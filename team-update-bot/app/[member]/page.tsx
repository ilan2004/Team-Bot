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
import { CalendarDays, CheckSquare, User, Plus } from 'lucide-react'
import { notFound } from 'next/navigation'

export default function MemberPage() {
  const params = useParams()
  const member = params.member as string
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState(false)

  // Validate member
  if (!TEAM_MEMBERS.includes(member as TeamMember)) {
    notFound()
  }

  const memberName = member as TeamMember

  useEffect(() => {
    // Check if environment variables are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setConfigError(true)
      setLoading(false)
      return
    }
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

  if (configError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h2>
            <p className="text-gray-600">Please configure your Supabase environment variables.</p>
            <p className="text-sm text-gray-500 mt-2">Check your deployment settings for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 bg-stone-200 rounded-xl">
              <User className="h-6 w-6 text-stone-700" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
                {MEMBER_DISPLAY_NAMES[memberName]}'s Tasks
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <Badge className="bg-stone-200 text-stone-800 font-medium px-3 py-1">
                  {memberTasks.length} tasks
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Nudge Team Member
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-stone-600 text-sm sm:text-base">Manage your tasks and track weekly progress</p>
        </div>

        {/* Add New Task */}
        <Card className="mb-6 sm:mb-8 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-stone-900 text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <AddTaskForm member={memberName} onAddTask={handleAddTask} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Today's Tasks */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-stone-800 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5" />
                  Today's Tasks
                  <Badge variant="secondary" className="bg-stone-200 text-stone-800">
                    {todaysTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
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
                    <div className="text-center py-8 text-stone-500">
                      <CalendarDays className="h-12 w-12 mx-auto mb-3 text-stone-400" />
                      <p className="font-medium">No tasks for today</p>
                      <p className="text-sm">Great job staying on top of things!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Other Tasks */}
            {otherTasks.length > 0 && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-stone-600 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Upcoming Tasks
                  <Badge variant="secondary" className="bg-stone-200 text-stone-800">
                    {otherTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {otherTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weekly Targets */}
          <div className="xl:col-span-1">
            <div className="sticky top-20">
              <WeeklyTargets tasks={tasks} member={memberName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
