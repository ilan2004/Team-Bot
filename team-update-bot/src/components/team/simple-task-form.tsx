'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamStore } from '@/store/team-store';
import { TeamMember } from '@/types';
import { Calendar, CalendarDays } from 'lucide-react';

interface SimpleTaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAssignee?: TeamMember;
}

export function SimpleTaskForm({ open, onOpenChange, defaultAssignee }: SimpleTaskFormProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useTeamStore();

  const handleSubmit = async (dueDate: 'today' | 'tomorrow') => {
    if (!title.trim() || !defaultAssignee) return;

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
        assignee: defaultAssignee,
        dueDate: taskDueDate,
        estimatedHours: 0,
        tags: [],
      });

      // Reset form
      setTitle('');
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
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && title.trim()) {
                  e.preventDefault();
                  handleSubmit('today');
                }
              }}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              onClick={() => handleSubmit('today')}
              disabled={!title.trim() || isSubmitting}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Today'}
            </Button>
            
            <Button
              type="button"
              onClick={() => handleSubmit('tomorrow')}
              disabled={!title.trim() || isSubmitting}
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
