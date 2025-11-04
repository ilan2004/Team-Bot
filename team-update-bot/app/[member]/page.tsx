'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Task } from '@/lib/supabase'
import { TEAM_MEMBERS, MEMBER_DISPLAY_NAMES, MEMBER_COLORS, TeamMember } from '@/lib/constants'
import { getTasksByMember, getTodaysTasks } from '@/lib/utils'
import { TaskItem } from '@/components/TaskItem'
import { AddTaskForm } from '@/components/AddTaskForm'
import { WeeklyTargets } from '@/components/WeeklyTargets'
import { CalendarDays, CheckSquare, User } from 'lucide-react'
import { notFound } from 'next/navigation'

export default function MemberPage() {
  const params = useParams()
  const member = params.member as string
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Validate member
  if (!TEAM_MEMBERS.includes(member as TeamMember)) {
    notFound()
  }

  const memberName = member as TeamMember

  useEffect(() => {
    fetchTasks()
  }, [member])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_member', member)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (title: string, assignedMember: TeamMember) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          assigned_member: assignedMember,
          completed: false
        })
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setTasks([data, ...tasks])
        // Note: WhatsApp notification will be handled by the background service
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTasks(tasks.map(task => 
          task.id === taskId ? data : task
        ))
        // Note: WhatsApp notification will be handled by the background service
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const memberTasks = getTasksByMember(tasks, member)
  const todaysTasks = getTodaysTasks(memberTasks)
  const otherTasks = memberTasks.filter(task => !getTodaysTasks([task]).length)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading {MEMBER_DISPLAY_NAMES[memberName]}'s tasks...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-900">{MEMBER_DISPLAY_NAMES[memberName]}'s Tasks</h1>
          <Badge className={`$ {MEMBER_COLORS[memberName]} text-white`}>
            {memberTasks.length} tasks
          </Badge>
        </div>
        <p className="text-gray-600">Manage your tasks and track weekly progress</p>
      </div>

      {/* Add New Task */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTaskForm member={memberName} onAddTask={handleAddTask} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Today's Tasks
                <Badge variant="outline">{todaysTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysTasks.length > 0 ? (
                todaysTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No tasks for today. Great job staying on top of things!
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Other Tasks */}
          {otherTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  All Tasks
                  <Badge variant="outline">{otherTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {otherTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Weekly Targets */}
        <div>
          <WeeklyTargets tasks={tasks} member={memberName} />
        </div>
      </div>
    </div>
  )
}
