import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on the schema
export interface DatabaseTask {
  id: string;
  title: string;
  completed: boolean;
  assigned_member: 'ilan' | 'midlaj' | 'hysam' | 'alan';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// Database type for daily logs
export interface DatabaseDailyLog {
  id: string;
  member_name: 'ilan' | 'midlaj' | 'hysam' | 'alan';
  log_type: 'check_in' | 'check_out';
  log_date: string; // Date in YYYY-MM-DD format
  tasks_planned: string[] | null;
  tasks_completed: string[] | null;
  tomorrow_priority: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
