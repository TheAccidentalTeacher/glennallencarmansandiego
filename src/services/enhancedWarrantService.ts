import { LocationScoringService, type DistanceScoring, type LocationCoordinates } from './locationScoringService';
import { ScoringService } from './scoringService';
import { query } from './database';

export interface EnhancedWarrantResult {
  // Basic validation
  correct: boolean;
  pointsAwarded: number;
  feedback: string;
  
  // Distance-based enhancements
  distance?: number;
  distanceScoring?: DistanceScoring;
  guessedLocation?: LocationCoordinates;
  correctLocation?: LocationCoordinates;
  
  // Enhanced feedback
  mapFeedback?: string[];
  educationalTips?: string[];
  
  // Score breakdown
  baseScore?: number;
  distanceMultiplier?: number;
  bonusPoints?: number;
}

/**
 * Enhanced Warrant Processing Service
 * 
 * Integrates the new distance-based scoring system with the existing warrant validation.
 * Provides enhanced feedback and scoring for the map-based student interface.
 */
export class EnhancedWarrantService {
  
  /**
   * Process a warrant submission with distance-based scoring
   */
  static async processMapWarrant(
    sessionId: string,
    teamId: string,
    guessedLocationId: string,
    reasoning?: string
  ): Promise<EnhancedWarrantResult> {
    try {
      // Get the correct location for this session
      const correctLocationId = await this.getCorrectLocationForSession(sessionId);
      
      if (!correctLocationId) {
        return {
          correct: false,
          pointsAwarded: 0,
          feedback: 'Error: Could not determine the correct location for this case.'
        };
      }
      
      // Calculate base score (using existing scoring service)
      const baseScore = await this.calculateBaseScore(sessionId, teamId);
      
      // Get distance-based validation and scoring
      const distanceValidation = await LocationScoringService.validateLocationWithDistance(
        guessedLocationId,
        correctLocationId,
        baseScore
      );
      
      // Check for exact match
      const isCorrect = distanceValidation.isExact;
      let finalScore = distanceValidation.adjustedScore;
      
      // Add educational bonuses
      const bonusPoints = await this.calculateEducationalBonuses(
        guessedLocationId,
        correctLocationId,
        reasoning,
        distanceValidation.distance
      );
      
      finalScore += bonusPoints;
      
      // Record the submission in database
      await this.recordEnhancedWarrantSubmission(
        sessionId,
        teamId,
        guessedLocationId,
        correctLocationId,
        isCorrect,
        finalScore,
        distanceValidation.distance,
        reasoning
      );
      
      // Generate enhanced feedback
      const mapFeedback = distanceValidation.guessedLocation && distanceValidation.correctLocation
        ? LocationScoringService.generateMapFeedback(
            distanceValidation.distanceScoring,
            distanceValidation.guessedLocation,
            distanceValidation.correctLocation
          )
        : ['Unable to generate map feedback'];
      
      const educationalTips = this.generateEducationalTips(
        distanceValidation,
        reasoning
      );
      
      // Create comprehensive result
      const result: EnhancedWarrantResult = {
        correct: isCorrect,
        pointsAwarded: finalScore,
        feedback: distanceValidation.feedback.join(' '),
        distance: distanceValidation.distance,
        distanceScoring: distanceValidation.distanceScoring,
        guessedLocation: distanceValidation.guessedLocation || undefined,
        correctLocation: distanceValidation.correctLocation || undefined,
        mapFeedback,
        educationalTips,
        baseScore,
        distanceMultiplier: distanceValidation.distanceScoring.scoreMultiplier,
        bonusPoints
      };
      
      return result;
      
    } catch (error) {
      console.error('Error processing map warrant:', error);
      return {
        correct: false,
        pointsAwarded: 0,
        feedback: 'An error occurred while processing your warrant submission.'
      };
    }
  }
  
  /**
   * Get the correct location ID for a game session
   */
  private static async getCorrectLocationForSession(sessionId: string): Promise<string | null> {
    const result = await query(
      `SELECT c.target_location_id 
       FROM game_sessions gs
       JOIN cases c ON gs.case_id = c.id
       WHERE gs.id = $1`,
      [sessionId]
    );
    
    return result.rows[0]?.target_location_id || null;
  }
  
  /**
   * Calculate base score using existing scoring service
   */
  private static async calculateBaseScore(sessionId: string, teamId: string): Promise<number> {
    try {
      // Get current round and other details needed for scoring
      const sessionResult = await query(
        'SELECT current_round, case_id FROM game_sessions WHERE id = $1',
        [sessionId]
      );
      
      if (sessionResult.rows.length === 0) {
        return 1000; // Default base score
      }
      
      const { current_round: currentRound, case_id: caseId } = sessionResult.rows[0];
      
      // Use existing scoring service to calculate base score
      const scoreCalc = await ScoringService.calculateCorrectGuessScore(
        sessionId,
        teamId,
        currentRound,
        new Date(),
        caseId
      );
      
      return scoreCalc.finalScore;
    } catch (error) {
      console.error('Error calculating base score:', error);
      return 1000; // Default fallback
    }
  }
  
  /**
   * Calculate educational bonus points
   */
  private static async calculateEducationalBonuses(
    guessedLocationId: string,
    correctLocationId: string,
    reasoning?: string,
    distance?: number
  ): Promise<number> {
    let bonusPoints = 0;
    
    // Reasoning quality bonus
    if (reasoning && reasoning.length > 50) {
      bonusPoints += 25; // Bonus for detailed reasoning
    }
    
    // Geographic proximity bonus (additional to distance multiplier)
    if (distance !== undefined && distance <= 200) {
      bonusPoints += 50; // Close geographic reasoning bonus
    }
    
    // Same country bonus (if not exact match)
    if (guessedLocationId !== correctLocationId) {
      const sameCountry = await this.checkSameCountry(guessedLocationId, correctLocationId);
      if (sameCountry) {
        bonusPoints += 100; // Regional knowledge bonus
      }
    }
    
    return bonusPoints;
  }
  
  /**
   * Check if two locations are in the same country
   */
  private static async checkSameCountry(locationId1: string, locationId2: string): Promise<boolean> {
    const result = await query(
      `SELECT 
         l1.country as country1,
         l2.country as country2
       FROM locations l1, locations l2 
       WHERE l1.id = $1 AND l2.id = $2`,
      [locationId1, locationId2]
    );
    
    if (result.rows.length === 0) return false;
    
    return result.rows[0].country1 === result.rows[0].country2;
  }
  
  /**
   * Record enhanced warrant submission in database
   */
  private static async recordEnhancedWarrantSubmission(
    sessionId: string,
    teamId: string,
    guessedLocationId: string,
    correctLocationId: string,
    isCorrect: boolean,
    finalScore: number,
    distance: number,
    reasoning?: string
  ): Promise<void> {
    try {
      // Get current round
      const sessionResult = await query(
        'SELECT current_round FROM game_sessions WHERE id = $1',
        [sessionId]
      );
      
      const currentRound = sessionResult.rows[0]?.current_round || 1;
      
      // Insert warrant submission with distance data
      await query(
        `INSERT INTO warrant_submissions 
         (session_id, team_id, round_number, guessed_location_id, correct_location_id, 
          is_correct, points_awarded, distance_km, reasoning, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [sessionId, teamId, currentRound, guessedLocationId, correctLocationId, 
         isCorrect, finalScore, distance, reasoning]
      );
      
      // Add score event using existing scoring service
      await ScoringService.addScoreEvent(
        sessionId,
        teamId,
        currentRound,
        isCorrect ? 'correct_guess' : 'incorrect_guess',
        finalScore,
        `Map warrant: ${isCorrect ? 'Correct' : Math.round(distance) + 'km away'}`,
        {
          distance,
          reasoning: reasoning?.substring(0, 100) + '...' || 'No reasoning provided',
          guessedLocationId,
          correctLocationId
        }
      );
      
    } catch (error) {
      console.error('Error recording enhanced warrant submission:', error);
    }
  }
  
  /**
   * Generate educational tips based on the warrant result
   */
  private static generateEducationalTips(
    distanceValidation: {
      distance: number;
      guessedLocation: LocationCoordinates | null;
      correctLocation: LocationCoordinates | null;
    },
    reasoning?: string
  ): string[] {
    const tips: string[] = [];
    
    // Distance-based tips
    if (distanceValidation.distance > 1000) {
      tips.push("🔍 Tip: Pay closer attention to geographic clues in the evidence!");
      tips.push("🗺️ Study the cultural and environmental details mentioned in clues.");
    } else if (distanceValidation.distance > 500) {
      tips.push("📍 You're getting better! Look for more specific location indicators.");
    }
    
    // Reasoning-based tips
    if (!reasoning || reasoning.length < 20) {
      tips.push("✍️ Try explaining your reasoning next time - it helps you think through the clues!");
    }
    
    // Country-based tips
    if (distanceValidation.guessedLocation && distanceValidation.correctLocation) {
      const guessed = distanceValidation.guessedLocation;
      const correct = distanceValidation.correctLocation;
      
      if (guessed.country !== correct.country) {
        tips.push(`🌍 The correct location was in ${correct.country}. What clues pointed to that country?`);
      }
    }
    
    return tips;
  }
  
  /**
   * Get enhanced warrant history for a team
   */
  static async getEnhancedWarrantHistory(
    sessionId: string, 
    teamId: string
  ): Promise<Array<{
    roundNumber: number;
    guessedLocation: string;
    correctLocation: string;
    isCorrect: boolean;
    distance: number;
    pointsAwarded: number;
    reasoning: string;
    submittedAt: string;
  }>> {
    const result = await query(
      `SELECT 
         ws.round_number,
         gl.name as guessed_location,
         cl.name as correct_location,
         ws.is_correct,
         ws.distance_km,
         ws.points_awarded,
         ws.reasoning,
         ws.submitted_at
       FROM warrant_submissions ws
       JOIN locations gl ON ws.guessed_location_id = gl.id
       JOIN locations cl ON ws.correct_location_id = cl.id
       WHERE ws.session_id = $1 AND ws.team_id = $2
       ORDER BY ws.round_number ASC`,
      [sessionId, teamId]
    );
    
    return result.rows.map((row: {
      round_number: number;
      guessed_location: string;
      correct_location: string;
      is_correct: boolean;
      distance_km: number;
      points_awarded: number;
      reasoning: string;
      submitted_at: string;
    }) => ({
      roundNumber: row.round_number,
      guessedLocation: row.guessed_location,
      correctLocation: row.correct_location,
      isCorrect: row.is_correct,
      distance: row.distance_km || 0,
      pointsAwarded: row.points_awarded,
      reasoning: row.reasoning || '',
      submittedAt: row.submitted_at
    }));
  }
}