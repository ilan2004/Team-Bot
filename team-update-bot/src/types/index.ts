import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

// Team Management Types
export type TeamMember = 'ilan' | 'midlaj' | 'hysam' | 'alan';

export type TaskType = 'feature' | 'bug' | 'research' | 'review' | 'asset' | 'animation';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'blocked';

export type AvailabilityStatus = 'available' | 'on-leave' | 'exams' | 'busy' | 'sick';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  assignee: TeamMember;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[]; // Task IDs
  goalId?: string;
  tags?: string[];
  completedAt?: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  type: 'weekly' | 'monthly' | 'milestone';
  priority: Priority;
}

export interface TeamMemberProfile {
  id: TeamMember;
  name: string;
  role: string;
  avatar?: string;
  status: AvailabilityStatus;
  currentMood?: MoodLevel;
  leaveStart?: Date;
  leaveEnd?: Date;
  leaveReason?: string;
  todaysTasks: string[]; // Task IDs
  weeklyTarget?: number; // Hours or points
  weeklyProgress?: number;
}

export interface CheckIn {
  id: string;
  memberId: TeamMember;
  date: Date;
  type: 'check-in' | 'check-out';
  mood: MoodLevel;
  plannedTasks?: string[]; // For check-in
  completedTasks?: string[]; // For check-out
  blockers?: string[];
  notes?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  progress: number;
  isComplete: boolean;
  tasks: string[];
  priority: Priority;
}

// Dec 4 Test Flight specific milestones
export interface TestFlightMilestone {
  id: string;
  title: string;
  description: string;
  assignee: TeamMember;
  progress: number;
  isComplete: boolean;
  tasks: string[];
}

export interface TeamStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overallProgress: number;
  testFlightProgress: number;
  daysUntilDeadline: number;
}

export interface DailyActivity {
  date: Date;
  checkedIn: TeamMember[];
  checkedOut: TeamMember[];
  tasksCompleted: number;
  blockers: string[];
}
