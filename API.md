# Sourdough Pete API Documentation

## Overview

The Sourdough Pete API provides a comprehensive backend for the educational geography game. It follows RESTful principles and includes WebSocket support for real-time game interactions.

**📋 IMPLEMENTATION STATUS:**
- **✅ CURRENT:** Static file serving, villain images, basic content endpoints
- **🚧 PLANNED:** JWT authentication, user management, game session management
- **📋 IN DEVELOPMENT:** Teacher-led MVP (no authentication required initially)

## Base URL
- Development: `http://localhost:3001`
- Production: `https://your-app.railway.app`

## Current Implemented Endpoints (September 2025)

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-27T10:30:00.000Z"
}
```

### GET /api/images/villains
List available villain image directories.

**Response:**
```json
[
  "sourdough-pete",
  "dr-meridian",
  "professor-sahara",
  ...
]
```

### Static File Endpoints
- `/images/*` - Serves villain images from content/villains/images/
- `/content/*` - Serves static content files

---

## PLANNED FEATURES (Future Implementation)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "teacher@school.edu",
  "password": "securepassword",
  "displayName": "Ms. Johnson",
  "role": "teacher"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "teacher@school.edu",
      "displayName": "Ms. Johnson",
      "role": "teacher"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

#### POST /api/auth/login
Authenticate and receive access tokens.

**Request Body:**
```json
{
  "email": "teacher@school.edu",
  "password": "securepassword"
}
```

#### GET /api/auth/profile
Get current user profile (requires authentication).

#### PUT /api/auth/profile
Update user profile (requires authentication).

#### PUT /api/auth/password
Change user password (requires authentication).

#### POST /api/auth/refresh
Refresh access token using refresh token.

## Game Management

### Game Session Endpoints

#### POST /api/game/sessions/{sessionId}/start
Start a game session (teachers only).

**Parameters:**
- `sessionId`: Game session identifier

**Response:**
```json
{
  "success": true,
  "message": "Game session started",
  "data": {
    "gameState": {
      "session": {...},
      "currentRound": 1,
      "roundState": "waiting",
      "timeRemaining": 900
    }
  }
}
```

#### GET /api/game/sessions/{sessionId}/state
Get current game state.

#### POST /api/game/sessions/{sessionId}/clues/reveal
Reveal next clue (teachers only).

#### POST /api/game/sessions/{sessionId}/warrants
Submit a warrant/guess.

**Request Body:**
```json
{
  "locationId": "location-uuid",
  "reasoning": "Based on the clues about the ancient marketplace..."
}
```

#### POST /api/game/sessions/{sessionId}/rounds/advance
Advance to next round (teachers only).

#### POST /api/game/sessions/{sessionId}/complete
Complete/end game (teachers only).

#### GET /api/game/sessions/{sessionId}/analytics
Get session analytics (teachers only).

#### POST /api/game/sessions/{sessionId}/pause
Pause game (teachers only).

#### POST /api/game/sessions/{sessionId}/resume
Resume game (teachers only).

## Content Management

### Case Endpoints

#### GET /api/content/cases
Get all available cases.

**Query Parameters:**
- `limit`: Number of cases to return (default: 50)
- `offset`: Number of cases to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "uuid",
        "title": "The Missing Artifacts of Athens",
        "description": "Ancient artifacts have gone missing from the Acropolis...",
        "difficultyLevel": 3,
        "villainName": "Carmen Sandiego",
        "locationName": "Athens",
        "locationCountry": "Greece"
      }
    ]
  }
}
```

#### GET /api/content/my-cases
Get cases created by authenticated user (teachers only).

#### GET /api/content/cases/{caseId}/clues
Get clues for a specific case.

#### POST /api/content/cases
Create a new case (teachers only).

**Request Body:**
```json
{
  "title": "The Case of the Stolen Artifacts",
  "description": "Investigate the theft of ancient artifacts",
  "difficultyLevel": 3,
  "villainId": "villain-uuid",
  "targetLocationId": "location-uuid",
  "estimatedDurationMinutes": 45
}
```

#### PUT /api/content/cases/{caseId}
Update a case (teachers only).

#### DELETE /api/content/cases/{caseId}
Delete a case (teachers only).

## WebSocket API

### Connection

Connect to WebSocket at `/ws` with authentication token:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=your-jwt-token');
```

### Message Types

#### Client to Server Messages

**Join Session:**
```json
{
  "type": "join_session",
  "sessionId": "session-uuid"
}
```

**Leave Session:**
```json
{
  "type": "leave_session"
}
```

**Ping:**
```json
{
  "type": "ping"
}
```

#### Server to Client Messages

**Game State Update:**
```json
{
  "type": "game_state_update",
  "sessionId": "session-uuid",
  "data": {
    "currentRound": 2,
    "roundState": "revealing",
    "timeRemaining": 780
  },
  "timestamp": 1640995200000
}
```

**Clue Revealed:**
```json
{
  "type": "clue_revealed",
  "sessionId": "session-uuid",
  "data": {
    "clue": {
      "id": "clue-uuid",
      "content": "This ancient city is known for its Parthenon...",
      "pointsValue": 100
    }
  },
  "timestamp": 1640995200000
}
```

**Team Joined:**
```json
{
  "type": "team_joined",
  "sessionId": "session-uuid",
  "data": {
    "team": {
      "id": "team-uuid",
      "name": "Detective Squad",
      "memberCount": 4
    }
  },
  "timestamp": 1640995200000
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Security Features

- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection against common attacks
- **Rate Limiting**: Protection against DDoS and abuse
- **Input Validation**: Comprehensive request validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds

## Development

### Starting the API Server

```bash
# Development mode with hot reload
npm run dev:api

# Production build and start
npm run build
npm start
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3001)

### Testing with curl

**Register a user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User",
    "role": "teacher"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get cases:**
```bash
curl http://localhost:3001/api/content/cases
```

## Production Deployment

The API is designed to deploy seamlessly to Railway or similar platforms. Key considerations:

- Environment variables are automatically configured
- Database migrations should run before deployment
- WebSocket support requires HTTP server upgrade capability
- Static files are served from the `/dist` directory

## Support

For questions or issues with the API, please refer to the project documentation or create an issue in the repository.