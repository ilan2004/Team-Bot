'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamStore } from '@/store/team-store';
import { TeamMember } from '@/types';
import { Calendar, CalendarDays, User } from 'lucide-react';

interface SimpleTaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAssignee?: TeamMember;
}

export function SimpleTaskForm({ open, onOpenChange, defaultAssignee }: SimpleTaskFormProps) {
  const [title, setTitle] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>(defaultAssignee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask, teamMembers } = useTeamStore();

  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setTitle('');
      if (!defaultAssignee) {
        setSelectedMember(undefined);
      }
    } else {
      // Set default assignee when opening
      setSelectedMember(defaultAssignee);
    }
  }, [open, defaultAssignee]);

  const handleSubmit = async (dueDate: 'today' | 'tomorrow') => {
    if (!title.trim() || !selectedMember) return;

    setIsSubmitting(true);

    try {
      // Calculate due date
      const today = new Date();
      const taskDueDate = new Date();
      
      if (dueDate === 'tomorrow') {
        taskDueDate.setDate(today.getDate() + 1);
      }
      // Set to end of day
      taskDueDate.setHours(23, 59, 59, 999);

      // Create task
      await addTask({
        title: title.trim(),
        description: '',
        type: 'feature',
        priority: 'medium',
        status: 'todo',
        assignee: selectedMember,
        dueDate: taskDueDate,
        estimatedHours: 0,
        tags: [],
      });

      // Reset form
      setTitle('');
      if (!defaultAssignee) {
        setSelectedMember(undefined);
      }
      onOpenChange(false);
    } catch {
      // Error creating task
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a quick task and schedule it for today or tomorrow.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!defaultAssignee && (
            <div className="space-y-2">
              <Label htmlFor="member-select">Assign to</Label>
              <Select
                value={selectedMember || ''}
                onValueChange={(value) => setSelectedMember(value as TeamMember)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="member-select">
                  <SelectValue placeholder="Select team member">
                    {selectedMember && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{teamMembers.find(m => m.id === selectedMember)?.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && title.trim() && selectedMember) {
                  e.preventDefault();
                  handleSubmit('today');
                }
              }}
              disabled={isSubmitting}
              autoFocus={!!defaultAssignee}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              onClick={() => handleSubmit('today')}
              disabled={!title.trim() || !selectedMember || isSubmitting}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Today'}
            </Button>
            
            <Button
              type="button"
              onClick={() => handleSubmit('tomorrow')}
              disabled={!title.trim() || !selectedMember || isSubmitting}
              variant="outline"
              className="flex-1"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Tomorrow'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
