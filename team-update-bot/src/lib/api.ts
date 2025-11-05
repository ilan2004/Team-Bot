/* eslint-disable no-console */
import { supabase, type DatabaseTask, type DatabaseDailyLog } from './supabase';
import type { Task, TeamMember, TeamStats } from '@/types';

// Re-export the type for use in other components
export type { DatabaseDailyLog };

// Convert database task to app task format
export function convertDbTaskToTask(dbTask: DatabaseTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: '',
    type: 'feature',
    priority: 'medium',
    status: dbTask.completed ? 'completed' : 'in-progress',
    assignee: dbTask.assigned_member,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
  };
}

// Convert app task to database task format
export function convertTaskToDbTask(task: Partial<Task>): Partial<DatabaseTask> {
  const dbTask: Partial<DatabaseTask> = {
    title: task.title,
    completed: task.status === 'completed',
    assigned_member: task.assignee,
  };
  
  // Set completed_at timestamp when task is completed
  if (task.status === 'completed' && task.completedAt) {
    dbTask.completed_at = task.completedAt.toISOString();
  } else if (task.status === 'completed' && !task.completedAt) {
    dbTask.completed_at = new Date().toISOString();
  } else if (task.status !== 'completed') {
    dbTask.completed_at = null;
  }
  
  // Always update the updated_at timestamp when making changes
  if (task.updatedAt) {
    dbTask.updated_at = task.updatedAt.toISOString();
  } else {
    dbTask.updated_at = new Date().toISOString();
  }
  
  return dbTask;
}

// Fetch all tasks from database
export async function fetchTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Error fetching tasks
      return [];
    }

    return data?.map(convertDbTaskToTask) || [];
  } catch {
    // Error fetching tasks
    return [];
  }
}

// Fetch tasks for a specific team member
export async function fetchTasksByMember(memberId: TeamMember): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_member', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      // Error fetching tasks by member
      return [];
    }

    return data?.map(convertDbTaskToTask) || [];
  } catch {
    // Error fetching tasks by member
    return [];
  }
}

// Create a new task
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
  try {
    const dbTask = convertTaskToDbTask(task);
    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
      .single();

    if (error) {
      // Error creating task
      return null;
    }

    return data ? convertDbTaskToTask(data) : null;
  } catch {
    // Error creating task
    return null;
  }
}

// Update a task
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    const dbUpdates = convertTaskToDbTask(updates);
    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      // Error updating task
      return null;
    }

    return data ? convertDbTaskToTask(data) : null;
  } catch {
    // Error updating task
    return null;
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      // Error deleting task
      return false;
    }

    return true;
  } catch {
    // Error deleting task
    return false;
  }
}

// Calculate real-time statistics
export async function calculateRealTimeStats(): Promise<TeamStats> {
  try {
    const tasks = await fetchTasks();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const blockedTasks = tasks.filter(task => task.status === 'blocked').length;
    
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate test flight progress based on actual milestones
    const defaultMilestones = [
      { progress: 0 }, // Character animations
      { progress: 0 }, // Onboarding UI  
      { progress: 0 }, // Screen Time API
      { progress: 0 }, // Frontend
      { progress: 0 }, // MBTI Questions
      { progress: 0 }, // Personality Cognitive Power
      { progress: 0 }, // Assets
    ];
    const testFlightProgress = defaultMilestones.reduce((acc, milestone) => acc + milestone.progress, 0) / defaultMilestones.length;
    
    const daysUntilDeadline = Math.ceil((new Date('2025-12-04').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      overallProgress,
      testFlightProgress,
      daysUntilDeadline,
    };
  } catch {
    // Error calculating stats
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
      overallProgress: 0,
      testFlightProgress: 0,
      daysUntilDeadline: Math.ceil((new Date('2025-12-04').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    };
  }
}

// Get today's tasks for a specific member
export async function getTodaysTasksByMember(memberId: TeamMember): Promise<Task[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const tasks = await fetchTasksByMember(memberId);
    
    return tasks.filter(task => 
      task.status !== 'completed' &&
      (!task.dueDate || (task.dueDate >= today && task.dueDate < tomorrow))
    );
  } catch {
    // Error getting today's tasks
    return [];
  }
}

// Create daily log entry for check-in/check-out
export async function createDailyLog(data: {
  memberName: TeamMember;
  logType: 'check_in' | 'check_out';
  logDate?: string; // Optional explicit date in YYYY-MM-DD format, defaults to today
  tasksPlanned?: string[];
  tasksCompleted?: string[];
  tomorrowPriority?: string;
  notes?: string;
}): Promise<boolean> {
  try {
    // Get current date in YYYY-MM-DD format if not provided
    const currentDate = data.logDate || new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_logs')
      .insert([
        {
          member_name: data.memberName,
          log_type: data.logType,
          log_date: currentDate,
          tasks_planned: data.tasksPlanned || null,
          tasks_completed: data.tasksCompleted || null,
          tomorrow_priority: data.tomorrowPriority || null,
          notes: data.notes || null,
        }
      ]);

    if (error) {
      console.error('Error creating daily log:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error creating daily log:', err);
    return false;
  }
}

// Real-time subscription for tasks
export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const subscription = supabase
    .channel('tasks')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      () => {
        // Fetch updated tasks when changes occur
        fetchTasks().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

// Real-time subscription for daily logs (sign-in/out events)
export function subscribeToDailyLogs(callback: (logs: DatabaseDailyLog[]) => void) {
  console.log('Setting up real-time subscription for daily_logs...');
  
  const subscription = supabase
    .channel('daily_logs_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'daily_logs' },
      (payload) => {
        console.log('Daily logs real-time update received:', payload);
        // Fetch updated daily logs when changes occur
        getDailyLogsByDate()
          .then(callback)
          .catch(error => console.error('Error fetching daily logs after real-time update:', error));
      }
    )
    .subscribe((status) => {
      console.log('Daily logs subscription status:', status);
    });

  return () => {
    console.log('Unsubscribing from daily logs real-time updates');
    supabase.removeChannel(subscription);
  };
}

// Combined subscription for both tasks and daily logs
export function subscribeToAllUpdates(
  tasksCallback: (tasks: Task[]) => void,
  dailyLogsCallback: (logs: DatabaseDailyLog[]) => void
) {
  const tasksUnsubscribe = subscribeToTasks(tasksCallback);
  const logsUnsubscribe = subscribeToDailyLogs(dailyLogsCallback);
  
  return () => {
    tasksUnsubscribe();
    logsUnsubscribe();
  };
}

// Daily Log Helper Functions

// Get daily logs for a specific member and date
export async function getDailyLogsByMemberAndDate(
  memberName: TeamMember, 
  date?: string // YYYY-MM-DD format, defaults to today
): Promise<DatabaseDailyLog[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('member_name', memberName)
      .eq('log_date', targetDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching daily logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching daily logs:', err);
    return [];
  }
}

// Get all daily logs for a specific date
export async function getDailyLogsByDate(date?: string): Promise<DatabaseDailyLog[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('log_date', targetDate)
      .order('member_name', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching daily logs by date:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching daily logs by date:', err);
    return [];
  }
}

// Check if a member is currently signed in today (considers both check-in and check-out)
export async function hasMemberSignedInToday(memberName: TeamMember, date?: string): Promise<boolean> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Get all logs for this member today, ordered by creation time (most recent first)
    const { data, error } = await supabase
      .from('daily_logs')
      .select('log_type, created_at')
      .eq('member_name', memberName)
      .eq('log_date', targetDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }

    if (!data || data.length === 0) {
      return false; // No logs today means not signed in
    }

    // The most recent log determines the current status
    const mostRecentLog = data[0];
    return mostRecentLog.log_type === 'check_in';
  } catch (err) {
    console.error('Error checking sign-in status:', err);
    return false;
  }
}

// Check if a member has signed out today
export async function hasMemberSignedOutToday(memberName: TeamMember, date?: string): Promise<boolean> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('member_name', memberName)
      .eq('log_type', 'check_out')
      .eq('log_date', targetDate)
      .limit(1);

    if (error) {
      console.error('Error checking sign-out status:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (err) {
    console.error('Error checking sign-out status:', err);
    return false;
  }
}

// Get daily logs for a member within a date range
export async function getDailyLogsByMemberAndDateRange(
  memberName: TeamMember,
  startDate: string, // YYYY-MM-DD format
  endDate: string    // YYYY-MM-DD format
): Promise<DatabaseDailyLog[]> {
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('member_name', memberName)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching daily logs by date range:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching daily logs by date range:', err);
    return [];
  }
}

// Availability Management Functions

// Create or update availability status
export async function createAvailabilityRecord(data: {
  memberName: TeamMember;
  status: 'available' | 'leave' | 'exam' | 'busy' | 'sick';
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  reason?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('availability')
      .insert([
        {
          member_name: data.memberName,
          status: data.status,
          start_date: data.startDate,
          end_date: data.endDate,
          reason: data.reason || null,
        }
      ]);

    if (error) {
      console.error('Error creating availability record:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error creating availability record:', err);
    return false;
  }
}

// Get current availability status for a member
export async function getMemberAvailability(memberName: TeamMember): Promise<{
  status: 'available' | 'leave' | 'exam' | 'busy' | 'sick';
  startDate?: string;
  endDate?: string;
  reason?: string;
} | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('member_name', memberName)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching member availability:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return { status: 'available' };
    }

    const record = data[0];
    return {
      status: record.status,
      startDate: record.start_date,
      endDate: record.end_date,
      reason: record.reason,
    };
  } catch (err) {
    console.error('Error fetching member availability:', err);
    return null;
  }
}

// Get all availability records for a date range
export async function getAvailabilityForDateRange(
  startDate: string,
  endDate: string
): Promise<Array<{
  id: string;
  memberName: TeamMember;
  status: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching availability records:', error);
      return [];
    }

    return (data || []).map(record => ({
      id: record.id,
      memberName: record.member_name,
      status: record.status,
      startDate: record.start_date,
      endDate: record.end_date,
      reason: record.reason,
      createdAt: record.created_at,
    }));
  } catch (err) {
    console.error('Error fetching availability records:', err);
    return [];
  }
}

// Get leave summary for a specific month
export async function getMonthlyLeaveSummary(year: number, month: number): Promise<{
  [key: string]: Array<{
    memberName: TeamMember;
    status: string;
    startDate: string;
    endDate: string;
    reason: string | null;
  }>;
}> {
  try {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const records = await getAvailabilityForDateRange(startDate, endDate);
    
    // Group by date
    const summary: { [key: string]: Array<any> } = {};
    
    records.forEach(record => {
      const start = new Date(record.startDate);
      const end = new Date(record.endDate);
      
      // Generate all dates in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        
        if (!summary[dateKey]) {
          summary[dateKey] = [];
        }
        
        summary[dateKey].push({
          memberName: record.memberName,
          status: record.status,
          startDate: record.startDate,
          endDate: record.endDate,
          reason: record.reason,
        });
      }
    });
    
    return summary;
  } catch (err) {
    console.error('Error fetching monthly leave summary:', err);
    return {};
  }
}

// Get team attendance summary for a specific date
export async function getTeamAttendanceSummary(date?: string): Promise<{
  date: string;
  signedIn: TeamMember[];
  signedOut: TeamMember[];
  notSignedIn: TeamMember[];
}> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const allMembers: TeamMember[] = ['ilan', 'midlaj', 'hysam', 'alan'];
    
    const logs = await getDailyLogsByDate(targetDate);
    
    const signedInMembers = logs
      .filter(log => log.log_type === 'check_in')
      .map(log => log.member_name);
      
    const signedOutMembers = logs
      .filter(log => log.log_type === 'check_out')
      .map(log => log.member_name);
    
    const notSignedIn = allMembers.filter(member => !signedInMembers.includes(member));
    
    return {
      date: targetDate,
      signedIn: Array.from(new Set(signedInMembers)), // Remove duplicates
      signedOut: Array.from(new Set(signedOutMembers)), // Remove duplicates
      notSignedIn
    };
  } catch (err) {
    console.error('Error getting team attendance summary:', err);
    const targetDate = date || new Date().toISOString().split('T')[0];
    return {
      date: targetDate,
      signedIn: [],
      signedOut: [],
      notSignedIn: ['ilan', 'midlaj', 'hysam', 'alan']
    };
  }
}
