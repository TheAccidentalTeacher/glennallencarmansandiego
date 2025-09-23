-- Database schema for "Where in the World is Sourdough Pete?"
-- Based on the TypeScript interfaces defined in /src/types/index.ts

-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Villains
CREATE TABLE villains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  backstory TEXT,
  image_url VARCHAR(500),
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  population INTEGER,
  area_km2 DECIMAL(10, 2),
  climate VARCHAR(50),
  notable_features TEXT[],
  cultural_info TEXT,
  economic_info TEXT,
  historical_info TEXT,
  image_url VARCHAR(500),
  flag_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  villain_id UUID NOT NULL REFERENCES villains(id),
  target_location_id UUID NOT NULL REFERENCES locations(id),
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration_minutes INTEGER DEFAULT 45,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clues
CREATE TABLE clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('geography', 'culture', 'historical', 'economic', 'visual')),
  content TEXT NOT NULL,
  reveal_order INTEGER NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  points_value INTEGER NOT NULL DEFAULT 100,
  media_url VARCHAR(500),
  media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'audio')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(case_id, reveal_order)
);

-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(10) UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES cases(id),
  host_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'completed')),
  current_round INTEGER DEFAULT 1 CHECK (current_round BETWEEN 1 AND 4),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Teams (many-to-many relationship)
CREATE TABLE session_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  join_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, team_id),
  UNIQUE(session_id, join_order)
);

-- Score Events
CREATE TABLE score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('clue_revealed', 'correct_guess', 'incorrect_guess', 'warrant_submitted', 'time_bonus')),
  points INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warrant Submissions
CREATE TABLE warrant_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  guessed_location_id UUID NOT NULL REFERENCES locations(id),
  is_correct BOOLEAN NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revealed Clues (tracks which clues have been revealed in each session)
CREATE TABLE revealed_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  clue_id UUID NOT NULL REFERENCES clues(id),
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  revealed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, clue_id)
);

-- Indexes for performance
CREATE INDEX idx_game_sessions_code ON game_sessions(session_code);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_host ON game_sessions(host_id);
CREATE INDEX idx_score_events_session ON score_events(session_id);
CREATE INDEX idx_score_events_team ON score_events(team_id);
CREATE INDEX idx_warrant_submissions_session ON warrant_submissions(session_id);
CREATE INDEX idx_clues_case ON clues(case_id);
CREATE INDEX idx_clues_order ON clues(case_id, reveal_order);
CREATE INDEX idx_revealed_clues_session ON revealed_clues(session_id);
CREATE INDEX idx_session_teams_session ON session_teams(session_id);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villains_updated_at BEFORE UPDATE ON villains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();