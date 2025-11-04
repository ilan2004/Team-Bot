-- SIMPLE DATABASE CLEANUP - DELETE ALL DATA
-- Copy and paste this into Supabase SQL Editor

-- Delete all data from tables
DELETE FROM public.tasks;
DELETE FROM public.daily_logs;  
DELETE FROM public.availability;

-- Verify tables are empty
SELECT 'tasks' as table_name, COUNT(*) as record_count FROM public.tasks
UNION ALL
SELECT 'daily_logs' as table_name, COUNT(*) as record_count FROM public.daily_logs
UNION ALL  
SELECT 'availability' as table_name, COUNT(*) as record_count FROM public.availability;
