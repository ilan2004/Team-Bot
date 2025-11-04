import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  TeamMember, 
  Task, 
  TeamMemberProfile, 
  CheckIn, 
  TeamStats, 
  TestFlightMilestone,
  AvailabilityStatus,
  MoodLevel 
} from '@/types';
import {
  fetchTasks,
  fetchTasksByMember,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  calculateRealTimeStats,
  getTodaysTasksByMember,
  subscribeToTasks
} from '@/lib/api';

interface TeamStore {
  // Team Members
  teamMembers: TeamMemberProfile[];
  
  // Tasks
  tasks: Task[];
  
  // Check-ins
  checkIns: CheckIn[];
  
  // Test Flight Milestones
  testFlightMilestones: TestFlightMilestone[];
  
  // Statistics
  stats: TeamStats;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  
  // Team member actions
  updateMemberStatus: (memberId: TeamMember, status: AvailabilityStatus, leaveDetails?: { start?: Date; end?: Date; reason?: string }) => void;
  
  // Check-in actions
  checkIn: (memberId: TeamMember, plannedTasks?: string[], notes?: string) => void;
  checkOut: (memberId: TeamMember, completedTasks?: string[], blockers?: string[], notes?: string) => void;
  
  // Milestone actions
  updateMilestoneProgress: (milestoneId: string, progress: number) => void;
  
  // Utility actions
  getTasksByMember: (memberId: TeamMember) => Task[];
  getTodaysTasks: (memberId: TeamMember) => Task[];
  calculateStats: () => void;
  
  // Database integration actions
  loadTasksFromDatabase: () => Promise<void>;
  loadTasksFromDatabaseByMember: (memberId: TeamMember) => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  subscribeToRealTimeUpdates: () => () => void;
}

const defaultTeamMembers: TeamMemberProfile[] = [
  {
    id: 'ilan',
    name: 'Ilan',
    role: 'Development (iOS App Development & Backend)',
    status: 'available',
    todaysTasks: [],
  },
  {
    id: 'midlaj',
    name: 'Midlaj',
    role: 'Animation (UI Animations & Interactions)',
    status: 'available',
    todaysTasks: [],
  },
  {
    id: 'hysam',
    name: 'Hysam',
    role: 'Design (UI/UX Design & Assets)',
    status: 'available',
    todaysTasks: [],
  },
  {
    id: 'alan',
    name: 'Alan',
    role: 'Research (R&D & Technical Research)',
    status: 'available',
    todaysTasks: [],
  },
];

const defaultTestFlightMilestones: TestFlightMilestone[] = [
  {
    id: 'character-animations',
    title: '2 Character Idle & Focused Animation',
    description: 'Create idle and focused state animations for 2 main characters',
    assignee: 'midlaj',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
  {
    id: 'onboarding-ui',
    title: 'Onboarding UI',
    description: 'Complete user onboarding interface and flow',
    assignee: 'hysam',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
  {
    id: 'screen-time-api',
    title: 'Screen Time API',
    description: 'Implement iOS Screen Time API integration',
    assignee: 'ilan',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Complete frontend implementation and integration',
    assignee: 'ilan',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
  {
    id: 'mbti-questions',
    title: 'MBTI Questions',
    description: 'Research and implement MBTI personality test questions',
    assignee: 'alan',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
  {
    id: 'personality-cognitive-power',
    title: 'Personality Type Cognitive Power',
    description: 'Define cognitive powers for each personality type',
    assignee: 'alan',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
  {
    id: 'assets',
    title: 'Assets',
    description: 'Create and organize all required visual assets',
    assignee: 'hysam',
    progress: 0,
    isComplete: false,
    tasks: [],
  },
];

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teamMembers: defaultTeamMembers,
      tasks: [],
      checkIns: [],
      testFlightMilestones: defaultTestFlightMilestones,
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        overallProgress: 0,
        testFlightProgress: 0,
        daysUntilDeadline: Math.ceil((new Date('2025-12-04').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      },

      addTask: async (taskData) => {
        // Try to create task in database first
        const newTask = await apiCreateTask(taskData);
        if (newTask) {
          set((state) => ({
            tasks: [...state.tasks, newTask],
          }));
        } else {
          // Fallback to local storage if database fails
          const fallbackTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            tasks: [...state.tasks, fallbackTask],
          }));
        }
        get().calculateStats();
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
        get().calculateStats();
      },

      completeTask: (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (task) {
          get().updateTask(taskId, {
            status: 'completed',
            completedAt: new Date(),
          });
        }
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
        get().calculateStats();
      },

      updateMemberStatus: (memberId, status, leaveDetails) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  status,
                  leaveStart: leaveDetails?.start,
                  leaveEnd: leaveDetails?.end,
                  leaveReason: leaveDetails?.reason,
                }
              : member
          ),
        }));
      },


      checkIn: (memberId, plannedTasks, notes) => {
        const checkIn: CheckIn = {
          id: crypto.randomUUID(),
          memberId,
          date: new Date(),
          type: 'check-in',
          plannedTasks,
          notes,
        };
        set((state) => ({
          checkIns: [...state.checkIns, checkIn],
        }));
      },

      checkOut: (memberId, completedTasks, blockers, notes) => {
        const checkOut: CheckIn = {
          id: crypto.randomUUID(),
          memberId,
          date: new Date(),
          type: 'check-out',
          completedTasks,
          blockers,
          notes,
        };
        set((state) => ({
          checkIns: [...state.checkIns, checkOut],
        }));
      },

      updateMilestoneProgress: (milestoneId, progress) => {
        set((state) => ({
          testFlightMilestones: state.testFlightMilestones.map((milestone) =>
            milestone.id === milestoneId
              ? { ...milestone, progress, isComplete: progress >= 100 }
              : milestone
          ),
        }));
        get().calculateStats();
      },

      getTasksByMember: (memberId) => {
        return get().tasks.filter((task) => task.assignee === memberId);
      },

      getTodaysTasks: (memberId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().tasks.filter((task) => 
          task.assignee === memberId && 
          task.status !== 'completed' &&
          (!task.dueDate || (task.dueDate >= today && task.dueDate < tomorrow))
        );
      },

      calculateStats: async () => {
        // Try to get real-time stats from database first
        try {
          const realTimeStats = await calculateRealTimeStats();
          set({ stats: realTimeStats });
        } catch (error) {
          // Fallback to local calculation
          const { tasks, testFlightMilestones } = get();
          
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.status === 'completed').length;
          const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
          const blockedTasks = tasks.filter(task => task.status === 'blocked').length;
          
          const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          
          // Calculate test flight progress from all milestones
          const testFlightProgress = testFlightMilestones.length > 0 
            ? testFlightMilestones.reduce((acc, milestone) => acc + milestone.progress, 0) / testFlightMilestones.length
            : 0;
          
          const daysUntilDeadline = Math.ceil((new Date('2025-12-04').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          set({
            stats: {
              totalTasks,
              completedTasks,
              inProgressTasks,
              blockedTasks,
              overallProgress,
              testFlightProgress,
              daysUntilDeadline,
            },
          });
        }
      },

      // Database integration methods
      loadTasksFromDatabase: async () => {
        try {
          const tasks = await fetchTasks();
          set({ tasks });
          get().calculateStats();
        } catch (error) {
          console.error('Failed to load tasks from database:', error);
        }
      },

      loadTasksFromDatabaseByMember: async (memberId) => {
        try {
          const memberTasks = await fetchTasksByMember(memberId);
          // Merge with existing tasks, avoiding duplicates
          set((state) => {
            const existingTaskIds = new Set(state.tasks.map(task => task.id));
            const newTasks = memberTasks.filter(task => !existingTaskIds.has(task.id));
            return {
              tasks: [...state.tasks, ...newTasks]
            };
          });
        } catch (error) {
          console.error('Failed to load tasks for member:', error);
        }
      },

      syncWithDatabase: async () => {
        try {
          await get().loadTasksFromDatabase();
          console.log('Successfully synced with database');
        } catch (error) {
          console.error('Failed to sync with database:', error);
        }
      },

      subscribeToRealTimeUpdates: () => {
        const unsubscribe = subscribeToTasks((tasks) => {
          set({ tasks });
          get().calculateStats();
        });
        return unsubscribe;
      },
    }),
    {
      name: 'team-store',
      version: 4, // Increment version after removing export milestone
    }
  )
);
