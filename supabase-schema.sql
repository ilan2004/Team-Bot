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

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_member ON public.tasks(assigned_member);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON public.tasks(updated_at);
