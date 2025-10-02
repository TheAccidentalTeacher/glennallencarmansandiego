# Case Catalog - Sourdough Syndicate Villains

We will ship with 12 fully‑fleshed weekly cases plus a 2‑week finale to find Sourdough Pete. Each case features one of the Sourdough Syndicate specialists with their unique geographic expertise.

## Villain Organization (00-12)

**Master Criminal:**
- **00: Sourdough Pete** - Alaska Master Criminal - The final boss organizing the global Sourdough Syndicate

**Sourdough Syndicate Specialists:**
- **01: Dr. Meridian (Elena Fossat)** - Western Europe/Alpine Research
- **02: Professor Sahara (Amira Hassan)** - North Africa/Desert Systems  
- **03: Professor Tectonic (Jin Wei-Ming)** - East Asia/Seismic Engineering
- **04: Dr. Altiplano (Isabella Santos)** - South America/Andean Systems
- **05: Dr. Sahel (Kwame Asante)** - West Africa/Sahelian Climatology
- **06: Dr. Monsoon (Kiran Patel)** - South Asia/Monsoon Systems
- **07: Dr. Coral (Maya Sari)** - Southeast Asia/Marine Conservation
- **08: Dr. Qanat (Reza Mehrabi)** - Middle East/Ancient Engineering
- **09: Professor Atlas (Viktor Kowalski)** - Eastern Europe/Cartography
- **10: Dr. Pacific (James Tauranga)** - Oceania/Volcanic Research
- **11: Dr. Watershed (Sarah Blackfoot)** - North America/Environmental Geography
- **12: Dr. Canopy (Carlos Mendoza)** - Central America/Rainforest Ecology

## Case Development Template

Template:
```
- ID: <slug>
  Title: <title>
  Villain: <villain-name>
  Difficulty: beginner|intermediate|advanced
  Focus: [geography, culture, economics, environment, history]
  Status: draft|approved|final
  JSON: content/cases/<slug>.json
```

## Planned Case Lineup

| # | ID (slug) | Title | Villain | Difficulty | Focus | Status | JSON Path |
|---|-----------|-------|---------|------------|-------|--------|-----------|
| 1 | norway-vanishing-ship | The Vanishing Viking Ship (Norway) | TBD | beginner | geography, culture, economics | draft | content/cases/norway-vanishing-ship.json |
| 2-12 | TBD | Geographic Cases | Syndicate Specialists | progressive | geography, culture, environment | planned | content/cases/ |
| 13-14 | finale-sourdough-pete | Finding Sourdough Pete (2-week finale) | Sourdough Pete | advanced | multi‑region synthesis | planned | content/cases/finale/ |

## Educational Framework

Each villain case includes:
- **4 Progressive Rounds:** Geographic Foundation → Cultural Context → Economic/Political Systems → Specific Landmarks  
- **Multi-level Difficulty:** Cases progress from beginner (Level 1-2) to advanced (Level 4-5)
- **Cross-curricular Integration:** Geography, environmental science, cultural studies, economics
- **Image Assets:** 5 professional character images per villain for visual context
- **Cultural Sensitivity:** Respectful professional portrayals focused on expertise

## File Organization

- **Character Profiles:** `content/villains/[00-12]-[character-name].md`
- **Character Images:** `content/villains/images/[00-12]-[character-name]/`  
- **Case Files:** `content/cases/[case-slug].json`
- **Organizations:** `docs/organizations/sourdough-syndicate.md`

Authoring flow: use the [Case Design Specification](./implementation-plan.md#case-design-specification-teacher-led-mode) and [Cultural Review Checklist](./cultural-review-checklist.md). Each JSON should validate against the MVP schema described in the Implementation Plan.
