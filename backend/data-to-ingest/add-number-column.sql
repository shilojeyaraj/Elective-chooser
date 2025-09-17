-- Migration script to add the missing 'number' column to existing courses table
-- Run this if you already have a courses table without the number column

-- Add the number column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS number INTEGER;

-- Update existing records to extract number from id
UPDATE courses 
SET number = CAST(REGEXP_REPLACE(id, '[^0-9]', '', 'g') AS INTEGER)
WHERE number IS NULL AND id ~ '[0-9]';

-- Create index on number column for better performance
CREATE INDEX IF NOT EXISTS idx_courses_number ON courses(number);
