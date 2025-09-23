-- Add test user with simple credentials
-- Username: abcd
-- Password: abcd
-- This user is for testing purposes only

-- First, remove any existing user with email 'abcd' if it exists
DELETE FROM users WHERE email = 'abcd';

-- Add the test user
INSERT INTO users (id, email, password_hash, display_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440099', 'abcd', '$2b$12$8/0T3LEkVGZbKd/zgWOd/OhdusMwteMEUxWzYdiDl9QUrXAS4RVGS', 'Test Teacher', 'teacher');

-- Verify the user was created
SELECT id, email, display_name, role, created_at FROM users WHERE email = 'abcd';