import { TokenManager } from './client';

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  sessionId?: string;
  data?: any;
  timestamp: number;
  message?: string;
  userId?: string;
}

export interface GameStateUpdateMessage extends WebSocketMessage {
  type: 'game_state_update';
  sessionId: string;
  data: {
    currentRound: number;
    roundState: string;
    timeRemaining: number;
    canAdvanceRound: boolean;
    gameComplete: boolean;
  };
}

export interface ClueRevealedMessage extends WebSocketMessage {
  type: 'clue_revealed';
  sessionId: string;
  data: {
    clue: {
      id: string;
      content: string;
      pointsValue: number;
      type: string;
    };
    revealOrder: number;
    timeRevealed: string;
  };
}

export interface TeamJoinedMessage extends WebSocketMessage {
  type: 'team_joined';
  sessionId: string;
  data: {
    team: {
      id: string;
      name: string;
      memberCount: number;
    };
  };
}

export interface RoundAdvanceMessage extends WebSocketMessage {
  type: 'round_advance';
  sessionId: string;
  data: {
    newRound: number;
    roundState: string;
    timeRemaining: number;
  };
}

export interface GameCompleteMessage extends WebSocketMessage {
  type: 'game_complete';
  sessionId: string;
  data: {
    finalResults: any;
    winningTeam?: string;
  };
}

// WebSocket Event Handlers
export type WebSocketEventHandler<T extends WebSocketMessage = WebSocketMessage> = (message: T) => void;

export interface WebSocketEventHandlers {
  onGameStateUpdate?: WebSocketEventHandler<GameStateUpdateMessage>;
  onClueRevealed?: WebSocketEventHandler<ClueRevealedMessage>;
  onTeamJoined?: WebSocketEventHandler<TeamJoinedMessage>;
  onRoundAdvance?: WebSocketEventHandler<RoundAdvanceMessage>;
  onGameComplete?: WebSocketEventHandler<GameCompleteMessage>;
  onUserJoined?: WebSocketEventHandler;
  onUserLeft?: WebSocketEventHandler;
  onConnectionEstablished?: WebSocketEventHandler;
  onError?: WebSocketEventHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

// WebSocket Service
export class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: WebSocketEventHandlers = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private currentSessionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupHeartbeat();
  }

  // Connect to WebSocket server
  connect(handlers: WebSocketEventHandlers = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = TokenManager.getAccessToken();
      if (!token) {
        reject(new Error('Authentication required to connect to WebSocket'));
        return;
      }

      const wsUrl = this.getWebSocketUrl();
      const wsUrlWithToken = `${wsUrl}?token=${encodeURIComponent(token)}`;

      try {
        this.ws = new WebSocket(wsUrlWithToken);
        this.handlers = handlers;

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.handlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.handlers.onDisconnect?.();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.handlers.onError?.({
            type: 'error',
            message: 'WebSocket connection error',
            timestamp: Date.now(),
          });
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.currentSessionId = null;
  }

  // Join a game session
  joinSession(sessionId: string): void {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return;
    }

    this.currentSessionId = sessionId;
    this.sendMessage({
      type: 'join_session',
      sessionId,
    });
  }

  // Leave current session
  leaveSession(): void {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket not connected');
      return;
    }

    this.sendMessage({
      type: 'leave_session',
    });
    this.currentSessionId = null;
  }

  // Send a message
  private sendMessage(message: Partial<WebSocketMessage>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not ready for sending messages');
      return;
    }

    const fullMessage: WebSocketMessage = {
      timestamp: Date.now(),
      ...message,
      type: message.type!,
    };

    this.ws.send(JSON.stringify(fullMessage));
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'game_state_update':
        this.handlers.onGameStateUpdate?.(message as GameStateUpdateMessage);
        break;
      case 'clue_revealed':
        this.handlers.onClueRevealed?.(message as ClueRevealedMessage);
        break;
      case 'team_joined':
        this.handlers.onTeamJoined?.(message as TeamJoinedMessage);
        break;
      case 'round_advance':
        this.handlers.onRoundAdvance?.(message as RoundAdvanceMessage);
        break;
      case 'game_complete':
        this.handlers.onGameComplete?.(message as GameCompleteMessage);
        break;
      case 'user_joined':
        this.handlers.onUserJoined?.(message);
        break;
      case 'user_left':
        this.handlers.onUserLeft?.(message);
        break;
      case 'connection_established':
        this.handlers.onConnectionEstablished?.(message);
        break;
      case 'error':
        this.handlers.onError?.(message);
        break;
      case 'pong':
        // Handle heartbeat response
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  // Setup heartbeat to keep connection alive
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.sendMessage({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  // Attempt to reconnect
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(this.handlers)
        .then(() => {
          console.log('Reconnected successfully');
          this.handlers.onReconnect?.();
          
          // Rejoin session if we were in one
          if (this.currentSessionId) {
            this.joinSession(this.currentSessionId);
          }
        })
        .catch((error) => {
          console.error('Reconnection failed:', error);
        });
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  // Get WebSocket URL
  private getWebSocketUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return apiUrl.replace(/^http/, 'ws') + '/ws';
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get sessionId(): string | null {
    return this.currentSessionId;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;