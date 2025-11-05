-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    assigned_member TEXT NOT NULL CHECK (assigned_member IN ('ilan', 'midlaj', 'hysam', 'alan')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no authentication required)
CREATE POLICY "Allow all operations on tasks" ON public.tasks
    FOR ALL USING (true);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    
    -- Set completed_at when task is marked as completed
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = TIMEZONE('utc'::TEXT, NOW());
    ELSIF NEW.completed = FALSE THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create daily_logs table for check-in/check-out tracking
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name TEXT NOT NULL CHECK (member_name IN ('ilan', 'midlaj', 'hysam', 'alan')),
    log_type TEXT NOT NULL CHECK (log_type IN ('check_in', 'check_out')),
    log_date DATE DEFAULT CURRENT_DATE NOT NULL, -- Explicit date for easier querying
    tasks_planned TEXT[], -- For check-in
    tasks_completed TEXT[], -- For check-out
    tomorrow_priority TEXT, -- For check-out
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create availability table for status tracking
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name TEXT NOT NULL CHECK (member_name IN ('ilan', 'midlaj', 'hysam', 'alan')),
    status TEXT NOT NULL CHECK (status IN ('available', 'leave', 'exam', 'busy', 'sick')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
CREATE POLICY "Allow all operations on daily_logs" ON public.daily_logs
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on availability" ON public.availability
    FOR ALL USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER set_updated_at_daily_logs
    BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_availability
    BEFORE UPDATE ON public.availability
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_member ON public.tasks(assigned_member);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON public.tasks(updated_at);
CREATE INDEX IF NOT EXISTS idx_daily_logs_member ON public.daily_logs(member_name);
CREATE INDEX IF NOT EXISTS idx_daily_logs_created_at ON public.daily_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_member_date ON public.daily_logs(member_name, log_date);
CREATE INDEX IF NOT EXISTS idx_availability_member ON public.availability(member_name);
CREATE INDEX IF NOT EXISTS idx_availability_dates ON public.availability(start_date, end_date);
