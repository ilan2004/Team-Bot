'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TeamMemberProfile } from '@/types';
import { useTeamStore } from '@/store/team-store';
import { LogIn, LogOut, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  sendSignInOutViDatabase,
  type SignInOutData 
} from '@/lib/whatsapp-service';

interface TeamStatusGridProps {
  members: TeamMemberProfile[];
}

export function TeamStatusGrid({ members }: TeamStatusGridProps) {
  const { getTodaysTasks, getTasksByMember, loadTasksFromDatabase, subscribeToRealTimeUpdates, checkIn, checkOut } = useTeamStore();
  const router = useRouter();
  const [signingIn, setSigningIn] = React.useState<string | null>(null);

  // Load real data on component mount
  React.useEffect(() => {
    loadTasksFromDatabase();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealTimeUpdates();
    
    return unsubscribe;
  }, [loadTasksFromDatabase, subscribeToRealTimeUpdates]);

  // Check if member has signed in today
  const hasSignedInToday = (memberId: string) => {
    const today = new Date().toDateString();
    const lastSignIn = localStorage.getItem(`lastSignIn_${memberId}`);
    return lastSignIn === today;
  };

  // Generate WhatsApp message with task details
  const generateWhatsAppMessage = (member: TeamMemberProfile, isSignIn: boolean) => {
    const todaysTasks = getTodaysTasks(member.id);
    const allTasks = getTasksByMember(member.id);
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let message = '';
    
    if (isSignIn) {
      message = `🚀 *Daily Check-in Report*\n`;
      message += `👋 Hi! ${member.name} has signed in for ${currentDate}\n\n`;
      message += `📋 *Today's Tasks (${todaysTasks.length}):*\n`;
      
      if (todaysTasks.length > 0) {
        todaysTasks.forEach((task, index) => {
          message += `${index + 1}. ${task.title}\n`;
        });
      } else {
        message += '• No specific tasks scheduled for today\n';
      }
      
      message += `\n📊 *Overall Progress:*\n`;
      message += `• Total Tasks: ${allTasks.length}\n`;
      message += `• Completed: ${completedTasks.length}\n`;
      message += `• Completion Rate: ${allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0}%\n\n`;
      message += `💪 Ready to tackle the day!`;
    } else {
      message = `✅ *Daily Check-out Report*\n`;
      message += `👋 ${member.name} is signing out for ${currentDate}\n\n`;
      message += `🎯 *Today's Accomplishments:*\n`;
      
      const todaysCompletedTasks = completedTasks.filter(task => {
        const today = new Date().toDateString();
        return task.completedAt && new Date(task.completedAt).toDateString() === today;
      });
      
      if (todaysCompletedTasks.length > 0) {
        todaysCompletedTasks.forEach((task, index) => {
          message += `✓ ${task.title}\n`;
        });
      } else {
        message += '• Working on ongoing tasks\n';
      }
      
      message += `\n📈 *Daily Summary:*\n`;
      message += `• Tasks Completed Today: ${todaysCompletedTasks.length}\n`;
      message += `• Overall Progress: ${allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0}%\n\n`;
      message += `🏠 Great work today! See you tomorrow!`;
    }

    return encodeURIComponent(message);
  };

  // Handle sign in/out with WhatsApp integration
  const handleSignInOut = async (member: TeamMemberProfile, isSignIn: boolean) => {
    setSigningIn(member.id);
    
    try {
      // Get task data for WhatsApp message
      const todaysTasks = getTodaysTasks(member.id);
      const allTasks = getTasksByMember(member.id);
      const completedTasks = allTasks.filter(task => task.status === 'completed');
      const todaysCompletedTasks = completedTasks.filter(task => {
        const today = new Date().toDateString();
        return task.completedAt && new Date(task.completedAt).toDateString() === today;
      });

      // Record sign in/out in local store
      if (isSignIn) {
        checkIn(member.id, 3, [], `Signed in for ${new Date().toDateString()}`);
        localStorage.setItem(`lastSignIn_${member.id}`, new Date().toDateString());
      } else {
        checkOut(member.id, 3, [], [], `Signed out for ${new Date().toDateString()}`);
        localStorage.removeItem(`lastSignIn_${member.id}`);
      }

      // Send to WhatsApp via database (bot service will pick it up)
      const whatsappData: SignInOutData = {
        member,
        isSignIn,
        todaysTasks,
        completedTasks,
        todaysCompletedTasks,
      };
      
      const success = await sendSignInOutViDatabase(whatsappData);
      
      if (success) {
        console.log(`Successfully logged ${isSignIn ? 'sign-in' : 'sign-out'} for ${member.name}`);
        // Show success feedback to user (optional)
      } else {
        console.error(`Failed to log ${isSignIn ? 'sign-in' : 'sign-out'} for ${member.name}`);
        // Could show error toast to user
      }
      
    } catch (error) {
      console.error('Error during sign in/out:', error);
    } finally {
      setSigningIn(null);
    }
  };

  // Handle card click to navigate to member page
  const handleCardClick = (memberId: string) => {
    router.push(`/dashboard/${memberId}`);
  };

  const statusColors = {
    available: 'bg-green-500',
    'on-leave': 'bg-yellow-500',
    exams: 'bg-blue-500',
    busy: 'bg-orange-500',
    sick: 'bg-red-500',
  };

  const statusLabels = {
    available: 'Available',
    'on-leave': 'On Leave',
    exams: 'Exams',
    busy: 'Busy',
    sick: 'Sick',
  };

  const moodEmojis = ['😟', '🙁', '😐', '🙂', '😄'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => {
            const todaysTasks = getTodaysTasks(member.id);
            const isSignedIn = hasSignedInToday(member.id);
            const isLoading = signingIn === member.id;
            
            return (
              <div 
                key={member.id} 
                className="border rounded-lg p-3 sm:p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleCardClick(member.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarFallback>
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{member.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {member.currentMood && (
                    <div className="text-base sm:text-lg flex-shrink-0" title={`Mood: ${member.currentMood}/5`}>
                      {moodEmojis[member.currentMood - 1]}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-start">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${statusColors[member.status]} text-white whitespace-nowrap`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-white mr-1 flex-shrink-0`} />
                    {statusLabels[member.status]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="truncate pr-2">Today's Tasks</span>
                    <span className="font-medium flex-shrink-0">{todaysTasks.length}</span>
                  </div>
                  
                  {member.weeklyTarget && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="truncate pr-2">Weekly Progress</span>
                        <span className="flex-shrink-0">{member.weeklyProgress}/{member.weeklyTarget}h</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  variant={isSignedIn ? "destructive" : "default"} 
                  size="sm" 
                  className="w-full text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleSignInOut(member, !isSignedIn);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : isSignedIn ? (
                    <>
                      <LogOut className="w-3 h-3 mr-1" />
                      Sign Out
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3 h-3 mr-1" />
                      Sign In Today
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
