// Export API client
export { api, apiClient, TokenManager, handleApiError, isApiSuccess } from './client';
export type { ApiResponse } from './client';

// Export authentication
export { AuthService } from './auth';
export type { 
  User, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest 
} from './auth';

// Export game services
export { GameService } from './game';
export type {
  GameSession,
  GameSettings,
  GameState,
  TeamScore,
  ClueResult,
  WarrantSubmission,
  WarrantResult,
  SessionAnalytics
} from './game';

// Export content services
export { ContentService } from './content';
export type {
  Case,
  Clue,
  Location,
  Villain,
  CreateCaseRequest,
  UpdateCaseRequest,
  CaseListParams
} from './content';

// Export WebSocket
export { webSocketService, WebSocketService } from './websocket';
export type {
  WebSocketMessage,
  GameStateUpdateMessage,
  ClueRevealedMessage,
  TeamJoinedMessage,
  RoundAdvanceMessage,
  GameCompleteMessage,
  WebSocketEventHandler,
  WebSocketEventHandlers
} from './websocket';