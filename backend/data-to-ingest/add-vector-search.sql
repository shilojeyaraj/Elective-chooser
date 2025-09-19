-- Add embedding column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS embedding VECTOR(1536);

-- Create vector search function for courses
CREATE OR REPLACE FUNCTION search_courses_vector(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  dept TEXT,
  number INT,
  units FLOAT,
  level INT,
  description TEXT,
  terms_offered JSONB,
  prereqs TEXT,
  skills JSONB,
  workload JSONB,
  assessments JSONB,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    courses.id,
    courses.title,
    courses.dept,
    courses.number,
    courses.units,
    courses.level,
    courses.description,
    courses.terms_offered,
    courses.prereqs,
    courses.skills,
    courses.workload,
    courses.assessments,
    courses.source_url,
    1 - (courses.embedding <=> query_embedding) AS similarity
  FROM courses
  WHERE courses.embedding IS NOT NULL
    AND 1 - (courses.embedding <=> query_embedding) > match_threshold
  ORDER BY courses.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS courses_embedding_idx ON courses 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
