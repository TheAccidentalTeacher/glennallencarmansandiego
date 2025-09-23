-- Sample data for "Where in the World is Sourdough Pete?"
-- This provides initial content for testing and demonstration

-- Sample Users
INSERT INTO users (id, email, password_hash, display_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'teacher@school.edu', '$2b$10$YeZJukqyBxblkYbvEb/JTerSxUtaGd58bIK8lfiulcMKIWR59w9vm', 'Ms. Johnson', 'teacher'),
  ('550e8400-e29b-41d4-a716-446655440002', 'admin@game.com', '$2b$10$BoTBSYJ/nj5/rxwayanuA.r.LjW88srC8zTQXmOWZj6Jv7sPVIbt2', 'Admin User', 'admin');

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