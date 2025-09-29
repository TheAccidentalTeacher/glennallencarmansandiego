# Technical Architecture: Sourdough Pete

## System Overview

This document outlines the technical architecture for the "Sourdough Pete's Geography Challenge" educational geography game.

**⚠️ IMPLEMENTATION STATUS:** This document reflects the planned full-scale architecture. Current MVP implementation focuses on teacher-led gameplay with simplified architecture (React frontend + Express backend + local file-based content + PostgreSQL database setup).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Teacher Dashboard    │  Smart TV Display  │  Content Editor │
│  - Game Controls      │  - Clue Panel      │  - Villain Edit │
│  - Scoreboard        │  - Live Scores     │  - Case Edit    │
│  - Review Queue      │  - Timer Display   │  - Review Tools │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)  │  Routing (React Router)     │
│  UI Components (Tailwind)    │  Real-time (WebSockets)     │
│  Maps (Leaflet)             │  HTTP Client (Fetch API)    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (REST + WebSocket)            │
├─────────────────────────────────────────────────────────────┤
│  Game Management    │  Content Management  │  Authentication │
│  - Cases           │  - Villains          │  - JWT Tokens   │
│  - Sessions        │  - Review Queue      │  - RBAC         │
│  - Scoring         │  - Content Filter    │  - Sessions     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Game Engine        │  Content Services    │  Security       │
│  - Clue Engine      │  - Content Filter    │  - Auth Service │
│  - Scoring Service  │  - Review Workflow   │  - Input Valid. │
│  - Session Manager  │  - Cultural Safety   │  - Rate Limiting│
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                  │
├─────────────────────────────────────────────────────────────┤
│  Core Tables        │  Game Data          │  System Data    │
│  - villains         │  - sessions         │  - users        │
│  - cases            │  - teams            │  - audit_log    │
│  - scoring_profiles │  - score_events     │  - system_config│
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies
- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript 5+** - Strong typing for reliability and developer experience
- **Tailwind CSS 3+** - Utility-first styling with custom theme
- **Zustand** - Lightweight state management
- **React Router 6+** - Client-side routing
- **Leaflet** - Interactive mapping with OpenStreetMap
- **Lucide React** - Consistent icon library
- **Vite** - Fast build tool and development server

### Backend Technologies
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **PostgreSQL 15+** - Primary database
- **JWT** - Authentication tokens
- **Zod** - Schema validation
- **bcrypt** - Password hashing

### Hosting & Infrastructure
- **Railway** (Recommended) - Unified hosting platform
  - Frontend and backend deployment
  - PostgreSQL database hosting
  - Environment management
  - Auto-scaling capabilities

- **Netlify + Supabase** (Alternative)
  - Netlify for static frontend
  - Supabase for backend/database
  - Built-in authentication
  - Real-time subscriptions

## Data Architecture

### Core Entities

#### Villain
```typescript
interface Villain {
  id: string;
  codename: string;
  fullName: string;
  region: string;
  culturalInspiration: string;
  respectNote: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  specialty: string;
  signatureTools: string[];
  callingCard: string;
  modusOperandi: string;
  personalityTraits: string[];
  preferredTargets: string[];
  sampleCaseHook: string;
  imagePromptVintage: string;
  clueTemplates: ClueTemplates;
  educationalTags: string[];
  status: 'active' | 'archived';
  culturalReviewStatus: 'approved' | 'pending' | 'flagged';
  metadata: EntityMetadata;
}
```

#### Case
```typescript
interface Case {
  id: string;
  title: string;
  scenario: string;
  stolenItem: string;
  educationalObjectives: string[];
  primaryGeographicAnswer: string;
  alternateAcceptableAnswers: string[];
  villainId: string;
  rounds: CaseRound[];
  difficultyOverride?: 1 | 2 | 3 | 4 | 5;
  timingProfile: 'full' | 'quick' | 'custom';
  warrantRequirements: WarrantRequirements;
  scoringProfileId: string;
  status: 'draft' | 'published' | 'archived';
  culturalReviewStatus: 'approved' | 'pending' | 'flagged';
  metadata: EntityMetadata;
}
```

### Database Schema Design

#### Core Tables
```sql
-- Villains table with full-text search
CREATE TABLE villains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codename VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  region VARCHAR(100) NOT NULL,
  cultural_inspiration VARCHAR(200) NOT NULL,
  respect_note TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  specialty VARCHAR(200) NOT NULL,
  signature_tools TEXT[] NOT NULL,
  calling_card TEXT NOT NULL,
  modus_operandi TEXT NOT NULL,
  personality_traits TEXT[] NOT NULL,
  preferred_targets TEXT[] NOT NULL,
  sample_case_hook TEXT NOT NULL,
  image_prompt_vintage TEXT NOT NULL,
  clue_templates JSONB NOT NULL,
  educational_tags TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  cultural_review_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL,
  reviewed_by UUID,
  
  -- Indexes for performance
  CONSTRAINT villains_difficulty_check CHECK (difficulty BETWEEN 1 AND 5),
  CONSTRAINT villains_status_check CHECK (status IN ('active', 'archived')),
  CONSTRAINT villains_review_status_check CHECK (cultural_review_status IN ('approved', 'pending', 'flagged'))
);

-- Indexes
CREATE INDEX idx_villains_region ON villains(region);
CREATE INDEX idx_villains_difficulty ON villains(difficulty);
CREATE INDEX idx_villains_status ON villains(status, cultural_review_status);
CREATE INDEX idx_villains_tags ON villains USING GIN(educational_tags);
CREATE INDEX idx_villains_search ON villains USING GIN(to_tsvector('english', codename || ' ' || full_name || ' ' || specialty));
```

#### Game Session Management
```sql
-- Game sessions for active games
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'preparing',
  current_round INTEGER DEFAULT 0,
  timing_profile VARCHAR(20) NOT NULL,
  round_durations INTEGER[] NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  session_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT sessions_status_check CHECK (status IN ('preparing', 'active', 'paused', 'completed', 'cancelled')),
  CONSTRAINT sessions_round_check CHECK (current_round >= 0 AND current_round <= 4)
);

-- Teams for each session
CREATE TABLE session_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  members TEXT[] NOT NULL,
  total_score INTEGER DEFAULT 0,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_team_name_per_session UNIQUE (session_id, name)
);

-- Individual scoring events
CREATE TABLE score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES session_teams(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  awarded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT score_events_round_check CHECK (round_number BETWEEN 1 AND 4),
  CONSTRAINT score_events_category_check CHECK (category IN (
    'location', 'villain', 'speed', 'researchQuality', 
    'culturalInsight', 'penalty', 'bonus'
  ))
);

-- solution submissions
CREATE TABLE warrant_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES session_teams(id) ON DELETE CASCADE,
  proposed_location VARCHAR(200) NOT NULL,
  proposed_villain_id UUID REFERENCES villains(id),
  evidence_justifications TEXT[] NOT NULL,
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 5),
  is_correct_location BOOLEAN,
  is_correct_villain BOOLEAN,
  reviewed_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_warrant_per_team UNIQUE (session_id, team_id)
);
```

## Security Architecture

### Authentication & Authorization
```typescript
// JWT-based authentication
interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'teacher' | 'admin' | 'content_approver';
  permissions: string[];
  exp: number;
}

// Role-based permissions
const PERMISSIONS = {
  CREATE_CASE: 'case:create',
  EDIT_CASE: 'case:edit',
  DELETE_CASE: 'case:delete',
  CREATE_VILLAIN: 'villain:create',
  EDIT_VILLAIN: 'villain:edit',
  APPROVE_CONTENT: 'content:approve',
  MANAGE_USERS: 'user:manage',
  VIEW_AUDIT_LOG: 'audit:view'
} as const;
```

### Input Validation
```typescript
// Zod schemas for all API inputs
const CreateVillainSchema = z.object({
  codename: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  region: z.string().min(1).max(100),
  difficulty: z.number().int().min(1).max(5),
  // ... other fields with validation
});

// Sanitization for user-generated content
const sanitizeUserInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
};
```

### Content Safety
```typescript
// Content filtering service
class ContentFilterService {
  private bannedTokens: string[];
  private warnTokens: string[];

  scanContent(text: string): ContentScanResult {
    const lowerText = text.toLowerCase();
    
    const bannedFound = this.bannedTokens.filter(token => 
      lowerText.includes(token.toLowerCase())
    );
    
    const warningsFound = this.warnTokens.filter(token => 
      lowerText.includes(token.toLowerCase())
    );
    
    return {
      hasBannedContent: bannedFound.length > 0,
      hasWarningContent: warningsFound.length > 0,
      bannedTokens: bannedFound,
      warningTokens: warningsFound,
      recommendedAction: this.getRecommendedAction(bannedFound, warningsFound)
    };
  }
}
```

## Performance Considerations

### Database Optimization
- **Indexes:** Strategic indexes on frequently queried columns
- **Query Optimization:** Efficient queries with proper joins and limits
- **Connection Pooling:** Database connection management
- **Caching:** Redis or in-memory caching for frequently accessed data

### Frontend Optimization
- **Code Splitting:** Route-based and component-based splitting
- **Lazy Loading:** Defer loading of non-critical components
- **Memoization:** React.memo and useMemo for expensive operations
- **Bundle Optimization:** Tree shaking and minification

### Real-time Performance
- **WebSocket Optimization:** Efficient message batching
- **State Synchronization:** Optimistic updates with rollback
- **Connection Management:** Automatic reconnection and heartbeat

## Scalability Architecture

### Horizontal Scaling
```typescript
// Load balancer configuration
const loadBalancerConfig = {
  algorithm: 'round-robin',
  healthCheck: '/api/health',
  servers: [
    { host: 'app1.example.com', weight: 1 },
    { host: 'app2.example.com', weight: 1 },
    { host: 'app3.example.com', weight: 1 }
  ]
};

// Session affinity for WebSocket connections
const sessionAffinity = {
  enabled: true,
  method: 'sticky-session',
  ttl: 3600 // 1 hour
};
```

### Database Scaling
- **Read Replicas:** Separate read operations to replica databases
- **Connection Pooling:** pgBouncer for PostgreSQL connection management
- **Query Optimization:** Regular EXPLAIN ANALYZE for slow queries
- **Indexing Strategy:** Composite indexes for complex queries

### Caching Strategy
```typescript
// Multi-level caching
interface CacheStrategy {
  // Browser cache for static assets
  browserCache: {
    staticAssets: '1 year',
    apiResponses: '5 minutes'
  };
  
  // CDN cache for global distribution
  cdnCache: {
    images: '1 month',
    stylesheets: '1 week',
    scripts: '1 week'
  };
  
  // Application cache for dynamic data
  applicationCache: {
    villains: '1 hour',
    cases: '30 minutes',
    scores: '1 minute'
  };
}
```

## Monitoring & Observability

### Application Monitoring
```typescript
// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
    database: 'connected', // Check DB connection
    cache: 'connected',    // Check cache connection
    memory: process.memoryUsage(),
    load: os.loadavg()
  };
  
  res.json(health);
});

// Performance metrics
const performanceMetrics = {
  responseTime: histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds'
  }),
  
  activeConnections: gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections'
  }),
  
  gamesSessions: gauge({
    name: 'game_sessions_active',
    help: 'Number of active game sessions'
  })
};
```

### Error Tracking
```typescript
// Structured error logging
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  userId?: string;
  sessionId?: string;
  stack?: string;
  context: Record<string, any>;
}

// Error boundary for React components
class GameErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError({
      message: error.message,
      stack: error.stack,
      component: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }
}
```

## Deployment Architecture

### Environment Configuration
```typescript
// Environment-specific configurations
interface EnvironmentConfig {
  development: {
    database: 'postgresql://localhost:5432/sourdough_dev';
    redis: 'redis://localhost:6379';
    logLevel: 'debug';
    cors: { origin: 'http://localhost:3000' };
  };
  
  staging: {
    database: process.env.DATABASE_URL;
    redis: process.env.REDIS_URL;
    logLevel: 'info';
    cors: { origin: 'https://staging.sourdoughpete.com' };
  };
  
  production: {
    database: process.env.DATABASE_URL;
    redis: process.env.REDIS_URL;
    logLevel: 'warn';
    cors: { origin: 'https://sourdoughpete.com' };
  };
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Type check
        run: npm run type-check
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
```

This technical architecture provides a robust foundation for building, deploying, and scaling the Sourdough Pete educational game while maintaining security, performance, and reliability standards.