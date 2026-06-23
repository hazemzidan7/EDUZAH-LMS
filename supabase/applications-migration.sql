-- ============================================================================
-- EDUZAH — Internship Applications System
-- Run this in your Supabase SQL editor
-- ============================================================================

-- ---------------------------------------------------------------------------
-- internship_applications table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Step 1: Personal Info
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  current_address TEXT,
  facebook_link TEXT,
  linkedin_link TEXT,

  -- Step 2: Education
  university TEXT NOT NULL,
  faculty TEXT NOT NULL,
  department TEXT NOT NULL,
  academic_status TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  gpa TEXT,
  academic_achievements TEXT,

  -- Step 3: Position
  position TEXT NOT NULL,
  position_type TEXT NOT NULL,

  -- Step 4: Skills (dynamic per position)
  skills JSONB DEFAULT '{}',

  -- Step 5: Experience
  has_experience BOOLEAN DEFAULT FALSE,
  experiences JSONB DEFAULT '[]',

  -- Step 6: Portfolio / Files
  cv_url TEXT NOT NULL,
  cv_filename TEXT,
  portfolio_link TEXT,
  github_link TEXT,
  behance_link TEXT,
  personal_website TEXT,

  -- Step 7: Availability
  hours_per_week TEXT NOT NULL,
  preferred_days TEXT[] DEFAULT '{}',
  can_attend_offline BOOLEAN,
  can_attend_online BOOLEAN,

  -- Step 8: Personal Questions
  why_join TEXT NOT NULL,
  skills_to_gain TEXT NOT NULL,
  value_added TEXT NOT NULL,
  one_year_vision TEXT NOT NULL,

  -- Admin fields
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON internship_applications
  FOR EACH ROW EXECUTE PROCEDURE update_applications_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit an application
CREATE POLICY "applications_insert_anyone" ON internship_applications
  FOR INSERT WITH CHECK (TRUE);

-- Only admins can read all applications
CREATE POLICY "applications_select_admin" ON internship_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update (change status, add notes)
CREATE POLICY "applications_update_admin" ON internship_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete
CREATE POLICY "applications_delete_admin" ON internship_applications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- Storage bucket for CVs
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-cvs', 'application-cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload CVs (anonymous applicants)
CREATE POLICY "application_cvs_upload_anyone" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'application-cvs');

-- Public read (CVs are named with random UUIDs, hard to guess)
CREATE POLICY "application_cvs_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'application-cvs');

-- Only admins can delete CV files
CREATE POLICY "application_cvs_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'application-cvs'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- Indexes for common filter queries
-- ---------------------------------------------------------------------------
CREATE INDEX idx_applications_position ON internship_applications (position);
CREATE INDEX idx_applications_position_type ON internship_applications (position_type);
CREATE INDEX idx_applications_status ON internship_applications (status);
CREATE INDEX idx_applications_graduation_year ON internship_applications (graduation_year);
CREATE INDEX idx_applications_governorate ON internship_applications (governorate);
CREATE INDEX idx_applications_academic_status ON internship_applications (academic_status);
CREATE INDEX idx_applications_created_at ON internship_applications (created_at DESC);
