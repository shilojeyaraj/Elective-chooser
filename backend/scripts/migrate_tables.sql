-- Migration script to update Supabase tables
-- Run this in the Supabase SQL Editor

-- Example: Add new columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prerequisites_met BOOLEAN DEFAULT false;

-- Example: Modify existing column
ALTER TABLE courses 
ALTER COLUMN workload TYPE JSONB USING workload::JSONB;

-- Example: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);

-- Example: Update data
UPDATE courses 
SET difficulty_level = 2 
WHERE level IN ('2A', '2B', '3A', '3B');

-- Example: Add constraint
ALTER TABLE courses 
ADD CONSTRAINT check_difficulty 
CHECK (difficulty_level BETWEEN 1 AND 5);
