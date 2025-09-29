# Teacher Runbook

This is the operational guide for running Sourdough Pete as a whole‑class activity from a single computer connected via HDMI.

## Before Class
- Verify both servers run locally (see Health Checks below)
- Open two browser windows:
  - Control: http://localhost:5173/control (Milestone 3)
  - Projector: http://localhost:5173/projector (Milestone 4)
- Pick today’s case JSON (Milestone 1) and do a quick skim
- Optional: prepare a 8‑minute timer per round

Quickstart:
- On Windows, you can run `start-servers.ps1` to open both servers in new windows.
- Cross-platform, `node start-game.mjs` starts backend + frontend together.

## Health Checks
- API: http://localhost:3001/health → { status: "OK" }
- Images: http://localhost:3001/api/images/villains → villain ids
- Frontend: http://localhost:5173/

## In‑Class Flow (MVP)
1. Intro/Briefing
2. Round 1: Reveal Clue → Class research → Collect one class guess on map → Submit → Show distance/score
3. Round 2–3: Repeat with cultural/economic/environmental focus
4. Round 4: Final identification → Submit solution (country + optional suspect)
5. Recap screen with evidence summary and learning extensions

## Controls (planned)
- Buttons: Reveal, Guess, Submit, Score/Show, Next, solution, Recap
- Toggles: Suspect lineup, Timer on/off, Skip round
- Keyboard: N (next), G (guess), W (solution), R (reveal), T (timer)

## After Class
- Save/export session results (CSV + JSON snapshot) to `data/sessions/`
- Note improvements for the next run; update cases if needed

## Troubleshooting
- If the projector view isn’t updating, refresh the /projector tab
- If ports are busy, stop Node processes and restart the two servers
- If images 404, verify URLs like `/images/<folder>/<file>.png`
