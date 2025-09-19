-- ==============================================
-- SETUP SCHEMA FOR MINORS, CONCURRENT DEGREES, AND ACCELERATED MASTERS
-- ==============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. MINORS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS minors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  faculty TEXT, -- e.g., "Faculty of Arts", "Conrad School"
  description TEXT,
  requirements TEXT, -- e.g., "Normally requires a minimum of 10 courses (approx. 5.0 units)"
  diploma_note TEXT, -- e.g., "Minors are noted on your diploma"
  advice TEXT, -- General advice for students
  is_engineering_offered BOOLEAN DEFAULT false, -- Engineering doesn't offer minors
  available_to_engineering BOOLEAN DEFAULT true, -- Available to engineering students
  units_required NUMERIC,
  courses_required INTEGER,
  description_long TEXT, -- Detailed description
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. CONCURRENT DEGREES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS concurrent_degrees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "Concurrent Bachelor of Arts (BA)"
  description TEXT,
  requirements TEXT, -- e.g., "This process requires a significant number of extra courses"
  advice TEXT, -- e.g., "Students must consult both their Engineering academic advisor"
  available_to_engineering BOOLEAN DEFAULT true,
  extra_courses_required TEXT, -- Description of additional course requirements
  approval_required TEXT, -- e.g., "Agreement from both Faculties"
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. ACCELERATED MASTERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS accelerated_masters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_name TEXT NOT NULL, -- e.g., "Accelerated Master's Program (MASc Fast Track)"
  description TEXT,
  administered_by TEXT, -- e.g., "Faculty of Engineering in coordination with Graduate Studies Office"
  offered_by TEXT, -- e.g., "All Engineering departments at Waterloo"
  
  -- Eligibility requirements
  average_requirement TEXT, -- e.g., "80% cumulative average at the end of 3B term"
  record_requirement TEXT, -- e.g., "Must have consistently achieved excellent academic records"
  
  -- Program structure
  graduate_courses_info TEXT, -- e.g., "Take up to two graduate-level courses during final undergraduate year"
  research_opportunities TEXT, -- e.g., "Opportunity to conduct research during final co-op term(s)"
  
  -- Funding information (stored as JSONB for flexibility)
  funding_options JSONB, -- Array of funding options
  tuition_reimbursement JSONB, -- Eligibility and requirements for tuition reimbursement
  
  -- Application process (stored as JSONB for flexibility)
  application_process JSONB, -- Array of application steps
  
  available_to_engineering BOOLEAN DEFAULT true,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. RELATIONSHIP TABLES
-- ==============================================

-- Minors to Engineering Programs (many-to-many)
CREATE TABLE IF NOT EXISTS minors_engineering_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  minor_id UUID REFERENCES minors(id) ON DELETE CASCADE,
  engineering_program TEXT NOT NULL, -- e.g., "Computer Engineering (BASc)"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Concurrent Degrees to Engineering Programs (many-to-many)
CREATE TABLE IF NOT EXISTS concurrent_degrees_engineering_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurrent_degree_id UUID REFERENCES concurrent_degrees(id) ON DELETE CASCADE,
  engineering_program TEXT NOT NULL, -- e.g., "Computer Engineering (BASc)"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accelerated Masters to Engineering Programs (many-to-many)
CREATE TABLE IF NOT EXISTS accelerated_masters_engineering_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accelerated_master_id UUID REFERENCES accelerated_masters(id) ON DELETE CASCADE,
  engineering_program TEXT NOT NULL, -- e.g., "Computer Engineering (BASc)"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================

-- Minors indexes
CREATE INDEX IF NOT EXISTS idx_minors_faculty ON minors(faculty);
CREATE INDEX IF NOT EXISTS idx_minors_available_to_engineering ON minors(available_to_engineering);

-- Concurrent degrees indexes
CREATE INDEX IF NOT EXISTS idx_concurrent_degrees_available_to_engineering ON concurrent_degrees(available_to_engineering);

-- Accelerated masters indexes
CREATE INDEX IF NOT EXISTS idx_accelerated_masters_available_to_engineering ON accelerated_masters(available_to_engineering);
CREATE INDEX IF NOT EXISTS idx_accelerated_masters_administered_by ON accelerated_masters(administered_by);

-- Relationship table indexes
CREATE INDEX IF NOT EXISTS idx_minors_eng_programs_minor_id ON minors_engineering_programs(minor_id);
CREATE INDEX IF NOT EXISTS idx_minors_eng_programs_program ON minors_engineering_programs(engineering_program);

CREATE INDEX IF NOT EXISTS idx_concurrent_eng_programs_degree_id ON concurrent_degrees_engineering_programs(concurrent_degree_id);
CREATE INDEX IF NOT EXISTS idx_concurrent_eng_programs_program ON concurrent_degrees_engineering_programs(engineering_program);

CREATE INDEX IF NOT EXISTS idx_accelerated_eng_programs_master_id ON accelerated_masters_engineering_programs(accelerated_master_id);
CREATE INDEX IF NOT EXISTS idx_accelerated_eng_programs_program ON accelerated_masters_engineering_programs(engineering_program);

-- ==============================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE minors IS 'Information about minors available to engineering students';
COMMENT ON TABLE concurrent_degrees IS 'Information about concurrent degree programs available to engineering students';
COMMENT ON TABLE accelerated_masters IS 'Information about accelerated master''s programs for engineering students';

COMMENT ON COLUMN minors.is_engineering_offered IS 'Whether the minor is offered by the Faculty of Engineering (false for all)';
COMMENT ON COLUMN minors.available_to_engineering IS 'Whether engineering students can pursue this minor';
COMMENT ON COLUMN concurrent_degrees.available_to_engineering IS 'Whether engineering students can pursue this concurrent degree';
COMMENT ON COLUMN accelerated_masters.available_to_engineering IS 'Whether engineering students can pursue this accelerated master''s program';

-- ==============================================
-- 7. SAMPLE DATA INSERTION (Optional)
-- ==============================================

-- Insert general minors information
INSERT INTO minors (name, faculty, description, requirements, diploma_note, advice, is_engineering_offered, available_to_engineering, units_required, courses_required, description_long) VALUES
('General Minors Information', 'Various Faculties', 'Engineering does not offer minors to students enrolled in engineering; however, minors are offered by other faculties (e.g., Arts, Science, Environment, Math).', 'Normally requires a minimum of 10 courses (approx. 5.0 units).', 'Minors are noted on your diploma.', 'If you are interested in a minor, visit the undergraduate calendar or contact your academic advisor for more information.', false, true, 5.0, 10, 'Engineering does not offer minors to students enrolled in engineering; however, minors are offered by other faculties (e.g., Arts, Science, Environment, Math).');

-- Insert concurrent degrees information
INSERT INTO concurrent_degrees (name, description, requirements, advice, available_to_engineering, extra_courses_required, approval_required) VALUES
('Concurrent Bachelor of Arts (BA)', 'Engineering students may complete requirements for a concurrent Bachelor of Arts (BA) degree in addition to their BASc/BSE.', 'This process requires a significant number of extra courses and agreement from both Faculties.', 'Students must consult both their Engineering academic advisor and the Faculty of Arts to plan and confirm degree requirements.', true, 'Significant number of extra courses', 'Agreement from both Faculties');

-- Insert accelerated masters information
INSERT INTO accelerated_masters (program_name, description, administered_by, offered_by, average_requirement, record_requirement, graduate_courses_info, research_opportunities, funding_options, tuition_reimbursement, application_process, available_to_engineering) VALUES
('Accelerated Master''s Program (MASc Fast Track)', 'Allows undergraduate Engineering students at Waterloo to fast track into a Master of Applied Science (MASc) degree.', 'Faculty of Engineering in coordination with Graduate Studies Office', 'All Engineering departments at Waterloo', '80% cumulative average at the end of 3B term.', 'Must have consistently achieved excellent academic records.', 'Take up to two graduate-level courses during final undergraduate year (one in 4A, one in 4B or during a co-op term).', 'Opportunity to conduct research during final co-op term(s), which may serve as foundation for MASc work.', 
'["Undergraduate Research Assistantship (URA) – part-time research during an academic term.", "Undergraduate Student Research Award (USRA) – full-time research (NSERC government grant) during a work term.", "Accelerated Master''s students with an NSERC USRA: eligible for a one-time $4,500 from the Dean of Engineering.", "NSERC USRA holders in Accelerated Master''s: eligible for graduate course tuition reimbursement (one course max)."]'::jsonb,
'{"eligibility": "Students holding NSERC USRA and registering in a graduate course during co-op.", "requirements": ["Course must be extra to degree (NRNA/TRIA).", "Tuition/fees must be paid up front.", "Course completed with a minimum grade of 80%.", "Submit documentation (Quest screenshot + course details) to Departmental Graduate Coordinator."], "process": "If approved, reimbursement deposited into Quest account within ~3 weeks."}'::jsonb,
'["Confirm academic eligibility by end of 3B term.", "Find a faculty supervisor.", "Document academic plan.", "Document research plan.", "Obtain approvals from department/faculty.", "Submit Accelerated Master''s application form to Graduate Studies."]'::jsonb,
true);

-- ==============================================
-- 8. SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Schema for minors, concurrent degrees, and accelerated masters created successfully!';
    RAISE NOTICE '📊 Tables created: minors, concurrent_degrees, accelerated_masters';
    RAISE NOTICE '🔗 Relationship tables created for engineering program associations';
    RAISE NOTICE '📈 Indexes created for optimal query performance';
    RAISE NOTICE '📝 Sample data inserted for testing';
END $$;
