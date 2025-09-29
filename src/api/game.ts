import { api } from './client';
import type { ApiResponse } from './client';

// Game Types
export interface GameSession {
  id: string;
  caseId: string;
  teacherId: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  settings: GameSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GameSettings {
  timeLimit?: number;
  maxTeams?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  maxRounds: number;
  cluesPerRound: number;
  roundDurationMinutes: number;
  timeBetweenRounds: number;
  autoAdvanceRounds: boolean;
  allowLateJoins: boolean;
}

export interface GameState {
  session: GameSession;
  currentRound: number;
  roundState: 'waiting' | 'revealing' | 'guessing' | 'scoring' | 'complete';
  clueState: ClueRevealState;
  timeRemaining: number;
  canAdvanceRound: boolean;
  gameComplete: boolean;
  teamScores: TeamScore[];
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

export interface RevealedClue {
  id: string;
  text: string;
  type: 'geography' | 'culture' | 'historical' | 'economic' | 'visual';
  round: number;
  timestamp: Date;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  totalScore: number;
  roundScores: number[];
  lastUpdated: string;
}

export interface ClueResult {
  clue: {
    id: string;
    content: string;
    pointsValue: number;
    type: string;
  };
  revealOrder: number;
  timeRevealed: string;
}

export interface WarrantSubmission {
  locationId: string;
  reasoning?: string;
}

export interface WarrantResult {
  correct: boolean;
  pointsAwarded: number;
  feedback: string;
  correctLocation?: {
    id: string;
    name: string;
    country: string;
  };
}

export interface SessionAnalytics {
  totalTeams: number;
  averageScore: number;
  completionRate: number;
  avgTimePerRound: number;
  mostMissedClues: string[];
  topPerformingTeams: TeamScore[];
}

// Game Service
export class GameService {
  // Start a game session
  static async startSession(sessionId: string, settings?: GameSettings): Promise<ApiResponse<{ gameState: GameState }>> {
    return api.post<{ gameState: GameState }>(`/game/sessions/${sessionId}/start`, settings);
  }

  // Get current game state
  static async getGameState(sessionId: string): Promise<ApiResponse<{ gameState: GameState }>> {
    return api.get<{ gameState: GameState }>(`/game/sessions/${sessionId}/state`);
  }

  // Reveal next clue (teachers only)
  static async revealNextClue(sessionId: string): Promise<ApiResponse<{ clueResult: ClueResult }>> {
    return api.post<{ clueResult: ClueResult }>(`/game/sessions/${sessionId}/clues/reveal`);
  }

  // Submit a warrant/guess
  static async submitWarrant(sessionId: string, warrant: WarrantSubmission): Promise<ApiResponse<{ result: WarrantResult }>> {
    return api.post<{ result: WarrantResult }>(`/game/sessions/${sessionId}/warrants`, warrant);
  }

  // Advance to next round (teachers only)
  static async advanceRound(sessionId: string): Promise<ApiResponse<{ gameState: GameState }>> {
    return api.post<{ gameState: GameState }>(`/game/sessions/${sessionId}/rounds/advance`);
  }

  // Complete/end game (teachers only)
  static async completeGame(sessionId: string): Promise<ApiResponse<{ finalState: GameState }>> {
    return api.post<{ finalState: GameState }>(`/game/sessions/${sessionId}/complete`);
  }

  // Pause game (teachers only)
  static async pauseGame(sessionId: string): Promise<ApiResponse<{ gameState: GameState }>> {
    return api.post<{ gameState: GameState }>(`/game/sessions/${sessionId}/pause`);
  }

  // Resume game (teachers only)
  static async resumeGame(sessionId: string): Promise<ApiResponse<{ gameState: GameState }>> {
    return api.post<{ gameState: GameState }>(`/game/sessions/${sessionId}/resume`);
  }

  // Get session analytics (teachers only)
  static async getSessionAnalytics(sessionId: string): Promise<ApiResponse<{ analytics: SessionAnalytics }>> {
    return api.get<{ analytics: SessionAnalytics }>(`/game/sessions/${sessionId}/analytics`);
  }
}

export default GameService;