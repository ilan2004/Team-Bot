-- Migration script to add log_date column to existing daily_logs table
-- Run this script if you have an existing daily_logs table without the log_date column

-- Add the log_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='daily_logs' 
        AND column_name='log_date'
    ) THEN
        -- Add the log_date column with default value
        ALTER TABLE public.daily_logs 
        ADD COLUMN log_date DATE DEFAULT CURRENT_DATE NOT NULL;
        
        -- Update existing records to set log_date based on created_at
        UPDATE public.daily_logs 
        SET log_date = DATE(created_at AT TIME ZONE 'UTC')
        WHERE log_date IS NULL;
        
        -- Create indexes for the new column
        CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(log_date);
        CREATE INDEX IF NOT EXISTS idx_daily_logs_member_date ON public.daily_logs(member_name, log_date);
        
        RAISE NOTICE 'Successfully added log_date column and indexes to daily_logs table';
    ELSE
        RAISE NOTICE 'log_date column already exists in daily_logs table';
    END IF;
END $$;
