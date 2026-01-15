import { Task, Analytics, DayStats, Priority } from '../types'
import { getTasks } from './storage'
import { getLast30Days, getToday } from '../utils/date'

export const calculateAnalytics = async (): Promise<Analytics> => {
    const tasks = await getTasks()
    const last30Days = getLast30Days()

    const dailyStats: DayStats[] = last30Days.map(date => {
        const dayTasks = tasks.filter(t => t.scheduledDate === date || (t.originalDate === date))
        return {
            date,
            total: dayTasks.length,
            completed: dayTasks.filter(t => t.completed).length
        }
    })

    const totalTasks = dailyStats.reduce((sum, d) => sum + d.total, 0)
    const completedTasks = dailyStats.reduce((sum, d) => sum + d.completed, 0)
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const carriedTasks = tasks.filter(t => t.carriedOver).length
    const carryOverRate = totalTasks > 0 ? (carriedTasks / totalTasks) * 100 : 0

    const streakDays = calculateStreak(dailyStats)

    const tasksByPriority: Record<Priority, number> = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
    }
    tasks.forEach(t => {
        tasksByPriority[t.priority]++
    })

    return {
        completionRate,
        carryOverRate,
        streakDays,
        tasksByPriority,
        dailyStats
    }
}

const calculateStreak = (dailyStats: DayStats[]): number => {
    let streak = 0
    const today = getToday()

    for (let i = dailyStats.length - 1; i >= 0; i--) {
        const day = dailyStats[i]
        if (day.date > today) continue
        if (day.total === 0) continue
        if (day.completed === day.total) {
            streak++
        } else {
            break
        }
    }

    return streak
}

export const getCompletionRateForWeek = async (): Promise<number> => {
    const analytics = await calculateAnalytics()
    const last7 = analytics.dailyStats.slice(-7)
    const total = last7.reduce((sum, d) => sum + d.total, 0)
    const completed = last7.reduce((sum, d) => sum + d.completed, 0)
    return total > 0 ? (completed / total) * 100 : 0
}
