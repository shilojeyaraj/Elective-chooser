-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY, -- e.g., "ECE486"
  title TEXT NOT NULL,
  dept TEXT NOT NULL, -- e.g., "ECE", "MTE", "ME"
  units NUMERIC DEFAULT 0.5,
  level INTEGER, -- 100/200/300/400
  description TEXT,
  terms_offered JSONB, -- ["F","W","S"]
  prereqs TEXT,
  workload JSONB, -- {"reading": 2, "assignments": 3, "projects": 1, "labs": 2}
  skills JSONB, -- ["robotics", "control", "embedded", "ML"]
  assessments JSONB, -- {"midterm": 30, "final": 40, "assignments": 30}
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options table (Waterloo specializations)
CREATE TABLE options (
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

-- Many-to-many mapping of courses to options
CREATE TABLE course_option_map (
  option_id UUID REFERENCES options(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  rule JSONB, -- {"bucket": "selectives", "weight": 1}
  PRIMARY KEY (option_id, course_id)
);

-- User profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  program TEXT, -- e.g., "MTE", "ECE"
  current_term TEXT, -- e.g., "2A", "2B", "3A"
  completed_courses JSONB DEFAULT '[]', -- ["ECE100", "ECE150"]
  planned_courses JSONB DEFAULT '[]', -- ["ECE486", "ECE488"]
  gpa NUMERIC,
  interests JSONB DEFAULT '[]', -- ["robotics", "ML", "entrepreneurship"]
  goal_tags JSONB DEFAULT '[]', -- ["career_robotics", "grad_school", "industry"]
  constraints JSONB DEFAULT '{}', -- {"max_workload": 4, "morning_labs": false}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT,
  goal_snapshot JSONB, -- snapshot of user goals when session started
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  citations JSONB DEFAULT '[]', -- [{"url": "...", "text": "..."}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elective documents for RAG (chunks from PDFs/HTML)
CREATE TABLE elective_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  option_id UUID REFERENCES options(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  source_url TEXT,
  chunk_id INTEGER,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-large
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_courses_dept ON courses(dept);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_terms ON courses USING GIN(terms_offered);
CREATE INDEX idx_courses_skills ON courses USING GIN(skills);

CREATE INDEX idx_course_option_map_option ON course_option_map(option_id);
CREATE INDEX idx_course_option_map_course ON course_option_map(course_id);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Vector similarity search index
CREATE INDEX ON elective_docs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat sessions: users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: users can only see messages from their own sessions
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

-- Public tables (courses, options, elective_docs) are readable by everyone
-- but only service role can modify them

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_elective_docs(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  course_id TEXT,
  option_id UUID,
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
