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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter new task..."
        className="flex-1 h-11 text-base"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        disabled={!title.trim() || isSubmitting}
        size="default"
        className="h-11 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </Button>
    </form>
  )
}
