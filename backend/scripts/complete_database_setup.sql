-- Complete Supabase Database Setup and Fixes
-- Run this entire file in the Supabase SQL Editor

-- ==============================================
-- 1. DROP EXISTING FUNCTIONS (if they exist)
-- ==============================================

DROP FUNCTION IF EXISTS search_elective_docs(VECTOR, FLOAT, INT);

-- ==============================================
-- 2. CREATE EXTENSIONS
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ==============================================
-- 3. CREATE TABLES
-- ==============================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  dept TEXT NOT NULL,
  level TEXT NOT NULL,
  skills JSONB DEFAULT '[]',
  terms_offered JSONB DEFAULT '[]',
  workload JSONB DEFAULT '{}',
  prerequisites JSONB DEFAULT '[]',
  corequisites JSONB DEFAULT '[]',
  restrictions JSONB DEFAULT '[]',
  notes TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  program TEXT NOT NULL,
  requirements JSONB DEFAULT '{}',
  min_courses INTEGER DEFAULT 0,
  max_courses INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course-Option relationships
CREATE TABLE IF NOT EXISTS course_options (
  option_id UUID REFERENCES options(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (option_id, course_id)
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  program TEXT,
  current_term TEXT,
  completed_courses JSONB DEFAULT '[]',
  planned_courses JSONB DEFAULT '[]',
  additional_comments TEXT,
  gpa NUMERIC,
  interests JSONB DEFAULT '[]',
  goal_tags JSONB DEFAULT '[]',
  constraints JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT,
  goal_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elective documents for RAG
CREATE TABLE IF NOT EXISTS elective_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  option_id UUID REFERENCES options(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  source_url TEXT,
  chunk_id INTEGER,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Course indexes
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(dept);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_skills ON courses USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_courses_terms ON courses USING GIN (terms_offered);

-- Option indexes
CREATE INDEX IF NOT EXISTS idx_options_program ON options(program);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_program ON profiles(program);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON profiles USING GIN (goal_tags);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Elective docs indexes
CREATE INDEX IF NOT EXISTS idx_elective_docs_course ON elective_docs(course_id);
CREATE INDEX IF NOT EXISTS idx_elective_docs_option ON elective_docs(option_id);
CREATE INDEX IF NOT EXISTS idx_elective_docs_embedding ON elective_docs USING ivfflat (embedding vector_cosine_ops);

-- ==============================================
-- 5. CREATE FUNCTIONS
-- ==============================================

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Vector similarity search function (FIXED)
CREATE OR REPLACE FUNCTION search_elective_docs(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  course_id TEXT,
  option_id TEXT,  -- FIXED: Changed from UUID to TEXT
  text TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    elective_docs.id,
    elective_docs.course_id,
    elective_docs.option_id,
    elective_docs.text,
    elective_docs.source_url,
    1 - (elective_docs.embedding <=> query_embedding) AS similarity
  FROM elective_docs
  WHERE 1 - (elective_docs.embedding <=> query_embedding) > match_threshold
  ORDER BY elective_docs.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ==============================================
-- 6. CREATE TRIGGERS
-- ==============================================

-- Add triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public tables (courses, options, elective_docs) are readable by everyone
-- but only service role can modify them

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs 
      WHERE cs.id = messages.session_id 
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions cs 
      WHERE cs.id = messages.session_id 
      AND cs.user_id = auth.uid()
    )
  );

-- ==============================================
-- 8. SAMPLE DATA (Optional)
-- ==============================================

-- Insert sample course
INSERT INTO courses (id, title, description, dept, level, skills, terms_offered, workload)
VALUES (
  'SAMPLE101',
  'Sample Engineering Course',
  'A sample course for testing purposes',
  'ENG',
  '1A',
  '["programming", "problem-solving"]'::jsonb,
  '["1A", "1B"]'::jsonb,
  '{"lectures": 3, "tutorials": 1, "labs": 0, "total": 4}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert sample option
INSERT INTO options (name, description, program, requirements, min_courses)
VALUES (
  'Software Engineering Option',
  'Focus on software development and computer science',
  'MTE',
  '{"required_courses": ["CS115", "CS136"], "elective_courses": 5}'::jsonb,
  7
) ON CONFLICT DO NOTHING;

-- ==============================================
-- 9. VERIFICATION QUERIES
-- ==============================================

-- Test the vector search function
SELECT 'Vector search function test:' as test_name;
SELECT * FROM search_elective_docs(
  ARRAY[0.1, 0.2, 0.3]::vector(1536),  -- Dummy embedding
  0.5,
  5
);

-- Test course search
SELECT 'Course search test:' as test_name;
SELECT id, title, dept, level FROM courses LIMIT 5;

-- Test JSONB operations
SELECT 'JSONB operations test:' as test_name;
SELECT id, title, skills, terms_offered 
FROM courses 
WHERE skills @> '["programming"]'::jsonb
LIMIT 3;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

SELECT 'Database setup completed successfully! 🎉' as status;
