'use client';

import { useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TeamMemberProfile, AvailabilityStatus } from '@/types';

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMemberProfile;
}

export function StatusUpdateDialog({ open, onOpenChange, member }: StatusUpdateDialogProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(member.status);
  const [leaveStart, setLeaveStart] = useState(
    member.leaveStart ? member.leaveStart.toISOString().split('T')[0] : ''
  );
  const [leaveEnd, setLeaveEnd] = useState(
    member.leaveEnd ? member.leaveEnd.toISOString().split('T')[0] : ''
  );
  const [leaveReason, setLeaveReason] = useState(member.leaveReason || '');

  const { updateMemberStatus } = useTeamStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const leaveDetails = (status === 'on-leave' || status === 'exams' || status === 'sick') ? {
      start: leaveStart ? new Date(leaveStart) : undefined,
      end: leaveEnd ? new Date(leaveEnd) : undefined,
      reason: leaveReason.trim() || undefined,
    } : undefined;

    updateMemberStatus(member.id, status, leaveDetails);
    onOpenChange(false);
  };

  const statusLabels = {
    available: 'Available',
    'on-leave': 'On Leave',
    exams: 'Exams',
    busy: 'Busy',
    sick: 'Sick',
  };

  const statusDescriptions = {
    available: 'Ready to work on tasks',
    'on-leave': 'Taking time off',
    exams: 'Exam period - limited availability',
    busy: 'Working on high-priority items',
    sick: 'Unable to work due to illness',
  };

  const requiresDates = ['on-leave', 'exams', 'sick'].includes(status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Status - {member.name}</DialogTitle>
          <DialogDescription>
            Change your availability status to keep the team informed
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-3">
            <Label>Availability Status</Label>
            <RadioGroup value={status} onValueChange={setStatus as any}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <div key={value} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={`status-${value}`} />
                    <Label htmlFor={`status-${value}`} className="font-medium">
                      {label}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    {statusDescriptions[value as keyof typeof statusDescriptions]}
                  </p>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Date Range for Leave/Exams/Sick */}
          {requiresDates && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Duration Details</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveStart" className="text-sm">Start Date</Label>
                  <Input
                    id="leaveStart"
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leaveEnd" className="text-sm">End Date (Optional)</Label>
                  <Input
                    id="leaveEnd"
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveReason" className="text-sm">Reason (Optional)</Label>
                <Textarea
                  id="leaveReason"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder={
                    status === 'on-leave' ? 'Vacation, personal time, etc.' :
                    status === 'exams' ? 'Final exams, certification tests, etc.' :
                    status === 'sick' ? 'Recovery details (optional)' :
                    'Additional context...'
                  }
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
