# Educational Game Flow: Where in the World is Carmen Sandiego?

## Overview
This document defines the educational game flow that transforms graduate-level geography cases into 11-year-old friendly progressive discovery experiences.

## Target Audience
- **Primary**: 11-year-old students (6th grade)
- **Language Level**: Age-appropriate vocabulary with educational scaffolding
- **Learning Style**: Progressive discovery with research prompts

## Game Flow Structure

### Phase 1: Case Selection & Setup
1. **Teacher selects educational case** from available options
2. **System creates session** with 5-round progressive structure
3. **Case briefing displays** with:
   - Learning objectives (age-appropriate)
   - Mission overview (detective theme)
   - Required materials (globe, maps, research tools)

### Phase 2: Progressive Discovery Learning (Per Round)

Each round follows this 6-step educational progression:

#### Step 1: Reveal Detective Clue
- **Action**: Teacher clicks "Reveal Next Clue"
- **Content**: Age-appropriate detective mystery clue
- **Format**: HTML with 11-year-old friendly language
- **Example**: *"Dr. Altiplano was spotted stealing equipment from a place with really tall, snowy mountains! She's hiding in the world's LONGEST mountain range - it goes for thousands of miles!"*

#### Step 2: Reveal Research Hint #1
- **Action**: Teacher clicks "💡 Reveal Hint #1"
- **Content**: First research direction from `researchPrompts` array
- **Purpose**: Guide students to initial investigation tools
- **Example**: *"Look on your globe for the longest mountain range in the world"*

#### Step 3: Reveal Research Hint #2
- **Action**: Teacher clicks "💡 Reveal Hint #2"
- **Content**: Second research direction
- **Purpose**: Provide alternative research approach
- **Example**: *"Find the brown areas on your physical map that show tall mountains"*

#### Step 4: Reveal Research Hint #3
- **Action**: Teacher clicks "💡 Reveal Hint #3"
- **Content**: Final hint before answer
- **Purpose**: Guide toward specific research terms
- **Example**: *"Research which mountain range is the longest on Earth"*

#### Step 5: Reveal Educational Answer
- **Action**: Teacher clicks "🎯 Reveal Answer #X"
- **Content**: Location name + comprehensive educational explanation
- **Format**: Green-styled answer box with detailed learning content
- **Example**: 
  - **Answer**: "Andes Mountains"
  - **Explanation**: Detailed content about mountain formation, climate effects, cultural significance

#### Step 6: Advance to Next Round
- **Action**: Automatic advance after answer reveal
- **Result**: System progresses to next geographic concept
- **Continuity**: Builds on previous learning

### Phase 3: Case Completion
- **Final Round**: Culminating challenge that synthesizes all learning
- **Case Resolution**: Educational explanation of villain's motivations
- **Learning Summary**: Review of geographic concepts covered

## Content Transformation Standards

### Language Transformation
- **Graduate Level** → **11-Year-Old Friendly**
- **Technical Terms** → **Relatable Analogies**
- **Complex Concepts** → **Step-by-Step Explanations**

#### Example Transformations:
| Graduate Level | 11-Year-Old Friendly |
|---|---|
| "Altitudinal zonation affects atmospheric pressure" | "It's hard to breathe at the top because the air is thin" |
| "Andean orogeny created the longest continental mountain chain" | "These mountains look like a long, bumpy spine running down the side of a continent" |
| "Tropical glaciation near the equatorial region" | "Ice that never melts, even though it's near the equator!" |

### Educational Scaffolding
1. **Visual Learning**: Each clue includes appropriate villain imagery
2. **Research Skills**: Progressive hints teach different investigation methods
3. **Geographic Tools**: Encourages use of globes, maps, atlases
4. **Critical Thinking**: Builds from general to specific concepts

### Case Structure Requirements

#### Required JSON Structure:
```json
{
  "id": "case-identifier",
  "title": "Child-Friendly Title (e.g., 'Dr. Altiplano's Mountain Mystery')",
  "difficulty": "beginner",
  "durationMinutes": 30,
  "villainId": "villain-folder-name",
  "briefing": {
    "headline": "Age-appropriate mission title",
    "narrativeHtml": "Educational objectives + detective mission",
    "assets": {
      "image": "/images/villains/villain-folder/image.png"
    }
  },
  "rounds": [
    {
      "id": "r1",
      "focus": ["geographic-concept", "specific-topic"],
      "clueHtml": "11-year-old friendly detective clue",
      "researchPrompts": [
        "Research direction #1",
        "Research direction #2", 
        "Research direction #3"
      ],
      "answer": {
        "name": "Geographic Location",
        "lat": -13.1631,
        "lng": -72.545
      },
      "explainHtml": "Comprehensive educational explanation"
    }
  ]
}
```

## Technical Implementation

### Frontend Requirements
- **Progressive Reveal System**: State management for hints and answers
- **Visual Hierarchy**: Clear distinction between clues, hints, and answers
- **Button Contrast**: All buttons must have accessible contrast ratios
- **Responsive Design**: Works on classroom projectors and various screens

### Backend Requirements
- **Session Management**: Track revealed clues and hints per session
- **Image Serving**: Proper villain image path mapping
- **Content API**: Serve educational content from JSON files

### Styling Standards
- **Clue Content**: White text on dark transparent backgrounds
- **Research Hints**: Blue-themed hint boxes with clear typography
- **Educational Answers**: Green-themed answer boxes with comprehensive content
- **Button Accessibility**: Proper contrast ratios for all interactive elements

## Quality Assurance

### Educational Content Review
- [ ] Age-appropriate vocabulary (11-year-old reading level)
- [ ] Clear learning objectives
- [ ] Progressive difficulty within each case
- [ ] Cultural sensitivity and inclusivity
- [ ] Geographic accuracy

### Technical Testing
- [ ] All 5 rounds reveal properly
- [ ] Images display correctly
- [ ] Button contrast meets accessibility standards
- [ ] Progressive hints work in sequence
- [ ] Educational answers display comprehensive content

### Classroom Readiness
- [ ] Teacher can control pacing
- [ ] Content projects clearly on classroom displays
- [ ] No technical barriers to educational flow
- [ ] Research prompts align with available classroom resources

## Success Metrics

### Educational Effectiveness
- Students can identify geographic features after each round
- Students demonstrate improved map and globe usage skills
- Students retain geographic concepts between rounds
- Students show engagement with detective narrative

### Technical Performance
- Zero technical interruptions during 30-minute sessions
- All content loads within 2 seconds
- Button interactions work consistently
- Image display is reliable across sessions

## Future Enhancements

### Interactive Features (Future Phases)
- **Map Guessing**: Students click locations on interactive world map
- **Scoring System**: Points for accuracy and research skills
- **Team Competition**: Class vs. class challenges
- **Extended Learning**: Additional research projects per case

### Content Expansion
- **Cultural Cases**: Focus on human geography and cultural diversity
- **Environmental Cases**: Climate change and conservation themes
- **Historical Geography**: Past civilizations and historical events
- **Urban Geography**: City planning and human settlement patterns

---

*This document ensures consistent educational quality and technical implementation across all Carmen Sandiego geography cases.*