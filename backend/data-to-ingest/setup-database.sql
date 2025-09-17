-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY, -- e.g., "ECE486"
  title TEXT NOT NULL,
  dept TEXT NOT NULL, -- e.g., "ECE", "MTE", "ME"
  number INTEGER, -- e.g., 486, 150, 222
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
  id TEXT PRIMARY KEY, -- e.g., "computer-engineering"
  name TEXT NOT NULL, -- e.g., "Computer Engineering"
  program TEXT, -- e.g., "BASc", "BSE"
  faculty TEXT, -- e.g., "Engineering"
  description TEXT,
  required_courses JSONB, -- ["ECE486", "ECE488"]
  selective_rules JSONB, -- {"selectNfrom": ["MTE380", "ECE457A"]}
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elective documents for RAG
CREATE TABLE elective_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id TEXT REFERENCES courses(id),
  option_id TEXT REFERENCES options(id),
  text TEXT NOT NULL,
  source_url TEXT,
  chunk_id INTEGER,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  program TEXT,
  year INTEGER,
  interests JSONB, -- ["robotics", "AI", "software"]
  completed_courses JSONB, -- ["ECE150", "ECE222"]
  preferences JSONB, -- {"workload": "medium", "terms": ["F", "W"]}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_courses_dept ON courses(dept);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_skills ON courses USING GIN(skills);
CREATE INDEX idx_elective_docs_course_id ON elective_docs(course_id);
CREATE INDEX idx_elective_docs_option_id ON elective_docs(option_id);
CREATE INDEX idx_elective_docs_embedding ON elective_docs USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE elective_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all operations on options" ON options FOR ALL USING (true);
CREATE POLICY "Allow all operations on elective_docs" ON elective_docs FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_sessions" ON chat_sessions FOR ALL USING (true);
