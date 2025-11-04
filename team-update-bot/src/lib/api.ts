import { supabase, type DatabaseTask } from './supabase';
import type { Task, TeamMember, TeamStats } from '@/types';

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
  return {
    title: task.title,
    completed: task.status === 'completed',
    assigned_member: task.assignee,
  };
}

// Fetch all tasks from database
export async function fetchTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data?.map(convertDbTaskToTask) || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
      console.error('Error fetching tasks by member:', error);
      return [];
    }

    return data?.map(convertDbTaskToTask) || [];
  } catch (error) {
    console.error('Error fetching tasks by member:', error);
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
      console.error('Error creating task:', error);
      return null;
    }

    return data ? convertDbTaskToTask(data) : null;
  } catch (error) {
    console.error('Error creating task:', error);
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
      console.error('Error updating task:', error);
      return null;
    }

    return data ? convertDbTaskToTask(data) : null;
  } catch (error) {
    console.error('Error updating task:', error);
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
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
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
    
    // Calculate test flight progress based on completed milestones
    const testFlightProgress = overallProgress; // Simplified for now
    
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
  } catch (error) {
    console.error('Error calculating stats:', error);
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
  } catch (error) {
    console.error('Error getting today\'s tasks:', error);
    return [];
  }
}

// Create daily log entry for check-in/check-out
export async function createDailyLog(data: {
  memberName: TeamMember;
  logType: 'check_in' | 'check_out';
  tasksPlanned?: string[];
  tasksCompleted?: string[];
  tomorrowPriority?: string;
  notes?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('daily_logs')
      .insert([
        {
          member_name: data.memberName,
          log_type: data.logType,
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
  } catch (error) {
    console.error('Error creating daily log:', error);
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
