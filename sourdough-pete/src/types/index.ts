// Core data interfaces for Sourdough Pete application
// Based on the master specification requirements

// User Management Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: 'teacher' | 'admin';
}

export interface Villain {
  id: string; // UUID
  codename: string;
  fullName: string;
  region: string; // e.g., "Western Europe", "Southeast Asia"
  culturalInspiration: string;
  respectNote: string; // Note on respectful portrayal
  difficulty: 1 | 2 | 3 | 4 | 5;
  specialty: string; // e.g., "Marine Biology", "Ancient Cartography"
  signatureTools: string[];
  callingCard: string;
  modusOperandi: string;
  personalityTraits: string[];
  preferredTargets: string[];
  sampleCaseHook: string;
  imagePromptVintage: string; // Prompt for generating a visual
  clueTemplates: ClueTemplates;
  educationalTags: string[];
  status: 'active' | 'archived';
  culturalReviewStatus: 'approved' | 'pending' | 'flagged';
  metadata: EntityMetadata;
}

export interface ClueTemplates {
  geographic: string[];
  cultural: string[];
  economicPolitical: string[];
  landmarkNatural: string[];
  wildcard: string[];
}

export interface Case {
  id: string; // UUID
  title: string;
  scenario: string; // Narrative description of the crime
  stolenItem: string;
  educationalObjectives: string[]; // e.g., ["biomes", "trade routes"]
  primaryGeographicAnswer: string; // Country, region, or city
  alternateAcceptableAnswers: string[];
  villainId: string; // Foreign key to Villain
  rounds: CaseRound[];
  difficultyOverride?: 1 | 2 | 3 | 4 | 5;
  timingProfile: 'full' | 'quick' | 'custom';
  warrantRequirements: WarrantRequirements;
  scoringProfileId: string;
  status: 'draft' | 'published' | 'archived';
  culturalReviewStatus: 'approved' | 'pending' | 'flagged';
  metadata: EntityMetadata;
}

export interface CaseRound {
  roundNumber: 1 | 2 | 3 | 4;
  cluePackets: CluePackets;
  suspectTraits: string[]; // Descriptions of the villain revealed this round
}

export interface CluePackets {
  geographic?: string[];
  cultural?: string[];
  economicPolitical?: string[];
  landmarkNatural?: string[];
  wildcard?: string[];
}

export interface WarrantRequirements {
  requireLocation: boolean;
  requireVillain: boolean;
  requireEvidenceJustifications: number;
}

export interface WarrantSubmission {
  id: string; // UUID
  teamId: string;
  caseId: string;
  submittedAt: string; // ISO Timestamp
  proposedLocation: string;
  proposedVillainId: string;
  evidenceJustifications: string[];
  confidence: 1 | 2 | 3 | 4 | 5; // Self-rated confidence
  isCorrectLocation: boolean;
  isCorrectVillain: boolean;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  cumulativePoints: number;
  rank: string; // Computed based on points
}

export interface ScoreEvent {
  id: string;
  sessionId: string;
  teamId: string;
  teamName?: string;
  teamColor?: string;
  roundNumber: number;
  eventType: 'clue_revealed' | 'correct_guess' | 'incorrect_guess' | 'warrant_submitted' | 'time_bonus';
  points: number;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ScoringProfile {
  id: string;
  label: string;
  roundLocationPoints: [number, number, number, number];
  villainIdentificationPoints: number;
  speedBonus: number;
  researchQualityBonus: number;
  culturalInsightBonus: number;
  wrongArrestPenalty: number;
  difficultyMultipliers: { [level: number]: number };
}

export interface SystemConfig {
  rankThresholds: { rank: string; min: number }[];
  contentFlags: { bannedTokens: string[]; warnTokens: string[] };
  defaultTiming: 'full' | 'quick';
  mappingProvider: 'leaflet' | 'google' | 'local';
}

export interface EntityMetadata {
  createdAt: string; // ISO Timestamp
  updatedAt: string; // ISO Timestamp
  createdBy: string; // User ID
  reviewedBy?: string; // User ID
}

// Game session interfaces
export interface GameSession {
  id: string;
  sessionCode: string;
  caseId: string;
  hostId: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentRound: number;
  startedAt?: string;
  endedAt?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SessionTeam {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  joinOrder: number;
  joinedAt: string;
}

// UI and State interfaces
export interface GameState {
  session: GameSession | null;
  teams: SessionTeam[];
  currentCase: Case | null;
  currentVillain: Villain | null;
  revealedClues: string[];
  scores: ScoreEvent[];
  warrants: WarrantSubmission[];
}

export interface TeacherControls {
  canAdvanceRound: boolean;
  canPauseTimer: boolean;
  canAwardBonus: boolean;
  canOverrideScore: boolean;
}

// Content creation interfaces
export interface ContentScanResult {
  hasBannedContent: boolean;
  hasWarningContent: boolean;
  bannedTokens: string[];
  warningTokens: string[];
  recommendedAction: 'approve' | 'review' | 'reject';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// WebSocket event interfaces
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface ScoreUpdateEvent extends WebSocketEvent {
  type: 'score-update';
  payload: {
    teamId: string;
    scoreEvent: ScoreEvent;
    newTotal: number;
  };
}

export interface RoundAdvanceEvent extends WebSocketEvent {
  type: 'round-advance';
  payload: {
    sessionId: string;
    newRound: number;
    clues: string[];
  };
}

export interface ClueRevealEvent extends WebSocketEvent {
  type: 'clue-reveal';
  payload: {
    sessionId: string;
    round: number;
    clue: string;
  };
}

export interface WarrantSubmissionEvent extends WebSocketEvent {
  type: 'warrant-submitted';
  payload: {
    sessionId: string;
    teamId: string;
    warrant: WarrantSubmission;
  };
}

export interface GameCompleteEvent extends WebSocketEvent {
  type: 'game-complete';
  payload: {
    sessionId: string;
    finalRankings: SessionTeam[];
    correctAnswer: {
      location: string;
      villain: Villain;
    };
  };
}

// Error interfaces
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
  constraint: string;
}