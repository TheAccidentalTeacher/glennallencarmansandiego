import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { AuthService } from '../../services/authService';

export interface GameSocketMessage {
  type: 'game_state_update' | 'clue_revealed' | 'team_joined' | 'round_advance' | 'game_complete' | 'error';
  sessionId: string;
  data?: any;
  timestamp: number;
}

export interface ConnectedClient {
  ws: any;
  userId: string;
  sessionId?: string;
  role: string;
}

class GameSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private sessionRooms: Map<string, Set<string>> = new Map();

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, request) => {
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token
      const decoded = AuthService.verifyToken(token);
      if (!decoded) {
        ws.close(1008, 'Invalid token');
        return;
      }

      const clientId = `${decoded.userId}_${Date.now()}`;
      const client: ConnectedClient = {
        ws,
        userId: decoded.userId,
        role: decoded.role,
      };

      this.clients.set(clientId, client);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection_established',
        message: 'WebSocket connection established',
        userId: decoded.userId,
      });

      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          this.sendToClient(clientId, {
            type: 'error',
            message: 'Invalid message format',
          });
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection(clientId);
      });
    });
  }

  private handleMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'join_session':
        this.handleJoinSession(clientId, message.sessionId);
        break;
      case 'leave_session':
        this.handleLeaveSession(clientId);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
        break;
      default:
        this.sendToClient(clientId, {
          type: 'error',
          message: 'Unknown message type',
        });
    }
  }

  private handleJoinSession(clientId: string, sessionId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave current session if any
    if (client.sessionId) {
      this.handleLeaveSession(clientId);
    }

    // Join new session
    client.sessionId = sessionId;
    
    if (!this.sessionRooms.has(sessionId)) {
      this.sessionRooms.set(sessionId, new Set());
    }
    this.sessionRooms.get(sessionId)!.add(clientId);

    this.sendToClient(clientId, {
      type: 'session_joined',
      sessionId,
      message: 'Successfully joined session',
    });

    // Notify others in the session
    this.broadcastToSession(sessionId, {
      type: 'user_joined',
      userId: client.userId,
      sessionId,
    }, clientId);
  }

  private handleLeaveSession(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) return;

    const sessionId = client.sessionId;
    
    // Remove from session room
    const sessionClients = this.sessionRooms.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(clientId);
      if (sessionClients.size === 0) {
        this.sessionRooms.delete(sessionId);
      }
    }

    // Notify others in the session
    this.broadcastToSession(sessionId, {
      type: 'user_left',
      userId: client.userId,
      sessionId,
    }, clientId);

    client.sessionId = undefined;
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client && client.sessionId) {
      this.handleLeaveSession(clientId);
    }
    this.clients.delete(clientId);
  }

  private sendToClient(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== 1) return; // 1 = OPEN

    try {
      client.ws.send(JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error sending message to client:', error);
      this.handleDisconnection(clientId);
    }
  }

  private broadcastToSession(sessionId: string, data: any, excludeClientId?: string): void {
    const sessionClients = this.sessionRooms.get(sessionId);
    if (!sessionClients) return;

    const message = JSON.stringify({
      ...data,
      timestamp: Date.now(),
    });

    sessionClients.forEach(clientId => {
      if (clientId === excludeClientId) return;
      
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) {
        try {
          client.ws.send(message);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
          this.handleDisconnection(clientId);
        }
      }
    });
  }

  // Public methods for game events
  public broadcastGameStateUpdate(sessionId: string, gameState: any): void {
    this.broadcastToSession(sessionId, {
      type: 'game_state_update',
      sessionId,
      data: gameState,
    });
  }

  public broadcastClueRevealed(sessionId: string, clue: any): void {
    this.broadcastToSession(sessionId, {
      type: 'clue_revealed',
      sessionId,
      data: clue,
    });
  }

  public broadcastTeamJoined(sessionId: string, team: any): void {
    this.broadcastToSession(sessionId, {
      type: 'team_joined',
      sessionId,
      data: team,
    });
  }

  public broadcastRoundAdvance(sessionId: string, roundData: any): void {
    this.broadcastToSession(sessionId, {
      type: 'round_advance',
      sessionId,
      data: roundData,
    });
  }

  public broadcastGameComplete(sessionId: string, finalResults: any): void {
    this.broadcastToSession(sessionId, {
      type: 'game_complete',
      sessionId,
      data: finalResults,
    });
  }

  public getConnectedUsers(sessionId: string): string[] {
    const sessionClients = this.sessionRooms.get(sessionId);
    if (!sessionClients) return [];

    return Array.from(sessionClients)
      .map(clientId => this.clients.get(clientId))
      .filter(client => client !== undefined)
      .map(client => client!.userId);
  }

  public getActiveSessionsCount(): number {
    return this.sessionRooms.size;
  }

  public getTotalConnections(): number {
    return this.clients.size;
  }
}

// Export singleton instance
export const gameSocketManager = new GameSocketManager();

export function setupWebSocket(server: Server): void {
  gameSocketManager.initialize(server);
  console.log('WebSocket server initialized on /ws');
}