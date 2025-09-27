-- =====================================================
-- UW Elective Chooser - Complete Database Setup
-- =====================================================
-- This file contains all the SQL commands needed to set up
-- the complete database schema and initial data for the
-- University of Waterloo Elective Chooser application.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100),
    program VARCHAR(100),
    current_term VARCHAR(10),
    interests TEXT[],
    goal_tags TEXT[],
    completed_courses TEXT[],
    additional_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255),
    dept VARCHAR(10),
    number INTEGER,
    units DECIMAL(3,1),
    level INTEGER,
    description TEXT,
    faculty VARCHAR(100),
    cse_classification VARCHAR(5),
    terms_offered TEXT[],
    prereqs TEXT,
    workload JSONB,
    skills TEXT[],
    assessments JSONB,
    fulfills_options TEXT[],
    fulfills_specializations TEXT[],
    fulfills_certificates TEXT[],
    fulfills_diplomas TEXT[],
    source_url TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    required_courses TEXT[],
    selective_rules JSONB,
    description TEXT,
    coordinator VARCHAR(255),
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specializations table
CREATE TABLE IF NOT EXISTS specializations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    min_average_in_specialization INTEGER,
    graduation_requirements TEXT,
    course_requirements JSONB,
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    required_courses TEXT[],
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diplomas table
CREATE TABLE IF NOT EXISTS diplomas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    required_courses TEXT[],
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Minors table
CREATE TABLE IF NOT EXISTS minors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    required_courses TEXT[],
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Concurrent degrees table
CREATE TABLE IF NOT EXISTS concurrent_degrees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    required_courses TEXT[],
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accelerated masters table
CREATE TABLE IF NOT EXISTS accelerated_masters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    faculty VARCHAR(100),
    required_courses TEXT[],
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CHAT SYSTEM TABLES
-- =====================================================

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. VECTOR SEARCH FUNCTIONS
-- =====================================================

-- Function to search elective documents using vector similarity
CREATE OR REPLACE FUNCTION search_elective_docs(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    text TEXT,
    source_url TEXT,
    similarity FLOAT
)
LANGUAGE SQL
AS $$
    SELECT
        description as text,
        source_url,
        1 - (embedding <=> query_embedding) as similarity
    FROM courses
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS courses_embedding_idx ON courses USING ivfflat (embedding vector_cosine_ops);

-- Text search indexes
CREATE INDEX IF NOT EXISTS courses_title_idx ON courses USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS courses_description_idx ON courses USING gin (to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS courses_dept_idx ON courses (dept);
CREATE INDEX IF NOT EXISTS courses_level_idx ON courses (level);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages (session_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for chat_sessions table
CREATE POLICY "Users can view own sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for messages table
CREATE POLICY "Users can view messages from own sessions" ON messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own sessions" ON messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM chat_sessions WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specializations_updated_at BEFORE UPDATE ON specializations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diplomas_updated_at BEFORE UPDATE ON diplomas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_minors_updated_at BEFORE UPDATE ON minors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concurrent_degrees_updated_at BEFORE UPDATE ON concurrent_degrees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accelerated_masters_updated_at BEFORE UPDATE ON accelerated_masters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample options
INSERT INTO options (id, name, program, faculty, description) VALUES
('ai_option', 'Artificial Intelligence Option', 'Software Engineering', 'Engineering', 'Focus on AI and machine learning'),
('business_option', 'Business Option', 'Software Engineering', 'Engineering', 'Business and entrepreneurship focus'),
('robotics_option', 'Robotics Option', 'Mechatronics Engineering', 'Engineering', 'Robotics and automation focus')
ON CONFLICT (id) DO NOTHING;

-- Insert sample specializations
INSERT INTO specializations (id, name, program, faculty, description) VALUES
('ai_spec', 'Artificial Intelligence Specialization', 'Software Engineering', 'Engineering', 'AI and ML specialization'),
('business_spec', 'Business Specialization', 'Software Engineering', 'Engineering', 'Business specialization'),
('robotics_spec', 'Robotics Specialization', 'Mechatronics Engineering', 'Engineering', 'Robotics specialization')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMPLETE DATABASE SETUP FINISHED
-- =====================================================
