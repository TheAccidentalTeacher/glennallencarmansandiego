

# MASTER D### 2- **Teacher (a.k.a. "Coordinator"):** Controls game pacing, reveals clues, enters scores, approves team submissions (solutions), and moderates all user-generated content. Core Personas

- **Teacher (a.k.a. "Coordinator"):** Controls game pacing, reveals clues, enters scores, approves team submissions (solutions), and moderates all user-generated content.
- **Detective Teams (3–4 students):** Collaborate to solve cases. Roles can be assigned within teams:**Teacher (a.k.a. "Coordinator"):** Controls game pacing, reveals clues, enters scores, approves team submissions (solutions), and moderates all user-generated content. **Teacher (a.k.a. "Coordinator"):** Controls game pacing, reveals clues, enters scores, approves team submissions (solutions), and moderates all user-generated content.LOPMENT PROMPT: Sourdough Pete's Geography Challenge

---

## PART 1: PRODUCT DEFINITION & CORE LOGIC

This section defines the project's vision, user experience, core rules, and data structures. It focuses on **what** the application is and **why** it exists.

### 1. High-Level Purpose

Build a web-based, teacher-facilitated geography deduction game for middle-grade classrooms, optimized for smart TVs and projectors. The game teaches world & regional geography, cultural literacy, environmental systems, and research skills. Its structure is inspired by Carmen Sandiego’s progressive clue logic but features a fully editable content library, respectful cultural representation, and dynamic classroom management tools.

### 2. Core Personas

- **Teacher (a.k.a. “Coordinator”):** Controls game pacing, reveals clues, enters scores, approves team submissions (solutions), and moderates all user-generated content.
- **Detective Teams (3–4 students):** Collaborate to solve cases. Roles can be assigned within teams:
    - Lead Detective
    - Research Specialist
    - Cultural Analyst
    - Geography Expert
- **Villain Profiles:** A library of fictional antagonists used for the deduction part of the game. The library is extensible by the teacher, with content safety guidelines enforced.

### 3. Game Flow Modes

The application must support two distinct timing modes to fit different classroom schedules.

**A. Full Period Mode (≈50 minutes)**
- **Phase 1: Mission Briefing (8 min):** The teacher introduces the crime scenario and the pool of 8–10 potential villains.
- **Phase 2: Investigation (32 min):** Consists of four rounds, each lasting 8 minutes.
    - **Round 1:** Geographic Foundation (broad physical & regional clues)
    - **Round 2:** Cultural Context (language, heritage, practices)
    - **Round 3:** Economic & Political Intelligence (currency, governance, trade)
    - **Round 4:** Landmark & Specific Features (unique identifiers, wildcard clues)
- **Phase 3: Resolution (10 min):** Teams present their final "solutions," the teacher reveals the correct answer, and team ranks are updated.

**B. Quick Case Mode (≈25 minutes)**
- **Briefing:** 3 min
- **Investigation:** 16 min (4 rounds × 4 min each)
- **Resolution:** 6 min (solution & Reveal)

### 4. Pedagogical Foundations

- **Indirect Clue Deduction:** Fosters inferential reasoning rather than rote memorization.
- **Systems Thinking:** Repeated exposure to the interconnectedness of geographic, economic, and cultural systems.
- **Collaborative Inquiry:** Team roles and shared goals strengthen research and communication skills.
- **Consolidation & Debriefing:** The resolution phase solidifies learning and provides opportunities for classroom discussion.

### 5. Cultural Representation & Respect Guidelines

This is a critical component of the application. All content must adhere to these principles.

**DO:**
- Emphasize expertise in fields like science, ecology, art, and innovation.
- Use neutral, professional attire and contextually accurate environmental details for villain characters.
- Implement a mandatory review flag for all new user-generated content (villains and cases).

**AVOID:**
- Stereotypical props, accents, or caricatures (e.g., no berets for French characters).
- Associating characters with religious symbols unless pedagogically grounded, neutral, and explicitly approved.




### 6. Data Model (Core Entities)

This section defines the core data structures for the application. Use these TypeScript interfaces as the single source of truth for data shapes.

```typescript
// Represents a single villain character
interface Villain {
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
  clueTemplates: {
    geographic: string[];
    cultural: string[];
    economicPolitical: string[];
    landmarkNatural: string[];
    wildcard: string[];
  };
  educationalTags: string[];
  status: 'active' | 'archived';
  culturalReviewStatus: 'approved' | 'pending' | 'flagged';
  metadata: {
    createdAt: string; // ISO Timestamp
    updatedAt: string; // ISO Timestamp
    createdBy: string; // User ID
    reviewedBy?: string; // User ID
  };
}

// Represents a single case or mission
interface Case {
  id: string; // UUID
  title: string;
  scenario: string; // Narrative description of the crime
  stolenItem: string;
  educationalObjectives: string[]; // e.g., ["biomes", "trade routes"]
  primaryGeographicAnswer: string; // Country, region, or city
  alternateAcceptableAnswers: string[];
  villainId: string; // Foreign key to Villain
  rounds: {
    roundNumber: 1 | 2 | 3 | 4;
    cluePackets: {
      geographic?: string[];
      cultural?: string[];
      economicPolitical?: string[];
      landmarkNatural?: string[];
      wildcard?: string[];
    };
    suspectTraits: string[]; // Descriptions of the villain revealed this round
  }[];
  difficultyOverride?: 1 | 2 | 3 | 4 | 5;
  timingProfile: 'full' | 'quick' | 'custom';
  warrantRequirements: {
    requireLocation: boolean;
    requireVillain: boolean;
    requireEvidenceJustifications: number;
  };
  scoringProfileId: string;
  status: 'draft' | 'published' | 'archived';
  culturalReviewStatus: 'approved' | 'pending' | 'flagged';
  metadata: {
    createdAt: string; // ISO Timestamp
    updatedAt: string; // ISO Timestamp
    createdBy: string; // User ID
  };
}

// Represents a team's submission at the end of the game
interface solutionsubmission {
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

// Other core entities
interface Team {
  id: string;
  name: string;
  members: string[];
  cumulativePoints: number;
  rank: string; // Computed based on points
}

interface ScoreEvent {
  id: string;
  teamId: string;
  caseId: string;
  roundNumber: number;
  category: 'location' | 'villain' | 'speed' | 'researchQuality' | 'culturalInsight' | 'penalty' | 'bonus';
  points: number;
  timestamp: string;
}

interface ScoringProfile {
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

interface SystemConfig {
  rankThresholds: { rank: string; min: number }[];
  contentFlags: { bannedTokens: string[]; warnTokens: string[] };
  defaultTiming: 'full' | 'quick';
  mappingProvider: 'leaflet' | 'google' | 'local';
}
```



### 7. Progressive Clue Engine & Scoring

**Clue Engine Algorithm:**

The engine must dynamically select and reveal clues based on the game round and villain difficulty.

1.  **Initialization:** On case start, load the full `Villain` and `Case` objects. Pre-shuffle the clue arrays for each category to ensure variety.
2.  **Round-based Selection:** In each round, select 1-2 clues from the categories corresponding to that round (e.g., Round 1 is primarily `geographic`).
3.  **Difficulty Obfuscation:** If `villain.difficulty` is 4 or 5, the engine must reduce clue specificity in early rounds (1 and 2). For example, replace a direct mention of the "Andes" with a more general term like "a major longitudinal cordillera."
4.  **Token Replacement:** The engine must support a token replacement system within clue text. Clues can contain placeholders like `{{currency}}` or `{{regional_biome}}`, which are replaced with data from a `geoFacts.json` file keyed by the `primaryGeographicAnswer`.
5.  **Suspect Trait Progression:** Reveal suspect traits in ascending order of specificity. For example:
    *   Round 1: General profession ("a meticulous conservator")
    *   Round 2: Region hint ("consults prime meridian instruments")
    *   Round 3: Signature tool ("carries a brass sextant")
    *   Round 4: Calling card ("leaves a wax seal with a longitudinal line")

**Scoring System Logic:**

The scoring system must be transparent, configurable, and apply bonuses and penalties correctly.

*   **Base Score Calculation:** `basePoints = categoryPoints * difficultyMultiplier`
*   **Final Score:** `finalEventPoints = basePoints + bonuses - penalties`
*   **Tie-Breaking:** In the event of a tie in total points, the team with the higher number of `researchQualityBonus` points will be ranked higher. If still tied, the team that submitted their final solution earliest wins.

**Default Scoring Profile (Full Period):**

| Category | Points | Notes |
| :--- | :--- | :--- |
| `roundLocationPoints` | `[5, 8, 10, 15]` | Points for correct location in rounds 1-4 |
| `villainIdentificationPoints` | `10` | Awarded for correct villain in the final solution |
| `speedBonus` | `3` | Awarded to the first team to submit a correct location guess per round |
| `researchQualityBonus` | `2` | Manually awarded by the teacher for excellent reasoning |
| `culturalInsightBonus` | `2` | Manually awarded by the teacher for demonstrating deep cultural understanding |
| `wrongArrestPenalty` | `-5` | Applied if the final solution has the wrong villain or location |

**Difficulty Multipliers:**

| Difficulty | Multiplier |
| :--- | :--- |
| 1 | 1.0 |
| 2 | 1.05 |
| 3 | 1.1 |
| 4 | 1.2 |
| 5 | 1.3 |




---

## PART 2: TECHNICAL IMPLEMENTATION & EXECUTION

This section provides the detailed technical specifications required to build the application. It focuses on **how** the application should be architected, built, and deployed.



### 8. Architecture & Technology Stack

- **Frontend:** React with TypeScript
- **State Management:** Zustand or Redux Toolkit
- **Routing:** React Router
- **Styling:** Tailwind CSS with a custom vintage theme configuration.
- **Icons:** Lucide icon library.
- **Mapping:** Leaflet with OpenStreetMap tiles. Must support a cached or offline fallback mode.
- **Backend/Database:** Supabase with PostgreSQL, or a self-hosted PostgreSQL instance on a platform like Railway.
- **Authentication:** Simple email/password-based authentication for teachers initially, with the option to add school SSO in the future.

**Directory Structure:**

```
/src
  /components
    /common       // Buttons, Modals, Inputs
    /game         // CluePanel, Scoreboard, Timer
    /teacher      // Dashboard, CaseEditor, VillainEditor
  /pages
    /Dashboard.tsx
    /LiveCase.tsx
    /Editor.tsx
  /services
    /api.ts         // Centralized API client
    /gameService.ts // Core game logic
    /scoringService.ts
  /hooks          // Custom React hooks (e.g., useRealtimeScores)
  /data           // Seed data (villains.json, sampleCases.json)
  /types          // All TypeScript interfaces
  /theme          // Tailwind theme configuration
  /utils          // Helper functions
```

### 9. API Design & Endpoints

Implement a RESTful API with the following endpoints. All endpoints should expect and return JSON.

**Game Management**
- `GET /api/cases`: Retrieve a list of all available cases.
- `POST /api/cases`: Create a new case (requires teacher authentication).
- `GET /api/cases/:id`: Get the full details for a specific case.
- `PUT /api/cases/:id`: Update an existing case.
- `DELETE /api/cases/:id`: Archive a case.

**Game Session**
- `POST /api/sessions`: Start a new game session from a case.
- `GET /api/sessions/:id`: Get the current state of a game session (including round, scores, etc.).
- `POST /api/sessions/:id/round`: Advance the game to the next round.
- `POST /api/sessions/:id/solution`: Submit a final solution for a team.

**Content Management**
- `GET /api/villains`: Retrieve the list of all villains.
- `POST /api/villains`: Create a new villain.
- `PUT /api/villains/:id/review`: Update the `culturalReviewStatus` of a villain.

**Real-time Communication**
- A WebSocket endpoint at `/ws/game/:sessionId` should be established to push real-time updates to clients for:
  - Score changes
  - Round advancements
  - New clue reveals


_


### 10. User Interface (UI) Requirements

**Teacher (coordinator) UI Panels:**

- **Case Dashboard:** A filterable list of all cases, showing status, difficulty, and region tags, with a prominent "Launch Case" button.
- **Live Case Control:** The main screen during a game. It must feature:
    - A master timer with start/pause/reveal controls.
    - A "Reveal Next Round" button that locks previous rounds.
    - A list of all clues revealed so far.
    - Buttons to manually award `researchQualityBonus` and `culturalInsightBonus` points to teams.
    - A modal for reviewing and approving/rejecting team `solutionsubmissions`.
- **Scoreboard:** A real-time table showing each team's name, round-by-round points, total score, and rank badge. Must be exportable to CSV and JSON.
- **Villain & Case Editor:** A form-based interface for creating and editing content. It should use tabs to separate metadata, clue entry, and the cultural review status.

**Smart TV / Projector Layout:**

The primary display must be optimized for large screens with a two-column layout:
- **Left Column (60% width):** Clue Panel - displays all revealed clues in a large, readable font.
- **Right Column (40% width):** Score & Timer Panel - shows the real-time scoreboard and the master timer.
- **Typography:** Use large, high-contrast fonts (e.g., base size of 22px, headings at 36px+).

### 11. Accessibility & Inclusion

- **Color Contrast:** Must meet WCAG 2.1 AA standards for all text and UI elements.
- **Status Indicators:** Do not rely on color alone to convey status. Use icons and text labels (e.g., a green checkmark icon next to the word "Approved").
- **Keyboard Navigation:** All interactive elements must be focusable and operable via keyboard.
- **Alt Text:** For villain images, automatically generate alt text from the `imagePromptVintage` field, trimmed to 125 characters.
- **Dyslexia-Friendly Font:** Include a settings toggle to switch the UI font to a dyslexia-friendly option like OpenDyslexic.

### 12. Visual & Thematic Style

- **Theme:** Vintage Cartoon / Mid-century illustration.
- **Color Palette:** Muted but warm. Base colors: `#2F4F4F` (Dark Slate Gray), `#C7925B` (Camel), `#E4D8C4` (Bone), `#4B7F94` (Steel Blue), `#A34234` (Burnt Sienna). Accent: `#F2B950` (Goldenrod).
- **Illustrations:** Villains should be depicted with bold line art. The AI image prompt should be used as a template.
- **Iconography:** Simple, two-tone icons with a subtle paper texture or grain effect.

**Sample Image Prompt Template:**

`"Vintage cartoon style: [professional regional role] in [environment], wearing [modern respectful attire], holding [signature tool], [geographic backdrop], [palette adjectives], bold clean ink outlines, educational tone, dignified."`


_


### 13. Security, Error Handling, and Content Safety

**Security:**
- **Input Validation:** All API endpoints must validate and sanitize user input on the server-side to prevent injection attacks. Use a library like Zod for schema validation.
- **Authentication:** Teacher accounts must be protected by hashed passwords. All endpoints for creating or modifying content must require a valid authentication token.
- **Authorization:** Implement role-based access control. Only authenticated teachers can create/edit cases. A special permission (`approve_content`) is required to approve culturally flagged content.

**Error Handling:**
- The application must gracefully handle API failures, network issues, and validation errors.
- Implement clear loading, empty, and error states for all data-driven UI components.
- Provide user-friendly error messages that explain the problem without exposing technical details (e.g., "Invalid location name" instead of "Database constraint violation").

**Content Safety & Review Pipeline:**
- **Server-Side Validation:** On any `Case` or `Villain` save operation, the text content must be processed by a server-side `ContentFilterService`.
- **Flagging:** If the service detects any tokens from the `bannedTokens` or `warnTokens` lists in `SystemConfig`, the item's `culturalReviewStatus` must be set to `flagged` or `pending`.
- **Content Block:** Items with a `pending` or `flagged` status cannot be selected for a new game session.
- **Approval Workflow:** An authenticated teacher with `approve_content` permission must be able to review flagged content and change its status to `approved`.
- **Audit Trail:** All content modifications and review status changes must be logged with a user ID and timestamp.



### 14. Deployment & DevOps

- **Hosting:** The application should be deployable to Netlify (for the static frontend) and Supabase (for the database and backend functions). Alternatively, Railway can be used for unified hosting.
- **Environment Variables:** The application must be configurable via environment variables:
  - `VITE_API_BASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_MAP_TILE_URL`
  - `VITE_FEATURE_IMAGE_UPLOAD` (boolean flag)
- **Continuous Integration (CI):** On every push to the main branch, the following checks must be run:
  - Linting (ESLint)
  - Type checking (TypeScript)
  - Unit tests (Vitest or Jest)
  - Code formatting (Prettier)
  - A successful build of the application.

### 15. Quality Assurance & Test Matrix

The following scenarios must be tested to ensure application stability and correctness:

| Scenario | Expected Outcome |
| :--- | :--- |
| **High-Difficulty Case** | Clue obfuscation is active in early rounds for a case with difficulty 5. |
| **Quick Mode Timing** | The game timer and round progression adhere to the shorter Quick Mode timings. |
| **Invalid solution** | A solution submitted with missing evidence or an incorrect villain is rejected or penalized. |
| **Content Flagging** | A case created with a banned token is automatically flagged for review and cannot be published. |
| **Tie-Breaking** | A tie in final scores is correctly broken first by the research bonus count, then by submission timestamp. |
| **Offline Map** | The map interface successfully loads a fallback tile layer when network access is unavailable. |
| **Teacher Override** | A teacher forcing an early clue reveal is logged in the audit trail, and the override count is updated. |

### 16. Developer Acceptance Checklist

Development will be considered complete when the following criteria are met:

- [ ] **Seed Data:** The database is seeded with at least 21 unique villains and 3 complete sample cases covering different continents.
- [ ] **Timing Modes:** Both "Full Period" and "Quick Case" modes are fully functional and selectable.
- [ ] **Scoring Engine:** The scoring engine correctly applies points, bonuses, penalties, and difficulty multipliers.
- [ ] **Rank Progression:** Team ranks are computed correctly and displayed on the scoreboard.
- [ ] **Content Editors:** The villain and case editors are fully functional, including the cultural review flag workflow.
- [ ] **Clue Obfuscation:** The clue engine correctly obfuscates clues for high-difficulty cases in early rounds.
- [ ] **solution Workflow:** The complete solution submission and teacher approval process is implemented.
- [ ] **Exportable Scoreboard:** The final scoreboard can be exported to both CSV and JSON formats.
- [ ] **Accessibility Pass:** The application meets WCAG 2.1 AA standards, and the dyslexia-friendly font toggle is functional.
- [ ] **Content Filter:** The server-side content filter is integrated and correctly flags content for review.
- [ ] **Offline Map:** The map component includes a functional offline fallback.
- [ ] **Audit Log:** A basic audit trail for content changes is implemented.

### 17. Complete Sample Case (JSON Format)

Use this JSON object as a direct, machine-readable template for creating seed data. This structure must match the TypeScript interfaces defined in Section 6.

```json
{
  "case": {
    "id": "case-001",
    "title": "The Vanished Iron Lattice Draft",
    "scenario": "Original structural stress analysis sheets for an iconic 19th‑century iron tower have disappeared from an international engineering archive.",
    "stolenItem": "Structural Engineering Blueprints",
    "primaryGeographicAnswer": "France",
    "alternateAcceptableAnswers": ["Paris"],
    "villainId": "villain-007",
    "educationalObjectives": ["European Geography", "Industrial Revolution History", "Architectural Engineering"],
    "rounds": [
      {
        "roundNumber": 1,
        "cluePackets": {
          "geographic": ["This hexagon-shaped Western European country has coastlines on multiple seas."]
        },
        "suspectTraits": ["Meticulous conservator of maritime charts"]
      },
      {
        "roundNumber": 2,
        "cluePackets": {
          "cultural": ["Clues about a Romance language daily press and culinary tradition of layered pastries."]
        },
        "suspectTraits": ["Frequently consults prime meridian calibration instruments"]
      },
      {
        "roundNumber": 3,
        "cluePackets": {
          "economicPolitical": ["Reference to a euro-zone economy with aerospace and high-speed rail manufacturing leadership."]
        },
        "suspectTraits": ["Carries a brass sextant in a reinforced vellum tube"]
      },
      {
        "roundNumber": 4,
        "cluePackets": {
          "landmarkNatural": ["The crime scene is near a triumphal arch aligning with historic avenues and a wrought-iron tower built for a universal exposition."]
        },
        "suspectTraits": ["Leaves a wax seal depicting a longitudinal line"]
      }
    ],
    "timingProfile": "full",
    "warrantRequirements": {
      "requireLocation": true,
      "requireVillain": true,
      "requireEvidenceJustifications": 2
    },
    "scoringProfileId": "default-full",
    "status": "published",
    "culturalReviewStatus": "approved",
    "metadata": {
      "createdAt": "2025-09-20T10:00:00Z",
      "updatedAt": "2025-09-20T10:00:00Z",
      "createdBy": "user-teacher-admin"
    }
  },
  "villain": {
    "id": "villain-007",
    "codename": "Sir Cedric Meridian",
    "fullName": "Dr. Cedric Meridian",
    "region": "Western Europe",
    "culturalInspiration": "British Maritime Tradition",
    "respectNote": "Portrayed as a scholarly professional obsessed with precision, not as a national stereotype.",
    "difficulty": 3,
    "specialty": "Historical Cartography",
    "signatureTools": ["Brass sextant", "Antique compass"],
    "callingCard": "A wax seal with a longitudinal line",
    "modusOperandi": "Targets historical documents related to navigation and engineering.",
    "personalityTraits": ["Methodical", "Scholarly", "Obsessed with precision"],
    "preferredTargets": ["Maritime archives", "Engineering blueprints"],
    "sampleCaseHook": "When priceless navigation documents go missing, look for the scholar who measures twice and steals once.",
    "imagePromptVintage": "Vintage cartoon style: A distinguished British maritime scholar in modern professional attire, holding a brass sextant, standing before nautical charts. The palette is warm and muted with navy and brass accents. The style uses bold, clean ink outlines, conveying an educational and dignified tone.",
    "status": "active",
    "culturalReviewStatus": "approved",
    "metadata": {
      "createdAt": "2025-09-20T10:00:00Z",
      "updatedAt": "2025-09-20T10:00:00Z",
      "createdBy": "user-teacher-admin"
    }
  }
}
```


---

## IMPLEMENTATION GUIDANCE

This prompt provides a complete specification for building the "Sourdough Pete's Geography Challenge" application. The structure is designed to be clear and actionable for AI-driven development.

**Development Approach:**
1. Begin with the data models and API endpoints defined in Part 1.
2. Implement the core game logic (clue engine and scoring system) as services.
3. Build the teacher dashboard and case management interfaces.
4. Create the live game interface with real-time features.
5. Add the content creation and review workflows.
6. Implement accessibility features and visual styling.
7. Complete testing and deployment setup.

**Key Success Factors:**
- Maintain the educational integrity and cultural sensitivity throughout development.
- Ensure the smart TV/projector optimization is prioritized for classroom use.
- Implement robust error handling and content safety measures.
- Create a scalable architecture that can support future enhancements.

The application should be production-ready, educationally sound, and technically robust upon completion of all specified requirements.


