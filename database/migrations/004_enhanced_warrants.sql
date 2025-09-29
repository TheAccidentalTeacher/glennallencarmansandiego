-- Enhanced Warrant Submissions Migration
-- Adds distance-based scoring and enhanced feedback fields

-- Add new columns to warrant_submissions table
ALTER TABLE warrant_submissions 
ADD COLUMN IF NOT EXISTS correct_location_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index on distance for analytics queries
CREATE INDEX IF NOT EXISTS idx_warrant_submissions_distance 
ON warrant_submissions(distance_km);

-- Create index on session_id and distance for session analytics
CREATE INDEX IF NOT EXISTS idx_warrant_submissions_session_distance 
ON warrant_submissions(session_id, distance_km);

-- Create index for warrant history queries
CREATE INDEX IF NOT EXISTS idx_warrant_submissions_team_round 
ON warrant_submissions(session_id, team_id, round_number);

-- Update existing records to have correct_location_id (if possible)
-- This would need to be run after the schema update with actual case data

COMMENT ON COLUMN warrant_submissions.distance_km IS 'Distance in kilometers between guessed and correct location';
COMMENT ON COLUMN warrant_submissions.reasoning IS 'Student explanation for their location choice';
COMMENT ON COLUMN warrant_submissions.correct_location_id IS 'The correct location ID for this case/round';

-- Create a view for enhanced warrant analytics
CREATE OR REPLACE VIEW warrant_analytics AS
SELECT 
  ws.session_id,
  ws.team_id,
  ws.round_number,
  ws.is_correct,
  ws.distance_km,
  ws.points_awarded,
  ws.reasoning,
  gl.name as guessed_location,
  gl.country as guessed_country,
  cl.name as correct_location,
  cl.country as correct_country,
  CASE 
    WHEN ws.distance_km = 0 THEN 'perfect'
    WHEN ws.distance_km <= 100 THEN 'excellent'
    WHEN ws.distance_km <= 500 THEN 'good'
    WHEN ws.distance_km <= 1500 THEN 'fair'
    ELSE 'poor'
  END as performance_category,
  ws.submitted_at
FROM warrant_submissions ws
LEFT JOIN locations gl ON ws.guessed_location_id = gl.id
LEFT JOIN locations cl ON ws.correct_location_id = cl.id;

-- Create a function to calculate session-wide distance statistics
CREATE OR REPLACE FUNCTION get_session_distance_stats(session_uuid VARCHAR)
RETURNS TABLE(
  total_warrants INTEGER,
  average_distance DECIMAL(10,2),
  median_distance DECIMAL(10,2),
  perfect_warrants INTEGER,
  excellent_warrants INTEGER,
  improvement_trend VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  WITH session_stats AS (
    SELECT 
      COUNT(*)::INTEGER as total,
      AVG(distance_km) as avg_dist,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY distance_km) as med_dist,
      SUM(CASE WHEN distance_km = 0 THEN 1 ELSE 0 END)::INTEGER as perfect,
      SUM(CASE WHEN distance_km <= 100 THEN 1 ELSE 0 END)::INTEGER as excellent,
      -- Simple trend calculation based on first vs last half of submissions
      CASE 
        WHEN COUNT(*) < 4 THEN 'stable'
        ELSE
          CASE 
            WHEN AVG(CASE WHEN row_number() OVER (ORDER BY submitted_at) > COUNT(*) OVER ()/2 THEN distance_km END) < 
                 AVG(CASE WHEN row_number() OVER (ORDER BY submitted_at) <= COUNT(*) OVER ()/2 THEN distance_km END)
            THEN 'improving'
            WHEN AVG(CASE WHEN row_number() OVER (ORDER BY submitted_at) > COUNT(*) OVER ()/2 THEN distance_km END) > 
                 AVG(CASE WHEN row_number() OVER (ORDER BY submitted_at) <= COUNT(*) OVER ()/2 THEN distance_km END)
            THEN 'declining'
            ELSE 'stable'
          END
      END as trend
    FROM warrant_submissions 
    WHERE session_id = session_uuid AND distance_km IS NOT NULL
  )
  SELECT 
    total, 
    ROUND(avg_dist, 2), 
    ROUND(med_dist, 2), 
    perfect, 
    excellent,
    trend
  FROM session_stats;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for the analytics view
CREATE INDEX IF NOT EXISTS idx_warrant_submissions_performance 
ON warrant_submissions(session_id, distance_km) 
WHERE distance_km IS NOT NULL;