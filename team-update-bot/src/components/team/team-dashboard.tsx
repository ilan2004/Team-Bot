'use client';

import React from 'react';
import { useTeamStore } from '@/store/team-store';
import { SimpleTaskForm } from './simple-task-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Target, AlertCircle, Plus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { TestFlightMilestones } from './test-flight-milestones';
import { TeamStatusGrid } from './team-status-grid';
import { TeamActivityChart } from './team-activity-chart';

export function TeamDashboard() {
  const { 
    teamMembers, 
    stats, 
    testFlightMilestones, 
    calculateStats, 
    loadTasksFromDatabase, 
    subscribeToRealTimeUpdates 
  } = useTeamStore();

  const [showTaskForm, setShowTaskForm] = React.useState(false);

  const testFlightDate = new Date('2025-12-04');
  const currentDate = new Date();
  const daysUntilTestFlight = differenceInDays(testFlightDate, currentDate);

  // Load real data and set up real-time updates
  React.useEffect(() => {
    // Load initial data from database
    loadTasksFromDatabase();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealTimeUpdates();
    
    // Update stats periodically
    const interval = setInterval(() => {
      calculateStats();
    }, 60000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [loadTasksFromDatabase, subscribeToRealTimeUpdates, calculateStats]);
  

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
            {format(currentDate, 'EEEE, MMMM dd, yyyy • HH:mm')}
          </p>
        </div>
        <div className="flex items-center justify-start sm:justify-end gap-2">
          <Button 
            onClick={() => setShowTaskForm(true)}
            size="sm"
            className="hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-1" />
            Quick Task
          </Button>
          <Badge variant="secondary" className="text-sm sm:text-lg px-2 py-1 sm:px-3 flex items-center whitespace-nowrap">
            <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {Math.abs(daysUntilTestFlight)} days {daysUntilTestFlight < 0 ? 'past' : 'until'} TestFlight
            </span>
          </Badge>
        </div>
      </div>

      {/* Test Flight Countdown */}
      <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
              <span className="text-base sm:text-lg">Dec 4 Test Flight Export</span>
            </div>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {daysUntilTestFlight < 0 
              ? `Deadline passed ${Math.abs(daysUntilTestFlight)} days ago (${format(testFlightDate, 'MMM dd, yyyy')})`
              : daysUntilTestFlight === 0
              ? 'Deadline is TODAY! 🚀'
              : `Critical deadline approaching - ${daysUntilTestFlight} days remaining (${format(testFlightDate, 'MMM dd, yyyy')})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="truncate pr-2">Overall Test Flight Progress</span>
              <span className="font-medium flex-shrink-0">{Math.round(stats.testFlightProgress)}%</span>
            </div>
            <Progress 
              value={stats.testFlightProgress} 
              className="h-2 sm:h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Status Grid */}
      <TeamStatusGrid members={teamMembers} />

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Overview</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.overallProgress)}% complete
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>In Progress: {stats.inProgressTasks}</span>
              </div>
              {stats.blockedTasks > 0 && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>Blocked: {stats.blockedTasks}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {daysUntilTestFlight}
            </div>
            <p className="text-xs text-muted-foreground">
              days until deadline
            </p>
            <div className="mt-2 text-xs">
              <div>Target: {format(testFlightDate, 'MMM dd, yyyy')}</div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Test Flight Milestones */}
      <TestFlightMilestones milestones={testFlightMilestones} />

      {/* Team Activity Chart */}
      <TeamActivityChart />

      {/* Quick Task Form */}
      <SimpleTaskForm 
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        defaultAssignee={undefined}
      />

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          onClick={() => setShowTaskForm(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
