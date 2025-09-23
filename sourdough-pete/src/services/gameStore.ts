import { create } from 'zustand';
import type { GameState, GameSession, SessionTeam, Case, Villain, ScoreEvent, WarrantSubmission } from '../types';

interface GameStore extends GameState {
  // Actions
  setSession: (session: GameSession | null) => void;
  setTeams: (teams: SessionTeam[]) => void;
  setCurrentCase: (caseData: Case | null) => void;
  setCurrentVillain: (villain: Villain | null) => void;
  addRevealedClue: (clue: string) => void;
  addScore: (scoreEvent: ScoreEvent) => void;
  addWarrant: (warrant: WarrantSubmission) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  session: null,
  teams: [],
  currentCase: null,
  currentVillain: null,
  revealedClues: [],
  scores: [],
  warrants: [],
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),
  
  setTeams: (teams) => set({ teams }),
  
  setCurrentCase: (currentCase) => set({ currentCase }),
  
  setCurrentVillain: (currentVillain) => set({ currentVillain }),
  
  addRevealedClue: (clue) => set((state) => ({
    revealedClues: [...state.revealedClues, clue]
  })),
  
  addScore: (scoreEvent) => set((state) => ({
    scores: [...state.scores, scoreEvent]
  })),
  
  addWarrant: (warrant) => set((state) => ({
    warrants: [...state.warrants, warrant]
  })),
  
  resetGame: () => set(initialState),
}));

// Selectors
export const useCurrentRound = () => {
  return useGameStore((state) => state.session?.currentRound || 0);
};

export const useTeamScores = () => {
  return useGameStore((state) => {
    const teams = state.teams;
    const scores = state.scores;
    
    return teams.map(team => {
      const teamScores = scores.filter(score => score.teamId === team.id);
      const totalScore = teamScores.reduce((sum, score) => sum + score.points, 0);
      
      return {
        ...team,
        totalScore,
        scoreEvents: teamScores,
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  });
};

export const useGameStatus = () => {
  return useGameStore((state) => ({
    isActive: state.session?.status === 'active',
    isPaused: state.session?.status === 'paused',
    isCompleted: state.session?.status === 'completed',
    currentRound: state.session?.currentRound || 0,
    totalRounds: 4,
  }));
};