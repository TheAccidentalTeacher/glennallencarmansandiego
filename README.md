# Where in the World is Sourdough Pete?

## Project Overview

"Where in the World is Sourdough Pete?" is an educational geography deduction game inspired by Carmen Sandiego, designed specifically for middle-grade classrooms. The game teaches world geography, cultural literacy, environmental systems, and research skills through engaging, teacher-facilitated gameplay optimized for smart TVs and projectors.

### Key Features

- **Educational Focus**: Teaches geography, cultural awareness, and critical thinking
- **Classroom-Optimized**: Designed for smart TV/projector display with teacher controls
- **Culturally Sensitive**: Respectful representation with expert content review
- **Collaborative Learning**: Team-based gameplay with assigned roles
- **Flexible Timing**: Full period (50 min) and quick case (25 min) modes
- **Content Management**: Teacher-friendly content creation and review tools

## � Current Development Status

### ✅ Phase 1 Completed: Project Architecture Setup
- React + TypeScript + Vite project structure
- Tailwind CSS with vintage Carmen Sandiego theme
- Core page components (Dashboard, LiveCase, Editor)
- Navigation and routing with React Router
- Zustand state management setup

### 🔄 Phase 2 In Progress: Data Models & Database Design
- PostgreSQL database schema implemented
- User authentication system with JWT
- Game session management services
- Content management services for cases, villains, and locations
- Sample data for testing and demonstration

### 📋 Coming Next: Phase 3 - Core Game Logic Services
- Progressive clue reveal engine
- Team scoring system
- Warrant submission handling
- Real-time game session management

## 🏗️ Quick Start for Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Setup Instructions

1. **Clone and Setup**
```bash
cd sourdough-pete
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

3. **Database Setup**
```bash
# Create database and run migrations
psql -c "CREATE DATABASE sourdough_pete;"
psql -d sourdough_pete -f database/schema.sql
psql -d sourdough_pete -f database/sample_data.sql
```

4. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## �📚 Documentation

This project includes comprehensive documentation organized for easy reference:

### Core Documentation
| Document | Purpose | Audience |
|----------|---------|----------|
| **[Master Specification](./revised_master_prompt.md)** | Complete product requirements and specifications | Developers, Product Managers |
| **[Implementation Plan](./docs/implementation-plan.md)** | Phase-by-phase development roadmap | Developers, Project Managers |
| **[Technical Architecture](./docs/technical-architecture.md)** | System design, data models, and technical specifications | Developers, DevOps Engineers |
| **[Educational Design](./docs/educational-design.md)** | Pedagogical framework and classroom integration | Educators, Curriculum Designers |
| **[Content Creation Guide](./docs/content-creation-guide.md)** | Guidelines for creating culturally sensitive content | Content Creators, Teachers |

### Quick Reference

#### For Developers
- **Getting Started**: See [Implementation Plan - Phase 1](./docs/implementation-plan.md#phase-1-project-architecture-setup)
- **Data Models**: See [Technical Architecture - Data Architecture](./docs/technical-architecture.md#data-architecture)
- **API Design**: See [Technical Architecture - API Layer](./docs/technical-architecture.md#api-layer-implementation)

#### For Educators
- **Pedagogical Framework**: See [Educational Design - Learning Objectives](./docs/educational-design.md#learning-objectives)
- **Classroom Integration**: See [Educational Design - Classroom Integration](./docs/educational-design.md#classroom-integration-strategies)
- **Cultural Sensitivity**: See [Educational Design - Cultural Sensitivity](./docs/educational-design.md#cultural-sensitivity-framework)

#### For Content Creators
- **Character Creation**: See [Content Creation Guide - Villain Creation](./docs/content-creation-guide.md#villain-creation-guide)
- **Case Development**: See [Content Creation Guide - Case Creation](./docs/content-creation-guide.md#case-creation-guide)
- **Review Process**: See [Content Creation Guide - Content Review](./docs/content-creation-guide.md#content-review-process)

## 🛠️ Technical Stack

### Frontend
- **React 18+** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom vintage theme
- **React Router 6+** for navigation
- **Zustand** for state management
- **Leaflet** for interactive maps

### Backend & Database
- **PostgreSQL** for data persistence
- **Node.js** with TypeScript
- **JWT** authentication
- **bcryptjs** for password hashing

### Deployment
- **Railway** platform for hosting
- **Environment-based configuration**
- **PostgreSQL on Railway**

## 🎮 Game Architecture

The game follows a structured approach:

1. **Session Creation**: Teachers create game sessions using selected cases
2. **Team Management**: Students join teams with unique names and colors  
3. **Progressive Gameplay**: Clues are revealed in sequence with decreasing point values
4. **Cultural Learning**: Each clue teaches geographical and cultural concepts
5. **Warrant Submission**: Teams submit final guesses with evidence
6. **Scoring & Rankings**: Comprehensive scoring system with educational feedback

## 🏫 Educational Integration

### Learning Objectives
- **Geography**: Countries, capitals, climate zones, physical features
- **Cultural Literacy**: Traditions, languages, historical significance  
- **Critical Thinking**: Evidence analysis, logical deduction
- **Research Skills**: Information gathering and synthesis
- **Collaboration**: Team communication and decision-making

### Classroom Setup
- **Display**: Smart TV or projector for shared viewing
- **Teacher Control**: Dedicated teacher dashboard for game flow
- **Team Formation**: 3-5 teams of 4-6 students each
- **Role Assignment**: Detective, Researcher, Cultural Expert, etc.

## 🌍 Cultural Sensitivity

Our commitment to respectful representation:
- Expert cultural consultants review all content
- Positive portrayal of all cultures and regions
- Educational focus on diversity and global citizenship
- Regular content audits for sensitivity and accuracy

## 📋 Development Roadmap

### Phase 1: ✅ Foundation (Completed)
- Project setup and basic architecture
- React components and navigation
- Database schema design

### Phase 2: 🔄 Core Systems (In Progress)  
- Database implementation
- Authentication system
- Game session management
- Content management services

### Phase 3: 📋 Game Logic (Next)
- Clue reveal engine
- Scoring algorithms  
- Real-time session updates
- Warrant validation

### Phase 4: 📋 Content & UI
- Sample cases and villains
- Teacher dashboard functionality
- Game display optimization
- Content creation tools

### Phase 5: 📋 Advanced Features
- Real-time multiplayer features
- Advanced analytics
- Content recommendation engine
- Accessibility improvements

### Phase 6: 📋 Deployment & Testing
- Railway platform deployment
- Performance optimization
- User acceptance testing
- Security audit

## 🤝 Contributing

We welcome contributions! Please see our documentation for detailed guidelines on:
- Code style and conventions
- Content creation standards
- Cultural sensitivity requirements
- Testing procedures

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🚀 Getting Started

### For Developers

1. **Read the Master Specification**: Start with `revised_master_prompt.md` for complete project understanding
2. **Review Implementation Plan**: Follow the phase-by-phase plan in `docs/implementation-plan.md`
3. **Study Technical Architecture**: Understand system design in `docs/technical-architecture.md`
4. **Set Up Development Environment**: Follow Phase 1 of the implementation plan

### For Educators

1. **Understand Educational Goals**: Review `docs/educational-design.md`
2. **Learn Cultural Guidelines**: Study the cultural sensitivity framework
3. **Explore Classroom Integration**: See implementation strategies and assessment methods
4. **Review Sample Content**: Examine example cases and characters

### For Content Creators

1. **Read Cultural Guidelines**: Study `docs/content-creation-guide.md` thoroughly
2. **Understand Review Process**: Learn the content approval workflow
3. **Study Examples**: Review sample villains and cases
4. **Follow Templates**: Use provided templates for consistent quality

## 🎯 Project Goals

### Educational Objectives
- **Geographic Knowledge**: World geography, physical and political features
- **Cultural Literacy**: Respectful understanding of global diversity
- **Critical Thinking**: Evidence-based reasoning and inference skills
- **Collaboration**: Effective teamwork and communication

### Technical Objectives
- **Classroom-Ready**: Optimized for educational environments
- **Scalable Architecture**: Support multiple concurrent classrooms
- **Real-Time Interaction**: Live scoring and teacher controls
- **Accessibility**: WCAG 2.1 AA compliance with inclusive design

### Cultural Objectives
- **Respectful Representation**: Dignified portrayal of all cultures
- **Educational Accuracy**: Factually correct cultural and geographic information
- **Inclusive Content**: Diverse, representative character library
- **Expert Review**: Cultural anthropologist validation of all content

## 🛠️ Development Status

This project is currently in the planning and documentation phase. The complete implementation plan provides a roadmap for building the application across 12 development phases.

### Current Phase: Documentation & Planning ✅
- [x] Master specification completed
- [x] Implementation plan created
- [x] Technical architecture designed
- [x] Educational framework documented
- [x] Content creation guidelines established

### Next Phase: Project Architecture Setup
- [ ] Choose hosting platform (Railway vs Netlify+Supabase)
- [ ] Set up development environment
- [ ] Configure build tools and CI/CD
- [ ] Create project structure

## 📞 Support & Resources

### For Questions About...

- **Technical Implementation**: See `docs/technical-architecture.md`
- **Educational Use**: See `docs/educational-design.md`
- **Content Creation**: See `docs/content-creation-guide.md`
- **Project Planning**: See `docs/implementation-plan.md`
- **Complete Specifications**: See `revised_master_prompt.md`

### Contributing

This project prioritizes educational value and cultural sensitivity. All contributions must align with:
- Educational best practices for middle-grade students
- Cultural sensitivity and respectful representation guidelines
- Technical excellence and accessibility standards
- Collaborative, inclusive development practices

## 📄 License

[License information to be added during development phase]

---

**"Where in the World is Sourdough Pete?"** - Teaching geography through adventure, one clue at a time.
