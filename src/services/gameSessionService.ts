import { query } from './database';
import type { GameSession, SessionTeam, ScoreEvent } from '../types';

export class GameSessionService {
  static async createSession(sessionData: {
    caseId: string;
    hostId: string;
    settings?: Record<string, any>;
  }): Promise<GameSession> {
    // Generate unique session code
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const result = await query(
      `INSERT INTO game_sessions (session_code, case_id, host_id, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sessionCode, sessionData.caseId, sessionData.hostId, JSON.stringify(sessionData.settings || {})]
    );
    
    return this.mapSessionFromDb(result.rows[0]);
  }

  static async findByCode(sessionCode: string): Promise<GameSession | null> {
    const result = await query(
      `SELECT gs.*, c.title as case_title, c.description as case_description
       FROM game_sessions gs
       JOIN cases c ON gs.case_id = c.id
       WHERE gs.session_code = $1`,
      [sessionCode]
    );
    
    if (!result.rows[0]) return null;
    return this.mapSessionFromDb(result.rows[0]);
  }

  static async findById(id: string): Promise<GameSession | null> {
    const result = await query(
      `SELECT gs.*, c.title as case_title, c.description as case_description
       FROM game_sessions gs
       JOIN cases c ON gs.case_id = c.id
       WHERE gs.id = $1`,
      [id]
    );
    
    if (!result.rows[0]) return null;
    return this.mapSessionFromDb(result.rows[0]);
  }

  static async updateStatus(id: string, status: 'waiting' | 'active' | 'paused' | 'completed'): Promise<GameSession | null> {
    const updates: any = { status };
    
    if (status === 'active' && !await this.isSessionStarted(id)) {
      updates.started_at = new Date().toISOString();
    }
    
    if (status === 'completed') {
      updates.ended_at = new Date().toISOString();
    }

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await query(
      `UPDATE game_sessions SET ${setClause}, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      values
    );
    
    return result.rows[0] ? this.mapSessionFromDb(result.rows[0]) : null;
  }

  static async updateRound(id: string, round: number): Promise<GameSession | null> {
    const result = await query(
      'UPDATE game_sessions SET current_round = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, round]
    );
    
    return result.rows[0] ? this.mapSessionFromDb(result.rows[0]) : null;
  }

  static async getSessionTeams(sessionId: string): Promise<SessionTeam[]> {
    const result = await query(
      `SELECT st.*, t.name as team_name, t.color as team_color
       FROM session_teams st
       JOIN teams t ON st.team_id = t.id
       WHERE st.session_id = $1 AND st.is_active = true
       ORDER BY st.join_order`,
      [sessionId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.team_id,
      name: row.team_name,
      color: row.team_color,
      isActive: row.is_active,
      joinOrder: row.join_order,
      joinedAt: row.joined_at,
    }));
  }

  static async addTeamToSession(sessionId: string, teamId: string): Promise<SessionTeam> {
    // Get the next join order
    const orderResult = await query(
      'SELECT COALESCE(MAX(join_order), 0) + 1 as next_order FROM session_teams WHERE session_id = $1',
      [sessionId]
    );
    
    const joinOrder = orderResult.rows[0].next_order;
    
    const result = await query(
      `INSERT INTO session_teams (session_id, team_id, join_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sessionId, teamId, joinOrder]
    );
    
    // Get team details
    const teamResult = await query('SELECT * FROM teams WHERE id = $1', [teamId]);
    const team = teamResult.rows[0];
    
    return {
      id: team.id,
      name: team.name,
      color: team.color,
      isActive: result.rows[0].is_active,
      joinOrder: result.rows[0].join_order,
      joinedAt: result.rows[0].joined_at,
    };
  }

  static async removeTeamFromSession(sessionId: string, teamId: string): Promise<boolean> {
    const result = await query(
      'UPDATE session_teams SET is_active = false WHERE session_id = $1 AND team_id = $2',
      [sessionId, teamId]
    );
    
    return result.rowCount > 0;
  }

  static async getScores(sessionId: string): Promise<ScoreEvent[]> {
    const result = await query(
      `SELECT se.*, t.name as team_name, t.color as team_color
       FROM score_events se
       JOIN teams t ON se.team_id = t.id
       WHERE se.session_id = $1
       ORDER BY se.created_at DESC`,
      [sessionId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      teamId: row.team_id,
      teamName: row.team_name,
      teamColor: row.team_color,
      roundNumber: row.round_number,
      eventType: row.event_type,
      points: row.points,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  static async addScore(scoreData: {
    sessionId: string;
    teamId: string;
    roundNumber: number;
    eventType: string;
    points: number;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<ScoreEvent> {
    const result = await query(
      `INSERT INTO score_events (session_id, team_id, round_number, event_type, points, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        scoreData.sessionId,
        scoreData.teamId,
        scoreData.roundNumber,
        scoreData.eventType,
        scoreData.points,
        scoreData.description,
        JSON.stringify(scoreData.metadata || {})
      ]
    );
    
    // Get team details
    const teamResult = await query('SELECT name, color FROM teams WHERE id = $1', [scoreData.teamId]);
    const team = teamResult.rows[0];
    
    return {
      id: result.rows[0].id,
      sessionId: result.rows[0].session_id,
      teamId: result.rows[0].team_id,
      teamName: team.name,
      teamColor: team.color,
      roundNumber: result.rows[0].round_number,
      eventType: result.rows[0].event_type,
      points: result.rows[0].points,
      description: result.rows[0].description,
      metadata: result.rows[0].metadata,
      createdAt: result.rows[0].created_at,
    };
  }

  private static async isSessionStarted(id: string): Promise<boolean> {
    const result = await query('SELECT started_at FROM game_sessions WHERE id = $1', [id]);
    return result.rows[0]?.started_at != null;
  }

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
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async listActiveSessions(hostId?: string): Promise<GameSession[]> {
    const whereClause = hostId ? 'WHERE gs.host_id = $1 AND gs.status IN (\'waiting\', \'active\', \'paused\')' : 'WHERE gs.status IN (\'waiting\', \'active\', \'paused\')';
    const params = hostId ? [hostId] : [];
    
    const result = await query(
      `SELECT gs.*, c.title as case_title, c.description as case_description
       FROM game_sessions gs
       JOIN cases c ON gs.case_id = c.id
       ${whereClause}
       ORDER BY gs.created_at DESC`,
      params
    );
    
    return result.rows.map((row: any) => this.mapSessionFromDb(row));
  }
}