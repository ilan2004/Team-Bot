'use client';

import React, { useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMember } from '@/types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Target, 
  TrendingUp,
  User,
  LogIn
} from 'lucide-react';
import { format } from 'date-fns';
import { SimpleTaskForm } from './simple-task-form';
import { TaskList } from './task-list';
import { CheckInDialog } from './check-in-dialog';
import { StatusUpdateDialog } from './status-update-dialog';

interface MemberPageProps {
  memberId: TeamMember;
}

export function MemberPage({ memberId }: MemberPageProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  
  const { teamMembers, getTasksByMember, getTodaysTasks, loadMemberAvailabilityFromDatabase } = useTeamStore();

  // Load member availability on component mount
  React.useEffect(() => {
    loadMemberAvailabilityFromDatabase(memberId);
  }, [memberId, loadMemberAvailabilityFromDatabase]);
  
  const member = teamMembers.find(m => m.id === memberId);
  const allTasks = getTasksByMember(memberId);
  const todaysTasks = getTodaysTasks(memberId);
  
  if (!member) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Member not found</h2>
          <p className="text-muted-foreground">The requested team member could not be found.</p>
        </div>
      </div>
    );
  }

  const completedTasks = allTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = allTasks.filter(task => task.status === 'in-progress').length;
  const memberProgress = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Mobile-first header layout */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarFallback className="text-lg sm:text-2xl">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{member.name}</h1>
              <p className="text-muted-foreground truncate">{member.role}</p>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${statusColors[member.status]} text-white`}
                  >
                    <div className="w-2 h-2 rounded-full bg-white mr-1" />
                    {statusLabels[member.status]}
                  </Badge>
                </div>
                
                {/* Show leave dates if member is on leave */}
                {member.status !== 'available' && member.leaveStart && (
                  <div className="text-xs text-muted-foreground">
                    {member.leaveEnd && member.leaveStart !== member.leaveEnd ? (
                      <span>
                        📅 {format(member.leaveStart, 'MMM dd')} - {format(member.leaveEnd, 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span>
                        📅 {format(member.leaveStart, 'MMM dd, yyyy')}
                      </span>
                    )}
                    {member.leaveReason && (
                      <span className="block mt-1">💬 {member.leaveReason}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons - responsive layout */}
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowStatusUpdate(true)}
              className="w-full sm:w-auto"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="sm:inline">Update Status</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowCheckIn(true)}
              className="w-full sm:w-auto"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span className="sm:inline">Check In/Out</span>
            </Button>
            <Button 
              onClick={() => setShowTaskForm(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:inline">Add Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{allTasks.length}</div>
            <p className="text-xs text-muted-foreground truncate">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Today&apos;s Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{todaysTasks.length}</div>
            <p className="text-xs text-muted-foreground truncate">
              for {format(new Date(), 'MMM dd')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground truncate">
              active tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{Math.round(memberProgress)}%</div>
            <Progress value={memberProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <TaskList tasks={allTasks} />
        </TabsContent>
        
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Today&apos;s Focus</CardTitle>
              <CardDescription className="text-sm">
                Tasks planned for {format(new Date(), 'EEEE, MMMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysTasks.length > 0 ? (
                <TaskList tasks={todaysTasks} />
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No tasks scheduled for today</p>
                  <p className="text-xs sm:text-sm mt-1">Add some tasks to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Task Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Completed</span>
                    </span>
                    <span className="font-medium">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span>In Progress</span>
                    </span>
                    <span className="font-medium">{inProgressTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Total</span>
                    </span>
                    <span className="font-medium">{allTasks.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SimpleTaskForm 
        open={showTaskForm} 
        onOpenChange={setShowTaskForm}
        defaultAssignee={memberId}
      />
      
      <CheckInDialog 
        open={showCheckIn}
        onOpenChange={setShowCheckIn}
        memberId={memberId}
      />
      
      <StatusUpdateDialog 
        open={showStatusUpdate}
        onOpenChange={setShowStatusUpdate}
        member={member}
      />
    </div>
  );
}
