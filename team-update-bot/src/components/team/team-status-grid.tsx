'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TeamMemberProfile } from '@/types';
import { useTeamStore } from '@/store/team-store';
import { LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  sendSignInOutViDatabase,
  type SignInOutData 
} from '@/lib/whatsapp-service';
import { 
  hasMemberSignedInToday
} from '@/lib/api';

interface TeamStatusGridProps {
  members: TeamMemberProfile[];
}

export function TeamStatusGrid({ members }: TeamStatusGridProps) {
  const { getTodaysTasks, getTasksByMember, loadTasksFromDatabase, subscribeToRealTimeUpdates, checkIn, checkOut } = useTeamStore();
  const router = useRouter();
  const [signingIn, setSigningIn] = React.useState<string | null>(null);
  const [memberSignInStatus, setMemberSignInStatus] = React.useState<Record<string, boolean>>({});
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());

  // Function to check and update sign-in status for all members
  const checkAllMembersSignInStatus = React.useCallback(async () => {
    console.log('Refreshing sign-in status for all members...');
    const statusPromises = members.map(async (member) => {
      const hasSignedIn = await hasMemberSignedInToday(member.id as any);
      return { memberId: member.id, hasSignedIn };
    });
    
    const results = await Promise.all(statusPromises);
    const statusMap = results.reduce((acc, { memberId, hasSignedIn }) => {
      acc[memberId] = hasSignedIn;
      return acc;
    }, {} as Record<string, boolean>);
    
    console.log('Database sign-in status:', statusMap);
    setMemberSignInStatus(statusMap);
    setLastRefresh(new Date());
  }, [members]);

  // Manual refresh function for debugging
  const forceRefreshStatus = React.useCallback(() => {
    console.log('Force refreshing sign-in status...');
    checkAllMembersSignInStatus();
  }, [checkAllMembersSignInStatus]);


  // Load real data and set up polling-based sync
  React.useEffect(() => {
    loadTasksFromDatabase();
    checkAllMembersSignInStatus();
    
    // Subscribe to real-time updates for tasks only
    const unsubscribeTasks = subscribeToRealTimeUpdates();
    
    // Set up polling for sign-in status (every 10 seconds)
    const pollInterval = setInterval(() => {
      checkAllMembersSignInStatus();
    }, 10000); // Poll every 10 seconds
    
    // Also poll when window gains focus (user switches back to tab)
    const handleFocus = () => {
      console.log('Window focused, refreshing sign-in status...');
      checkAllMembersSignInStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      unsubscribeTasks();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadTasksFromDatabase, subscribeToRealTimeUpdates, checkAllMembersSignInStatus]);

  // Check if member has signed in today (using database state)
  const hasSignedInToday = (memberId: string) => {
    return memberSignInStatus[memberId] || false;
  };


  // Handle sign in/out with WhatsApp integration
  const handleSignInOut = async (member: TeamMemberProfile, isSignIn: boolean) => {
    setSigningIn(member.id);
    
    try {
      // Get current date for logging
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Get task data for WhatsApp message
      const todaysTasks = getTodaysTasks(member.id);
      const allTasks = getTasksByMember(member.id);
      const completedTasks = allTasks.filter(task => task.status === 'completed');
      const todaysCompletedTasks = completedTasks.filter(task => {
        const today = new Date().toDateString();
        return task.completedAt && new Date(task.completedAt).toDateString() === today;
      });

      // Record sign in/out in local store (for compatibility)
      if (typeof window !== 'undefined') {
        if (isSignIn) {
          checkIn(member.id, [], `Signed in for ${currentDate}`);
        } else {
          checkOut(member.id, [], [], `Signed out for ${currentDate}`);
        }
      }

      // Send to WhatsApp via database with explicit date (bot service will pick it up)
      const whatsappData: SignInOutData = {
        member,
        isSignIn,
        todaysTasks,
        completedTasks,
        todaysCompletedTasks,
      };
      
      const success = await sendSignInOutViDatabase(whatsappData, currentDate);
      
      if (success) {
        console.log(`Successfully ${isSignIn ? 'signed in' : 'signed out'} ${member.name} on ${currentDate}`);
        // Immediately refresh sign-in status after successful operation
        setTimeout(() => {
          checkAllMembersSignInStatus();
        }, 500); // Small delay to ensure database is updated
      } else {
        console.error(`Failed to ${isSignIn ? 'sign in' : 'sign out'} ${member.name} on ${currentDate}`);
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


  return (
    <Card>
      <CardHeader>
        <CardTitle 
          onDoubleClick={forceRefreshStatus}
          className="cursor-pointer select-none"
          title="Double-click to refresh sign-in status"
        >
          Team Members
          <span className="text-xs text-muted-foreground ml-2">
            (Last updated: {lastRefresh.toLocaleTimeString()})
          </span>
        </CardTitle>
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
                    <span className="truncate pr-2">Today&apos;s Tasks</span>
                    <span className="font-medium flex-shrink-0">{todaysTasks.length}</span>
                  </div>
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
