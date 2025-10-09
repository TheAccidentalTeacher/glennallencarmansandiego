# Atlas Corps Season 1 — Creator Operational Guide

Purpose: Human-centered meta companion to `NOVEL-MASTER.md` focusing on production workflow, decision rationale, adaptation levers, automation opportunities, and guardrails. Intended for you (the creator) or future collaborators onboarding quickly.

## 1. Orientation
Canonical Content Source: `NOVEL-MASTER.md` (do not fragment). Legacy files are historical. This guide = HOW; master = WHAT.
Design Pillars: Pedagogical spacing, motif chaining, ethical reasoning transparency, modular extensibility.
Narrative Version: v1.0 (post-consolidation) — increment after structural or KB taxonomy changes, not minor wording tweaks.

## 2. Production Workflow (Recommended Sprint Loop)
1. Select Chapter (or batch of 2) aligning with curriculum calendar.
2. Extract beats from Section 7 of master.
3. Use Scene Expansion Pass: For each beat → 2 short paragraphs (sensory first, reasoning second).
4. Insert KB using strict template; verify word count (<80) & reinforcement plan.
5. Ethics Beat: Write argument sides in bullet scratch, THEN narrative synthesis.
6. Continuity Check: Motifs (ring, quiet data, layering) present? If absent, subtle insertion.
7. Pedagogy Tagging: Annotate each beat with (S)ensory, (A)nalytical, (E)thical, (K)nowledge to ensure balance (target: each appears ≥2/ chapter; S occurs early).
8. Run Lint Script (future automation) to flag: KB overlength, missing forward tag, absent ethics stance, unreferenced prior concept.
9. Review Pass: Accessibility (sentence length diversity, define first jargon use).
10. Commit with version note: `ch05-prose-draft-v1` etc.

## 3. Prose Guardrails
Do:
- Open each chapter with anomaly sensory texture before technical exposition.
- Keep paragraphs <110 words (prefer 60–90) for readability.
- Reuse established analogies rather than inventing new metaphors late season.
Avoid:
- Naming cadets (breaks classroom self-insertion design).
- Introducing new antagonists or tools after Ch12 without tagging future-season intentionally.
- Stacking >2 untouched concepts in a single paragraph.

## 4. Ethical Debate Construction Checklist
- Frame as value tension, not hero vs villain.
- Present at least 2 credible positions with one trade-off each.
- Narrator synthesis references (if applicable) Charter Principle precursor.
- End debate beat with micro-shift in team understanding (reflective line or decision log note).

## 5. Knowledge Box Authoring Rules
Template fields mandatory: Term / Definition / Memory Hook / Application.
Validation: If Application cannot tie concretely to CURRENT chapter setting, defer KB.
Drift Prevention: Compare against master index; if new concept emerges, decide: integrate into existing KB or list candidate for Season 2 (parking lot section below).

## 6. Motif Deployment Matrix
| Motif | Min Early Use | Mid Reuse | Late Payoff | Failure Mode |
|-------|---------------|-----------|-------------|--------------|
| Broken Ring | Intro visual | Ch8 grid cross-ref | Ch14 near closure | Over-explaining geometry |
| Quiet Data | Ch5 reef | Ch9 canopy gap | Ch13 masked sensor | Treating as silence=always sabotage |
| Layering | Ch4 maps | Ch9 vertical strata | Ch14 taxonomy | Losing clarity with over-layering |
| Uncertainty Bands | Ch3 intro | Ch6 timing | Ch13 seismic risk | Deterministic phrasing undermines |
| Spiral (future) | — | — | Ch15 emergence | Premature hinting |

## 7. Automation & Tooling Roadmap
Targets:
- Beat → Prose Scaffold CLI: Insert standard headers, KB template stub, ethics checklist.
- KB Consistency Linter: Regex for structure, word count, missing Application.
- Motif Tag Extractor: Parse annotated beats to generate frequency heatmap.
- Synthesis Grid Exporter: JSON snapshot of anomaly classification per chapter for UI embedding.

## 8. Adaptation Levers (Safe vs Risky)
Safe Adjustments:
- Swap specialist ordering in dialogue (as long as functional roles preserved).
- Adjust sensory specifics (sounds, textures) without altering anomaly class.
- Tighten wording of charter principles (retain five-axis intent).
Risky Adjustments:
- Adding new KB without reinforcement plan.
- Merging Ch14 & Ch15 (collapses governance breathing room).
- Introducing named antagonist (breaks layered ambiguity design).

## 9. Continuity Watchpoints
- Desert Chapters (10 vs 11): Governance vs engineering—avoid cross-contaminating hooks.
- Leak Timing (Ch13): Must precede full pattern classification (Ch14) to preserve determination swing.
- Uncertainty Reuse: Explicit in Ch6 & Ch13; if one removed, re-seed elsewhere.
- Charter Principles: Should each have at least one antecedent ethics beat.

## 10. Accessibility & Pedagogy QA List
- Each chapter contains: 1 KB, 1 ethics beat, ≥1 synthesis/log update, forward tag.
- No chapter introduces >1 brand-new domain (use comparative framing if unavoidable).
- Concepts appear in concrete context before abstract naming (reef sound BEFORE acoustic taxonomy).

## 11. Versioning & Branching Strategy
Branch Naming: `prose/chXX-draft` → PR merges after QA. Tag after milestone groups: `v1.1-prose-ch1-5` etc.
Change Log Sections (in master): Added KB, Modified Beat Logic, Ethics Stance Adjustment, Motif Reassignment.
Rollback Plan: Preserve previous semantic tags; revert via git without editing historical file bodies manually.

## 12. Parking Lot (Season 2 / Deferred)
Candidates:
- Acoustic vs Thermal Signal Comparative KB.
- AI Triage Assistant as semi-character.
- Polar Data Sovereignty ethics beat.
- Community participatory mapping variant of Synthesis Grid.

## 13. Collaboration Onboarding (90-Min Ramp)
1. Read Sections 1–7 of master.
2. Skim KB index & note concept reinforcement pattern.
3. Review this guide’s Workflow & Guardrails.
4. Attempt expansion of one mid-season chapter (Ch6 or Ch8) using template.
5. Submit annotated prose draft with motif & pedagogy tags.

## 14. Quality Gate Before Publishing a Chapter
Checklist:
- [ ] All 9 beats represented.
- [ ] KB present & under 80 words.
- [ ] Ethics beat has at least 2 positions + synthesis.
- [ ] Forward tag tees a concrete next-domain expectation.
- [ ] Motif usage logged (ring/layer/quiet at least one present).
- [ ] No new unindexed concept introduced silently.
- [ ] Reading level: No paragraph with >2 multi-clause sentences.

## 15. Failure Mode Diagnostics
Symptom: Chapter feels flat → Check Escalation beat stakes escalation present?
Symptom: Concept confusion → Was KB introduced after usage? Reorder beats.
Symptom: Ethical debate reads biased → Rebuild opposing stance bullet scratch.
Symptom: Pacing drag mid chapter → Compress Data Triage + move twist earlier.

## 16. Rapid Prose Stub Template (Inline)
```
[Beat #] [Type] – [Working Title]
Sensory: ...
Reasoning: ...
Reflection (if ethics/KB): ...
```
Use for first-pass speed before stylistic polish.

## 17. Deprecation Policy Summary
Only `NOVEL-MASTER.md` & this guide should evolve. Legacy multi-file beats kept for archival comparison until v2.0 or repository pruning phase.

-- END CREATOR OPERATIONAL GUIDE --
