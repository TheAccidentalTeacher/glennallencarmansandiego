# Cases (Filesystem)

Place approved case JSON files in this folder. The backend will serve them via:

- List: GET /api/cases → { success, count, cases[] }
- Get one: GET /api/cases/:id → { success, case, validation }

Minimal required fields (see Implementation Plan for full spec):
- id (slug)
- title
- rounds[] with each round containing:
  - minutes
  - focus[]
  - clueHtml
  - answer { name, lat, lng }

Authoring tips:
- Keep clues respectful, professional, and educational (see Content Creation Guide)
- Validate coordinates (lat ∈ [-90, 90], lng ∈ [-180, 180])
- Use narrative and explanation HTML for projector readability

References:
- Case Design Spec: ../../docs/implementation-plan.md#case-design-specification-teacher-led-mode
- Cultural Review Checklist: ../../docs/cultural-review-checklist.md
