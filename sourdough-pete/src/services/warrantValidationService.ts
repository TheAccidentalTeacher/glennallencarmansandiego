import { query } from './database';
import { ScoringService } from './scoringService';

export interface WarrantValidationConfig {
  requireLocation: boolean;
  requireVillain: boolean;
  requireEvidenceJustifications: number;
  allowPartialCredit: boolean;
  partialCreditPercentage: number;
}

export interface WarrantSubmissionData {
  sessionId: string;
  teamId: string;
  roundNumber: number;
  guessedLocationId: string;
  guessedVillainId?: string;
  evidenceJustifications: string[];
  confidence: 'low' | 'medium' | 'high';
  submittedAt: Date;
}

export interface WarrantValidationResult {
  isValid: boolean;
  isCorrectLocation: boolean;
  isCorrectVillain: boolean;
  locationMatch: {
    exact: boolean;
    acceptable: boolean;
    locationName: string;
    countryMatch: boolean;
    regionMatch: boolean;
  };
  evidenceQuality: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    culturalInsight: boolean;
    geographicalAccuracy: boolean;
  };
  finalScore: number;
  partialCredit: number;
  feedback: string[];
  educationalNotes: string[];
}

/**
 * Warrant Validation Service
 * 
 * This service handles the climax of each game round:
 * - Validates team submissions against correct answers
 * - Awards appropriate scores with educational feedback
 * - Provides partial credit for close answers
 * - Ensures cultural sensitivity in all feedback
 * - Tracks educational outcomes for assessment
 */
export class WarrantValidationService {
  private static readonly DEFAULT_CONFIG: WarrantValidationConfig = {
    requireLocation: true,
    requireVillain: false, // Focus on geography first
    requireEvidenceJustifications: 2,
    allowPartialCredit: true,
    partialCreditPercentage: 0.5, // 50% points for close answers
  };

  /**
   * Validate a team's warrant submission
   */
  static async validateWarrant(
    submission: WarrantSubmissionData,
    config: WarrantValidationConfig = this.DEFAULT_CONFIG
  ): Promise<WarrantValidationResult> {
    // Get the correct answers for this session's case
    const correctAnswers = await this.getCorrectAnswers(submission.sessionId);
    
    // Validate location guess
    const locationValidation = await this.validateLocationGuess(
      submission.guessedLocationId,
      correctAnswers.targetLocationId,
      correctAnswers.alternateLocations
    );

    // Validate villain guess (if required)
    const villainValidation = await this.validateVillainGuess(
      submission.guessedVillainId,
      correctAnswers.villainId,
      config.requireVillain
    );

    // Evaluate evidence quality
    const evidenceEvaluation = await this.evaluateEvidenceQuality(
      submission.evidenceJustifications,
      correctAnswers.expectedClues,
      config.requireEvidenceJustifications
    );

    // Calculate final score
    const scoreCalculation = await this.calculateWarrantScore(
      submission,
      locationValidation,
      villainValidation,
      evidenceEvaluation,
      config
    );

    // Generate educational feedback
    const feedback = this.generateEducationalFeedback(
      locationValidation,
      evidenceEvaluation,
      correctAnswers
    );

    const result: WarrantValidationResult = {
      isValid: this.isSubmissionValid(submission, config),
      isCorrectLocation: locationValidation.exact,
      isCorrectVillain: villainValidation.isCorrect,
      locationMatch: locationValidation,
      evidenceQuality: evidenceEvaluation,
      finalScore: scoreCalculation.finalScore,
      partialCredit: scoreCalculation.partialCredit,
      feedback: feedback.feedback,
      educationalNotes: feedback.educationalNotes,
    };

    // Record the warrant submission in database
    await this.recordWarrantSubmission(submission, result);

    return result;
  }

  /**
   * Get correct answers for a game session
   */
  private static async getCorrectAnswers(sessionId: string): Promise<{
    targetLocationId: string;
    villainId: string;
    alternateLocations: string[];
    expectedClues: string[];
    caseTitle: string;
    locationName: string;
    countryName: string;
  }> {
    const result = await query(
      `SELECT 
         c.target_location_id,
         c.villain_id,
         c.title as case_title,
         l.name as location_name,
         l.country as country_name
       FROM game_sessions gs
       JOIN cases c ON gs.case_id = c.id
       JOIN locations l ON c.target_location_id = l.id
       WHERE gs.id = $1`,
      [sessionId]
    );

    if (!result.rows[0]) {
      throw new Error(`Session ${sessionId} not found or invalid`);
    }

    const row = result.rows[0];

    // Get clues that should have been revealed
    const cluesResult = await query(
      `SELECT content FROM clues
       WHERE case_id = (SELECT case_id FROM game_sessions WHERE id = $1)
       ORDER BY reveal_order`,
      [sessionId]
    );

    const expectedClues = cluesResult.rows.map((clueRow: any) => clueRow.content);

    return {
      targetLocationId: row.target_location_id,
      villainId: row.villain_id,
      alternateLocations: [], // Could be expanded to include regional alternatives
      expectedClues,
      caseTitle: row.case_title,
      locationName: row.location_name,
      countryName: row.country_name,
    };
  }

  /**
   * Validate location guess with partial credit options
   */
  private static async validateLocationGuess(
    guessedLocationId: string,
    correctLocationId: string,
    alternateLocationIds: string[]
  ): Promise<{
    exact: boolean;
    acceptable: boolean;
    locationName: string;
    countryMatch: boolean;
    regionMatch: boolean;
  }> {
    // Get location details for guessed and correct locations
    const locationsResult = await query(
      `SELECT id, name, country, region FROM locations 
       WHERE id IN ($1, $2)`,
      [guessedLocationId, correctLocationId]
    );

    const locations = locationsResult.rows;
    const guessedLocation = locations.find((l: any) => l.id === guessedLocationId);
    const correctLocation = locations.find((l: any) => l.id === correctLocationId);

    if (!guessedLocation || !correctLocation) {
      throw new Error('Location data not found');
    }

    const exact = guessedLocationId === correctLocationId;
    const countryMatch = guessedLocation.country === correctLocation.country;
    const regionMatch = guessedLocation.region === correctLocation.region;
    
    // Consider acceptable if in same country or region, or in alternate list
    const acceptable = exact || countryMatch || regionMatch || 
                      alternateLocationIds.includes(guessedLocationId);

    return {
      exact,
      acceptable,
      locationName: guessedLocation.name,
      countryMatch,
      regionMatch,
    };
  }

  /**
   * Validate villain guess
   */
  private static async validateVillainGuess(
    guessedVillainId: string | undefined,
    correctVillainId: string,
    isRequired: boolean
  ): Promise<{
    isCorrect: boolean;
    isRequired: boolean;
    provided: boolean;
  }> {
    if (!isRequired) {
      return {
        isCorrect: true, // Not scored if not required
        isRequired: false,
        provided: !!guessedVillainId,
      };
    }

    const isCorrect = guessedVillainId === correctVillainId;
    
    return {
      isCorrect,
      isRequired,
      provided: !!guessedVillainId,
    };
  }

  /**
   * Evaluate quality of evidence justifications
   */
  private static async evaluateEvidenceQuality(
    evidenceJustifications: string[],
    _expectedClues: string[],
    minimumRequired: number
  ): Promise<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    culturalInsight: boolean;
    geographicalAccuracy: boolean;
  }> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    let score = 0;
    let culturalInsight = false;
    let geographicalAccuracy = false;

    // Check if minimum evidence provided
    if (evidenceJustifications.length < minimumRequired) {
      weaknesses.push(`Insufficient evidence provided (${evidenceJustifications.length}/${minimumRequired} required)`);
    } else {
      strengths.push('Sufficient evidence provided');
      score += 25;
    }

    // Analyze evidence quality (simplified keyword matching)
    for (const evidence of evidenceJustifications) {
      const lowercaseEvidence = evidence.toLowerCase();
      
      // Check for geographical terms
      const geoKeywords = ['climate', 'latitude', 'longitude', 'ocean', 'mountain', 'desert', 'river', 'continent'];
      if (geoKeywords.some(keyword => lowercaseEvidence.includes(keyword))) {
        geographicalAccuracy = true;
        strengths.push('Demonstrates geographical knowledge');
        score += 15;
      }

      // Check for cultural terms
      const culturalKeywords = ['culture', 'tradition', 'language', 'religion', 'cuisine', 'festival', 'customs'];
      if (culturalKeywords.some(keyword => lowercaseEvidence.includes(keyword))) {
        culturalInsight = true;
        strengths.push('Shows cultural understanding');
        score += 20;
      }

      // Check evidence length and detail
      if (evidence.length > 50) {
        strengths.push('Detailed reasoning provided');
        score += 10;
      } else if (evidence.length < 20) {
        weaknesses.push('Evidence could be more detailed');
      }
    }

    // Cap score at 100
    score = Math.min(100, score);

    if (weaknesses.length === 0 && score < 50) {
      weaknesses.push('Evidence could better connect to geographical and cultural clues');
    }

    return {
      score,
      strengths,
      weaknesses,
      culturalInsight,
      geographicalAccuracy,
    };
  }

  /**
   * Calculate final warrant score with partial credit
   */
  private static async calculateWarrantScore(
    submission: WarrantSubmissionData,
    locationValidation: any,
    _villainValidation: any,
    evidenceEvaluation: any,
    config: WarrantValidationConfig
  ): Promise<{
    finalScore: number;
    partialCredit: number;
    breakdown: string[];
  }> {
    // Base score calculation using ScoringService
    let baseScore = 0;
    let partialCredit = 0;
    const breakdown: string[] = [];

    if (locationValidation.exact) {
      // Full points for correct answer
      const scoreCalc = await ScoringService.calculateCorrectGuessScore(
        submission.sessionId,
        submission.teamId,
        submission.roundNumber,
        submission.submittedAt,
        '' // Case ID would be retrieved separately
      );
      baseScore = scoreCalc.finalScore;
      breakdown.push(`Correct location: ${baseScore} points`);
    } else if (locationValidation.acceptable && config.allowPartialCredit) {
      // Partial credit for close answers
      const scoreCalc = await ScoringService.calculateCorrectGuessScore(
        submission.sessionId,
        submission.teamId,
        submission.roundNumber,
        submission.submittedAt,
        ''
      );
      partialCredit = Math.round(scoreCalc.finalScore * config.partialCreditPercentage);
      
      if (locationValidation.countryMatch) {
        breakdown.push(`Correct country: ${partialCredit} points (partial credit)`);
      } else if (locationValidation.regionMatch) {
        breakdown.push(`Correct region: ${Math.round(partialCredit * 0.7)} points (partial credit)`);
        partialCredit = Math.round(partialCredit * 0.7);
      }
    }

    // Evidence quality bonus
    const evidenceBonus = Math.round(evidenceEvaluation.score * 0.5); // Up to 50 bonus points
    if (evidenceBonus > 0) {
      breakdown.push(`Evidence quality bonus: +${evidenceBonus} points`);
    }

    // Cultural insight bonus
    if (evidenceEvaluation.culturalInsight) {
      breakdown.push('Cultural insight bonus: +25 points');
    }

    const finalScore = baseScore + partialCredit + evidenceBonus + 
                      (evidenceEvaluation.culturalInsight ? 25 : 0);

    return {
      finalScore,
      partialCredit,
      breakdown,
    };
  }

  /**
   * Generate educational feedback for teams
   */
  private static generateEducationalFeedback(
    locationValidation: any,
    evidenceEvaluation: any,
    correctAnswers: any
  ): {
    feedback: string[];
    educationalNotes: string[];
  } {
    const feedback: string[] = [];
    const educationalNotes: string[] = [];

    // Location feedback
    if (locationValidation.exact) {
      feedback.push(`🎯 Excellent! You correctly identified ${correctAnswers.locationName}, ${correctAnswers.countryName}.`);
    } else if (locationValidation.countryMatch) {
      feedback.push(`🌍 Good geographical reasoning! You identified the correct country (${correctAnswers.countryName}), but the specific location was ${correctAnswers.locationName}.`);
      educationalNotes.push(`${correctAnswers.locationName} is known for its unique geographical and cultural features that distinguish it from other cities in ${correctAnswers.countryName}.`);
    } else {
      feedback.push(`🔍 The correct location was ${correctAnswers.locationName}, ${correctAnswers.countryName}. Let's explore what clues pointed to this region.`);
      educationalNotes.push(`Consider how geographical clues like climate, physical features, and cultural indicators can help narrow down locations.`);
    }

    // Evidence feedback
    if (evidenceEvaluation.strengths.length > 0) {
      feedback.push(`💪 Strong detective work: ${evidenceEvaluation.strengths.join(', ')}`);
    }

    if (evidenceEvaluation.weaknesses.length > 0) {
      feedback.push(`📚 Learning opportunities: ${evidenceEvaluation.weaknesses.join(', ')}`);
    }

    // Educational insights
    if (evidenceEvaluation.culturalInsight) {
      educationalNotes.push('Your team demonstrated excellent cultural awareness in connecting clues to local traditions and customs.');
    }

    if (evidenceEvaluation.geographicalAccuracy) {
      educationalNotes.push('Great use of geographical knowledge to analyze physical and climate clues.');
    }

    // Always include positive, educational framing
    educationalNotes.push(`Remember: Every guess teaches us something new about world geography and cultures!`);

    return {
      feedback,
      educationalNotes,
    };
  }

  /**
   * Check if submission meets basic validation requirements
   */
  private static isSubmissionValid(
    submission: WarrantSubmissionData,
    config: WarrantValidationConfig
  ): boolean {
    if (config.requireLocation && !submission.guessedLocationId) {
      return false;
    }

    if (config.requireVillain && !submission.guessedVillainId) {
      return false;
    }

    if (submission.evidenceJustifications.length < config.requireEvidenceJustifications) {
      return false;
    }

    return true;
  }

  /**
   * Record warrant submission in database
   */
  private static async recordWarrantSubmission(
    submission: WarrantSubmissionData,
    result: WarrantValidationResult
  ): Promise<void> {
    // Insert warrant submission record
    await query(
      `INSERT INTO warrant_submissions 
       (session_id, team_id, round_number, guessed_location_id, is_correct, points_awarded, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        submission.sessionId,
        submission.teamId,
        submission.roundNumber,
        submission.guessedLocationId,
        result.isCorrectLocation,
        result.finalScore,
        submission.submittedAt
      ]
    );

    // Add score event
    await ScoringService.addScoreEvent(
      submission.sessionId,
      submission.teamId,
      submission.roundNumber,
      result.isCorrectLocation ? 'correct_guess' : 'incorrect_guess',
      result.finalScore,
      `Warrant submitted: ${result.locationMatch.locationName}`,
      {
        warrantValidation: {
          isCorrect: result.isCorrectLocation,
          partialCredit: result.partialCredit,
          evidenceScore: result.evidenceQuality.score,
          culturalInsight: result.evidenceQuality.culturalInsight,
        },
        evidenceJustifications: submission.evidenceJustifications,
        confidence: submission.confidence,
      }
    );

    // Award educational bonuses if earned
    if (result.evidenceQuality.culturalInsight) {
      await ScoringService.awardEducationalBonus(
        submission.sessionId,
        submission.teamId,
        submission.roundNumber,
        'cultural_insight',
        'Demonstrated cultural understanding in warrant evidence'
      );
    }

    if (result.evidenceQuality.geographicalAccuracy) {
      await ScoringService.awardEducationalBonus(
        submission.sessionId,
        submission.teamId,
        submission.roundNumber,
        'research_quality',
        'Showed strong geographical reasoning skills'
      );
    }
  }

  /**
   * Get warrant submission history for a team
   */
  static async getTeamWarrantHistory(
    sessionId: string,
    teamId: string
  ): Promise<Array<{
    roundNumber: number;
    guessedLocation: string;
    isCorrect: boolean;
    pointsAwarded: number;
    submittedAt: string;
  }>> {
    const result = await query(
      `SELECT 
         ws.round_number,
         l.name as guessed_location,
         ws.is_correct,
         ws.points_awarded,
         ws.submitted_at
       FROM warrant_submissions ws
       JOIN locations l ON ws.guessed_location_id = l.id
       WHERE ws.session_id = $1 AND ws.team_id = $2
       ORDER BY ws.round_number ASC`,
      [sessionId, teamId]
    );

    return result.rows.map((row: any) => ({
      roundNumber: row.round_number,
      guessedLocation: row.guessed_location,
      isCorrect: row.is_correct,
      pointsAwarded: row.points_awarded,
      submittedAt: row.submitted_at,
    }));
  }

  /**
   * Get session-wide warrant statistics for educational assessment
   */
  static async getSessionWarrantStats(sessionId: string): Promise<{
    totalSubmissions: number;
    correctSubmissions: number;
    averageEvidenceQuality: number;
    culturalInsightCount: number;
    commonMistakes: string[];
    educationalOutcomes: Record<string, number>;
  }> {
    const result = await query(
      `SELECT 
         COUNT(*) as total_submissions,
         COUNT(CASE WHEN is_correct THEN 1 END) as correct_submissions,
         AVG(points_awarded) as avg_points
       FROM warrant_submissions
       WHERE session_id = $1`,
      [sessionId]
    );

    const stats = result.rows[0] || {};

    // Get score events for cultural insights
    const culturalResult = await query(
      `SELECT COUNT(*) as cultural_count
       FROM score_events
       WHERE session_id = $1 AND description LIKE '%cultural%'`,
      [sessionId]
    );

    return {
      totalSubmissions: parseInt(stats.total_submissions) || 0,
      correctSubmissions: parseInt(stats.correct_submissions) || 0,
      averageEvidenceQuality: parseFloat(stats.avg_points) || 0,
      culturalInsightCount: parseInt(culturalResult.rows[0]?.cultural_count) || 0,
      commonMistakes: [], // Could be expanded with more analysis
      educationalOutcomes: {
        accuracyRate: stats.total_submissions > 0 ? 
          (stats.correct_submissions / stats.total_submissions) * 100 : 0,
        averageScore: parseFloat(stats.avg_points) || 0,
      },
    };
  }
}