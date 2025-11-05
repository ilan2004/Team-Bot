'use client';
/* eslint-disable no-console */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getDailyLogsByDate,
  hasMemberSignedInToday,
  createDailyLog,
  type DatabaseDailyLog 
} from '@/lib/api';

interface SignInDebugProps {
  members: Array<{ id: string; name: string; }>;
}

export function SignInDebug({ members }: SignInDebugProps) {
  const [dailyLogs, setDailyLogs] = React.useState<DatabaseDailyLog[]>([]);
  const [memberStatus, setMemberStatus] = React.useState<Record<string, boolean>>({});
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());

  // Function to refresh data
  const refreshData = React.useCallback(async () => {
    console.log('🔄 Refreshing debug data...');
    
    // Get today's logs
    const logs = await getDailyLogsByDate();
    console.log('📄 Today\'s logs:', logs);
    setDailyLogs(logs);

    // Check each member's status
    const statusPromises = members.map(async (member) => {
      const hasSignedIn = await hasMemberSignedInToday(member.id as any);
      return { memberId: member.id, hasSignedIn };
    });

    const results = await Promise.all(statusPromises);
    const statusMap = results.reduce((acc, { memberId, hasSignedIn }) => {
      acc[memberId] = hasSignedIn;
      return acc;
    }, {} as Record<string, boolean>);

    console.log('👤 Member status:', statusMap);
    setMemberStatus(statusMap);
    setLastUpdate(new Date());
  }, [members]);


  // Test sign-in function
  const testSignIn = async (memberId: string) => {
    console.log(`🧪 Testing sign-in for ${memberId}...`);
    const success = await createDailyLog({
      memberName: memberId as any,
      logType: 'check_in',
      notes: 'Test sign-in from debug component'
    });
    
    if (success) {
      console.log('✅ Test sign-in successful');
    } else {
      console.log('❌ Test sign-in failed');
    }
    
    // Refresh data after a short delay
    setTimeout(refreshData, 500);
  };

  // Test sign-out function
  const testSignOut = async (memberId: string) => {
    console.log(`🧪 Testing sign-out for ${memberId}...`);
    const success = await createDailyLog({
      memberName: memberId as any,
      logType: 'check_out',
      notes: 'Test sign-out from debug component'
    });
    
    if (success) {
      console.log('✅ Test sign-out successful');
    } else {
      console.log('❌ Test sign-out failed');
    }
    
    // Refresh data after a short delay
    setTimeout(refreshData, 500);
  };

  // Setup polling-based sync
  React.useEffect(() => {
    refreshData();

    console.log('🔄 Setting up polling-based sync (every 5 seconds)...');
    const pollInterval = setInterval(() => {
      refreshData();
    }, 5000); // Poll every 5 seconds for debug component

    // Poll when window gains focus
    const handleFocus = () => {
      console.log('🔍 Window focused, refreshing debug data...');
      refreshData();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshData]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Sign-In Debug Panel
            <div className="flex items-center space-x-2">
              <Badge variant="default">
                🔄 Polling Active
              </Badge>
              <Button size="sm" onClick={refreshData}>
                Refresh
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Member Status */}
          <div>
            <h4 className="font-medium mb-2">Member Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{member.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={memberStatus[member.id] ? "default" : "secondary"}>
                      {memberStatus[member.id] ? "Signed In" : "Signed Out"}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => testSignIn(member.id)}>
                        Test In
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => testSignOut(member.id)}>
                        Test Out
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Logs */}
          <div>
            <h4 className="font-medium mb-2">Today&apos;s Logs ({dailyLogs.length})</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {dailyLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No logs for today</p>
              ) : (
                dailyLogs.map(log => (
                  <div key={log.id} className="text-xs p-2 bg-muted rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.member_name}</span>
                      <Badge variant={log.log_type === 'check_in' ? 'default' : 'secondary'}>
                        {log.log_type}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString()} - {log.log_date}
                    </div>
                    {log.notes && (
                      <div className="mt-1">{log.notes}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground border-t pt-2">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Use &quot;Test In/Out&quot; buttons to simulate sign-in/out events</li>
              <li>Status updates automatically every 5 seconds via polling</li>
              <li>Open this on multiple devices to test sync (may take up to 10 seconds)</li>
              <li>Updates also happen when you switch back to the browser tab</li>
              <li>Double-click &quot;Team Members&quot; title in main dashboard for manual refresh</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
