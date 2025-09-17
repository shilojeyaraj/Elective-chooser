-- Add CSE classification column to courses table
-- Run this in your Supabase SQL Editor

ALTER TABLE courses
ADD COLUMN cse_classification TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN courses.cse_classification IS 'CSE elective classification: A, B, C, D, or EXCLUSION';
