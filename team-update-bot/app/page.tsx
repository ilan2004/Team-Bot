'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { supabase, Task } from '@/lib/supabase'
import { TEAM_MEMBERS, MEMBER_DISPLAY_NAMES, MEMBER_COLORS } from '@/lib/constants'
import { getTasksByMember, getCompletedTasks, getWeeklyProgress } from '@/lib/utils'
import { CheckCircle, Clock, Users, Target } from 'lucide-react'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    // Check if environment variables are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setConfigError(true)
      setLoading(false)
      return
    }
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedTasks = getCompletedTasks(tasks)
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

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
          <div className="text-lg text-gray-600">Loading project status...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Project Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track team progress and boost productivity with Nudge</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Tasks</CardTitle>
              <Target className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTasks}</div>
              <p className="text-xs text-gray-500 mt-1">All team tasks</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{completedTasks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Tasks finished</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{totalTasks - completedTasks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Tasks remaining</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completion</CardTitle>
              <Users className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{completionPercentage}%</div>
              <Progress value={completionPercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Team Member Breakdown */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-6 w-6" />
              Team Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {TEAM_MEMBERS.map((member) => {
                const memberTasks = getTasksByMember(tasks, member)
                const memberCompleted = getCompletedTasks(memberTasks)
                const memberPercentage = memberTasks.length > 0 
                  ? Math.round((memberCompleted.length / memberTasks.length) * 100) 
                  : 0
                const weeklyProgress = getWeeklyProgress(tasks, member)

                return (
                  <div key={member} className="p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                        {MEMBER_DISPLAY_NAMES[member]}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`${MEMBER_COLORS[member]} text-white font-semibold px-2 py-1 text-sm`}
                      >
                        {memberPercentage}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Total: {memberTasks.length}</span>
                        <span>Done: {memberCompleted.length}</span>
                      </div>
                      <Progress value={memberPercentage} className="h-2 bg-gray-200" />
                      
                      <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md">
                        This week: {weeklyProgress.completed}/{weeklyProgress.total}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
