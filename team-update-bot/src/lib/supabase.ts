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
