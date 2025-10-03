# Implementation Plan: Sourdough Pete's Geography Challenge

## ✅ SUCCESSFUL EDUCATIONAL TRANSFORMATION COMPLETED (Oct 3, 2025)

**Status**: Phase 1 & 2 complete - Educational content transformation successful!

### Achievement Summary
- **✅ Content Transformation**: Successfully converted graduate-level geography cases to 11-year-old friendly educational content
- **✅ Progressive Discovery Learning**: Implemented 6-step educational flow per round
- **✅ Technical Implementation**: Frontend supports clue progression, hint reveals, and educational answers
- **✅ Accessibility**: Fixed button contrast and visual hierarchy issues
- **✅ Pilot Cases**: 3 cases converted and tested successfully

### Validated Educational Approach
Our pilot transformation proves this content delivery method works:

1. **Dr. Altiplano's Mountain Mystery** - Mountain geography, climate, indigenous cultures
2. **Dr. Coral's Ocean Adventure** - Marine geography, tropical islands, coral reef ecosystems  
3. **Professor Atlas's Map Mystery** - European political geography, cartography, cultural boundaries

**Key Success**: Complex graduate concepts successfully transformed to engaging 11-year-old detective adventures with proper educational scaffolding.

## 📚 Educational Content Standards (ACTIVE)

### Required Content Transformation Process
All new cases must follow the proven educational transformation pattern:

#### 1. **Age-Appropriate Language Conversion**
- **Graduate Level** → **11-Year-Old Friendly**
- **Technical jargon** → **Relatable analogies** 
- **Complex syntax** → **Simple, clear sentences**

#### 2. **Progressive Discovery Structure (Per Round)**
```
Step 1: Reveal Detective Clue (age-appropriate mystery)
Step 2: Reveal Research Hint #1 (globe/map work)
Step 3: Reveal Research Hint #2 (alternative research method)  
Step 4: Reveal Research Hint #3 (specific investigation term)
Step 5: Reveal Educational Answer (comprehensive learning content)
Step 6: Auto-advance to next round
```

#### 3. **Required JSON Structure**
Each case must include:
- `clueHtml`: 11-year-old friendly detective narrative
- `researchPrompts`: Array of 3+ progressive research directions
- `explainHtml`: Comprehensive educational explanation with learning objectives
- `answer.name`: Clear geographic location identifier

#### 4. **Content Quality Standards**
- **Reading Level**: 6th grade vocabulary maximum
- **Cultural Sensitivity**: Inclusive and respectful representations
- **Educational Value**: Clear learning objectives per round
- **Engagement**: Detective narrative maintains interest throughout

### Villain Image Integration
- All cases must map `villainId` to existing image folders
- Frontend automatically resolves: `dr-altiplano-isabella-santos` → `04-dr-altiplano-isabella-santos`
- Images must load correctly with proper URL encoding

---

<a id="teacher-led-mvp-plan-sept-26-2025"></a>
## Teacher‑Led MVP Plan (Sept 26, 2025)

Context: For the next few weeks this app will be used only by the teacher (Mr. Scott Somers) via HDMI on a projector as a whole‑class game. Students will not log in or use their own devices yet. The objective is to deliver a rock‑solid, playable in‑class experience first, then add multi‑user/auth/database features later.

This section supersedes earlier priorities. The original plan remains below as a reference, but the order of work is now explicitly teacher‑first and offline‑friendly.

### Product Goals (MVP)
- Play a complete, repeatable case end‑to‑end in front of the class using a single computer.
- Teacher controls the flow: start game, reveal clues, collect a class guess on the map, submit solution, show distance/score, advance rounds, show final results.
- No logins, no per‑student devices, no network dependencies beyond localhost.
- Use existing filesystem content for villains and images; cases stored as simple JSON files.

### Out‑of‑Scope (defer until after MVP)
- Authentication, roles, and accounts
- Multi‑device student joins and live sync
- PostgreSQL or Atlas‑backed content (use filesystem JSON for now)
- CI/CD, cloud deploy, multi‑class concurrency

---

## MVP Definition (Teacher‑Only, Single‑Machine)

### Data and Content
- Villains: use existing images in `content/villains/images/*` (already working)
- Cases: add JSON files under `content/cases/` describing rounds, clues, answers

Example case JSON (proposed):
```json
{
  "id": "sourdough-pete-alaska-demo",
  "title": "Sourdough Pete’s Alaska Escape",
  "villainId": "sourdough-pete",
  "rounds": [
    {
      "clueHtml": "<p>He slipped north where glaciers meet the sea...</p>",
      "answer": { "name": "Juneau, Alaska, USA", "lat": 58.3019, "lng": -134.4197 },
      "explain": "Capital city accessible only by boat or plane; glacial fjords nearby."
    },
    {
      "clueHtml": "<p>Gold rush tales echo along a winding trail...</p>",
      "answer": { "name": "Skagway, Alaska, USA", "lat": 59.4583, "lng": -135.3139 },
      "explain": "Klondike Gold Rush gateway; White Pass & Yukon Route."
    }
  ],
  "solution": {
    "villainId": "sourdough-pete",
    "victim": "National Museum of Bread History",
    "item": "The Ancient Sourdough Starter"
  }
}
```

### Backend (Express) – minimal endpoints
- GET `/api/images/villains` – already returns villain ids
- GET `/api/cases` – list case JSON (read from `content/cases/*.json`)
- GET `/api/cases/:id` – fetch a single case JSON
- POST `/api/session` – create an in‑memory session from a case
- GET `/api/session/:id` – fetch current session state
- POST `/api/session/:id/advance` – move to next round
- POST `/api/session/:id/guess` – record the class’s map guess {lat, lng, label}
- POST `/api/session/:id/solution` – submit solution (villain confirmation)
- GET `/api/session/:id/summary` – computed totals and recap

Implementation detail:
- Store sessions in memory (a simple Map) and optionally persist snapshots to `data/sessions/{timestamp}.json` for recovery and teacher export.
- For projector/control dual views on one machine, polling (1–2s) is sufficient; WebSockets/SSE optional later.

### Frontend – pages and responsibilities
- `/control` (Teacher Control)
  - Choose case (from `/api/cases`)
  - Start game → creates session
  - Reveal next clue → displays on projector view
  - Map interaction to collect a single class guess (lat/lng)
  - Submit guess → see distance line, score, explanation
  - Advance round → repeat until done
  - Submit solution → final score + recap
  - Save/export session results

- `/projector` (Read‑Only Projector View)
  - Big, clean display for the class
  - Shows current clue, map with guess vs answer, and scoreboard
  - Auto‑refreshes session state (polling) every 1–2 seconds

### Scoring (use what exists, minimum rules)
- Distance‑based points per round
- Bonus/penalty hooks available later (time, accuracy tiers)
- Final score is sum of rounds; solution correctness adds a bonus

### Accessibility and Classroom Fit
- Large typography and high‑contrast colors
- Single‑button flows, keyboard shortcuts (N for next, G for guess, W for solution)
- “Reset Game” and “Resume Last Session” buttons

<a id="collaborative-authoring-workflow"></a>
## Collaborative Content Authoring Workflow (Teacher‑Led)

This section documents how we will co‑author the season’s content with tight feedback loops. Each step is small, we check in, then move on.

### Step 1 — Lock series tone and vibe
- Options to choose (can be mixed):
  - Retro‑educational, warm, clever; light humor but grounded
  - Straight academic tone, minimal humor, very factual
  - Playful adventure with tight cultural safeguards

### Step 2 — Select primary learning focus (pick 2–3)
- Physical geography • Cultural geography • Economic systems/trade • Environmental systems • Political geography/governance

### Step 3 — Choose difficulty arc for 12 + 2 finale
- Ramp up (early easy → mid medium → late hard → finale hardest)
- Mixed each week (1–2 easy clues + 1–2 hard clues per case)
- Custom pattern

### Step 4 — Prioritize first 3 dossiers to draft
- From the roster (rename later if desired): Sourdough Pete, Dr. Meridian, Dr. Aurora, Dr. Mirage, Professor Tectonic, Dr. Cordillera, Dr. Monsoon, Dr. Sahel, Dr. Qanat, Professor Atlas, Dr. Pacific, Dr. Watershed, Dr. Canopy

### Step 5 — Naming policy for culturally sensitive characters
- Keep heritage‑signaling names with careful bios, OR use neutral names and keep bios purely professional. State preference upfront.

### Step 6 — Image summary approach
- We summarize image folders (setting, tools, vibes) to ground dossiers. If any images need changes, we adjust prompts before narrative writing.

### Definition of Ready (DoR)
- For a dossier: selected character + tone guidance + name policy + any must‑include/avoid notes
- For a case: chosen region/theme + difficulty target + 2–3 learning objectives + any constraints

### Definition of Done (DoD)
- Dossier: 1–2 paragraph professional backstory; signature tools/calling card; respect note; 1 image prompt aligned to Content Guide; 4–6 educational tags; links to cultural review notes
- Case: briefing; 3–4 rounds (clueHtml + answer lat/lng + explainHtml); solution; resolution; passes cultural pre‑check

### Cadence
- We propose → you approve (or tweak) → we draft small slice → you review → we iterate. Keep the loop to 24–48h per slice.

### Immediate Decisions Needed (from teacher)
1) Tone and vibe
2) Primary learning focus (2–3)
3) Difficulty arc
4) First 3 dossiers to draft
5) Naming policy preference
6) Green‑light to summarize images in `content/villains/images/*`

Once the 6 decisions are in, we’ll draft: Series Overview + Org Structure, 3 complete dossiers, and a season arc outline, then pause for your review.

<a id="scaffold-inventory-docs"></a>
## Scaffold Inventory (Docs and Artifacts)

- README: quickstart, health checks, doc map — ready
- Implementation Plan: teacher‑led MVP, case spec, anchors — ready
- Docs Index: links to anchored sections — ready
- Teacher Runbook: day‑of operations + quickstart — ready
- Content Creation Guide: cultural sensitivity, clue templates — ready
- Cultural Review Checklist: pre‑check + required review — ready
- Lore Bible: dossier template present — needs content fill (series overview, org structure, 13 dossiers, season arc)
- Case Catalog: 12 + 2 finale table present — needs entries filled as cases are authored
- Cases Folder: first sample JSON `norway-vanishing-ship.json` — ready; needs additional cases

Open items (authoring, to be completed with teacher input):
- [ ] Series Overview & Themes (short)
- [ ] Organization Structure (Pete’s network)
- [ ] 13 Character Dossiers (using the template)
- [ ] Season Arc Outline (12 + finale mapping to learning goals)

---

## Milestones and Acceptance Criteria

### Milestone 0 – Stable Dev Loop (DONE/VERIFY)
- [x] Backend on 3001; Frontend on 5173; one‑command start (two windows)
- [x] Image URLs fixed (`/images/...`)
- [x] Health checks listed in README (how to verify quickly)

### Milestone 1 – Case JSON + API (0.5–1 day)
- [ ] Create `content/cases/` folder with 1 playable case JSON
- [ ] Implement GET `/api/cases` and `/api/cases/:id` reading from filesystem
- [ ] Validate JSON shape and return helpful errors
- Acceptance: `curl` can list/fetch the case JSON; UI can render case title

### Milestone 2 – Session Engine (1 day)
- [ ] In‑memory session store with lifecycle: created → round[i] → complete
- [ ] Endpoints to advance, record guess, compute distance/points
- [ ] Session summary (totals + per‑round details)
- Acceptance: Postman flow can complete an entire case with scores

### Milestone 3 – Teacher Control (/control) (1–2 days)
- [ ] Case picker and Start Game
- [ ] Clue reveal, map for guess, submit/score flow, advance
- [ ] Final solution submit + recap screen
- Acceptance: Teacher can run an entire game end‑to‑end from one page

### Milestone 4 – Projector View (/projector) (0.5–1 day)
- [ ] Read‑only state display with big typography and map
- [ ] Polling every 1–2s to reflect latest session
- Acceptance: With two browser windows (control + projector), class sees live updates

### Milestone 5 – Save/Export + Resilience (0.5–1 day)
- [ ] Persist session snapshots to `data/sessions/*.json`
- [ ] Export CSV (team, round, guess, distance, points, total)
- [ ] “Resume last session” on server restart
- Acceptance: File created on disk; CSV opens in Excel/Sheets

### Milestone 6 – Polish (nice‑to‑have) (0.5–1 day)
- [ ] Timer per round (optional)
- [ ] Sound cues (clue revealed, correct, end game)
- [ ] Keyboard shortcuts and presenter‑friendly styling

---

## What We’re Explicitly Deferring (until after classroom playtests)
- Auth (teacher/student accounts), role‑based routing
- Multi‑client student joins and team codes
- PostgreSQL/Atlas content storage and migrations
- Real‑time websockets across devices
- Cloud deployment and CI/CD

---

## Quickstart (Teacher)
1) Start servers
   - Backend starts at http://localhost:3001
   - Frontend starts at http://localhost:5173
2) Open two browser windows:
   - Window A: http://localhost:5173/control (teacher controls)
   - Window B: http://localhost:5173/projector (projector view)
3) Select case → Start → Reveal clue → Collect map guess → Submit → Advance → Final solution → Recap

We’ll document this in README once Milestone 3 ships.

---

## Migration Path After MVP (when ready)
1) Replace filesystem case JSON with DB‑backed storage (PostgreSQL or MongoDB) via a content import script
2) Add authentication and role‑based access for teachers
3) Introduce student join codes and multi‑device synchronization (WebSockets/SSE)
4) Harden for deployment and multi‑class concurrency

---

> The sections below reflect the original end‑to‑end plan (auth + DB + sessions). Keep for reference but do not block the teacher‑led MVP above.

---

<a id="case-design-specification-teacher-led-mode"></a>
## Case Design Specification (Teacher‑Led Mode)

This section defines how a “case” should look and behave for the single‑machine, teacher‑controlled presentation flow. It distills the pattern you’ve used (like the Viking/Norway example) into a structured, reusable format while allowing teacher‑selected variations.

### Canonical Flow (default screens)
1) Crime Briefing (intro narrative)
2) Suspect Lineup (optional for now; can be “villain gallery” or simple list)
3) Investigation Rounds (typically 3–4)
   - Round 1: Geographic foundation
   - Round 2: Cultural context + first trait reveal
   - Round 3: Economic/Environmental clue + second trait
   - Round 4: Final identification + third trait
4) solution/Guess Submission (teacher enters or selects the class’s final answer)
5) Solution & Resolution (answer reveal, evidence summary)
6) Learning Extensions (follow‑ups, cross‑curricular)

All screens are teacher‑advanced from `/control` and displayed on `/projector`. Teachers can toggle screens on/off and reorder rounds if desired.

### Data Model (JSON, filesystem)
Minimal viable schema for MVP. Required fields marked with •.

```jsonc
{
  "id": "sourdough-pete-alaska-demo",        // • stable slug
  "title": "The Vanishing Viking Ship",       // • presentable title
  "difficulty": "beginner|intermediate|advanced",
  "durationMinutes": 32,                       // recommended total
  "display": {
    "enable": {
      "suspectLineup": false,
      "warrantStep": true,
      "learningExtensions": true
    },
    "theme": "default|high-contrast|dark"
  },
  "briefing": {                                // • intro content
    "headline": "A priceless Viking longship replica is missing!",
    "narrativeHtml": "<p>Alert all detectives... compass pointing north...</p>",
    "assets": { "image": "/images/cases/viking/briefing.jpg" }
  },
  "suspects": [                                // optional for MVP
    { "name": "Kneemoi", "tags": ["history-fanatic","viking-obsession"], "image": null }
  ],
  "rounds": [                                  // • at least one round
    {
      "id": "r1",
      "minutes": 8,
      "focus": ["geography"],                 // taxonomy: geography|culture|economics|environment|history|flag|language
      "clueHtml": "<p>Long narrow country on a peninsula with fjords, borders Sweden and Finland...</p>",
      "researchPrompts": ["fjords country","borders Sweden Finland","Scandinavian peninsula"],
      "expectedProcess": ["Identify fjords→Norway","Confirm borders","Verify peninsula shape"],
      "reveal": { "trait": null, "note": null },
      "answer": {                               // • the target for the round
        "name": "Norway",
        "lat": 60.4720,
        "lng": 8.4689
      },
      "explainHtml": "<p>Norway’s coastline features deep fjords...</p>",
      "scoring": { "base": 100, "distanceKmFull": 50 }
    },
    {
      "id": "r2",
      "minutes": 8,
      "focus": ["culture","language"],
      "clueHtml": "<p>Aftenposten, lefse, Syttende Mai; language similar to Swedish/Danish...</p>",
      "researchPrompts": ["Aftenposten country","lefse origin","Syttende Mai"],
      "reveal": { "trait": "traditional knitted sweater", "note": "geometric patterns" },
      "answer": { "name": "Norway", "lat": 60.4720, "lng": 8.4689 },
      "explainHtml": "<p>These are Norwegian cultural references...</p>",
      "scoring": { "base": 80, "distanceKmFull": 50 }
    },
    {
      "id": "r3",
      "minutes": 8,
      "focus": ["economics","environment"],
      "clueHtml": "<p>Norwegian kroner; high cost of living; North Sea oil; midnight sun...</p>",
      "reveal": { "trait": "Viking & Norse mythology fan" },
      "answer": { "name": "Norway", "lat": 60.4720, "lng": 8.4689 },
      "explainHtml": "<p>Oil platforms in the North Sea; Arctic phenomena...</p>",
      "scoring": { "base": 80, "distanceKmFull": 50 }
    },
    {
      "id": "r4",
      "minutes": 8,
      "focus": ["history","flag","geography"],
      "clueHtml": "<p>Bergen stave church photo; red flag with white‑bordered blue Nordic cross; capital around a fjord; Northern Lights...</p>",
      "reveal": { "trait": "Collects miniature ships" },
      "answer": { "name": "Norway", "lat": 60.4720, "lng": 8.4689 },
      "explainHtml": "<p>Stave churches, Oslofjord, Aurora Borealis...</p>",
      "scoring": { "base": 120, "distanceKmFull": 50 }
    }
  ],
  "solution": {                                 // final step (MVP: country + optional suspect)
    "expectedCountry": "Norway",
    "suspect": { "name": "Kneemoi", "notes": "history fanatic, Vikings, sweater, ships" }
  },
  "resolution": {
    "summaryHtml": "<ul><li>Geography: fjords, borders SE & FI...</li><li>Language & culture: Aftenposten, lefse, Syttende Mai...</li><li>Economy & environment: oil, midnight sun, Northern Lights...</li><li>Flag & landmarks: Nordic cross, Bergen stave church, Oslofjord</li></ul>",
    "learningExtensions": [
      "Compare Norway, Sweden, Denmark",
      "Research Viking exploration routes on Google Earth",
      "Study Nordic cross flags",
      "Investigate Arctic phenomena"
    ],
    "crossCurricular": [
      "History: Viking Age, maritime culture",
      "Science: fjords, Arctic climate",
      "Economics: oil industry impact",
      "Literature: Norse mythology"
    ]
  }
}
```

Notes:
- `clueHtml` and `explainHtml` allow rich formatting for projector readability.
- `focus` tags let us filter/analyze which domains a case covers week‑to‑week.
- `scoring.distanceKmFull` is the distance where base points decay to zero (linear for MVP).

### Authoring Template (Markdown → JSON)
Teachers can draft cases in Markdown and we’ll provide a converter to JSON (optional after MVP). Template:

```markdown
# Title

## Crime Briefing
Narrative paragraph(s).

## Rounds
### Round 1 (8 min) — Focus: Geography
- Clue: ...
- Research Prompts: • ... • ...
- Expected Process: • ... → ...
- Trait Reveal (optional): ...
- Answer: Name (lat, lng)
- Explanation: ...

### Round 2 ...

## solution
- Expected Country: ...
- Suspect (optional): name + notes

## Resolution
- Evidence Summary (bullet list)
- Learning Extensions (bullets)
- Cross‑Curricular (bullets)
```

### UI & Controls (Teacher‑Led)
- `/control`
  - Case picker, Start Game
  - Buttons: Reveal Clue, Open Map for Guess, Submit Guess, Score & Show, Next Round, Final solution, Recap
  - Toggles: Show/Hide Suspect Lineup, Skip Round, Timer On/Off
  - Keyboard shortcuts: N (next), G (guess), W (solution), R (reveal), T (timer)
  - Timer: 8‑minute default per round with pause/reset
- `/projector`
  - Large typography, limited controls
  - Shows current clue; when scoring, shows guess vs answer with distance line; final recap screen
  - Auto‑refresh every 1–2s

### Validation Rules
- Case must include: id, title, briefing, ≥1 round, and final resolution
- Each round must include: minutes, focus[], clueHtml, answer(lat/lng/name)
- Lat ∈ [‑90, 90], Lng ∈ [‑180, 180]; minutes ∈ [2, 20]
- Optional fields should fail softly with clear error in `/control` if missing

### Extensibility (outside the pattern)
All non‑canonical screens are teacher‑selected toggles in `/control`:
- Add “Flag Identification Round”
- Add “Language Audio Snippet”
- Add “Photo Montage”
- Add “Mini‑Quiz”

We’ll implement these as optional round types with display toggles, keeping the core JSON schema stable.

### Future: AI‑Assisted Case Generation (deferred)
When ready to connect an OpenAI (or other) key:
1) Provide a prompt template that asks the model to fill our JSON schema for a chosen region/theme/difficulty.
2) Validate the generated JSON against our schema and flag missing fields.
3) Require teacher review/edits before publishing to `content/cases/`.
4) Add a “Generate Draft Case” button in `/control` with a side‑by‑side editor and fact‑check tips.
5) Cache drafts on disk; never overwrite approved cases without versioning.

Safety/quality:
- Keep generation grounded by giving the model a region/topic packet (facts list, constraints, sample answers).
- Validate location lat/lng reverse‑geocoding to ensure internal consistency.
- Prefer conservative facts; allow teacher to approve/adjust before use.

<a id="villain-dossier-authoring-plan"></a>
## Villain Dossier Authoring Plan (A + C Retro‑Educational Tone)

We will author 13 character dossiers (Sourdough Pete + 12 specialists) using a tight, reviewable loop. Tone is retro‑educational and playful, with strong cultural safeguards (avoid straight academic tone).

### Difficulty Guardrail
- Aim up to “high‑school sophomore with some experience,” never beyond.
- Each villain’s clue palette supports multi‑country chases (3+ rounds) spanning geography, culture (food, dance, traditions), economy, flags, landforms (peninsulas, rivers, mesas, etc.).

### Per‑Dossier Steps (one by one)
1) Image Pass (grounding)
  - Inspect folder in `content/villains/images/<slug>/`
  - Summarize setting/tools/attire without stereotypes
  - Save `summary.md` in that folder for traceability
2) Cultural Pre‑Check
  - Run the Author’s Pre‑Check from `docs/cultural-review-checklist.md`
  - Confirm name policy (heritage‑signaling vs neutral) per teacher’s preference
3) Draft Dossier v1 (using the Dossier Template)
  - 1–2 paragraph professional backstory and motivation
  - Signature tools + calling card (professional markers only)
  - Respect Note (how portrayal stays dignified and neutral)
  - Image Prompt (aligned with Content Creation Guide)
  - 4–6 Educational Tags (e.g., Alpine Geography, Trade Routes)
4) Clue Domains & Case Seeds
  - Define 4+ clue domains the villain naturally supports (e.g., cartography → coordinates; marine biology → currents)
  - Propose 1–2 case seeds linking to 2–3 countries for chase rounds
5) Review & Iterate
  - Teacher feedback applied; finalize v2
6) Cultural Review & Approval
  - Record outcomes in checklist; set dossier status to approved

### Organization Dossier
- Define Sourdough Pete’s network: roles, rivalries, and collaborative patterns
- Map each specialist’s niche to likely geographies and case hooks
- Document communication motifs (non‑sensitive) used as in‑world breadcrumbs

### Acceptance Criteria (per dossier)
- Professional, non‑stereotyped portrayal with Respect Note
- Image Prompt adheres to `docs/content-creation-guide.md`
- Educational tags and clue domains support multi‑country chases
- Links to cultural review notes and `summary.md` photo grounding

### Tracking & Artifacts
- Tracker: `docs/dossiers/README.md` (status per villain)
- Grounding files: `content/villains/images/<slug>/summary.md`
- Final dossier lives in `docs/lore-bible.md` under Character Dossiers

<a id="alaska-two-part-research-plan"></a>
## Sourdough Pete Two‑Part Alaska Special (Copper River Valley & Glennallen)

We will create a 2‑part case focused on Alaska, specifically the Copper River Valley and Glennallen.

### Research Plan (propose, then fetch with approval)
- Candidate sources: Alaska state and education sites (parks, geography, ADF&G), regional historical/cultural pages, and reputable geography references.
- On approval, we will collect facts (rivers, salmon runs, landforms, climate, history), cite sources inline in a `research-notes.md` file, and distill into clues.

### Authoring Steps
1) Research pass with citations → `content/cases/sourdough-pete-alaska/research-notes.md`
2) Draft 2 linked case JSONs (Week 13 & 14) with multi‑round chases across Alaskan sub‑regions leading to Glennallen focus
3) Classroom checks: difficulty, clarity, map practice opportunities
4) Cultural pre‑check → Review → Approve

### Acceptance Criteria
- Alaska‑specific, Copper River Valley & Glennallen highlighted accurately
- Clear, respectful, educational clues supporting map practice
- Cited sources available for teacher reference

<a id="season-narrative-novella-plan"></a>
## Season Narrative Integration & Novella Plan

We will structure the 12 cases + 2‑part finale as a coherent arc that can be adapted into a ~30K‑word classroom novella for ELA work.

### Narrative Weave
- Episode beats that carry through cases (non‑violent, educational stakes)
- Recurring motifs and callbacks to reinforce learning
- Villain crossovers to justify multi‑country chases

### Novella Adaptation Outline
- For each case: 1–2k words prose chapter capturing clues, reasoning, and reveals
- Interstitials: short bridge scenes connecting geography lessons to character choices
- Teacher edition: annotations highlighting standards/objectives and discussion prompts

### Acceptance Criteria
- Age‑appropriate tone; educationally purposeful
- Chapters map clearly to cases and reinforce geography skills
- Ready for close‑read strategies (vocab, text evidence, structure)


## CURRENT STATUS (As of September 26, 2025)

### ✅ COMPLETED PHASES
- **Phase 1**: Project Architecture Setup - COMPLETE
- **Phase 3**: Core Game Logic Services - COMPLETE  
- **Phase 4**: API Infrastructure - MOSTLY COMPLETE
- **Phase 8**: Map Integration (Priority 2) - COMPLETE

### 🔄 CURRENT DEVELOPMENT STATE
**What Works:**
- React/TypeScript frontend with routing and contexts
- Interactive world map with Leaflet integration
- Complete service layer (scoring, clues, warrants)
- Distance-based gameplay with educational feedback
- Enhanced solution results with clue analysis
- REST API endpoints for content and game operations

**Critical Missing for A-Z Gameplay:**
- PostgreSQL database setup and migrations
- Sample content (villains, cases) in database
- Working authentication system
- Session creation and management interface
- Teacher dashboard for launching games
- Real-time WebSocket connections

### 🎯 IMMEDIATE NEXT PHASE: END-TO-END FOUNDATION

**Priority 1: Database & Content Foundation** (2-3 days)
- Set up PostgreSQL database
- Run all migrations to create tables
- Seed database with 3 sample villains and 1 complete case
- Test database connectivity and API integration

**Priority 2: Authentication & Sessions** (2-3 days)  
- Complete teacher authentication system
- Implement protected routes and role-based access
- Build session creation interface for teachers
- Connect session management to game state

**Priority 3: Minimal Viable Game Flow** (3-4 days)
- Teacher dashboard to select and launch cases
- Student joining workflow (team codes)
- Live game session with clue progression
- Basic real-time updates between teacher and students

---

## REVISED IMPLEMENTATION PHASES

### Phase 2A: Database & Content Setup (NEXT - HIGH PRIORITY)

**Duration:** 2-3 days  
**Dependencies:** Current codebase  

### Objectives
- Set up PostgreSQL database with all tables
- Populate with minimum viable content
- Test end-to-end data flow

### Tasks

#### 2A.1 Database Setup
```bash
# Set up PostgreSQL (local development)
# Option 1: Docker
docker run --name sourdough-postgres -e POSTGRES_PASSWORD=dev123 -p 5432:5432 -d postgres:15

# Option 2: Railway PostgreSQL addon
railway add postgresql
```

#### 2A.2 Migration Execution
```bash
# Run all existing migration files
npm run migrate:up
```

#### 2A.3 Sample Content Creation
```sql
-- Insert 3 sample villains
INSERT INTO villains (codename, full_name, region, cultural_inspiration, ...)
VALUES 
  ('sourdough-pete', 'Sourdough Pete', 'Alaska', 'Alaskan Gold Rush culture', ...),
  ('fjord-phantom', 'The Fjord Phantom', 'Norway', 'Nordic maritime culture', ...),
  ('sahara-sphinx', 'Sahara Sphinx', 'Egypt', 'Ancient Egyptian culture', ...);

-- Insert 1 complete case
INSERT INTO cases (title, scenario, stolen_item, villain_id, ...)
VALUES ('The Great Sourdough Heist', 'Pete has stolen the world''s largest sourdough starter...', 
        'Ancient Sourdough Starter', 'sourdough-pete-uuid', ...);
```

#### 2A.4 API Integration Testing
```bash
# Test database connectivity
curl http://localhost:3001/api/villains
curl http://localhost:3001/api/cases
```

### Deliverables
- [ ] PostgreSQL database running locally or on Railway
- [ ] All migration tables created successfully  
- [ ] 3 sample villains with complete data
- [ ] 1 playable case with all rounds and clues
- [ ] API endpoints returning real database data

### Acceptance Criteria
- Database queries execute without errors
- API endpoints return actual villain/case data from database
- Sample case has all required fields for gameplay
- Frontend components can load and display database content

---

### Phase 2B: Authentication & Protected Routes (HIGH PRIORITY)

**Duration:** 2-3 days  
**Dependencies:** Phase 2A complete  

### Objectives
- Complete teacher authentication system
- Secure API endpoints with proper authorization
- Enable teacher dashboard functionality

### Tasks

#### 2B.1 Authentication Service Integration
```typescript
// Complete existing authService.ts
export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse>
  static async register(teacherData: TeacherRegistration): Promise<User>
  static getToken(): string | null
  static isAuthenticated(): boolean
}
```

#### 2B.2 Protected Route Implementation
```typescript
// Complete ProtectedRoute component
const ProtectedRoute = ({ children, role = 'teacher' }) => {
  const { user, isLoading } = useAuth();
  // Implement proper redirection and role checking
};
```

#### 2B.3 Login/Registration UI
```typescript
// Build functional login page
const LoginPage = () => {
  // Form handling, validation, error states
  // Connect to AuthService.login()
  // Redirect to dashboard on success
};
```

### Deliverables
- [ ] Working login/logout functionality
- [ ] Protected routes properly secured
- [ ] Teacher registration system
- [ ] Authentication state management
- [ ] Error handling for auth failures

### Acceptance Criteria
- Teachers can create accounts and log in
- Protected routes redirect unauthenticated users
- JWT tokens properly stored and validated
- Role-based access control works correctly
- Auth state persists across browser sessions

---

### Phase 2C: Session Management & MVP Game Flow (HIGH PRIORITY)

**Duration:** 3-4 days  
**Dependencies:** Phase 2B complete  

### Objectives
- Teachers can create and launch game sessions
- Students can join sessions with team codes
- Basic end-to-end game flow functional

### Tasks

#### 2C.1 Teacher Dashboard Enhancement
```typescript
// Complete Dashboard.tsx
const Dashboard = () => {
  // Display available cases from database
  // "Launch Game" button creates session
  // Session management interface
  // Real-time session monitoring
};
```

#### 2C.2 Session Creation Flow
```typescript
// Implement session creation
export const createGameSession = async (
  caseId: string,
  settings: GameSettings
): Promise<GameSession> => {
  // Create session in database
  // Generate unique join code
  // Initialize game state
  // Return session details
};
```

#### 2C.3 Student Joining Workflow
```typescript
// Build join game interface
const JoinGame = () => {
  // Team code input
  // Team name registration
  // Connection to game session
  // Redirect to student interface
};
```

#### 2C.4 Live Game Session Management
```typescript
// Complete game session controller
export class LiveGameSession {
  // Teacher controls: start, pause, advance rounds
  // Student interface: display clues, submit warrants
  // Real-time synchronization
  // Score calculation and display
};
```

### Deliverables
- [ ] Functional teacher dashboard with case selection
- [ ] Session creation and join code generation
- [ ] Student team joining workflow
- [ ] Live game session management
- [ ] Basic real-time updates (teacher → students)

### Acceptance Criteria
- Teacher can select a case and create a session
- Students can join with team codes
- Game progresses through clue reveals
- solution submissions are processed
- Scores are calculated and displayed
- One complete game can be played start to finish

---

## IMMEDIATE ACTION PLAN (Next 7-10 Days)

### Week 1 Priorities:

**Day 1-2: Database Foundation**
1. Set up PostgreSQL (local or Railway)
2. Run migrations to create all tables
3. Create and insert 3 sample villains with complete data
4. Create 1 complete case with all clues and rounds
5. Test API connectivity to database

**Day 3-4: Authentication System** 
1. Complete login/registration functionality
2. Implement protected routes
3. Connect teacher dashboard to auth system
4. Test role-based access control

**Day 5-7: MVP Game Session**
1. Build session creation interface
2. Implement student joining workflow  
3. Create live game session management
4. Test complete game flow from teacher launch to student completion

**Day 8-10: Polish & Testing**
1. Fix bugs discovered in end-to-end testing
2. Improve error handling and user feedback
3. Test with multiple concurrent sessions
4. Prepare for classroom pilot testing

### Success Criteria for Week 1:
- [ ] A teacher can log in, select a case, and start a game session
- [ ] Students can join the session with a team code
- [ ] The game progresses through clue reveals with real-time updates
- [ ] Students can submit warrants and see their scores
- [ ] A complete game can be played from start to finish
- [ ] All data is stored in and retrieved from PostgreSQL database

This revised plan focuses on the minimum viable product needed for a complete A-Z game experience, prioritizing the missing foundational pieces that prevent end-to-end gameplay.

---

---

## Phase 1: Project Architecture Setup

**Duration:** 1-2 days  
**Dependencies:** None  

### Objectives
- Establish foundational project structure
- Choose and configure hosting platform
- Set up development environment and build tools

### Tasks

#### 1.1 Platform Selection & Setup
- **Choose hosting platform:**
  - **Recommended:** Railway (unified frontend/backend hosting)
  - **Alternative:** Netlify + Supabase
- **Create project repositories and deployment pipelines**

#### 1.2 Frontend Setup
```bash
# Create React + TypeScript project
npx create-react-app sourdough-pete --template typescript
cd sourdough-pete

# Install core dependencies
npm install react-router-dom zustand tailwindcss
npm install leaflet react-leaflet lucide-react
npm install @types/leaflet

# Install development dependencies
npm install -D @types/node eslint prettier vitest
```

#### 1.3 Project Structure Creation
```
/src
  /components
    /common           # Reusable UI components
    /game             # Game-specific components
    /teacher          # Teacher dashboard components
  /pages
    /Dashboard.tsx
    /LiveCase.tsx
    /Editor.tsx
  /services
    /api.ts
    /gameService.ts
    /scoringService.ts
  /hooks              # Custom React hooks
  /data               # Seed data and constants
  /types              # TypeScript interfaces
  /theme              # Tailwind configuration
  /utils              # Helper functions
```

#### 1.4 Build Configuration
- Configure Tailwind CSS with custom theme
- Set up ESLint, Prettier, and TypeScript strict mode
- Configure Vitest for testing
- Set up environment variable handling

### Deliverables
- [ ] Project repository with complete folder structure
- [ ] Build system configured and working
- [ ] Basic deployment pipeline to chosen platform
- [ ] Development environment documentation

### Acceptance Criteria
- `npm run build` produces optimized bundle
- `npm run dev` starts development server
- `npm run test` runs test suite
- Deployment pipeline successfully deploys to staging environment

---

## Phase 2: Data Models & Database Design

**Duration:** 2-3 days  
**Dependencies:** Phase 1 complete  

### Objectives
- Implement TypeScript interfaces from specification
- Design and create PostgreSQL database schema
- Set up database migrations and seed data structure

### Tasks

#### 2.1 TypeScript Interface Implementation
Create `/src/types/index.ts` with all interfaces:
- `Villain` - Character data structure
- `Case` - Game scenario structure
- `Team` - Student team information
- `WarrantSubmission` - Final answers
- `ScoreEvent` - Individual scoring events
- `ScoringProfile` - Scoring configuration
- `SystemConfig` - Application settings

#### 2.2 Database Schema Design
```sql
-- Core tables
CREATE TABLE villains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codename VARCHAR(100) NOT NULL,
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
  reviewed_by UUID
);

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  scenario TEXT NOT NULL,
  stolen_item VARCHAR(200) NOT NULL,
  educational_objectives TEXT[] NOT NULL,
  primary_geographic_answer VARCHAR(100) NOT NULL,
  alternate_acceptable_answers TEXT[] NOT NULL,
  villain_id UUID NOT NULL REFERENCES villains(id),
  rounds JSONB NOT NULL,
  difficulty_override INTEGER CHECK (difficulty_override BETWEEN 1 AND 5),
  timing_profile VARCHAR(20) DEFAULT 'full',
  warrant_requirements JSONB NOT NULL,
  scoring_profile_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  cultural_review_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL
);

-- Additional tables for teams, sessions, scores, etc.
```

#### 2.3 Database Indexes and Constraints
- Create indexes for frequently queried fields
- Set up foreign key constraints
- Add check constraints for data validation

#### 2.4 Migration System
- Set up database migration framework
- Create initial migration files
- Implement rollback capabilities

### Deliverables
- [ ] Complete TypeScript interfaces in `/src/types/`
- [ ] Database schema with all tables and relationships
- [ ] Migration system and initial migration files
- [ ] Database connection configuration

### Acceptance Criteria
- All TypeScript interfaces match specification exactly
- Database schema supports all required features
- Migrations run successfully without errors
- Foreign key relationships properly enforced

---

## Phase 3: Core Game Logic Services

**Duration:** 3-4 days  
**Dependencies:** Phase 2 complete  

### Objectives
- Implement progressive clue engine
- Build scoring system with all rules
- Create content filtering service
- Develop game session management

### Tasks

#### 3.1 Progressive Clue Engine (`/src/services/clueEngine.ts`)
```typescript
class ClueEngine {
  // Initialize with villain and case data
  async initializeCase(caseId: string): Promise<GameSession>
  
  // Generate clues for specific round with difficulty obfuscation
  generateRoundClues(round: number, difficulty: number): Promise<CluePacket>
  
  // Handle token replacement ({{currency}}, {{biome}}, etc.)
  processTokenReplacement(clueText: string, geoData: GeoFacts): string
  
  // Progressive suspect trait revelation
  generateSuspectTraits(round: number, villain: Villain): string[]
}
```

**Key Features:**
- Difficulty-based clue obfuscation for rounds 1-2
- Token replacement system for dynamic content
- Progressive specificity in suspect traits
- Clue shuffling for variety

#### 3.2 Scoring System (`/src/services/scoringService.ts`)
```typescript
class ScoringService {
  // Calculate base score with difficulty multiplier
  calculateBaseScore(category: string, difficulty: number): number
  
  // Apply bonuses and penalties
  calculateFinalScore(baseScore: number, bonuses: Bonus[], penalties: Penalty[]): number
  
  // Handle tie-breaking logic
  resolveTieBreaker(teams: Team[]): Team[]
  
  // Real-time score updates
  updateTeamScore(teamId: string, scoreEvent: ScoreEvent): Promise<void>
}
```

**Scoring Rules Implementation:**
- Round location points: [5, 8, 10, 15]
- Villain identification: 10 points
- Speed bonus: 3 points (first correct team per round)
- Research quality bonus: 2 points (teacher awarded)
- Cultural insight bonus: 2 points (teacher awarded)
- Wrong capture penalty: -5 points

#### 3.3 Content Filtering Service (`/src/services/contentFilter.ts`)
```typescript
class ContentFilterService {
  // Check content against banned/warning token lists
  scanContent(text: string): ContentScanResult
  
  // Auto-flag content for review
  flagForReview(contentId: string, reason: string): Promise<void>
  
  // Cultural sensitivity validation
  validateCulturalContent(content: Villain | Case): ValidationResult
}
```

#### 3.4 Game Session Management (`/src/services/gameSession.ts`)
```typescript
class GameSessionService {
  // Create new game session from case
  createSession(caseId: string, teams: Team[]): Promise<GameSession>
  
  // Advance to next round with timer management
  advanceRound(sessionId: string): Promise<RoundAdvanceResult>
  
  // Handle solution submissions
  submitWarrant(sessionId: string, teamId: string, solution: WarrantSubmission): Promise<void>
  
  // Real-time state management
  getSessionState(sessionId: string): Promise<GameSessionState>
}
```

### Deliverables
- [ ] Clue engine with difficulty obfuscation
- [ ] Complete scoring system with all rules
- [ ] Content filtering and safety validation
- [ ] Game session state management
- [ ] Comprehensive unit tests for all services

### Acceptance Criteria
- Clue engine correctly obfuscates high-difficulty clues in early rounds
- Scoring system calculates points exactly per specification
- Content filter correctly flags problematic content
- Game sessions handle timing modes correctly
- All edge cases covered by tests

---

## Phase 4: API Layer Implementation

**Duration:** 3-4 days  
**Dependencies:** Phase 3 complete  

### Objectives
- Create RESTful API endpoints
- Implement WebSocket real-time communication
- Set up authentication and authorization
- Add comprehensive error handling

### Tasks

#### 4.1 REST API Endpoints

**Game Management:**
```typescript
// GET /api/cases - List all available cases
// POST /api/cases - Create new case (teacher only)
// GET /api/cases/:id - Get specific case details
// PUT /api/cases/:id - Update existing case
// DELETE /api/cases/:id - Archive case

// POST /api/sessions - Start new game session
// GET /api/sessions/:id - Get session state
// POST /api/sessions/:id/round - Advance round
// POST /api/sessions/:id/solution - Submit solution
```

**Content Management:**
```typescript
// GET /api/villains - List all villains
// POST /api/villains - Create new villain
// PUT /api/villains/:id - Update villain
// PUT /api/villains/:id/review - Update cultural review status

// GET /api/scoring-profiles - Get scoring configurations
// GET /api/system-config - Get system settings
```

#### 4.2 WebSocket Implementation (`/ws/game/:sessionId`)
```typescript
// Real-time events
interface WebSocketEvents {
  'score-update': ScoreUpdateEvent;
  'round-advance': RoundAdvanceEvent;
  'clue-reveal': ClueRevealEvent;
  'solution-submitted': WarrantSubmissionEvent;
  'game-complete': GameCompleteEvent;
}
```

#### 4.3 Authentication System
- JWT-based authentication for teachers
- Role-based access control (teacher, admin, content_approver)
- Session management and token refresh
- Password hashing with bcrypt

#### 4.4 Input Validation & Error Handling
- Zod schema validation for all endpoints
- Standardized error response format
- Rate limiting and security headers
- Comprehensive logging

### Deliverables
- [ ] Complete REST API with all endpoints
- [ ] WebSocket server for real-time updates
- [ ] Authentication and authorization system
- [ ] Input validation and error handling
- [ ] API documentation (OpenAPI/Swagger)

### Acceptance Criteria
- All API endpoints function correctly
- WebSocket events broadcast to connected clients
- Authentication properly protects teacher-only routes
- Input validation prevents malformed requests
- Error responses are user-friendly and informative

---

## Phase 5: Teacher Dashboard & Controls

**Duration:** 4-5 days  
**Dependencies:** Phase 4 complete  

### Objectives
- Build comprehensive teacher interface
- Implement live game controls
- Create real-time scoreboard
- Add content review workflow

### Tasks

#### 5.1 Case Dashboard (`/src/pages/Dashboard.tsx`)
```typescript
// Features:
// - Filterable case library (status, difficulty, region)
// - Quick launch buttons
// - Case preview with educational objectives
// - Recently used cases
// - Import/export functionality
```

#### 5.2 Live Game Control Panel (`/src/components/teacher/LiveGameControl.tsx`)
```typescript
// Master timer with start/pause/reset
// Round advancement controls
// Manual scoring buttons (research/cultural bonuses)
// Clue reveal history
// Emergency override controls
// Session export functionality
```

#### 5.3 Real-time Scoreboard (`/src/components/game/Scoreboard.tsx`)
```typescript
// Team rankings with rank badges
// Round-by-round score breakdown
// Real-time updates via WebSocket
// Export to CSV/JSON
// Tie-breaker indicators
// Performance analytics
```

#### 5.4 solution Review System (`/src/components/teacher/WarrantReview.tsx`)
```typescript
// Review submitted warrants
// Approve/reject with feedback
// Evidence quality assessment
// Batch processing for multiple teams
// Audit trail of decisions
```

#### 5.5 Content Review Workflow (`/src/components/teacher/ContentReview.tsx`)
```typescript
// Flagged content queue
// Cultural sensitivity review tools
// Approval/rejection with notes
// Content modification suggestions
// Review history and audit trail
```

### Deliverables
- [ ] Complete teacher dashboard interface
- [ ] Live game control panel with all features
- [ ] Real-time scoreboard with export functionality
- [ ] solution review and approval system
- [ ] Content review and moderation tools

### Acceptance Criteria
- Teachers can launch and control games seamlessly
- Scoreboard updates in real-time across all clients
- solution review process is efficient and comprehensive
- Content review workflow maintains cultural sensitivity
- All teacher actions are logged for audit purposes

---

## Phase 6: Smart TV/Projector Interface

**Duration:** 3-4 days  
**Dependencies:** Phase 5 complete  

### Objectives
- Create optimized large-screen display
- Implement two-column layout design
- Ensure high-contrast, readable typography
- Add real-time synchronization

### Tasks

#### 6.1 Large Screen Layout (`/src/pages/LiveCase.tsx`)
```typescript
// Two-column layout:
// Left (60%): Clue Panel with large typography
// Right (40%): Scoreboard and Timer
// Responsive breakpoints for different screen sizes
// High contrast color scheme
```

#### 6.2 Clue Display Panel (`/src/components/game/CluePanel.tsx`)
```typescript
// Progressive clue revelation
// Large, readable fonts (22px base, 36px+ headings)
// Visual hierarchy with icons and spacing
// Smooth animations for new clue reveals
// Round indicators and progress bars
```

#### 6.3 Timer & Status Display (`/src/components/game/TimerDisplay.tsx`)
```typescript
// Large countdown timer
// Round progress indicator
// Visual alerts for time warnings
// Pause/resume state indicators
// Emergency stop controls
```

#### 6.4 Typography & Accessibility
```css
/* Large screen optimizations */
.tv-display {
  font-size: 22px;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

.tv-heading {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* High contrast theme */
.tv-theme {
  background: #2F4F4F;
  color: #E4D8C4;
  --primary: #F2B950;
  --secondary: #C7925B;
}
```

### Deliverables
- [ ] Optimized large-screen interface
- [ ] Two-column layout with proper proportions
- [ ] High-contrast typography system
- [ ] Real-time synchronization with teacher controls
- [ ] Smooth animations and transitions

### Acceptance Criteria
- Interface is clearly readable from 10+ feet away
- Two-column layout works on various screen sizes
- Real-time updates display without lag
- Typography meets accessibility standards
- Visual hierarchy guides attention effectively

---

## Phase 7: Content Management System

**Duration:** 4-5 days  
**Dependencies:** Phase 4 complete  

### Objectives
- Build villain and case editors
- Implement content safety pipeline
- Create cultural review workflow
- Seed database with sample content

### Tasks

#### 7.1 Villain Editor (`/src/components/teacher/VillainEditor.tsx`)
```typescript
// Form-based editor with validation
// Image prompt generator
// Cultural sensitivity guidelines
// Preview functionality
// Bulk import/export capabilities
```

#### 7.2 Case Editor (`/src/components/teacher/CaseEditor.tsx`)
```typescript
// Multi-step case creation wizard
// Clue template system
// Educational objective mapping
// Difficulty calculation
// Playtesting mode
```

#### 7.3 Content Safety Pipeline
```typescript
// Automated content scanning
// Manual review queue
// Approval workflow with notifications
// Version control for content changes
// Rollback capabilities
```

#### 7.4 Sample Content Creation
- 21 unique villains across different regions
- 3 complete sample cases
- Geographical facts database
- Educational objective taxonomy

### Deliverables
- [ ] Comprehensive villain editor
- [ ] Full-featured case editor
- [ ] Content safety and review system
- [ ] Sample content database
- [ ] Content import/export tools

### Acceptance Criteria
- Editors validate all required fields
- Content safety pipeline catches inappropriate content
- Review workflow maintains cultural sensitivity
- Sample content demonstrates all game features
- Import/export maintains data integrity

---

## Phase 8: Map Integration & Offline Support

**Duration:** 2-3 days  
**Dependencies:** Phase 6 complete  

### Objectives
- Integrate Leaflet mapping library
- Implement offline tile fallback
- Add educational map features
- Ensure classroom compatibility

### Tasks

#### 8.1 Map Component (`/src/components/game/GameMap.tsx`)
```typescript
// Leaflet integration with OpenStreetMap
// Offline tile caching system
// Educational overlays (countries, regions)
// Interactive zoom and pan controls
// Fallback to static images when offline
```

#### 8.2 Offline Tile System
```typescript
// Pre-cache essential map tiles
// Fallback tile server configuration
// Local storage management
// Network connectivity detection
// Graceful degradation
```

#### 8.3 Educational Features
- Country/region highlighting
- Educational information overlays
- Cultural landmark markers
- Geographic feature annotations

### Deliverables
- [ ] Integrated mapping system
- [ ] Offline tile fallback
- [ ] Educational map overlays
- [ ] Network resilience features

### Acceptance Criteria
- Maps load reliably in classroom environments
- Offline mode provides adequate functionality
- Educational overlays enhance learning
- Performance is acceptable on various devices

---

## Phase 9: Accessibility & Visual Theme

**Duration:** 3-4 days  
**Dependencies:** All UI phases complete  

### Objectives
- Achieve WCAG 2.1 AA compliance
- Implement dyslexia-friendly features
- Apply vintage cartoon styling
- Ensure responsive design

### Tasks

#### 9.1 Accessibility Implementation
```typescript
// WCAG 2.1 AA compliance audit
// Keyboard navigation support
// Screen reader compatibility
// Color contrast validation
// Focus management
// Alt text for all images
```

#### 9.2 Dyslexia-Friendly Features
```css
/* Font switching system */
.dyslexia-friendly {
  font-family: 'OpenDyslexic', sans-serif;
  letter-spacing: 0.1em;
  word-spacing: 0.16em;
  line-height: 1.5;
}
```

#### 9.3 Vintage Theme Implementation
```css
/* Color palette */
:root {
  --dark-slate-gray: #2F4F4F;
  --camel: #C7925B;
  --bone: #E4D8C4;
  --steel-blue: #4B7F94;
  --burnt-sienna: #A34234;
  --goldenrod: #F2B950;
}

/* Vintage styling */
.vintage-theme {
  background: linear-gradient(45deg, var(--dark-slate-gray), var(--steel-blue));
  font-family: 'Fredoka One', cursive;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
```

#### 9.4 Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop and large screen support
- Print-friendly styles

### Deliverables
- [ ] WCAG 2.1 AA compliant interface
- [ ] Dyslexia-friendly font toggle
- [ ] Complete vintage theme implementation
- [ ] Responsive design across all devices
- [ ] Accessibility testing report

### Acceptance Criteria
- Passes automated accessibility testing tools
- Manual testing confirms keyboard navigation
- Dyslexia-friendly mode significantly improves readability
- Vintage theme is visually cohesive and appealing
- Interface works well on all target devices

---

## Phase 10: Testing & Quality Assurance

**Duration:** 4-5 days  
**Dependencies:** All development phases complete  

### Objectives
- Implement comprehensive test suite
- Validate all educational scenarios
- Performance testing and optimization
- Security testing and validation

### Tasks

#### 10.1 Unit Testing
```typescript
// Service layer tests
describe('ClueEngine', () => {
  test('obfuscates high-difficulty clues in early rounds');
  test('processes token replacement correctly');
  test('generates progressive suspect traits');
});

describe('ScoringService', () => {
  test('calculates scores with difficulty multipliers');
  test('handles tie-breaking correctly');
  test('applies bonuses and penalties');
});
```

#### 10.2 Integration Testing
- API endpoint testing
- Database transaction testing
- WebSocket communication testing
- Authentication flow testing

#### 10.3 Educational Scenario Testing
- Full Period mode (50 minutes)
- Quick Case mode (25 minutes)
- High-difficulty case obfuscation
- solution submission and review
- Content flagging and review workflow

#### 10.4 Performance & Security Testing
- Load testing with multiple concurrent games
- Database query optimization
- Security vulnerability scanning
- Content sanitization validation

### Deliverables
- [ ] Comprehensive unit test suite (>90% coverage)
- [ ] Integration test automation
- [ ] Educational scenario validation
- [ ] Performance optimization report
- [ ] Security audit and fixes

### Acceptance Criteria
- All tests pass consistently
- Performance meets classroom requirements
- Security vulnerabilities are resolved
- Educational scenarios work as specified
- Code coverage exceeds 90%

---

## Phase 11: Deployment & DevOps Setup

**Duration:** 2-3 days  
**Dependencies:** Phase 10 complete  

### Objectives
- Configure production deployment
- Set up CI/CD pipeline
- Implement monitoring and logging
- Create backup and recovery procedures

### Tasks

#### 11.1 Production Deployment
```yaml
# Railway/Netlify deployment configuration
services:
  - name: sourdough-pete-app
    source:
      repo: github.com/TheAccidentalTeacher/glennallencarmansandiego
    build:
      command: npm run build
    deploy:
      command: npm start
    variables:
      NODE_ENV: production
      DATABASE_URL: ${{DATABASE_URL}}
      JWT_SECRET: ${{JWT_SECRET}}
```

#### 11.2 CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Type check
        run: npm run type-check
      - name: Lint
        run: npm run lint
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: railway up
```

#### 11.3 Monitoring & Logging
- Application performance monitoring
- Error tracking and alerting
- User analytics (privacy-compliant)
- Database performance monitoring

#### 11.4 Backup & Recovery
- Automated database backups
- Content export procedures
- Disaster recovery plan
- Data retention policies

### Deliverables
- [ ] Production deployment configuration
- [ ] Automated CI/CD pipeline
- [ ] Comprehensive monitoring setup
- [ ] Backup and recovery procedures
- [ ] Production operations guide

### Acceptance Criteria
- Deployment process is automated and reliable
- CI/CD pipeline catches issues before production
- Monitoring provides actionable insights
- Backup procedures are tested and verified
- Operations team can manage production environment

---

## Phase 12: Documentation & Final Polish

**Duration:** 2-3 days  
**Dependencies:** Phase 11 complete  

### Objectives
- Create comprehensive user documentation
- Develop teacher training materials
- Final testing against acceptance checklist
- Prepare for production launch

### Tasks

#### 12.1 User Documentation
```markdown
# Teacher's Guide to Sourdough Pete
## Getting Started
## Creating Your First Case
## Managing Live Games
## Understanding Scoring
## Cultural Sensitivity Guidelines
## Troubleshooting Common Issues
```

#### 12.2 Technical Documentation
- API documentation (OpenAPI spec)
- Database schema documentation
- Deployment and maintenance guide
- Security best practices
- Performance optimization guide

#### 12.3 Training Materials
- Video tutorials for teachers
- Sample lesson plans
- Educational objective alignment
- Classroom setup recommendations

#### 12.4 Final Testing Checklist
- [ ] Seed data: 21 villains, 3 complete cases
- [ ] Timing modes: Full Period and Quick Case functional
- [ ] Scoring engine: All rules correctly implemented
- [ ] Rank progression: Computed and displayed correctly
- [ ] Content editors: Fully functional with review workflow
- [ ] Clue obfuscation: Working for high-difficulty cases
- [ ] solution workflow: Complete submission to approval process
- [ ] Scoreboard export: CSV and JSON formats working
- [ ] Accessibility: WCAG 2.1 AA compliance verified
- [ ] Content filter: Integrated and functioning
- [ ] Offline map: Functional fallback implemented
- [ ] Audit log: Content changes tracked

### Deliverables
- [ ] Complete user documentation
- [ ] Technical documentation and guides
- [ ] Teacher training materials
- [ ] Final acceptance checklist validation
- [ ] Production launch readiness report

### Acceptance Criteria
- All documentation is complete and accurate
- Teacher training materials are engaging and effective
- Final checklist shows 100% completion
- Application is ready for production use
- Support procedures are established

---

## Success Metrics

### Technical Metrics
- **Performance:** Page load times < 2 seconds
- **Reliability:** 99.9% uptime in production
- **Security:** Zero critical vulnerabilities
- **Accessibility:** WCAG 2.1 AA compliance
- **Test Coverage:** >90% code coverage

### Educational Metrics
- **Usability:** Teachers can create and launch games independently
- **Engagement:** Students actively participate throughout sessions
- **Learning:** Measurable improvement in geography knowledge
- **Adoption:** Positive feedback from classroom pilots
- **Scalability:** Support for multiple concurrent classrooms

### Cultural Sensitivity Metrics
- **Content Review:** 100% of user-generated content reviewed
- **Cultural Accuracy:** Expert validation of cultural representations
- **Inclusivity:** Diverse, respectful character portrayals
- **Safety:** Robust content filtering prevents inappropriate material

---

## Risk Mitigation

### Technical Risks
- **Database Performance:** Implement caching and query optimization
- **Real-time Synchronization:** Robust WebSocket error handling
- **Offline Functionality:** Comprehensive fallback mechanisms
- **Browser Compatibility:** Cross-browser testing and polyfills

### Educational Risks
- **Cultural Sensitivity:** Multi-stage review process with expert input
- **Age Appropriateness:** Content guidelines and teacher oversight
- **Learning Effectiveness:** Pilot testing with actual classrooms
- **Technology Barriers:** Comprehensive teacher training and support

### Operational Risks
- **Scalability:** Load testing and auto-scaling configuration
- **Data Loss:** Automated backups and recovery procedures
- **Security Breaches:** Regular security audits and updates
- **Compliance:** Privacy policy and data protection measures

---

## ✅ PROVEN APPROACH UPDATE

**Status**: Educational transformation successfully completed with 3 pilot cases

### Achievement Summary
- **Dr. Altiplano (Isabella Santos)**: ✅ Mountain geography with 11-year-old appropriate content
- **Dr. Coral (Maya Sari)**: ✅ Marine ecosystems using detective narrative engagement  
- **Professor Atlas (Viktor Kowalski)**: ✅ Political geography with progressive discovery model
- **Frontend Implementation**: ✅ Progressive hint reveal system with proper button contrast
- **Image Integration**: ✅ Villain folder mapping and display system working
- **Educational Standards**: ✅ All content transformed from graduate to elementary level

### Validated Workflow for Future Cases
1. **Content Review**: Transform complex language to 11-year-old vocabulary using detective themes
2. **Progressive Structure**: Implement 5-round discovery model (broad → specific → synthesis)
3. **Cultural Sensitivity**: Maintain respectful representation with educational focus
4. **Technical Integration**: Follow proven JSON structure with proper villain ID mapping
5. **Quality Assurance**: Use comprehensive checklist for educational and technical validation

### Ready for Next Development Phase
The proven approach documented in `game-flow.md` and this implementation plan ensures consistent quality for all remaining villain cases. The educational transformation methodology and technical implementation patterns are now standardized for efficient development of the complete geography curriculum.

---

## Next Steps

1. **Review and approve this implementation plan**
2. **Set up development environment and choose hosting platform**
3. **Begin Phase 1: Project Architecture Setup**
4. **Establish regular check-ins and progress reviews**
5. **Recruit teacher beta testers for classroom pilots**

This implementation plan provides a comprehensive roadmap for building "Sourdough Pete's Geography Challenge" while maintaining educational integrity, cultural sensitivity, and technical excellence.