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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Weekly Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{getWeekRange()}</span>
          </div>
          <Badge 
            variant="secondary"
            className={`${MEMBER_COLORS[member]} text-white`}
          >
            {weeklyProgress.percentage}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {weeklyProgress.completed} of {weeklyProgress.total} tasks
            </span>
          </div>
          <Progress value={weeklyProgress.percentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Status:</span>
          </div>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {weeklyProgress.total === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No tasks assigned for this week yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
