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
      'flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-all duration-200',
      task.completed && 'bg-stone-100 opacity-80'
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="mt-1 sm:mt-0 w-5 h-5"
      />
      
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
        <p className={cn(
          'text-sm sm:text-base font-medium text-stone-900 leading-relaxed',
          task.completed && 'line-through text-stone-500'
        )}>
          {task.title}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <div className="flex items-center text-xs text-stone-500">
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatDate(task.created_at)}</span>
          </div>
          
          {task.completed && task.completed_at && (
            <Badge variant="secondary" className="text-xs bg-stone-200 text-stone-700 font-medium w-fit">
              ✓ Completed {formatDate(task.completed_at)}
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
