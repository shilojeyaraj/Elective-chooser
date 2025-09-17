-- Fix options table to use TEXT instead of UUID for id column
-- Run this in your Supabase SQL Editor

-- Drop all foreign key constraints that reference options(id)
ALTER TABLE course_option_map DROP CONSTRAINT IF EXISTS course_option_map_option_id_fkey;
ALTER TABLE elective_docs DROP CONSTRAINT IF EXISTS elective_docs_option_id_fkey;

-- Change the id column type from UUID to TEXT
ALTER TABLE options ALTER COLUMN id TYPE TEXT;

-- Change the option_id columns in referencing tables to TEXT
ALTER TABLE course_option_map ALTER COLUMN option_id TYPE TEXT;
ALTER TABLE elective_docs ALTER COLUMN option_id TYPE TEXT;

-- Re-add the foreign key constraints
ALTER TABLE course_option_map 
ADD CONSTRAINT course_option_map_option_id_fkey 
FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE;

ALTER TABLE elective_docs 
ADD CONSTRAINT elective_docs_option_id_fkey 
FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE SET NULL;
