'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/supabase'
import { TeamMember, MEMBER_COLORS } from '@/lib/constants'
import { getWeeklyProgress } from '@/lib/utils'
import { Target, TrendingUp, Calendar } from 'lucide-react'

interface WeeklyTargetsProps {
  tasks: Task[]
  member: TeamMember
}

export function WeeklyTargets({ tasks, member }: WeeklyTargetsProps) {
  const weeklyProgress = getWeeklyProgress(tasks, member)
  
  const getWeekRange = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${endOfWeek.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`
  }

  const getStatusColor = () => {
    if (weeklyProgress.percentage >= 80) return 'text-green-600'
    if (weeklyProgress.percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusText = () => {
    if (weeklyProgress.percentage >= 80) return 'Excellent'
    if (weeklyProgress.percentage >= 50) return 'On Track'
    if (weeklyProgress.total === 0) return 'No Tasks'
    return 'Behind'
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-6 w-6" />
          Weekly Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">{getWeekRange()}</span>
          </div>
          <Badge 
            variant="secondary"
            className={`${MEMBER_COLORS[member]} text-white font-bold px-3 py-1 text-sm`}
          >
            {weeklyProgress.percentage}%
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-700">Progress</span>
            <span className="text-gray-900">
              {weeklyProgress.completed} of {weeklyProgress.total} tasks
            </span>
          </div>
          <div className="space-y-2">
            <Progress value={weeklyProgress.percentage} className="h-3 bg-gray-200" />
            <div className="text-xs text-center text-gray-500">
              {weeklyProgress.percentage}% Complete
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${getStatusColor().replace('text-', 'text-')}`} />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor()} px-2 py-1 rounded-md bg-white shadow-sm`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {weeklyProgress.total === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No tasks assigned</p>
            <p className="text-xs">Add some tasks to track progress</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
