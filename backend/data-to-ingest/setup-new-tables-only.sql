-- Create only the new tables for specializations, certificates, and diplomas
-- No RLS policies, no function changes, just the new tables

-- ==============================================
-- 1. SPECIALIZATIONS TABLE
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
-- 2. CERTIFICATES TABLE
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
-- 3. DIPLOMAS TABLE
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
-- 4. RELATIONSHIP TABLES
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
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_specializations_program ON specializations(program);
CREATE INDEX IF NOT EXISTS idx_certificates_engineering ON certificates(uw_engineering_listed);
CREATE INDEX IF NOT EXISTS idx_diplomas_engineering ON diplomas(uw_engineering_listed);

-- ==============================================
-- 6. COMMENTS
-- ==============================================
COMMENT ON TABLE specializations IS 'Engineering program specializations with course requirements';
COMMENT ON TABLE certificates IS 'Certificates available to Engineering students';
COMMENT ON TABLE diplomas IS 'Diplomas available to Engineering students';
