-- Enhanced Team Update Bot Schema (Fixed Version)
-- Comprehensive team management for Nudge iOS app development

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on tasks" ON public.tasks;

-- Member profiles with roles (create first)
CREATE TABLE IF NOT EXISTS public.member_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name TEXT UNIQUE NOT NULL CHECK (member_name IN ('ilan', 'midlaj', 'hysam', 'alan')),
    role TEXT NOT NULL CHECK (role IN ('development', 'animation', 'design', 'research')),
    display_name TEXT NOT NULL,
    avatar_color TEXT DEFAULT 'bg-stone-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Insert default member profiles
INSERT INTO public.member_profiles (member_name, role, display_name, avatar_color) VALUES
('ilan', 'development', 'Ilan', 'bg-stone-700'),
('midlaj', 'animation', 'Midlaj', 'bg-stone-600'),
('hysam', 'design', 'Hysam', 'bg-stone-500'),
('alan', 'research', 'Alan', 'bg-stone-800')
ON CONFLICT (member_name) DO NOTHING;

-- Goals and milestones (create second, before tasks reference it)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assigned_member TEXT NOT NULL CHECK (assigned_member IN ('ilan', 'midlaj', 'hysam', 'alan')),
    goal_type TEXT CHECK (goal_type IN ('weekly', 'monthly', 'milestone', 'feature')) DEFAULT 'weekly',
    priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')) DEFAULT 'not_started',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    depends_on UUID[], -- Array of goal IDs this goal depends on
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Now update existing tasks table with new columns (after goals table exists)
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS task_type TEXT CHECK (task_type IN ('feature', 'bug', 'research', 'review', 'asset', 'animation')) DEFAULT 'feature',
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS blocked_by TEXT,
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.goals(id);

-- Team availability tracking
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name TEXT NOT NULL CHECK (member_name IN ('ilan', 'midlaj', 'hysam', 'alan')),
    status TEXT CHECK (status IN ('available', 'leave', 'exam', 'busy', 'sick')) DEFAULT 'available',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Daily check-ins and check-outs
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name TEXT NOT NULL CHECK (member_name IN ('ilan', 'midlaj', 'hysam', 'alan')),
    log_type TEXT CHECK (log_type IN ('check_in', 'check_out')) NOT NULL,
    mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 5),
    notes TEXT,
    tasks_planned TEXT[], -- Array of task titles for check-in
    tasks_completed TEXT[], -- Array of completed task titles for check-out
    blockers TEXT,
    tomorrow_priority TEXT,
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations (public access for team)
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on goals" ON public.goals FOR ALL USING (true);
CREATE POLICY "Allow all operations on availability" ON public.availability FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_logs" ON public.daily_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on member_profiles" ON public.member_profiles FOR ALL USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    
    -- Set completed_at when goal is marked as completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = TIMEZONE('utc'::TEXT, NOW());
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_goals_updated_at();

CREATE TRIGGER set_availability_updated_at
    BEFORE UPDATE ON public.availability
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_availability_updated_at();

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_goals_assigned_member ON public.goals(assigned_member);
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON public.goals(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_availability_member_date ON public.availability(member_name, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_member_date ON public.daily_logs(member_name, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_type ON public.daily_logs(log_type);

-- Create view for current team availability
CREATE OR REPLACE VIEW public.current_availability AS
SELECT 
    mp.member_name,
    mp.display_name,
    mp.role,
    COALESCE(a.status, 'available') as current_status,
    a.reason,
    a.start_date,
    a.end_date
FROM public.member_profiles mp
LEFT JOIN public.availability a ON mp.member_name = a.member_name 
    AND CURRENT_DATE BETWEEN a.start_date AND a.end_date
ORDER BY mp.member_name;

-- Create view for today's team status
CREATE OR REPLACE VIEW public.todays_team_status AS
SELECT 
    mp.member_name,
    mp.display_name,
    mp.role,
    mp.avatar_color,
    COALESCE(a.status, 'available') as availability_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.daily_logs WHERE member_name = mp.member_name AND log_date = CURRENT_DATE AND log_type = 'check_in') 
        THEN 'checked_in' 
        ELSE 'not_checked_in' 
    END as check_in_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.daily_logs WHERE member_name = mp.member_name AND log_date = CURRENT_DATE AND log_type = 'check_out') 
        THEN 'checked_out' 
        ELSE 'not_checked_out' 
    END as check_out_status
FROM public.member_profiles mp
LEFT JOIN public.availability a ON mp.member_name = a.member_name 
    AND CURRENT_DATE BETWEEN a.start_date AND a.end_date
ORDER BY mp.member_name;
