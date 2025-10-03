# Sourdough Pete's Geography Challenge

An educational, teacher‑led geography detective game designed for whole‑class play on a single computer connected to a projector/Smart TV. Students help track down The Sourdough Syndicate using maps, globes, and research skills. Built with React + TypeScript + Vite (frontend) and Node/Express (backend).

## 📚 EDUCATIONAL DOCUMENTATION
👉 **[GAME-FLOW.md](./GAME-FLOW.md)** - Complete educational design and 11-year-old content standards
👉 **[IMPLEMENTATION-PLAN.md](./docs/implementation-plan.md)** - Proven development workflow and quality standards

## 🎯 EDUCATIONAL SUCCESS ✅
**3 Pilot Cases Successfully Transformed for 11-Year-Olds:**
- **Dr. Altiplano**: Mountain geography with progressive discovery system
- **Dr. Coral**: Marine ecosystems using detective narrative engagement
- **Professor Atlas**: Political geography with age-appropriate complexity

All cases feature 5-round progressive hint reveal, proper button contrast, and proven educational content transformation from graduate-level to elementary-friendly language.dough Pete's Geography Challenge

An educational, teacher‑led geography detective game designed for whole‑class play on a single computer connected to a projector/Smart TV. Students help track down The Sourdough Syndicate using maps, globes, and research skills. Built with React + TypeScript + Vite (frontend) and Node/Express (backend).

## � GAME DESIGN & FLOW
👉 **[GAME-FLOW.md](./GAME-FLOW.md)** - Master design document for clue creation and game mechanics

## �🚀 CODESPACES HANDOFF (September 28, 2025)

### What's Working Right Now
- ✅ **5-Image Educational Progression System**: Complete for 8 villain cases
- ✅ **Villain Gallery**: All images loading correctly via `/images/villains/` routes
- ✅ **Case System**: Cases tab loads and displays with round-specific images
- ✅ **API Server**: Filesystem-based content serving (`USE_FS_CONTENT=true`)
- ✅ **Static File Serving**: Villain images served from `content/villains/images/`

### What Was Just Fixed
- **Image URL Construction**: Fixed CasePreview component to use correct folder prefixes (e.g., `04-dr-altiplano-isabella-santos`)
- **Server Configuration**: Added case image serving routes in server.ts
- **Round-to-Image Mapping**: Each round now displays specific villain image progression

### Quick Start in Codespaces
```bash
# Terminal 1 - API Server
cd /workspaces/glennallencarmansandiego
export USE_FS_CONTENT="true"
npm run build:server
npm start

# Terminal 2 - Frontend Server  
cd /workspaces/glennallencarmansandiego
npm run dev

# Open browser to localhost:5173
```

### Test the System
1. Go to http://localhost:5173
2. Click **Cases** tab
3. Select "The Andean Mining Operation Sabotage" 
4. Verify each round shows different villain images (15-19)
5. Check **Villains** tab shows image gallery

### Current Progress Status

**🎉 IMAGE INTEGRATION COMPLETE (ALL 13 CHARACTERS):**
- ✅ Dr. Meridian - Alpine Research (Western Europe)
- ✅ Professor Sahara - Desert Systems (North Africa)  
- ✅ Professor Tectonic - Seismic Engineering (East Asia)
- ✅ Dr. Altiplano - Andean Systems (South America)
- ✅ Dr. Sahel - Sahelian Climatology (West Africa)
- ✅ Dr. Monsoon - Monsoon Systems (South Asia)
- ✅ Dr. Coral - Marine Conservation (Southeast Asia)
- ✅ Dr. Qanat - Ancient Engineering (Middle East)
- ✅ Professor Atlas - Cartography (Eastern Europe)
- ✅ Dr. Pacific - Volcanic Research (Oceania)
- ✅ Dr. Watershed - Environmental Geography (North America) **HERO**
- ✅ Dr. Canopy - Rainforest Ecology (Central America) **HERO**
- ✅ Sourdough Pete - Alaska Master Criminal (Finale Boss)

**📋 READY FOR CASE DEVELOPMENT:**
- Character universe complete with 13 distinct specialists
- All villain images analyzed and documented with manifests
- Educational framework established for each character
- Technical foundation ready for case narratives

## 🛠️ Development Environment Setup

### Prerequisites
- Node.js 20+
- npm 9+
- Git

### Installation
```bash
npm install
npm run build:server  # Build TypeScript server
```

### Starting Development Servers (SIMPLE VERSION)

**Two terminals, two commands:**

```bash
# Terminal 1 - API Server (port 3001)
cd /workspaces/glennallencarmansandiego
export USE_FS_CONTENT="true"  # or $env:USE_FS_CONTENT="true" on Windows
npm start

# Terminal 2 - Frontend Server (port 5173)  
cd /workspaces/glennallencarmansandiego
npm run dev
```

**Health Check:**
- Frontend: http://localhost:5173 
- API: http://localhost:3001/api/content/cases

### Alternative Scripts
- `npm run dev:both` - Automated PowerShell script (Windows)
- `npm run dev:simple` - Simple version of above

## Project Structure

```
content/
  villains/
    images/                     # Image folders per villain with manifests
      00-sourdough-pete-alaska/
        manifest.md             # Detailed image analysis & educational context
        *.png                   # Character images (5 per villain)
      01-dr-meridian-elena-fossat/
      02-professor-sahara-amira-hassan/
      03-professor-tectonic-seismic-specialist/
      04-dr-altiplano-isabella-santos/
      [... 05-12 complete folders]
  cases/                        # JSON cases (ready for development)
docs/                           # Comprehensive documentation (see docs/README.md)
  organizations/                # Sourdough Syndicate lore
  case-catalog.md              # Complete villain catalog (00-12)
  world-building-progress.md   # Development completion tracking
src/                           # React frontend application
server files                   # Express server (local dev)
vite.config.ts               # Vite config (dev)
```

## Teacher‑Led MVP (What we’re building first)

We’re prioritizing a single‑machine classroom flow:
1) Case JSON loaded from filesystem
2) Teacher controls the rounds from /control
3) Projector view shows clues/map/recap
4) No logins, no multi‑device—yet

Details: docs/implementation-plan.md#teacher%E2%80%91led-mvp-plan-sept-26-2025

## Authoring Cases

- Spec and examples: docs/implementation-plan.md#case-design-specification-teacher%E2%80%91led-mode
- Case Catalog (12 + 2‑week finale plan): docs/case-catalog.md
- Cultural sensitivity and content process: docs/content-creation-guide.md

## Contributing and Documentation

- Full documentation index: docs/README.md
- Update docs when behavior changes; keep links valid.

## Troubleshooting

- Frontend won’t open on 5173: ensure npm run dev is running; check netstat for :5173.
- Backend not responding on 3001: re‑run `node test-server.mjs`; check .env.local.
- Image 404s: frontend should request `/images/<folder>/<file>.png` (not `/images/villains/...`).

## License

For classroom and educational use. See repository LICENSE if provided.

