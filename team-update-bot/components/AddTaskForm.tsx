'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { TeamMember } from '@/lib/constants'

interface AddTaskFormProps {
  member: TeamMember
  onAddTask: (title: string, member: TeamMember) => void
}

export function AddTaskForm({ member, onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    await onAddTask(title.trim(), member)
    setTitle('')
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter new task..."
        className="flex-1"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        disabled={!title.trim() || isSubmitting}
        size="sm"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Task
      </Button>
    </form>
  )
}
