-- YANI Puzzle Challenge Database Schema & Seeds

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    course TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Questions Table
CREATE TABLE IF NOT EXISTS public.custom_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no', 'rating', 'dropdown')),
    options TEXT[] DEFAULT NULL,
    required BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Answers Table
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.custom_questions(id) ON DELETE CASCADE,
    question_version INTEGER NOT NULL,
    question_text_snapshot TEXT NOT NULL,
    answer_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Puzzles Table
CREATE TABLE IF NOT EXISTS public.puzzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    time_limit_seconds INTEGER DEFAULT 300,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    puzzle_id UUID NOT NULL REFERENCES public.puzzles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    moves INTEGER DEFAULT 0,
    puzzle_state JSONB,
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS public.event_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL DEFAULT 'YANI Puzzle Challenge',
    registration_enabled BOOLEAN DEFAULT true,
    leaderboard_enabled BOOLEAN DEFAULT true,
    max_attempts INTEGER DEFAULT 1,
    scoring_version TEXT DEFAULT 'v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Students: Anonymous can insert (registration), anyone can read (leaderboard)
CREATE POLICY "Enable insert for anonymous users" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.students FOR SELECT USING (true);

-- Custom Questions: Anyone can read active questions, admins can do all
CREATE POLICY "Enable read access for all users" ON public.custom_questions FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON public.custom_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- Student Answers: Anonymous can insert during registration, admins can do all
CREATE POLICY "Enable insert for anonymous users" ON public.student_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable all access for admins" ON public.student_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- Puzzles: Anyone can read active puzzles, admins can do all
CREATE POLICY "Enable read access for all users" ON public.puzzles FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON public.puzzles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- Game Sessions: Anonymous can insert and update their own (via client), anyone can read (leaderboard)
CREATE POLICY "Enable insert for anonymous users" ON public.game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for anonymous users" ON public.game_sessions FOR UPDATE USING (true);
CREATE POLICY "Enable read access for all users" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON public.game_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- Admins: Admins can read their own
CREATE POLICY "Enable read access for admins" ON public.admins FOR SELECT USING (auth_user_id = auth.uid());

-- Event Settings: Anyone can read, admins can do all
CREATE POLICY "Enable read access for all users" ON public.event_settings FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON public.event_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- Audit Logs: Admins can read
CREATE POLICY "Enable read access for admins" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- 4. SEEDS (Initial Data)

-- Seed Event Settings
INSERT INTO public.event_settings (event_name, registration_enabled, leaderboard_enabled, max_attempts, scoring_version)
VALUES ('YANI Puzzle Challenge', true, true, 1, 'v1')
ON CONFLICT DO NOTHING;

-- Seed Active Puzzle
INSERT INTO public.puzzles (name, image_url, time_limit_seconds, active)
VALUES ('YANI Robot Core', '/yani-robot.jpg', 300, true)
ON CONFLICT DO NOTHING;

-- Seed Sample Custom Questions
INSERT INTO public.custom_questions (question_text, type, options, required, active, order_index, version)
VALUES 
('What areas of robotics interest you?', 'multiple_choice', ARRAY['AI/ML', 'Hardware/Electronics', 'Software Engineering', 'Mechanical Design'], true, true, 0, 1),
('Have you built a robot before?', 'yes_no', NULL, true, true, 1, 1),
('Why do you want to join Yantrix?', 'long_text', NULL, false, true, 2, 1)
ON CONFLICT DO NOTHING;
