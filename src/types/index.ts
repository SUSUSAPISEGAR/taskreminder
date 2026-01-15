export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskType = 'daily' | 'lifetime'

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  priority: Priority
  scheduledDate: string
  completed: boolean
  completedAt?: string
  carriedOver: boolean
  originalDate?: string
  createdAt: string
  reminderInterval: number
}

export interface AppState {
  lastOpenedDate: string
  tasks: Task[]
}

export interface DayStats {
  date: string
  total: number
  completed: number
}

export interface Analytics {
  completionRate: number
  carryOverRate: number
  streakDays: number
  tasksByPriority: Record<Priority, number>
  dailyStats: DayStats[]
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444'
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
}
