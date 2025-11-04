-- ==========================================
-- DATABASE CLEANUP SCRIPT - START FRESH
-- ==========================================
-- Run this script in your Supabase SQL Editor to delete all data and start clean

-- ==========================================
-- 1. DELETE ALL EXISTING DATA
-- ==========================================

-- Delete all tasks
DELETE FROM public.tasks;
PRINT 'Deleted all tasks';

-- Delete all daily logs (check-ins/check-outs)
DELETE FROM public.daily_logs;
PRINT 'Deleted all daily logs';

-- Delete all availability records
DELETE FROM public.availability;
PRINT 'Deleted all availability records';

-- ==========================================
-- 2. RESET AUTO-INCREMENT SEQUENCES (if any)
-- ==========================================
-- Note: PostgreSQL with UUID doesn't need sequence reset, but including for completeness

-- ==========================================
-- 3. VERIFY CLEANUP
-- ==========================================

-- Check that all tables are empty
SELECT 'tasks' as table_name, COUNT(*) as record_count FROM public.tasks
UNION ALL
SELECT 'daily_logs' as table_name, COUNT(*) as record_count FROM public.daily_logs
UNION ALL
SELECT 'availability' as table_name, COUNT(*) as record_count FROM public.availability;

-- ==========================================
-- 4. OPTIONAL: INSERT FRESH SAMPLE DATA
-- ==========================================

-- Uncomment the sections below if you want to start with some sample data

/*
-- Sample tasks for each team member
INSERT INTO public.tasks (title, assigned_member, completed) VALUES
('Setup project structure', 'ilan', false),
('Design initial wireframes', 'hysam', false),
('Research animation libraries', 'midlaj', false),
('Analyze user requirements', 'alan', false),
('Create database schema', 'ilan', true),
('Design app icons', 'hysam', false),
('Prototype character animations', 'midlaj', false),
('Research MBTI implementation', 'alan', false);
*/

/*
-- Sample availability records (current status)
INSERT INTO public.availability (member_name, status, start_date, end_date, reason) VALUES
('ilan', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Working on TestFlight deadline'),
('midlaj', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Animation tasks'),
('hysam', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Design work'),
('alan', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Research tasks');
*/

/*
-- Sample daily log entries
INSERT INTO public.daily_logs (member_name, log_type, tasks_planned, notes, mood) VALUES
('ilan', 'check_in', ARRAY['Setup project structure', 'Create database schema'], 'Ready to work on TestFlight tasks', 4),
('hysam', 'check_in', ARRAY['Design initial wireframes', 'Design app icons'], 'Focusing on UI design', 5),
('midlaj', 'check_in', ARRAY['Research animation libraries', 'Prototype character animations'], 'Working on animations', 4),
('alan', 'check_in', ARRAY['Analyze user requirements', 'Research MBTI implementation'], 'Research and analysis day', 3);
*/

-- ==========================================
-- 5. FINAL VERIFICATION
-- ==========================================

SELECT 
    'CLEANUP COMPLETE' as status,
    'All tables have been cleared and are ready for fresh data' as message;

-- Display current table counts after cleanup
SELECT 
    'Final Count Check:' as info,
    (SELECT COUNT(*) FROM public.tasks) as tasks_count,
    (SELECT COUNT(*) FROM public.daily_logs) as daily_logs_count,
    (SELECT COUNT(*) FROM public.availability) as availability_count;
