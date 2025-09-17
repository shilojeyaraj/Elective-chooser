-- Add faculty column to courses table
-- Run this in your Supabase SQL Editor

ALTER TABLE courses
ADD COLUMN faculty TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN courses.faculty IS 'Faculty or school that offers the course (e.g., "Engineering")';
