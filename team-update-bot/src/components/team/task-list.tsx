'use client';

import { useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types';
import { format } from 'date-fns';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Edit, 
  MoreHorizontal, 
  Trash2,
  AlertCircle,
  Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskForm } from './task-form';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { completeTask, updateTask, deleteTask } = useTeamStore();

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    todo: 'text-gray-600',
    'in-progress': 'text-blue-600',
    completed: 'text-green-600',
    blocked: 'text-red-600',
  };

  const statusIcons = {
    todo: Circle,
    'in-progress': Clock,
    completed: CheckCircle2,
    blocked: AlertCircle,
  };

  const typeLabels = {
    feature: 'Feature',
    bug: 'Bug Fix',
    research: 'Research',
    review: 'Review',
    asset: 'Asset',
    animation: 'Animation',
  };

  const handleStatusChange = async (taskId: string, completed: boolean) => {
    if (completed) {
      await completeTask(taskId);
    } else {
      await updateTask(taskId, { status: 'todo' });
    }
  };

  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    await updateTask(taskId, { status });
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
            <p className="text-sm mt-1">Create your first task to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const StatusIcon = statusIcons[task.status];
        const isCompleted = task.status === 'completed';
        const isOverdue = task.dueDate && new Date() > task.dueDate && !isCompleted;

        return (
          <Card key={task.id} className={`${isCompleted ? 'opacity-75' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleStatusChange(task.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h4>
                      <StatusIcon className={`w-4 h-4 ${statusColors[task.status]}`} />
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm text-gray-600 ${isCompleted ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {typeLabels[task.type]}
                      </Badge>
                      
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      
                      {task.estimatedHours && (
                        <Badge variant="outline" className="text-xs">
                          {task.estimatedHours}h
                        </Badge>
                      )}
                      
                      {task.dueDate && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs flex items-center space-x-1 ${
                            isOverdue ? 'border-red-300 text-red-700 bg-red-50' : ''
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{format(task.dueDate, 'MMM dd')}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingTaskId(task.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    
                    {task.status !== 'in-progress' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'in-progress')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Start Progress
                      </DropdownMenuItem>
                    )}
                    
                    {task.status === 'in-progress' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'todo')}>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    
                    {task.status !== 'blocked' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'blocked')}>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Mark Blocked
                      </DropdownMenuItem>
                    )}
                    
                    {task.status !== 'completed' && (
                      <DropdownMenuItem onClick={() => completeTask(task.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Task Dialog */}
      <TaskForm
        open={!!editingTaskId}
        onOpenChange={(open) => !open && setEditingTaskId(null)}
        taskId={editingTaskId || undefined}
      />
    </div>
  );
}
