import { query } from './database';

export interface ClueRevealConfig {
  sessionId: string;
  caseId: string;
  roundNumber: number;
  maxClues: number;
  pointsPerClue: number[];
  timeBetweenClues: number; // seconds
}

export interface RevealedClue {
  id: string;
  caseId: string;
  type: 'geography' | 'culture' | 'historical' | 'economic' | 'visual';
  content: string;
  revealOrder: number;
  pointsValue: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  revealedAt: string;
}

export interface ClueRevealState {
  sessionId: string;
  roundNumber: number;
  totalClues: number;
  revealedClues: RevealedClue[];
  nextClueIndex: number;
  isComplete: boolean;
  remainingPoints: number;
}

/**
 * Progressive Clue Reveal Engine
 * 
 * This service manages the educational core of the game:
 * - Reveals clues in sequence with decreasing point values
 * - Tracks which clues have been shown to teams
 * - Manages timing and scoring for the reveal process
 * - Ensures educational progression from general to specific
 */
export class ClueRevealService {
  /**
   * Initialize a new clue reveal sequence for a game session
   */
  static async initializeClueReveal(config: ClueRevealConfig): Promise<ClueRevealState> {
    // Get all clues for this case, ordered by reveal sequence
    const cluesResult = await query(
      `SELECT * FROM clues 
       WHERE case_id = $1 
       ORDER BY reveal_order ASC`,
      [config.caseId]
    );

    if (cluesResult.rows.length === 0) {
      throw new Error(`No clues found for case ${config.caseId}`);
    }

    // Clear any existing revealed clues for this session and round
    await query(
      `DELETE FROM revealed_clues 
       WHERE session_id = $1 AND round_number = $2`,
      [config.sessionId, config.roundNumber]
    );

    const clues = cluesResult.rows;
    const totalPoints = clues.reduce((sum: number, clue: any) => sum + clue.points_value, 0);

    return {
      sessionId: config.sessionId,
      roundNumber: config.roundNumber,
      totalClues: clues.length,
      revealedClues: [],
      nextClueIndex: 0,
      isComplete: false,
      remainingPoints: totalPoints,
    };
  }

  /**
   * Reveal the next clue in sequence
   */
  static async revealNextClue(sessionId: string, roundNumber: number): Promise<{
    clue: RevealedClue | null;
    state: ClueRevealState;
  }> {
    // Get the current session to find the case
    const sessionResult = await query(
      'SELECT case_id FROM game_sessions WHERE id = $1',
      [sessionId]
    );

    if (!sessionResult.rows[0]) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const caseId = sessionResult.rows[0].case_id;

    // Get all clues for this case
    const cluesResult = await query(
      `SELECT * FROM clues 
       WHERE case_id = $1 
       ORDER BY reveal_order ASC`,
      [caseId]
    );

    // Get already revealed clues for this session and round
    const revealedResult = await query(
      `SELECT rc.*, c.* FROM revealed_clues rc
       JOIN clues c ON rc.clue_id = c.id
       WHERE rc.session_id = $1 AND rc.round_number = $2
       ORDER BY c.reveal_order ASC`,
      [sessionId, roundNumber]
    );

    const allClues = cluesResult.rows;
    const alreadyRevealed = revealedResult.rows;
    const nextClueIndex = alreadyRevealed.length;

    // Check if all clues have been revealed
    if (nextClueIndex >= allClues.length) {
      return {
        clue: null,
        state: await this.getClueRevealState(sessionId, roundNumber),
      };
    }

    // Get the next clue to reveal
    const nextClue = allClues[nextClueIndex];

    // Record this clue as revealed
    await query(
      `INSERT INTO revealed_clues (session_id, clue_id, round_number)
       VALUES ($1, $2, $3)`,
      [sessionId, nextClue.id, roundNumber]
    );

    // Create score event for clue reveal
    await query(
      `INSERT INTO score_events (session_id, round_number, event_type, points, description, metadata)
       VALUES ($1, $2, 'clue_revealed', $3, $4, $5)`,
      [
        sessionId,
        roundNumber,
        0, // No points awarded for revealing clues
        `Clue ${nextClue.reveal_order} revealed: ${nextClue.type}`,
        JSON.stringify({
          clueId: nextClue.id,
          clueType: nextClue.type,
          revealOrder: nextClue.reveal_order,
        }),
      ]
    );

    const revealedClue: RevealedClue = {
      id: nextClue.id,
      caseId: nextClue.case_id,
      type: nextClue.type,
      content: nextClue.content,
      revealOrder: nextClue.reveal_order,
      pointsValue: nextClue.points_value,
      mediaUrl: nextClue.media_url,
      mediaType: nextClue.media_type,
      revealedAt: new Date().toISOString(),
    };

    const newState = await this.getClueRevealState(sessionId, roundNumber);

    return {
      clue: revealedClue,
      state: newState,
    };
  }

  /**
   * Get the current state of clue reveals for a session and round
   */
  static async getClueRevealState(sessionId: string, roundNumber: number): Promise<ClueRevealState> {
    // Get the session and case info
    const sessionResult = await query(
      'SELECT case_id FROM game_sessions WHERE id = $1',
      [sessionId]
    );

    if (!sessionResult.rows[0]) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const caseId = sessionResult.rows[0].case_id;

    // Get all clues for this case
    const allCluesResult = await query(
      `SELECT * FROM clues 
       WHERE case_id = $1 
       ORDER BY reveal_order ASC`,
      [caseId]
    );

    // Get revealed clues for this session and round
    const revealedResult = await query(
      `SELECT rc.revealed_at, c.* FROM revealed_clues rc
       JOIN clues c ON rc.clue_id = c.id
       WHERE rc.session_id = $1 AND rc.round_number = $2
       ORDER BY c.reveal_order ASC`,
      [sessionId, roundNumber]
    );

    const allClues = allCluesResult.rows;
    const revealedClues: RevealedClue[] = revealedResult.rows.map((row: any) => ({
      id: row.id,
      caseId: row.case_id,
      type: row.type,
      content: row.content,
      revealOrder: row.reveal_order,
      pointsValue: row.points_value,
      mediaUrl: row.media_url,
      mediaType: row.media_type,
      revealedAt: row.revealed_at,
    }));

    const totalPoints = allClues.reduce((sum: number, clue: any) => sum + clue.points_value, 0);
    const usedPoints = revealedClues.reduce((sum: number, clue: RevealedClue) => sum + clue.pointsValue, 0);

    return {
      sessionId,
      roundNumber,
      totalClues: allClues.length,
      revealedClues,
      nextClueIndex: revealedClues.length,
      isComplete: revealedClues.length >= allClues.length,
      remainingPoints: totalPoints - usedPoints,
    };
  }

  /**
   * Get available clues for teams to base their guesses on
   */
  static async getAvailableClues(sessionId: string, roundNumber: number): Promise<RevealedClue[]> {
    const state = await this.getClueRevealState(sessionId, roundNumber);
    return state.revealedClues;
  }

  /**
   * Check if a specific clue has been revealed
   */
  static async isClueRevealed(sessionId: string, clueId: string, roundNumber: number): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM revealed_clues 
       WHERE session_id = $1 AND clue_id = $2 AND round_number = $3`,
      [sessionId, clueId, roundNumber]
    );

    return result.rows.length > 0;
  }

  /**
   * Reveal all remaining clues (for end of round or debugging)
   */
  static async revealAllClues(sessionId: string, roundNumber: number): Promise<ClueRevealState> {
    const state = await this.getClueRevealState(sessionId, roundNumber);
    
    while (!state.isComplete) {
      await this.revealNextClue(sessionId, roundNumber);
      const newState = await this.getClueRevealState(sessionId, roundNumber);
      if (newState.nextClueIndex <= state.nextClueIndex) {
        break; // Prevent infinite loop
      }
      Object.assign(state, newState);
    }

    return state;
  }

  /**
   * Reset clue reveals for a session and round (for restart scenarios)
   */
  static async resetClueReveals(sessionId: string, roundNumber: number): Promise<void> {
    await query(
      `DELETE FROM revealed_clues 
       WHERE session_id = $1 AND round_number = $2`,
      [sessionId, roundNumber]
    );

    // Also remove related score events
    await query(
      `DELETE FROM score_events 
       WHERE session_id = $1 AND round_number = $2 AND event_type = 'clue_revealed'`,
      [sessionId, roundNumber]
    );
  }

  /**
   * Get clue reveal statistics for educational reporting
   */
  static async getClueRevealStats(sessionId: string): Promise<{
    totalClues: number;
    revealedClues: number;
    averageRevealTime: number;
    clueTypeDistribution: Record<string, number>;
  }> {
    const result = await query(
      `SELECT 
         COUNT(*) as revealed_count,
         AVG(EXTRACT(EPOCH FROM (rc.revealed_at - gs.started_at))) as avg_reveal_time,
         c.type,
         COUNT(c.type) as type_count
       FROM revealed_clues rc
       JOIN clues c ON rc.clue_id = c.id
       JOIN game_sessions gs ON rc.session_id = gs.id
       WHERE rc.session_id = $1
       GROUP BY c.type`,
      [sessionId]
    );

    const totalCluesResult = await query(
      `SELECT COUNT(*) as total
       FROM clues c
       JOIN game_sessions gs ON c.case_id = gs.case_id
       WHERE gs.id = $1`,
      [sessionId]
    );

    const typeDistribution: Record<string, number> = {};
    let totalRevealed = 0;
    let totalRevealTime = 0;

    result.rows.forEach((row: any) => {
      typeDistribution[row.type] = parseInt(row.type_count);
      totalRevealed += parseInt(row.type_count);
      totalRevealTime += parseFloat(row.avg_reveal_time) || 0;
    });

    return {
      totalClues: parseInt(totalCluesResult.rows[0]?.total) || 0,
      revealedClues: totalRevealed,
      averageRevealTime: totalRevealTime / Math.max(1, result.rows.length),
      clueTypeDistribution: typeDistribution,
    };
  }
}