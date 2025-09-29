import { query } from './database';
import { ClueRevealService, type ClueRevealState } from './clueRevealService';
import { ScoringService, type TeamScore } from './scoringService';
import { EnhancedWarrantService, type EnhancedWarrantResult } from './enhancedWarrantService';
import type { GameSession } from '../types';

export interface GameFlowConfig {
  maxRounds: number;
  cluesPerRound: number;
  roundDurationMinutes: number;
  timeBetweenRounds: number;
  autoAdvanceRounds: boolean;
  allowLateJoins: boolean;
}

export interface GameFlowState {
  session: GameSession;
  currentRound: number;
  roundState: 'waiting' | 'revealing' | 'guessing' | 'scoring' | 'complete';
  clueState: ClueRevealState;
  teamScores: TeamScore[];
  timeRemaining: number;
  canAdvanceRound: boolean;
  gameComplete: boolean;
}

export interface RoundResult {
  roundNumber: number;
  teamResults: {
    teamId: string;
    teamName: string;
    correctGuess: boolean;
    finalAnswer: string;
    pointsEarned: number;
    timeUsed: number;
  }[];
  roundWinner: string | null;
  finalScores: TeamScore[];
}

/**
 * Game Session Controller
 * 
 * This service orchestrates the entire educational game flow:
 * - Manages session lifecycle from creation to completion
 * - Controls round progression and timing
 * - Coordinates clue reveals with team responses
 * - Handles teacher controls and intervention points
 * - Ensures smooth educational experience
 */
export class GameSessionController {
  private static readonly DEFAULT_CONFIG: GameFlowConfig = {
    maxRounds: 4,
    cluesPerRound: 4,
    roundDurationMinutes: 12, // 50 min total / 4 rounds, with buffer
    timeBetweenRounds: 2,
    autoAdvanceRounds: false, // Teacher controlled
    allowLateJoins: true,
  };

  /**
   * Start a new game session
   */
  static async startGameSession(
    sessionId: string, 
    config: Partial<GameFlowConfig> = {}
  ): Promise<GameFlowState> {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Update session status to active
    const sessionResult = await query(
      `UPDATE game_sessions 
       SET status = 'active', started_at = NOW(), current_round = 1,
           settings = $2
       WHERE id = $1 
       RETURNING *`,
      [sessionId, JSON.stringify(fullConfig)]
    );

    if (!sessionResult.rows[0]) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const session = this.mapSessionFromDb(sessionResult.rows[0]);

    // Initialize clue reveal for round 1
    const clueState = await ClueRevealService.initializeClueReveal({
      sessionId,
      caseId: session.caseId,
      roundNumber: 1,
      maxClues: fullConfig.cluesPerRound,
      pointsPerClue: [400, 300, 200, 100],
      timeBetweenClues: 30,
    });

    const teamScores = await ScoringService.getTeamScores(sessionId);

    return {
      session,
      currentRound: 1,
      roundState: 'waiting',
      clueState,
      teamScores,
      timeRemaining: fullConfig.roundDurationMinutes * 60,
      canAdvanceRound: false,
      gameComplete: false,
    };
  }

  /**
   * Get current game state
   */
  static async getGameState(sessionId: string): Promise<GameFlowState> {
    // Get session info
    const sessionResult = await query(
      'SELECT * FROM game_sessions WHERE id = $1',
      [sessionId]
    );

    if (!sessionResult.rows[0]) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const session = this.mapSessionFromDb(sessionResult.rows[0]);
    const currentRound = session.currentRound;

    // Get clue state for current round
    const clueState = await ClueRevealService.getClueRevealState(sessionId, currentRound);
    
    // Get team scores
    const teamScores = await ScoringService.getTeamScores(sessionId);

    // Determine round state
    let roundState: 'waiting' | 'revealing' | 'guessing' | 'scoring' | 'complete' = 'waiting';
    
    if (session.status === 'completed') {
      roundState = 'complete';
    } else if (clueState.isComplete) {
      roundState = 'guessing';
    } else if (clueState.revealedClues.length > 0) {
      roundState = 'revealing';
    }

    // Calculate time remaining (simplified - would need more sophisticated timing)
    const config = session.settings as GameFlowConfig || this.DEFAULT_CONFIG;
    const timeRemaining = config.roundDurationMinutes * 60; // Placeholder

    return {
      session,
      currentRound,
      roundState,
      clueState,
      teamScores,
      timeRemaining,
      canAdvanceRound: clueState.isComplete,
      gameComplete: session.status === 'completed',
    };
  }

  /**
   * Advance to the next round
   */
  static async advanceToNextRound(sessionId: string): Promise<GameFlowState> {
    const currentState = await this.getGameState(sessionId);
    
    if (!currentState.canAdvanceRound) {
      throw new Error('Cannot advance round: current round not complete');
    }

    const nextRound = currentState.currentRound + 1;
    const maxRounds = (currentState.session.settings as GameFlowConfig)?.maxRounds || 4;

    if (nextRound > maxRounds) {
      // Game is complete
      return await this.completeGame(sessionId);
    }

    // Update session to next round
    await query(
      'UPDATE game_sessions SET current_round = $2 WHERE id = $1',
      [sessionId, nextRound]
    );

    // Initialize clue reveal for new round
    await ClueRevealService.initializeClueReveal({
      sessionId,
      caseId: currentState.session.caseId,
      roundNumber: nextRound,
      maxClues: 4,
      pointsPerClue: [400, 300, 200, 100],
      timeBetweenClues: 30,
    });

    return await this.getGameState(sessionId);
  }

  /**
   * Complete the current game
   */
  static async completeGame(sessionId: string): Promise<GameFlowState> {
    // Update session status
    await query(
      `UPDATE game_sessions 
       SET status = 'completed', ended_at = NOW() 
       WHERE id = $1`,
      [sessionId]
    );

    // Calculate final rankings
    const finalRankings = await ScoringService.calculateFinalRankings(sessionId);

    const gameState = await this.getGameState(sessionId);
    gameState.gameComplete = true;
    gameState.roundState = 'complete';
    gameState.teamScores = finalRankings;

    return gameState;
  }

  /**
   * Pause the current game
   */
  static async pauseGame(sessionId: string): Promise<GameFlowState> {
    await query(
      'UPDATE game_sessions SET status = $2 WHERE id = $1',
      [sessionId, 'paused']
    );

    return await this.getGameState(sessionId);
  }

  /**
   * Resume a paused game
   */
  static async resumeGame(sessionId: string): Promise<GameFlowState> {
    await query(
      'UPDATE game_sessions SET status = $2 WHERE id = $1',
      [sessionId, 'active']
    );

    return await this.getGameState(sessionId);
  }

  /**
   * Reveal the next clue in the current round
   */
  static async revealNextClue(sessionId: string): Promise<{
    gameState: GameFlowState;
    newClue: any;
  }> {
    const currentState = await this.getGameState(sessionId);
    
    if (currentState.session.status !== 'active') {
      throw new Error('Cannot reveal clue: session is not active');
    }

    const { clue } = await ClueRevealService.revealNextClue(
      sessionId, 
      currentState.currentRound
    );

    const updatedGameState = await this.getGameState(sessionId);

    return {
      gameState: updatedGameState,
      newClue: clue,
    };
  }

  /**
   * Submit a team's warrant with enhanced map-based scoring
   */
  static async submitEnhancedWarrant(
    sessionId: string,
    teamId: string,
    guessedLocationId: string,
    reasoning?: string
  ): Promise<EnhancedWarrantResult> {
    return await EnhancedWarrantService.processMapWarrant(
      sessionId,
      teamId,
      guessedLocationId,
      reasoning
    );
  }

  /**
   * Submit a team's warrant (final guess) - Legacy method
   */
  static async submitWarrant(
    sessionId: string,
    teamId: string,
    guessedLocationId: string,
    evidence: string[]
  ): Promise<{
    isCorrect: boolean;
    pointsAwarded: number;
    gameState: GameFlowState;
  }> {
    const currentState = await this.getGameState(sessionId);
    
    // Get the correct location for this case
    const caseResult = await query(
      'SELECT target_location_id FROM cases WHERE id = $1',
      [currentState.session.caseId]
    );

    const correctLocationId = caseResult.rows[0]?.target_location_id;
    const isCorrect = guessedLocationId === correctLocationId;

    let pointsAwarded = 0;

    if (isCorrect) {
      // Calculate and award points for correct guess
      const scoreCalc = await ScoringService.calculateCorrectGuessScore(
        sessionId,
        teamId,
        currentState.currentRound,
        new Date(),
        currentState.session.caseId
      );

      pointsAwarded = scoreCalc.finalScore;

      await ScoringService.addScoreEvent(
        sessionId,
        teamId,
        currentState.currentRound,
        'correct_guess',
        pointsAwarded,
        `Correct warrant submitted: ${guessedLocationId}`,
        { 
          guessedLocationId, 
          evidence, 
          scoreBreakdown: scoreCalc.breakdown 
        }
      );
    } else {
      // Apply penalty for incorrect guess
      await ScoringService.applyIncorrectGuessPenalty(
        sessionId,
        teamId,
        currentState.currentRound,
        guessedLocationId
      );
      pointsAwarded = -100; // Default penalty
    }

    // Record the warrant submission
    await query(
      `INSERT INTO warrant_submissions (session_id, team_id, round_number, guessed_location_id, is_correct, points_awarded)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sessionId, teamId, currentState.currentRound, guessedLocationId, isCorrect, pointsAwarded]
    );

    const updatedGameState = await this.getGameState(sessionId);

    return {
      isCorrect,
      pointsAwarded,
      gameState: updatedGameState,
    };
  }

  /**
   * Get round results summary
   */
  static async getRoundResults(sessionId: string, roundNumber: number): Promise<RoundResult> {
    // Get all warrant submissions for this round
    const warrantsResult = await query(
      `SELECT ws.*, t.name as team_name, l.name as location_name
       FROM warrant_submissions ws
       JOIN teams t ON ws.team_id = t.id
       JOIN locations l ON ws.guessed_location_id = l.id
       WHERE ws.session_id = $1 AND ws.round_number = $2
       ORDER BY ws.submitted_at ASC`,
      [sessionId, roundNumber]
    );

    const teamResults = warrantsResult.rows.map((row: any) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      correctGuess: row.is_correct,
      finalAnswer: row.location_name,
      pointsEarned: row.points_awarded,
      timeUsed: 0, // Would calculate from submission time vs round start
    }));

    // Find round winner (highest points this round)
    const roundWinner = teamResults.reduce((winner: any, team: any) => {
      if (!winner || team.pointsEarned > winner.pointsEarned) {
        return team;
      }
      return winner;
    }, null);

    const finalScores = await ScoringService.getTeamScores(sessionId);

    return {
      roundNumber,
      teamResults,
      roundWinner: roundWinner?.teamId || null,
      finalScores,
    };
  }

  /**
   * Get session analytics for educational assessment
   */
  static async getSessionAnalytics(sessionId: string): Promise<{
    duration: number;
    totalCluesRevealed: number;
    correctGuesses: number;
    incorrectGuesses: number;
    averageResponseTime: number;
    educationalOutcomes: Record<string, any>;
  }> {
    const session = await this.getGameState(sessionId);
    
    // Get clue reveal stats
    const clueStats = await ClueRevealService.getClueRevealStats(sessionId);
    
    // Get scoring stats
    const scoreStats = await ScoringService.getScoringStats(sessionId);
    
    // Calculate session duration
    const startTime = session.session.startedAt ? new Date(session.session.startedAt) : new Date();
    const endTime = session.session.endedAt ? new Date(session.session.endedAt) : new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // minutes

    // Get warrant submission stats
    const warrantsResult = await query(
      `SELECT 
         COUNT(*) as total_submissions,
         COUNT(CASE WHEN is_correct THEN 1 END) as correct_guesses,
         COUNT(CASE WHEN NOT is_correct THEN 1 END) as incorrect_guesses
       FROM warrant_submissions
       WHERE session_id = $1`,
      [sessionId]
    );

    const warrantStats = warrantsResult.rows[0] || {};

    return {
      duration: Math.round(duration),
      totalCluesRevealed: clueStats.revealedClues,
      correctGuesses: parseInt(warrantStats.correct_guesses) || 0,
      incorrectGuesses: parseInt(warrantStats.incorrect_guesses) || 0,
      averageResponseTime: clueStats.averageRevealTime,
      educationalOutcomes: {
        clueTypeDistribution: clueStats.clueTypeDistribution,
        scoreDistribution: scoreStats.scoreDistribution,
        teamPerformance: session.teamScores,
      },
    };
  }

  /**
   * Handle teacher interventions (bonus points, penalties, etc.)
   */
  static async teacherIntervention(
    sessionId: string,
    teamId: string,
    interventionType: 'bonus' | 'penalty' | 'educational_bonus',
    points: number,
    reason: string
  ): Promise<GameFlowState> {
    const currentState = await this.getGameState(sessionId);
    
    const eventType = interventionType === 'penalty' ? 'incorrect_guess' : 'time_bonus';
    const adjustedPoints = interventionType === 'penalty' ? -Math.abs(points) : Math.abs(points);

    await ScoringService.addScoreEvent(
      sessionId,
      teamId,
      currentState.currentRound,
      eventType,
      adjustedPoints,
      `Teacher intervention: ${reason}`,
      { interventionType, teacherAdjustment: true }
    );

    return await this.getGameState(sessionId);
  }

  /**
   * Emergency reset for current round (teacher emergency control)
   */
  static async resetCurrentRound(sessionId: string): Promise<GameFlowState> {
    const currentState = await this.getGameState(sessionId);
    
    // Clear revealed clues for current round
    await ClueRevealService.resetClueReveals(sessionId, currentState.currentRound);
    
    // Remove score events for current round
    await query(
      `DELETE FROM score_events 
       WHERE session_id = $1 AND round_number = $2`,
      [sessionId, currentState.currentRound]
    );

    // Remove warrant submissions for current round
    await query(
      `DELETE FROM warrant_submissions 
       WHERE session_id = $1 AND round_number = $2`,
      [sessionId, currentState.currentRound]
    );

    return await this.getGameState(sessionId);
  }

  /**
   * Map database row to GameSession object
   */
  private static mapSessionFromDb(row: any): GameSession {
    return {
      id: row.id,
      sessionCode: row.session_code,
      caseId: row.case_id,
      hostId: row.host_id,
      status: row.status,
      currentRound: row.current_round,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      settings: row.settings || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}