-- ==============================================
-- COMPLETE DATABASE SCHEMA FOR WATERLOO ENGINEERING ELECTIVE CHOOSER
-- ==============================================
-- This file creates all necessary tables for:
-- - Courses, Specializations, Certificates, Diplomas
-- - Minors, Concurrent Degrees, Accelerated Masters
-- - User profiles, Chat data, and Search functionality
-- ==============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==============================================
-- 1. CORE DATA TABLES
-- ==============================================

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY, -- e.g., "ECE486"
  title TEXT NOT NULL,
  dept TEXT NOT NULL, -- e.g., "ECE", "MTE", "ME"
  number INTEGER, -- e.g., 486, 150, 222
  units NUMERIC DEFAULT 0.5,
  level INTEGER, -- 100/200/300/400
  description TEXT,
  faculty TEXT, -- e.g., "Engineering"
  cse_classification TEXT, -- A, B, C, D, or EXCLUSION for CSE electives
  terms_offered JSONB, -- ["F","W","S"]
  prereqs TEXT,
  workload JSONB, -- {"reading": 2, "assignments": 3, "projects": 1, "labs": 2}
  skills JSONB, -- ["robotics", "control", "embedded", "ML"]
  assessments JSONB, -- {"midterm": 30, "final": 40, "assignments": 30}
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SPECIALIZATIONS TABLE
CREATE TABLE IF NOT EXISTS specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  program TEXT NOT NULL, -- e.g., "Architectural Engineering"
  faculty TEXT DEFAULT 'Engineering',
  min_average_in_specialization NUMERIC,
  graduation_requirements TEXT,
  course_requirements JSONB, -- {"required": [...], "choose_from": {...}}
  description TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  program TEXT, -- e.g., "Computer Engineering"
  faculty TEXT DEFAULT 'Engineering',
  min_average_required NUMERIC,
  graduation_requirements TEXT,
  course_requirements JSONB, -- {"required": [...], "choose_from": {...}}
  description TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DIPLOMAS TABLE
CREATE TABLE IF NOT EXISTS diplomas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  administered_by TEXT, -- e.g., "Faculty of Arts – Culture and Language Studies"
  uw_engineering_listed BOOLEAN DEFAULT false,
  eligibility TEXT,
  requirements TEXT,
  course_requirements JSONB, -- {"required": [...], "electives": [...]}
  units_required NUMERIC,
  description TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MINORS TABLE
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

-- CONCURRENT DEGREES TABLE
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

-- ACCELERATED MASTERS TABLE
CREATE TABLE IF NOT EXISTS accelerated_masters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_name TEXT NOT NULL,
  description TEXT,
  administered_by TEXT,
  offered_by TEXT,
  average_requirement TEXT,
  record_requirement TEXT,
  graduate_courses_info TEXT,
  research_opportunities TEXT,
  funding_options JSONB,
  tuition_reimbursement JSONB,
  application_process JSONB,
  available_to_engineering BOOLEAN DEFAULT true,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. RELATIONSHIP TABLES
-- ==============================================

-- Specializations to Courses (many-to-many)
CREATE TABLE IF NOT EXISTS specializations_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialization_id UUID REFERENCES specializations(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  course_type TEXT, -- 'required' or 'elective'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates to Courses (many-to-many)
CREATE TABLE IF NOT EXISTS certificates_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  course_type TEXT, -- 'required' or 'elective'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diplomas to Courses (many-to-many)
CREATE TABLE IF NOT EXISTS diplomas_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diploma_id UUID REFERENCES diplomas(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  course_type TEXT, -- 'required' or 'elective'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
-- 3. USER AND CHAT TABLES
-- ==============================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL, -- Supabase auth user ID
  program TEXT, -- e.g., "Computer Engineering"
  year INTEGER, -- 1, 2, 3, 4
  interests JSONB, -- ["robotics", "AI", "embedded"]
  goals TEXT, -- Career goals or interests
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Supabase auth user ID
  session_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  metadata JSONB, -- Additional data like course recommendations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. SEARCH AND VECTOR TABLES
-- ==============================================

-- Document Chunks for Vector Search
CREATE TABLE IF NOT EXISTS elective_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB, -- Document metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(dept);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_skills ON courses USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_courses_terms ON courses USING GIN(terms_offered);

-- Specializations indexes
CREATE INDEX IF NOT EXISTS idx_specializations_program ON specializations(program);
CREATE INDEX IF NOT EXISTS idx_specializations_faculty ON specializations(faculty);

-- Certificates indexes
CREATE INDEX IF NOT EXISTS idx_certificates_program ON certificates(program);
CREATE INDEX IF NOT EXISTS idx_certificates_faculty ON certificates(faculty);

-- Diplomas indexes
CREATE INDEX IF NOT EXISTS idx_diplomas_administered_by ON diplomas(administered_by);
CREATE INDEX IF NOT EXISTS idx_diplomas_uw_engineering_listed ON diplomas(uw_engineering_listed);

-- Minors indexes
CREATE INDEX IF NOT EXISTS idx_minors_faculty ON minors(faculty);
CREATE INDEX IF NOT EXISTS idx_minors_available_to_engineering ON minors(available_to_engineering);

-- Concurrent degrees indexes
CREATE INDEX IF NOT EXISTS idx_concurrent_degrees_available_to_engineering ON concurrent_degrees(available_to_engineering);

-- Accelerated masters indexes
CREATE INDEX IF NOT EXISTS idx_accelerated_masters_available_to_engineering ON accelerated_masters(available_to_engineering);
CREATE INDEX IF NOT EXISTS idx_accelerated_masters_administered_by ON accelerated_masters(administered_by);

-- Relationship table indexes
CREATE INDEX IF NOT EXISTS idx_specializations_courses_spec_id ON specializations_courses(specialization_id);
CREATE INDEX IF NOT EXISTS idx_specializations_courses_course_id ON specializations_courses(course_id);

CREATE INDEX IF NOT EXISTS idx_certificates_courses_cert_id ON certificates_courses(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_courses_course_id ON certificates_courses(course_id);

CREATE INDEX IF NOT EXISTS idx_diplomas_courses_diploma_id ON diplomas_courses(diploma_id);
CREATE INDEX IF NOT EXISTS idx_diplomas_courses_course_id ON diplomas_courses(course_id);

CREATE INDEX IF NOT EXISTS idx_minors_eng_programs_minor_id ON minors_engineering_programs(minor_id);
CREATE INDEX IF NOT EXISTS idx_minors_eng_programs_program ON minors_engineering_programs(engineering_program);

CREATE INDEX IF NOT EXISTS idx_concurrent_eng_programs_degree_id ON concurrent_degrees_engineering_programs(concurrent_degree_id);
CREATE INDEX IF NOT EXISTS idx_concurrent_eng_programs_program ON concurrent_degrees_engineering_programs(engineering_program);

CREATE INDEX IF NOT EXISTS idx_accelerated_eng_programs_master_id ON accelerated_masters_engineering_programs(accelerated_master_id);
CREATE INDEX IF NOT EXISTS idx_accelerated_eng_programs_program ON accelerated_masters_engineering_programs(engineering_program);

-- User and chat indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_program ON user_profiles(program);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Vector search indexes
CREATE INDEX IF NOT EXISTS idx_elective_docs_embedding ON elective_docs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ==============================================
-- 6. VECTOR SEARCH FUNCTIONS
-- ==============================================

-- Function to search elective documents using vector similarity
CREATE OR REPLACE FUNCTION search_elective_docs(
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT
    elective_docs.id,
    elective_docs.content,
    elective_docs.metadata,
    1 - (elective_docs.embedding <=> query_embedding) AS similarity
  FROM elective_docs
  WHERE 1 - (elective_docs.embedding <=> query_embedding) > similarity_threshold
  ORDER BY elective_docs.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ==============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on user-related tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages to their sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()::text
    )
  );

-- ==============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE courses IS 'All courses available at Waterloo, including engineering and non-engineering courses';
COMMENT ON TABLE specializations IS 'Engineering specializations available to students in specific programs';
COMMENT ON TABLE certificates IS 'Certificates available to engineering students';
COMMENT ON TABLE diplomas IS 'Diplomas available to engineering students from other faculties';
COMMENT ON TABLE minors IS 'Minors available to engineering students from other faculties';
COMMENT ON TABLE concurrent_degrees IS 'Concurrent degree programs available to engineering students';
COMMENT ON TABLE accelerated_masters IS 'Accelerated master''s programs for engineering students';

COMMENT ON COLUMN courses.cse_classification IS 'Classification for Computer Science and Engineering electives (A, B, C, D, or EXCLUSION)';
COMMENT ON COLUMN specializations.min_average_in_specialization IS 'Minimum average required in specialization courses';
COMMENT ON COLUMN diplomas.uw_engineering_listed IS 'Whether this diploma is specifically listed for UW Engineering students';
COMMENT ON COLUMN minors.is_engineering_offered IS 'Whether the minor is offered by the Faculty of Engineering (false for all)';
COMMENT ON COLUMN minors.available_to_engineering IS 'Whether engineering students can pursue this minor';

-- ==============================================
-- 9. SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Complete database schema created successfully!';
    RAISE NOTICE '📊 Tables created: courses, specializations, certificates, diplomas, minors, concurrent_degrees, accelerated_masters';
    RAISE NOTICE '🔗 Relationship tables created for all associations';
    RAISE NOTICE '👤 User and chat tables created with RLS policies';
    RAISE NOTICE '🔍 Vector search functionality enabled';
    RAISE NOTICE '📈 Indexes created for optimal query performance';
    RAISE NOTICE '🎉 Ready for data ingestion!';
END $$;
