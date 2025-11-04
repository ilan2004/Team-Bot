'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/supabase'
import { Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
}

export function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    setIsUpdating(true)
    await onToggleComplete(task.id, !task.completed)
    setIsUpdating(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={cn(
      'flex items-center space-x-3 p-3 bg-white rounded-lg border transition-all',
      task.completed && 'bg-gray-50 opacity-75'
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-gray-900',
          task.completed && 'line-through text-gray-500'
        )}>
          {task.title}
        </p>
        
        <div className="flex items-center space-x-2 mt-1">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(task.created_at)}
          </div>
          
          {task.completed && task.completed_at && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Completed {formatDate(task.completed_at)}
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
