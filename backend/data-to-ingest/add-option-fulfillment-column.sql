-- Add option fulfillment column to courses table
-- This column will store which options/specializations each course fulfills

-- Add the column to track which options this course fulfills
ALTER TABLE courses ADD COLUMN IF NOT EXISTS fulfills_options JSONB DEFAULT '[]';

-- Add the column to track which specializations this course fulfills  
ALTER TABLE courses ADD COLUMN IF NOT EXISTS fulfills_specializations JSONB DEFAULT '[]';

-- Add the column to track which certificates this course fulfills
ALTER TABLE courses ADD COLUMN IF NOT EXISTS fulfills_certificates JSONB DEFAULT '[]';

-- Add the column to track which diplomas this course fulfills
ALTER TABLE courses ADD COLUMN IF NOT EXISTS fulfills_diplomas JSONB DEFAULT '[]';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_fulfills_options ON courses USING GIN (fulfills_options);
CREATE INDEX IF NOT EXISTS idx_courses_fulfills_specializations ON courses USING GIN (fulfills_specializations);
CREATE INDEX IF NOT EXISTS idx_courses_fulfills_certificates ON courses USING GIN (fulfills_certificates);
CREATE INDEX IF NOT EXISTS idx_courses_fulfills_diplomas ON courses USING GIN (fulfills_diplomas);

-- Add some sample data for AI option courses
-- This is just an example - you'll need to populate this with real data
UPDATE courses 
SET fulfills_options = '["ai-option", "machine-learning-option"]'::jsonb
WHERE id IN ('CS 486', 'ECE 456', 'MTE 453', 'CS 480', 'ECE 457');

-- Add some sample data for other common options
UPDATE courses 
SET fulfills_options = '["robotics-option"]'::jsonb
WHERE id IN ('MTE 453', 'MTE 454', 'ECE 456');

UPDATE courses 
SET fulfills_options = '["software-option"]'::jsonb
WHERE id IN ('CS 486', 'CS 480', 'CS 488', 'ECE 457');

-- Add some sample specializations
UPDATE courses 
SET fulfills_specializations = '["artificial-intelligence", "machine-learning"]'::jsonb
WHERE id IN ('CS 486', 'ECE 456', 'CS 480');

UPDATE courses 
SET fulfills_specializations = '["robotics", "control-systems"]'::jsonb
WHERE id IN ('MTE 453', 'MTE 454', 'ECE 456');

COMMENT ON COLUMN courses.fulfills_options IS 'Array of option IDs that this course fulfills (e.g., ["ai-option", "robotics-option"])';
COMMENT ON COLUMN courses.fulfills_specializations IS 'Array of specialization IDs that this course fulfills';
COMMENT ON COLUMN courses.fulfills_certificates IS 'Array of certificate IDs that this course fulfills';
COMMENT ON COLUMN courses.fulfills_diplomas IS 'Array of diploma IDs that this course fulfills';
