-- SAMPLE DATA FOR TEAM UPDATE BOT
-- Run this after cleanup to start with some sample tasks and data

-- Insert sample tasks for TestFlight milestone
INSERT INTO public.tasks (title, assigned_member, completed) VALUES
-- Ilan's tasks (Development)
('Setup iOS project structure', 'ilan', true),
('Implement Screen Time API integration', 'ilan', false), 
('Create user authentication flow', 'ilan', false),
('Setup backend API endpoints', 'ilan', false),
('Integrate database with app', 'ilan', true),

-- Hysam's tasks (Design)  
('Design onboarding UI screens', 'hysam', false),
('Create app icon and assets', 'hysam', false),
('Design character selection screen', 'hysam', true),
('Create mood tracking interface', 'hysam', false),
('Design settings and profile screens', 'hysam', false),

-- Midlaj's tasks (Animation)
('Create character idle animations', 'midlaj', false),
('Design character focused state animations', 'midlaj', false), 
('Implement UI transition animations', 'midlaj', false),
('Create onboarding animation sequence', 'midlaj', true),

-- Alan's tasks (Research)
('Research MBTI personality types', 'alan', true),
('Define cognitive powers for each type', 'alan', false),
('Create personality assessment questions', 'alan', false),
('Research user engagement strategies', 'alan', true);

-- Set current availability status for all members
INSERT INTO public.availability (member_name, status, start_date, end_date, reason) VALUES
('ilan', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Working on TestFlight deadline'),
('midlaj', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Animation tasks for TestFlight'),
('hysam', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Design work for TestFlight'), 
('alan', 'available', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Research tasks for TestFlight');

-- Add some recent check-in logs
INSERT INTO public.daily_logs (member_name, log_type, tasks_planned, notes, mood) VALUES
('ilan', 'check_in', ARRAY['Implement Screen Time API integration', 'Create user authentication flow'], 'Focusing on core iOS functionality today', 4),
('hysam', 'check_in', ARRAY['Design onboarding UI screens', 'Create mood tracking interface'], 'Working on user experience design', 5),
('midlaj', 'check_in', ARRAY['Create character idle animations', 'Design character focused state animations'], 'Animation work for characters', 4),
('alan', 'check_in', ARRAY['Define cognitive powers for each type', 'Create personality assessment questions'], 'Research and content creation', 3);

-- Verify data insertion
SELECT 'Data inserted successfully!' as status;

-- Show summary of inserted data
SELECT 
    'Summary:' as info,
    (SELECT COUNT(*) FROM public.tasks) as total_tasks,
    (SELECT COUNT(*) FROM public.tasks WHERE completed = true) as completed_tasks,
    (SELECT COUNT(*) FROM public.daily_logs) as daily_logs,
    (SELECT COUNT(*) FROM public.availability) as availability_records;
