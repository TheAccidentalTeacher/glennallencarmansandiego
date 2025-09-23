import { query } from './database';
import type { ScoreEvent } from '../types';

export interface ScoringConfig {
  // Base points for correct location guess by round
  correctGuessPoints: [number, number, number, number]; // [round1, round2, round3, round4]
  
  // Time bonus (decreases over time)
  timeBonusMax: number;
  timeBonusDecayRate: number; // points lost per second
  
  // Penalties
  incorrectGuessPenalty: number;
  
  // Difficulty multipliers
  difficultyMultipliers: {
    1: number; // Easy
    2: number; // Medium-Easy  
    3: number; // Medium
    4: number; // Medium-Hard
    5: number; // Hard
  };
  
  // Educational bonuses
  culturalInsightBonus: number;
  researchQualityBonus: number;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  totalScore: number;
  roundScores: number[];
  bonusPoints: number;
  penaltyPoints: number;
  rank: number;
}

export interface ScoreCalculation {
  basePoints: number;
  timeBonus: number;
  difficultyMultiplier: number;
  educationalBonus: number;
  penalties: number;
  finalScore: number;
  breakdown: string[];
}

/**
 * Educational Scoring System
 * 
 * Implements a comprehensive scoring system that:
 * - Rewards quick, accurate deductions
 * - Encourages educational exploration and cultural learning
 * - Provides fair competition across different difficulty levels
 * - Tracks detailed analytics for teacher assessment
 */
export class ScoringService {
  // Default Carmen Sandiego-inspired scoring configuration
  private static readonly DEFAULT_CONFIG: ScoringConfig = {
    correctGuessPoints: [1000, 750, 500, 250], // Decreasing value by round
    timeBonusMax: 200,
    timeBonusDecayRate: 2, // 2 points lost per second
    incorrectGuessPenalty: 100,
    difficultyMultipliers: {
      1: 1.0,   // Easy cases
      2: 1.25,  // Medium-Easy
      3: 1.5,   // Medium (default)
      4: 1.75,  // Medium-Hard
      5: 2.0,   // Hard cases
    },
    culturalInsightBonus: 50,
    researchQualityBonus: 75,
  };

  /**
   * Calculate score for a correct guess
   */
  static async calculateCorrectGuessScore(
    sessionId: string,
    _teamId: string,
    roundNumber: number,
    guessTime: Date,
    caseId: string,
    config: ScoringConfig = this.DEFAULT_CONFIG
  ): Promise<ScoreCalculation> {
    // Get case difficulty
    const caseResult = await query(
      'SELECT difficulty_level FROM cases WHERE id = $1',
      [caseId]
    );
    
    const difficulty = caseResult.rows[0]?.difficulty_level || 3;
    
    // Get round start time
    const sessionResult = await query(
      'SELECT started_at FROM game_sessions WHERE id = $1',
      [sessionId]
    );
    
    const roundStartTime = new Date(sessionResult.rows[0]?.started_at || Date.now());
    
    // Calculate time elapsed (in seconds)
    const timeElapsed = Math.max(0, (guessTime.getTime() - roundStartTime.getTime()) / 1000);
    
    // Base points for this round
    const basePoints = config.correctGuessPoints[roundNumber - 1] || 0;
    
    // Time bonus (decreases over time, minimum 0)
    const timeBonus = Math.max(0, config.timeBonusMax - (timeElapsed * config.timeBonusDecayRate));
    
    // Difficulty multiplier
    const difficultyMultiplier = config.difficultyMultipliers[difficulty as keyof typeof config.difficultyMultipliers] || 1.5;
    
    // Calculate final score
    const scoreBeforeMultiplier = basePoints + timeBonus;
    const finalScore = Math.round(scoreBeforeMultiplier * difficultyMultiplier);
    
    const breakdown = [
      `Base points (Round ${roundNumber}): ${basePoints}`,
      `Time bonus: +${Math.round(timeBonus)} (${Math.round(timeElapsed)}s elapsed)`,
      `Difficulty multiplier (${difficulty}/5): ×${difficultyMultiplier}`,
      `Final score: ${finalScore}`,
    ];

    return {
      basePoints,
      timeBonus,
      difficultyMultiplier,
      educationalBonus: 0,
      penalties: 0,
      finalScore,
      breakdown,
    };
  }

  /**
   * Award educational bonus points
   */
  static async awardEducationalBonus(
    sessionId: string,
    teamId: string,
    roundNumber: number,
    bonusType: 'cultural_insight' | 'research_quality',
    description: string,
    config: ScoringConfig = this.DEFAULT_CONFIG
  ): Promise<ScoreEvent> {
    const points = bonusType === 'cultural_insight' 
      ? config.culturalInsightBonus 
      : config.researchQualityBonus;

    const scoreEvent = await this.addScoreEvent(
      sessionId,
      teamId,
      roundNumber,
      'time_bonus', // Using existing event type, could add more specific types
      points,
      `Educational bonus: ${description}`,
      { bonusType, description }
    );

    return scoreEvent;
  }

  /**
   * Apply penalty for incorrect guess
   */
  static async applyIncorrectGuessPenalty(
    sessionId: string,
    teamId: string,
    roundNumber: number,
    guessedLocation: string,
    config: ScoringConfig = this.DEFAULT_CONFIG
  ): Promise<ScoreEvent> {
    const penalty = -Math.abs(config.incorrectGuessPenalty);
    
    const scoreEvent = await this.addScoreEvent(
      sessionId,
      teamId,
      roundNumber,
      'incorrect_guess',
      penalty,
      `Incorrect guess: ${guessedLocation}`,
      { guessedLocation }
    );

    return scoreEvent;
  }

  /**
   * Add a score event to the database
   */
  static async addScoreEvent(
    sessionId: string,
    teamId: string,
    roundNumber: number,
    eventType: 'clue_revealed' | 'correct_guess' | 'incorrect_guess' | 'warrant_submitted' | 'time_bonus',
    points: number,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<ScoreEvent> {
    const result = await query(
      `INSERT INTO score_events (session_id, team_id, round_number, event_type, points, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sessionId, teamId, roundNumber, eventType, points, description, JSON.stringify(metadata)]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      sessionId: row.session_id,
      teamId: row.team_id,
      roundNumber: row.round_number,
      eventType: row.event_type,
      points: row.points,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }

  /**
   * Get current team scores for a session
   */
  static async getTeamScores(sessionId: string): Promise<TeamScore[]> {
    const result = await query(
      `SELECT 
         st.team_id,
         t.name as team_name,
         COALESCE(SUM(se.points), 0) as total_score,
         COALESCE(SUM(CASE WHEN se.points > 0 THEN se.points ELSE 0 END), 0) as bonus_points,
         COALESCE(SUM(CASE WHEN se.points < 0 THEN se.points ELSE 0 END), 0) as penalty_points
       FROM session_teams st
       JOIN teams t ON st.team_id = t.id
       LEFT JOIN score_events se ON se.team_id = st.team_id AND se.session_id = st.session_id
       WHERE st.session_id = $1 AND st.is_active = true
       GROUP BY st.team_id, t.name, st.join_order
       ORDER BY total_score DESC, st.join_order ASC`,
      [sessionId]
    );

    // Calculate round scores for each team
    const teamScores: TeamScore[] = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];
      
      // Get round-by-round scores
      const roundScoresResult = await query(
        `SELECT 
           round_number,
           COALESCE(SUM(points), 0) as round_score
         FROM score_events
         WHERE session_id = $1 AND team_id = $2
         GROUP BY round_number
         ORDER BY round_number`,
        [sessionId, row.team_id]
      );

      const roundScores = [0, 0, 0, 0]; // 4 rounds max
      roundScoresResult.rows.forEach((roundRow: any) => {
        const roundIndex = roundRow.round_number - 1;
        if (roundIndex >= 0 && roundIndex < 4) {
          roundScores[roundIndex] = parseInt(roundRow.round_score);
        }
      });

      teamScores.push({
        teamId: row.team_id,
        teamName: row.team_name,
        totalScore: parseInt(row.total_score),
        roundScores,
        bonusPoints: parseInt(row.bonus_points),
        penaltyPoints: Math.abs(parseInt(row.penalty_points)),
        rank: i + 1,
      });
    }

    return teamScores;
  }

  /**
   * Get detailed score breakdown for a specific team
   */
  static async getTeamScoreBreakdown(sessionId: string, teamId: string): Promise<{
    team: TeamScore;
    events: ScoreEvent[];
    roundBreakdowns: Record<number, ScoreEvent[]>;
  }> {
    const teamScores = await this.getTeamScores(sessionId);
    const team = teamScores.find(t => t.teamId === teamId);
    
    if (!team) {
      throw new Error(`Team ${teamId} not found in session ${sessionId}`);
    }

    // Get all score events for this team
    const eventsResult = await query(
      `SELECT * FROM score_events 
       WHERE session_id = $1 AND team_id = $2
       ORDER BY created_at ASC`,
      [sessionId, teamId]
    );

    const events: ScoreEvent[] = eventsResult.rows.map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      teamId: row.team_id,
      roundNumber: row.round_number,
      eventType: row.event_type,
      points: row.points,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

    // Group events by round
    const roundBreakdowns: Record<number, ScoreEvent[]> = {};
    events.forEach(event => {
      if (!roundBreakdowns[event.roundNumber]) {
        roundBreakdowns[event.roundNumber] = [];
      }
      roundBreakdowns[event.roundNumber].push(event);
    });

    return {
      team,
      events,
      roundBreakdowns,
    };
  }

  /**
   * Calculate final rankings with tiebreakers
   */
  static async calculateFinalRankings(sessionId: string): Promise<TeamScore[]> {
    const teamScores = await this.getTeamScores(sessionId);
    
    // Sort by total score (descending), then by time of first correct answer (ascending)
    const rankedTeams = teamScores.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore; // Higher score wins
      }
      
      // Tiebreaker: team that got points first
      // This would require additional logic to track timing
      return a.rank - b.rank; // Preserve existing order for now
    });

    // Update ranks
    rankedTeams.forEach((team, index) => {
      team.rank = index + 1;
    });

    return rankedTeams;
  }

  /**
   * Get scoring statistics for educational analytics
   */
  static async getScoringStats(sessionId: string): Promise<{
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalPointsAwarded: number;
    totalPenalties: number;
    scoreDistribution: Record<string, number>;
    eventTypeDistribution: Record<string, number>;
  }> {
    const teamScores = await this.getTeamScores(sessionId);
    
    if (teamScores.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalPointsAwarded: 0,
        totalPenalties: 0,
        scoreDistribution: {},
        eventTypeDistribution: {},
      };
    }

    const scores = teamScores.map(t => t.totalScore);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const totalPointsAwarded = teamScores.reduce((sum, team) => sum + team.bonusPoints, 0);
    const totalPenalties = teamScores.reduce((sum, team) => sum + team.penaltyPoints, 0);

    // Get event type distribution
    const eventResult = await query(
      `SELECT event_type, COUNT(*) as count
       FROM score_events
       WHERE session_id = $1
       GROUP BY event_type`,
      [sessionId]
    );

    const eventTypeDistribution: Record<string, number> = {};
    eventResult.rows.forEach((row: any) => {
      eventTypeDistribution[row.event_type] = parseInt(row.count);
    });

    // Score distribution (group by ranges)
    const scoreDistribution: Record<string, number> = {
      '0-249': 0,
      '250-499': 0,
      '500-749': 0,
      '750-999': 0,
      '1000+': 0,
    };

    scores.forEach(score => {
      if (score < 250) scoreDistribution['0-249']++;
      else if (score < 500) scoreDistribution['250-499']++;
      else if (score < 750) scoreDistribution['500-749']++;
      else if (score < 1000) scoreDistribution['750-999']++;
      else scoreDistribution['1000+']++;
    });

    return {
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      totalPointsAwarded,
      totalPenalties,
      scoreDistribution,
      eventTypeDistribution,
    };
  }

  /**
   * Reset all scores for a session (for testing or restart scenarios)
   */
  static async resetSessionScores(sessionId: string): Promise<void> {
    await query(
      'DELETE FROM score_events WHERE session_id = $1',
      [sessionId]
    );
  }
}