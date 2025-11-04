import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Task } from "./supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions
export function isToday(date: string): boolean {
  const today = new Date()
  const taskDate = new Date(date)
  
  return (
    taskDate.getDate() === today.getDate() &&
    taskDate.getMonth() === today.getMonth() &&
    taskDate.getFullYear() === today.getFullYear()
  )
}

export function isThisWeek(date: string): boolean {
  const today = new Date()
  const taskDate = new Date(date)
  
  // Get the start of this week (Monday)
  const startOfWeek = new Date(today)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)
  
  // Get the end of this week (Sunday)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return taskDate >= startOfWeek && taskDate <= endOfWeek
}

// Task filtering functions
export function getTodaysTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => isToday(task.created_at))
}

export function getThisWeeksTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => isThisWeek(task.created_at))
}

export function getTasksByMember(tasks: Task[], member: string): Task[] {
  return tasks.filter(task => task.assigned_member === member)
}

export function getCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.completed)
}

export function getWeeklyProgress(tasks: Task[], member: string) {
  const memberTasks = getTasksByMember(tasks, member)
  const weeklyTasks = getThisWeeksTasks(memberTasks)
  const completedWeeklyTasks = getCompletedTasks(weeklyTasks)
  
  return {
    completed: completedWeeklyTasks.length,
    total: weeklyTasks.length,
    percentage: weeklyTasks.length > 0 ? Math.round((completedWeeklyTasks.length / weeklyTasks.length) * 100) : 0
  }
}
