-- Complete Database Schema for Waterloo Engineering Data
-- This includes tables for courses, specializations, certificates, and diplomas

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==============================================
-- 1. COURSES TABLE (existing)
-- ==============================================
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

-- ==============================================
-- 2. SPECIALIZATIONS TABLE (new)
-- ==============================================
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

-- ==============================================
-- 3. CERTIFICATES TABLE (new)
-- ==============================================
CREATE TABLE IF NOT EXISTS certificates (
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

-- ==============================================
-- 4. DIPLOMAS TABLE (new)
-- ==============================================
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

-- ==============================================
-- 5. OPTIONS TABLE (existing - for program options)
-- ==============================================
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  program TEXT, -- e.g., "MTE", "ECE"
  faculty TEXT, -- e.g., "Engineering"
  required_courses JSONB, -- ["ECE486"]
  selective_rules JSONB, -- {"selectNfrom": ["MTE380", "ECE488"], "N": 2}
  description TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 6. RELATIONSHIP TABLES
-- ==============================================

-- Course-Specialization relationships
CREATE TABLE IF NOT EXISTS course_specializations (
  specialization_id UUID REFERENCES specializations(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  requirement_type TEXT, -- 'required', 'elective', 'choose_from'
  PRIMARY KEY (specialization_id, course_id)
);

-- Course-Certificate relationships
CREATE TABLE IF NOT EXISTS course_certificates (
  certificate_id UUID REFERENCES certificates(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  requirement_type TEXT, -- 'required', 'elective'
  PRIMARY KEY (certificate_id, course_id)
);

-- Course-Diploma relationships
CREATE TABLE IF NOT EXISTS course_diplomas (
  diploma_id UUID REFERENCES diplomas(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  requirement_type TEXT, -- 'required', 'elective'
  PRIMARY KEY (diploma_id, course_id)
);

-- ==============================================
-- 7. USER PROFILES (existing)
-- ==============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  program TEXT,
  current_term TEXT,
  completed_courses TEXT[] DEFAULT '{}',
  planned_courses TEXT[] DEFAULT '{}',
  additional_comments TEXT,
  gpa NUMERIC,
  interests TEXT[] DEFAULT '{}',
  goal_tags TEXT[] DEFAULT '{}',
  constraints JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 8. CHAT SESSIONS AND MESSAGES (existing)
-- ==============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  goal_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER,
  citations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 9. ELECTIVE DOCS FOR RAG (existing)
-- ==============================================
CREATE TABLE IF NOT EXISTS elective_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id TEXT REFERENCES courses(id),
  option_id UUID REFERENCES options(id),
  specialization_id UUID REFERENCES specializations(id),
  certificate_id UUID REFERENCES certificates(id),
  diploma_id UUID REFERENCES diplomas(id),
  text TEXT NOT NULL,
  source_url TEXT,
  chunk_id INTEGER,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 10. INDEXES FOR PERFORMANCE
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(dept);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_skills ON courses USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_courses_terms ON courses USING GIN(terms_offered);

CREATE INDEX IF NOT EXISTS idx_specializations_program ON specializations(program);
CREATE INDEX IF NOT EXISTS idx_certificates_engineering ON certificates(uw_engineering_listed);
CREATE INDEX IF NOT EXISTS idx_diplomas_engineering ON diplomas(uw_engineering_listed);

-- ==============================================
-- 11. VECTOR SEARCH FUNCTION
-- ==============================================
-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS search_elective_docs(VECTOR, FLOAT, INTEGER);

CREATE OR REPLACE FUNCTION search_elective_docs(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE(
  text TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT
    elective_docs.text,
    elective_docs.source_url,
    1 - (elective_docs.embedding <=> query_embedding) AS similarity
  FROM elective_docs
  WHERE 1 - (elective_docs.embedding <=> query_embedding) > match_threshold
  ORDER BY elective_docs.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ==============================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id));

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id));

-- Public read access for reference data
CREATE POLICY "Public read access for courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read access for specializations" ON specializations FOR SELECT USING (true);
CREATE POLICY "Public read access for certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read access for diplomas" ON diplomas FOR SELECT USING (true);
CREATE POLICY "Public read access for options" ON options FOR SELECT USING (true);
CREATE POLICY "Public read access for elective_docs" ON elective_docs FOR SELECT USING (true);

COMMENT ON TABLE courses IS 'Engineering courses available at Waterloo';
COMMENT ON TABLE specializations IS 'Engineering program specializations with course requirements';
COMMENT ON TABLE certificates IS 'Certificates available to Engineering students';
COMMENT ON TABLE diplomas IS 'Diplomas available to Engineering students';
COMMENT ON TABLE options IS 'Engineering program options and specializations';
COMMENT ON TABLE elective_docs IS 'Document chunks for RAG-based search';
