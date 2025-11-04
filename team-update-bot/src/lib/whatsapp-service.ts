// WhatsApp Bot Service Integration (Baileys Implementation)
import { TeamMemberProfile } from '@/types';

// WhatsApp configuration for existing Baileys service
const WHATSAPP_CONFIG = {
  // Local WhatsApp bot service endpoint (your existing service)
  BOT_SERVICE_URL: process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL || 'http://localhost:3001',
  API_ENDPOINT: '/api/send-message', // Custom endpoint we'll create
  GROUP_ID: process.env.WHATSAPP_GROUP_ID || '', // Your team group chat ID
  // Member display names matching your existing service
  MEMBER_DISPLAY_NAMES: {
    ilan: 'Ilan',
    midlaj: 'Midlaj',
    hysam: 'Hysam',
    alan: 'Alan',
  } as const
};

export interface WhatsAppMessage {
  to: string; // Phone number or group ID
  message: string;
  type?: 'text' | 'template';
}

export interface SignInOutData {
  member: TeamMemberProfile;
  isSignIn: boolean;
  todaysTasks: any[];
  completedTasks: any[];
  todaysCompletedTasks: any[];
}

// Generate formatted WhatsApp message
export const generateWhatsAppMessage = (data: SignInOutData): string => {
  const { member, isSignIn, todaysTasks, completedTasks, todaysCompletedTasks } = data;
  
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let message = '';
  
  if (isSignIn) {
    message = `🚀 *Daily Check-in Report*\n`;
    message += `👋 Hi team! ${member.name} has signed in for ${currentDate}\n\n`;
    message += `📋 *Today's Tasks (${todaysTasks.length}):*\n`;
    
    if (todaysTasks.length > 0) {
      todaysTasks.forEach((task, index) => {
        message += `${index + 1}. ${task.title}\n`;
      });
    } else {
      message += '• No specific tasks scheduled for today\n';
    }
    
    message += `\n📊 *Overall Progress:*\n`;
    message += `• Total Tasks: ${completedTasks.length + (todaysTasks.length - todaysCompletedTasks.length)}\n`;
    message += `• Completed: ${completedTasks.length}\n`;
    message += `• Completion Rate: ${completedTasks.length > 0 ? Math.round((completedTasks.length / (completedTasks.length + todaysTasks.length)) * 100) : 0}%\n\n`;
    message += `💪 Ready to tackle the day! Let's go team! 🎯`;
  } else {
    message = `✅ *Daily Check-out Report*\n`;
    message += `👋 ${member.name} is signing out for ${currentDate}\n\n`;
    message += `🎯 *Today's Accomplishments:*\n`;
    
    if (todaysCompletedTasks.length > 0) {
      todaysCompletedTasks.forEach((task) => {
        message += `✓ ${task.title}\n`;
      });
    } else {
      message += '• Working on ongoing tasks\n';
    }
    
    message += `\n📈 *Daily Summary:*\n`;
    message += `• Tasks Completed Today: ${todaysCompletedTasks.length}\n`;
    message += `• Overall Progress: ${completedTasks.length > 0 ? Math.round((completedTasks.length / (completedTasks.length + todaysTasks.length)) * 100) : 0}%\n\n`;
    message += `🏠 Great work today! See you tomorrow! 👏`;
  }

  return message;
};

// Send sign-in/out via database (WhatsApp bot service will pick it up)
import { createDailyLog } from './api';

export const sendSignInOutViDatabase = async (data: SignInOutData): Promise<boolean> => {
  try {
    // Extract task titles for the database entry
    const tasksPlanned = data.isSignIn ? data.todaysTasks.map(task => task.title) : undefined;
    const tasksCompleted = !data.isSignIn ? data.todaysCompletedTasks.map(task => task.title) : undefined;
    
    // Create daily log entry that WhatsApp bot service will pick up
    const success = await createDailyLog({
      memberName: data.member.id,
      logType: data.isSignIn ? 'check_in' : 'check_out',
      tasksPlanned: tasksPlanned,
      tasksCompleted: tasksCompleted,
      tomorrowPriority: !data.isSignIn ? 'Continue with current tasks' : undefined,
      notes: `${data.isSignIn ? 'Signed in' : 'Signed out'} via Team Update Bot`,
    });

    if (success) {
      // Daily log created successfully
      return true;
    } else {
      // Failed to create daily log entry
      return false;
    }
  } catch {
    // Error sending sign-in/out via database
    return false;
  }
};

// Basic WhatsApp message sending function (placeholder for direct API calls)
const sendWhatsAppMessage = async (messageData: WhatsAppMessage): Promise<boolean> => {
  try {
    // This would integrate with your existing Baileys WhatsApp bot service
    // For now, we'll just use the database approach via sendSignInOutViDatabase
    return true;
  } catch {
    return false;
  }
};

// Send to team group
export const sendToTeamGroup = async (data: SignInOutData): Promise<boolean> => {
  // For now, we'll use the database approach which your existing bot monitors
  return await sendSignInOutViDatabase(data);
};

// Send to individual member
export const sendToMember = async (data: SignInOutData): Promise<boolean> => {
  // For now, we'll use the database approach which your existing bot monitors
  return await sendSignInOutViDatabase(data);
};

// Send to both group and member
export const sendSignInOutNotification = async (data: SignInOutData): Promise<{
  groupSent: boolean;
  memberSent: boolean;
}> => {
  const [groupSent, memberSent] = await Promise.all([
    sendToTeamGroup(data),
    sendToMember(data)
  ]);
  
  return { groupSent, memberSent };
};

// Check if WhatsApp bot service is configured
export const isWhatsAppBotConfigured = (): boolean => {
  return !!(WHATSAPP_CONFIG.BOT_SERVICE_URL);
};

// Get member display name
export const getMemberDisplayName = (memberId: string): string => {
  return WHATSAPP_CONFIG.MEMBER_DISPLAY_NAMES[memberId as keyof typeof WHATSAPP_CONFIG.MEMBER_DISPLAY_NAMES] || memberId;
};
