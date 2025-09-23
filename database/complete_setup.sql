-- Complete Database Setup for Carmen Sandiego (Railway Production)
-- Run this entire script in your Railway PostgreSQL database

-- =============================================================================
-- DATABASE SCHEMA
-- =============================================================================

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

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Sample Users (including your test user)
INSERT INTO users (id, email, password_hash, display_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'teacher@school.edu', '$2b$10$YeZJukqyBxblkYbvEb/JTerSxUtaGd58bIK8lfiulcMKIWR59w9vm', 'Ms. Johnson', 'teacher'),
  ('550e8400-e29b-41d4-a716-446655440002', 'admin@game.com', '$2b$10$BoTBSYJ/nj5/rxwayanuA.r.LjW88srC8zTQXmOWZj6Jv7sPVIbt2', 'Admin User', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440099', 'abcd', '$2b$12$8/0T3LEkVGZbKd/zgWOd/OhdusMwteMEUxWzYdiDl9QUrXAS4RVGS', 'Test Teacher', 'teacher');

-- Sample Villains
INSERT INTO villains (id, name, description, backstory, difficulty_level, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 
   'Sourdough Pete', 
   'A notorious bread bandit with a taste for ancient grains and cultural treasures.',
   'Once a respected baker in San Francisco, Pete turned to a life of culinary crime after his sourdough starter was stolen by a rival. Now he travels the world, stealing cultural artifacts and rare ingredients to perfect his ultimate revenge recipe.',
   3,
   '550e8400-e29b-41d4-a716-446655440001'),
  
  ('550e8400-e29b-41d4-a716-446655440012',
   'The Wheat Wrangler',
   'A mysterious figure who hoards ancient grains from around the world.',
   'A former agricultural scientist turned rogue, the Wheat Wrangler believes modern farming has corrupted the purity of ancient grains. They steal heritage seeds and artifacts to preserve what they see as humanity''s true agricultural heritage.',
   2,
   '550e8400-e29b-41d4-a716-446655440001');

-- Sample Locations
INSERT INTO locations (id, name, country, region, latitude, longitude, population, area_km2, climate, notable_features, cultural_info, economic_info, historical_info) VALUES
  ('550e8400-e29b-41d4-a716-446655440021',
   'Istanbul',
   'Turkey',
   'Marmara',
   41.0082,
   28.9784,
   15462452,
   5343.0,
   'Mediterranean',
   ARRAY['Bosphorus Strait', 'Historic Peninsula', 'Grand Bazaar', 'Hagia Sophia'],
   'A crossroads of European and Asian cultures, known for Turkish coffee, kebabs, and traditional bread making.',
   'Major economic center with tourism, textiles, and food processing industries.',
   'Former capital of the Byzantine and Ottoman empires, with over 2,500 years of history.'),
   
  ('550e8400-e29b-41d4-a716-446655440022',
   'Lima',
   'Peru',
   'Lima Region',
   -12.0464,
   -77.0428,
   10092000,
   2672.3,
   'Desert',
   ARRAY['Historic Center', 'Miraflores District', 'Callao Port', 'Pachacamac Ruins'],
   'Capital city known for its colonial architecture, vibrant food scene, and indigenous Quechua influence.',
   'Economic hub of Peru with mining, fishing, and agricultural exports.',
   'Founded by Spanish conquistador Francisco Pizarro in 1535, built on ancient indigenous settlements.'),
   
  ('550e8400-e29b-41d4-a716-446655440023',
   'Marrakech',
   'Morocco',
   'Marrakech-Safi',
   31.6295,
   -7.9811,
   928850,
   230.0,
   'Semi-arid',
   ARRAY['Medina', 'Atlas Mountains', 'Sahara Desert Gateway', 'Souks'],
   'Known as the "Red City" for its red sandstone buildings, famous for traditional crafts and spices.',
   'Tourism and agriculture center, known for argan oil production and traditional crafts.',
   'Founded in 1070, served as the capital of the Almoravid and Almohad dynasties.');

-- Sample Cases
INSERT INTO cases (id, title, description, villain_id, target_location_id, difficulty_level, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440031',
   'The Great Sourdough Heist',
   'Sourdough Pete has stolen an ancient bread recipe from a famous culinary museum. Follow the clues across continents to track him down!',
   '550e8400-e29b-41d4-a716-446655440011',
   '550e8400-e29b-41d4-a716-446655440021',
   3,
   '550e8400-e29b-41d4-a716-446655440001'),
   
  ('550e8400-e29b-41d4-a716-446655440032',
   'The Spice Route Mystery',
   'The Wheat Wrangler has made off with rare saffron and ancient grain samples. Can you follow the spice trail?',
   '550e8400-e29b-41d4-a716-446655440012',
   '550e8400-e29b-41d4-a716-446655440023',
   2,
   '550e8400-e29b-41d4-a716-446655440001');

-- Sample Clues for Case 1 (Istanbul)
INSERT INTO clues (id, case_id, type, content, reveal_order, difficulty_level, points_value) VALUES
  ('550e8400-e29b-41d4-a716-446655440041',
   '550e8400-e29b-41d4-a716-446655440031',
   'geography',
   'Pete was seen near a famous waterway that connects two continents. Witnesses report he was asking about the depth of this strategic strait.',
   1, 3, 400),
   
  ('550e8400-e29b-41d4-a716-446655440042',
   '550e8400-e29b-41d4-a716-446655440031',
   'culture',
   'Local bakers report Pete inquiring about a traditional bread with a hole in the middle, often eaten for breakfast with tea.',
   2, 2, 300),
   
  ('550e8400-e29b-41d4-a716-446655440043',
   '550e8400-e29b-41d4-a716-446655440031',
   'historical',
   'Pete was spotted near a building that was once a church, then a mosque, and is now a museum. He seemed particularly interested in its massive dome.',
   3, 3, 200),
   
  ('550e8400-e29b-41d4-a716-446655440044',
   '550e8400-e29b-41d4-a716-446655440031',
   'economic',
   'Merchants in a centuries-old covered market reported Pete asking about spice trade routes. This market has over 4,000 shops.',
   4, 2, 100);

-- Sample Clues for Case 2 (Marrakech)
INSERT INTO clues (id, case_id, type, content, reveal_order, difficulty_level, points_value) VALUES
  ('550e8400-e29b-41d4-a716-446655440051',
   '550e8400-e29b-41d4-a716-446655440032',
   'geography',
   'The Wheat Wrangler was seen in a city known as the "Red City" due to its distinctive building color. It sits at the foothills of a major mountain range.',
   1, 2, 400),
   
  ('550e8400-e29b-41d4-a716-446655440052',
   '550e8400-e29b-41d4-a716-446655440032',
   'culture',
   'Local spice dealers report the thief was very interested in saffron and asked about traditional North African bread called "khubz."',
   2, 2, 300),
   
  ('550e8400-e29b-41d4-a716-446655440053',
   '550e8400-e29b-41d4-a716-446655440032',
   'economic',
   'The suspect was seen near traditional markets where local artisans sell carpets, pottery, and leather goods made using centuries-old techniques.',
   3, 2, 200),
   
  ('550e8400-e29b-41d4-a716-446655440054',
   '550e8400-e29b-41d4-a716-446655440032',
   'historical',
   'Witnesses place the thief near the old walled city center, built by the Almoravid dynasty in the 11th century.',
   4, 3, 100);

-- Sample Teams
INSERT INTO teams (id, name, color, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440061', 'Detective Squad Alpha', 'blue', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440062', 'Geography Gurus', 'red', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440063', 'World Wanderers', 'green', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440064', 'Culture Hunters', 'yellow', '550e8400-e29b-41d4-a716-446655440001');

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify everything was created successfully
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as villain_count FROM villains;
SELECT COUNT(*) as location_count FROM locations;
SELECT COUNT(*) as case_count FROM cases;
SELECT COUNT(*) as clue_count FROM clues;
SELECT COUNT(*) as team_count FROM teams;

-- Show your test user
SELECT email, display_name, role FROM users WHERE email = 'abcd';