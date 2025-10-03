# CURRENT SYSTEM API DOCUMENTATION
## Working API Endpoints (Pre-Enhancement)

### Backend Server: localhost:3001

#### Health Check
- **GET /health** → `{"status":"ok","timestamp":"...","environment":"development"}`
- **GET /healthz** → Same as above (Railway compatibility)

#### Content API (File-based)
- **GET /api/content/cases** → List all cases from filesystem
- **GET /api/content/cases/:caseId.json** → Raw case JSON file
- **GET /api/content/cases/:caseId/clues** → Derived clues from case rounds

#### Session Management API  
- **POST /api/sessions** → Create new game session
  - Body: `{"caseId": "case-id"}`
  - Response: `{"success": true, "session": {...}}`

- **GET /api/sessions/:sessionId** → Get session details
  - Response: `{"success": true, "session": {...}}`

- **POST /api/sessions/:sessionId/clue** → Reveal next clue
  - Response: Updated session with new clue in revealedClues array

- **POST /api/sessions/:sessionId/guess** → Submit location guess
  - Body: `{"latitude": number, "longitude": number, "locationName": string}`
  - Response: Updated session with guess results and distance calculation

#### Static File Serving
- **GET /images/villains/:folder/:file** → Villain images
- **GET /content/villains/images/:folder/:file** → Alternative image path

### Frontend: localhost:5173

#### Main Routes
- **/** → Home page
- **/presentation** → Teacher game presentation interface
- **/cases** → Case browser (if available)

### Current Case JSON Format
```json
{
  "id": "case-id",
  "title": "Case Title", 
  "difficulty": "beginner|intermediate|advanced",
  "durationMinutes": 30,
  "villainId": "villain-id",
  "briefing": {
    "headline": "Brief headline",
    "narrativeHtml": "<p>HTML description</p>",
    "assets": { "image": "path/to/image.png" }
  },
  "suspects": [
    {
      "name": "Villain Name",
      "tags": ["tag1", "tag2"],
      "description": "Description",
      "image": "path/to/image.png"
    }
  ],
  "rounds": [
    {
      "id": "r1",
      "minutes": 8,
      "focus": ["geography", "physical-features"],
      "image": "image-file.png",
      "clueHtml": "<p>Clue content in HTML</p>",
      "researchPrompts": ["Research prompt 1", "Research prompt 2"],
      "expectedProcess": ["Step 1", "Step 2"],
      "reveal": { "trait": "Villain trait", "note": "Additional note" },
      "answer": { "name": "Location Name", "lat": -13.1631, "lng": -72.5450 },
      "explainHtml": "<p>Explanation of answer</p>",
      "scoring": { "base": 100, "distanceKmFull": 150 }
    }
  ]
}
```

### Current Session Format
```json
{
  "id": "session-uuid",
  "caseId": "case-id", 
  "caseData": { /* full case JSON */ },
  "currentRound": 0,
  "maxRounds": 5,
  "revealedClues": [
    {
      "clue": "HTML clue content",
      "image": "image-filename.png",
      "revealedAt": "2025-10-03T...",
      "roundIndex": 0
    }
  ],
  "guesses": [
    {
      "latitude": -13.1631,
      "longitude": -72.5450,
      "locationName": "Location Name",
      "distance": 0,
      "points": 100,
      "submittedAt": "2025-10-03T...",
      "roundIndex": 0
    }
  ],
  "score": 100,
  "status": "active",
  "startedAt": "2025-10-03T...",
  "updatedAt": "2025-10-03T..."
}
```

### Image Path Resolution
Current system supports multiple image path patterns:
1. `/images/villains/04-dr-altiplano-isabella-santos/generated-image-2025-09-25 (15).png`
2. `/content/villains/images/04-dr-altiplano-isabella-santos/generated-image-2025-09-25 (15).png`
3. Just filename: `generated-image-2025-09-25 (15).png` (resolved using villainId)

### Working Game Flow
1. Teacher opens /presentation
2. Selects a case from the list
3. Starts a session (POST /api/sessions)
4. Reveals clues one by one (POST /api/sessions/:id/clue)
5. Students research and class makes guess
6. Teacher submits guess on map (POST /api/sessions/:id/guess)
7. System calculates distance and awards points
8. Repeat for all rounds
9. Game ends with final score

### Key Dependencies
- Case files must be in `/content/cases/` directory
- Villain images must be in `/content/villains/images/` directory structure
- Session management relies on file-based case loading
- Frontend expects specific session and case data structures