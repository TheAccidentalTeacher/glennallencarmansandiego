import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { GameService, webSocketService } from '../api';
import { useNotifications } from './NotificationContext';
import type { 
  GameState, 
  GameSettings, 
  ClueResult, 
  WarrantSubmission, 
  WarrantResult,
  WebSocketEventHandlers
} from '../api';

interface GameContextType {
  // Game State
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  
  // Current Session
  sessionId: string | null;
  isConnected: boolean;
  
  // Teacher Actions
  startSession: (sessionId: string, settings?: GameSettings) => Promise<boolean>;
  revealNextClue: () => Promise<ClueResult | null>;
  advanceRound: () => Promise<boolean>;
  pauseGame: () => Promise<boolean>;
  resumeGame: () => Promise<boolean>;
  completeGame: () => Promise<boolean>;
  
  // Student Actions
  submitWarrant: (warrant: WarrantSubmission) => Promise<WarrantResult | null>;
  
  // Session Management
  joinSession: (sessionId: string) => Promise<boolean>;
  leaveSession: () => void;
  refreshGameState: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useNotifications();

  // WebSocket event handlers
  const websocketHandlers: WebSocketEventHandlers = {
    onGameStateUpdate: (message) => {
      console.log('Game state update received:', message.data);
      if (message.sessionId === sessionId) {
        // Safely update game state with proper typing
        setGameState(message.data as GameState);
      }
    },
    
    onClueRevealed: (message) => {
      console.log('Clue revealed:', message.data);
      addNotification({
        type: 'info',
        title: 'New Clue Revealed!',
        message: 'A new piece of evidence has been discovered. Study it carefully!',
        duration: 4000
      });
    },
    
    onRoundAdvance: (message) => {
      console.log('Round advanced:', message.data);
      if (message.sessionId === sessionId) {
        // Update specific round-related properties
        setGameState(prev => prev ? {
          ...prev,
          currentRound: (message.data as any).newRound || prev.currentRound,
          roundState: (message.data as any).roundState || prev.roundState,
          timeRemaining: (message.data as any).timeRemaining ?? prev.timeRemaining,
          canAdvanceRound: (message.data as any).canAdvanceRound ?? prev.canAdvanceRound
        } : null);
        
        addNotification({
          type: 'success',
          title: 'Round Complete!',
          message: `Moving to Round ${(message.data as any).newRound || 'next'}`,
          duration: 3000
        });
      }
    },
    
    onGameComplete: (message) => {
      console.log('Game completed:', message.data);
      if (message.sessionId === sessionId) {
        setGameState(prev => prev ? { 
          ...prev, 
          gameComplete: true,
          roundState: 'complete' as const
        } : null);
        
        addNotification({
          type: 'success',
          title: 'Mission Complete! 🎉',
          message: 'Great detective work! Check out the final results.',
          duration: 6000
        });
      }
    },
    
    onConnect: () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    },
    
    onDisconnect: () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    },
    
    onError: (message) => {
      console.error('WebSocket error:', message);
      setError(message.message || 'WebSocket connection error');
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await webSocketService.connect(websocketHandlers);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setError('Failed to establish real-time connection');
      }
    };

    initWebSocket();

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Clear error after a timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = (err: any, defaultMessage: string) => {
    console.error(err);
    const message = err?.response?.data?.error?.message || err?.message || defaultMessage;
    setError(message);
  };

  const startSession = async (sessionId: string, settings?: GameSettings): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.startSession(sessionId, settings);
      
      if (response.success && response.data) {
        setGameState(response.data.gameState);
        setSessionId(sessionId);
        
        // Join WebSocket room
        if (isConnected) {
          webSocketService.joinSession(sessionId);
        }
        
        return true;
      } else {
        handleError(response, 'Failed to start game session');
        return false;
      }
    } catch (error) {
      handleError(error, 'Failed to start game session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const revealNextClue = async (): Promise<ClueResult | null> => {
    if (!sessionId) {
      setError('No active session');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.revealNextClue(sessionId);
      
      if (response.success && response.data) {
        return response.data.clueResult;
      } else {
        handleError(response, 'Failed to reveal clue');
        return null;
      }
    } catch (error) {
      handleError(error, 'Failed to reveal clue');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const advanceRound = async (): Promise<boolean> => {
    if (!sessionId) {
      setError('No active session');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.advanceRound(sessionId);
      
      if (response.success && response.data) {
        setGameState(response.data.gameState);
        return true;
      } else {
        handleError(response, 'Failed to advance round');
        return false;
      }
    } catch (error) {
      handleError(error, 'Failed to advance round');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const pauseGame = async (): Promise<boolean> => {
    if (!sessionId) {
      setError('No active session');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.pauseGame(sessionId);
      
      if (response.success && response.data) {
        setGameState(response.data.gameState);
        return true;
      } else {
        handleError(response, 'Failed to pause game');
        return false;
      }
    } catch (error) {
      handleError(error, 'Failed to pause game');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resumeGame = async (): Promise<boolean> => {
    if (!sessionId) {
      setError('No active session');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.resumeGame(sessionId);
      
      if (response.success && response.data) {
        setGameState(response.data.gameState);
        return true;
      } else {
        handleError(response, 'Failed to resume game');
        return false;
      }
    } catch (error) {
      handleError(error, 'Failed to resume game');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeGame = async (): Promise<boolean> => {
    if (!sessionId) {
      setError('No active session');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.completeGame(sessionId);
      
      if (response.success && response.data) {
        setGameState(response.data.finalState);
        return true;
      } else {
        handleError(response, 'Failed to complete game');
        return false;
      }
    } catch (error) {
      handleError(error, 'Failed to complete game');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitWarrant = async (warrant: WarrantSubmission): Promise<WarrantResult | null> => {
    if (!sessionId) {
      setError('No active session');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.submitWarrant(sessionId, warrant);
      
      if (response.success && response.data) {
        return response.data.result;
      } else {
        handleError(response, 'Failed to submit warrant');
        return null;
      }
    } catch (error) {
      handleError(error, 'Failed to submit warrant');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async (newSessionId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await GameService.getGameState(newSessionId);
      
      if (response.success && response.data) {
        setGameState(response.data.gameState);
        setSessionId(newSessionId);
        
        // Join WebSocket room
        if (isConnected) {
          webSocketService.joinSession(newSessionId);
        }
        
        return true;
      } else {
        handleError(response, 'Failed to join session');
        return false;
      }
    } catch (error) {
      handleError(error, 'Failed to join session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveSession = useCallback(() => {
    setGameState(null);
    setSessionId(null);
    
    if (isConnected) {
      webSocketService.leaveSession();
    }
  }, [isConnected]);

  const refreshGameState = async (): Promise<void> => {
    if (!sessionId) return;

    try {
      const response = await GameService.getGameState(sessionId);
      
      if (response.success && response.data) {
        setGameState(response.data.gameState);
      }
    } catch (error) {
      console.error('Failed to refresh game state:', error);
    }
  };

  const contextValue: GameContextType = {
    gameState,
    isLoading,
    error,
    sessionId,
    isConnected,
    startSession,
    revealNextClue,
    advanceRound,
    pauseGame,
    resumeGame,
    completeGame,
    submitWarrant,
    joinSession,
    leaveSession,
    refreshGameState,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;