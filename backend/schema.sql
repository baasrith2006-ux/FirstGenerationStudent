-- PathWise Database Schema (PostgreSQL for Supabase)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    name TEXT DEFAULT 'Student Name',
    initials TEXT DEFAULT 'SN',
    stream TEXT DEFAULT 'Not set',
    year TEXT DEFAULT 'Not set',
    goal TEXT DEFAULT 'Not set',
    streak INTEGER DEFAULT 0,
    dna_traits TEXT[],
    dna_type TEXT,
    dna_description TEXT,
    used_questions JSONB DEFAULT '{"math": [], "physics": [], "cs": [], "chemistry": []}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mastery INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT DEFAULT 'General',
    duration TEXT DEFAULT '30m',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Planner Sessions Table
CREATE TABLE IF NOT EXISTS planner_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL, -- 'Mon', 'Tue', etc.
    subject TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chats Table
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sender TEXT NOT NULL, -- 'user' or 'bot'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Syllabus Topics Table
CREATE TABLE IF NOT EXISTS syllabus_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT DEFAULT 'generic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Test History Table
CREATE TABLE IF NOT EXISTS test_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    date TEXT NOT NULL, -- Formatted date string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Bootstrap User (Optional if using Supabase Auth)
-- INSERT INTO users (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'PathWise Student') ON CONFLICT DO NOTHING;
