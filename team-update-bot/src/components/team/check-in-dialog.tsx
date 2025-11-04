'use client';

import { useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TeamMember, MoodLevel } from '@/types';
import { format } from 'date-fns';

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: TeamMember;
}

export function CheckInDialog({ open, onOpenChange, memberId }: CheckInDialogProps) {
  const [checkType, setCheckType] = useState<'check-in' | 'check-out'>('check-in');
  const [mood, setMood] = useState<MoodLevel>(3);
  const [notes, setNotes] = useState('');
  const [plannedTasks, setPlannedTasks] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [blockers, setBlockers] = useState('');

  const { checkIn, checkOut, teamMembers } = useTeamStore();

  const member = teamMembers.find(m => m.id === memberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tasksList = checkType === 'check-in' 
      ? plannedTasks.split('\n').filter(task => task.trim())
      : completedTasks.split('\n').filter(task => task.trim());

    const blockersList = blockers.split('\n').filter(blocker => blocker.trim());

    if (checkType === 'check-in') {
      checkIn(memberId, mood, tasksList, notes.trim() || undefined);
    } else {
      checkOut(memberId, mood, tasksList, blockersList.length > 0 ? blockersList : undefined, notes.trim() || undefined);
    }

    // Reset form
    setMood(3);
    setNotes('');
    setPlannedTasks('');
    setCompletedTasks('');
    setBlockers('');

    onOpenChange(false);
  };

  const moodLabels = {
    1: '😟 Very Low',
    2: '🙁 Low', 
    3: '😐 Neutral',
    4: '🙂 Good',
    5: '😄 Excellent'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Daily Check-{checkType === 'check-in' ? 'In' : 'Out'}</DialogTitle>
          <DialogDescription>
            {format(new Date(), 'EEEE, MMMM dd, yyyy')} - {member?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Check Type Selection */}
          <div className="space-y-3">
            <Label>Type</Label>
            <RadioGroup value={checkType} onValueChange={setCheckType as any}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="check-in" id="check-in" />
                <Label htmlFor="check-in">Morning Check-In</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="check-out" id="check-out" />
                <Label htmlFor="check-out">Evening Check-Out</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mood Selection */}
          <div className="space-y-3">
            <Label>Current Mood</Label>
            <RadioGroup value={mood.toString()} onValueChange={(value) => setMood(parseInt(value) as MoodLevel)}>
              {Object.entries(moodLabels).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`mood-${value}`} />
                  <Label htmlFor={`mood-${value}`} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Tasks Section */}
          {checkType === 'check-in' ? (
            <div className="space-y-2">
              <Label htmlFor="plannedTasks">Today&apos;s Planned Tasks</Label>
              <Textarea
                id="plannedTasks"
                value={plannedTasks}
                onChange={(e) => setPlannedTasks(e.target.value)}
                placeholder="Enter each task on a new line..."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                List the tasks you plan to work on today (one per line)
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="completedTasks">Completed Tasks</Label>
                <Textarea
                  id="completedTasks"
                  value={completedTasks}
                  onChange={(e) => setCompletedTasks(e.target.value)}
                  placeholder="Enter each completed task on a new line..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  List the tasks you completed today (one per line)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blockers">Blockers & Challenges</Label>
                <Textarea
                  id="blockers"
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="Any blockers or challenges you faced..."
                  rows={2}
                />
                <p className="text-xs text-gray-500">
                  Note any obstacles or issues that need attention (one per line)
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts, updates, or context..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit {checkType === 'check-in' ? 'Check-In' : 'Check-Out'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
