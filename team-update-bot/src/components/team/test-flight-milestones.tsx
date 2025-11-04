'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { TestFlightMilestone } from '@/types';
import { useTeamStore } from '@/store/team-store';

interface TestFlightMilestonesProps {
  milestones: TestFlightMilestone[];
}

export function TestFlightMilestones({ milestones }: TestFlightMilestonesProps) {
  const { updateMilestoneProgress } = useTeamStore();

  const getTeamMemberName = (memberId: string) => {
    const names = {
      ilan: 'Ilan',
      midlaj: 'Midlaj',
      hysam: 'Hysam',
      alan: 'Alan'
    };
    return names[memberId as keyof typeof names] || memberId;
  };

  const handleProgressUpdate = (milestoneId: string, progress: number) => {
    updateMilestoneProgress(milestoneId, progress);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Dec 4 Test Flight Milestones</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {milestone.isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h4 className="font-semibold">{milestone.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getTeamMemberName(milestone.assignee).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {getTeamMemberName(milestone.assignee)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{milestone.progress}%</span>
                    {milestone.isComplete && (
                      <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={milestone.progress} 
                  className="h-2"
                />
              </div>

              {/* Progress Update Buttons */}
              <div className="flex space-x-2">
                {[25, 50, 75, 100].map((progressValue) => (
                  <button
                    key={progressValue}
                    onClick={() => handleProgressUpdate(milestone.id, progressValue)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      milestone.progress >= progressValue
                        ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-black'
                    }`}
                  >
                    {progressValue}%
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
