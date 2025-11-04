'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTeamStore } from '@/store/team-store';
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export function TeamActivityChart() {
  const { teamMembers, getTasksByMember } = useTeamStore();

  const chartData = React.useMemo(() => {
    const teamData = teamMembers.map(member => {
      const allTasks = getTasksByMember(member.id);
      const completedTasks = allTasks.filter(task => task.status === 'completed');
      const inProgressTasks = allTasks.filter(task => task.status === 'in-progress');
      const todoTasks = allTasks.filter(task => task.status === 'todo');
      const blockedTasks = allTasks.filter(task => task.status === 'blocked');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentActivity = completedTasks.filter(task => task.completedAt && new Date(task.completedAt) >= weekAgo).length;
      const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
      return {
        name: member.name,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        todo: todoTasks.length,
        blocked: blockedTasks.length,
        total: allTasks.length,
        completionRate,
        recentActivity,
        activityScore: (completedTasks.length * 2) + (inProgressTasks.length * 1) + (recentActivity * 3)
      };
    });
    return teamData.sort((a, b) => b.activityScore - a.activityScore);
  }, [teamMembers, getTasksByMember]);

  const COLORS = {
    completed: '#22c55e',
    inProgress: '#3b82f6',
    todo: '#f59e0b',
    blocked: '#ef4444',
    primary: '#8884d8',
    secondary: '#82ca9d'
  } as const;

  const pieData = React.useMemo(() => {
    const totals = chartData.reduce(
      (acc, member) => ({
        completed: acc.completed + member.completed,
        inProgress: acc.inProgress + member.inProgress,
        todo: acc.todo + member.todo,
        blocked: acc.blocked + member.blocked,
      }),
      { completed: 0, inProgress: 0, todo: 0, blocked: 0 }
    );
    return [
      { name: 'Completed', value: totals.completed, color: COLORS.completed },
      { name: 'In Progress', value: totals.inProgress, color: COLORS.inProgress },
      { name: 'Todo', value: totals.todo, color: COLORS.todo },
      { name: 'Blocked', value: totals.blocked, color: COLORS.blocked },
    ].filter(item => item.value > 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Activity Overview
          </CardTitle>
          <CardDescription>Task completion and team member activity metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No team data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Team Activity Overview
        </CardTitle>
        <CardDescription>Task completion and team member activity metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Task Distribution</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={75} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Member Task Breakdown</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={chartData.slice(0, 6)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={50} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill={COLORS.completed} name="Completed" />
                  <Bar dataKey="inProgress" stackId="a" fill={COLORS.inProgress} name="In Progress" />
                  <Bar dataKey="todo" stackId="a" fill={COLORS.todo} name="Todo" />
                  <Bar dataKey="blocked" stackId="a" fill={COLORS.blocked} name="Blocked" />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground">Completion Rate & Recent Activity</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={50} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completionRate" stroke={COLORS.completed} strokeWidth={2} name="Completion Rate (%)" />
                  <Line type="monotone" dataKey="recentActivity" stroke={COLORS.secondary} strokeWidth={2} name="Recent Activity" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{chartData.reduce((sum, t) => sum + t.total, 0)}</div>
            <div className="text-xs text-muted-foreground">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{chartData.reduce((sum, t) => sum + t.completed, 0)}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{chartData.reduce((sum, t) => sum + t.inProgress, 0)}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">{chartData.length > 0 ? Math.round(chartData.reduce((sum, t) => sum + t.completionRate, 0) / chartData.length) : 0}%</div>
            <div className="text-xs text-muted-foreground">Avg Completion</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
