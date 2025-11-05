'use client';
/* eslint-disable no-console */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { getMonthlyLeaveSummary } from '@/lib/api';
import type { TeamMember } from '@/types';

interface LeaveRecord {
  memberName: TeamMember;
  status: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

const memberColors = {
  ilan: 'bg-blue-500',
  midlaj: 'bg-green-500', 
  hysam: 'bg-purple-500',
  alan: 'bg-orange-500',
};

const statusColors = {
  leave: 'bg-yellow-500',
  exam: 'bg-blue-500',
  sick: 'bg-red-500',
  busy: 'bg-orange-500',
};

const statusLabels = {
  leave: 'Leave',
  exam: 'Exams',
  sick: 'Sick',
  busy: 'Busy',
};

export function LeaveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveSummary, setLeaveSummary] = useState<{ [key: string]: LeaveRecord[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | 'all'>('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Load leave data for current month
  useEffect(() => {
    const loadLeaveData = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await getMonthlyLeaveSummary(year, month);
        setLeaveSummary(data);
      } catch (error) {
        console.error('Error loading leave data:', error);
        setLeaveSummary({});
      } finally {
        setLoading(false);
      }
    };

    loadLeaveData();
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const filterLeaveRecords = (records: LeaveRecord[]) => {
    if (selectedMember === 'all') return records;
    return records.filter(record => record.memberName === selectedMember);
  };


  const getLeaveRecordsForDay = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const records = leaveSummary[dayKey] || [];
    return filterLeaveRecords(records);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Leave Calendar</h2>
          <p className="text-muted-foreground">
            Overview of team member availability and leave schedules
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-semibold min-w-[160px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Member Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter:</span>
          <div className="flex space-x-1">
            <Button
              variant={selectedMember === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMember('all')}
            >
              All
            </Button>
            {(['ilan', 'midlaj', 'hysam', 'alan'] as TeamMember[]).map(member => (
              <Button
                key={member}
                variant={selectedMember === member ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMember(member)}
                className={selectedMember === member ? `${memberColors[member]} text-white` : ''}
              >
                {member.charAt(0).toUpperCase() + member.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading leave data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map(day => {
                  const leaveRecords = getLeaveRecordsForDay(day);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[80px] p-2 border rounded-lg transition-colors ${
                        isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      
                      {leaveRecords.length > 0 && (
                        <div className="space-y-1">
                          {leaveRecords.slice(0, 3).map((record, index) => {
                            const statusColor = statusColors[record.status as keyof typeof statusColors] || 'bg-gray-500';
                            const memberColor = memberColors[record.memberName];
                            
                            return (
                              <div
                                key={index}
                                className={`text-xs p-1 rounded text-white ${statusColor}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {record.memberName.charAt(0).toUpperCase() + record.memberName.slice(1)}
                                  </span>
                                  <div 
                                    className={`w-2 h-2 rounded-full ${memberColor} border border-white`}
                                  />
                                </div>
                                <div className="text-xs opacity-90">
                                  {statusLabels[record.status as keyof typeof statusLabels] || record.status}
                                </div>
                              </div>
                            );
                          })}
                          
                          {leaveRecords.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{leaveRecords.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Member Colors */}
            <div>
              <h4 className="font-medium mb-2">Team Members</h4>
              <div className="space-y-1">
                {(['ilan', 'midlaj', 'hysam', 'alan'] as TeamMember[]).map(member => (
                  <div key={member} className="flex items-center space-x-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${memberColors[member]}`} />
                    <span>{member.charAt(0).toUpperCase() + member.slice(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Types */}
            <div>
              <h4 className="font-medium mb-2">Leave Types</h4>
              <div className="space-y-1">
                {Object.entries(statusLabels).map(([key, label]) => {
                  const colorClass = statusColors[key as keyof typeof statusColors] || 'bg-gray-500';
                  return (
                    <div key={key} className="flex items-center space-x-2 text-sm">
                      <div className={`w-4 h-4 rounded ${colorClass}`} />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Leave Summary */}
      {(() => {
        const today = new Date();
        const todayRecords = getLeaveRecordsForDay(today);
        
        if (todayRecords.length > 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Today&apos;s Leave Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todayRecords.map((record, index) => {
                    const statusColor = statusColors[record.status as keyof typeof statusColors] || 'bg-gray-500';
                    const memberColor = memberColors[record.memberName];
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${statusColor}`} />
                            <div className={`w-3 h-3 rounded-full ${memberColor}`} />
                          </div>
                          <div>
                            <span className="font-medium">
                              {record.memberName.charAt(0).toUpperCase() + record.memberName.slice(1)}
                            </span>
                            <Badge className={`ml-2 text-xs text-white ${statusColor}`}>
                              {statusLabels[record.status as keyof typeof statusLabels] || record.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.startDate === record.endDate ? (
                            <span>Today only</span>
                          ) : (
                            <span>
                              {format(new Date(record.startDate), 'MMM dd')} - {format(new Date(record.endDate), 'MMM dd')}
                            </span>
                          )}
                          {record.reason && (
                            <span className="block text-xs">💬 {record.reason}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        }
        return null;
      })()}
    </div>
  );
}
