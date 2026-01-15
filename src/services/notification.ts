import * as Notifications from 'expo-notifications'
import { Task } from '../types'
import { getIncompleteTasks } from './storage'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
})

export const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
}

export const scheduleTaskReminder = async (task: Task): Promise<string | null> => {
    if (task.reminderInterval <= 0) return null

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: `⏰ ${task.title}`,
            body: task.description || 'Task belum selesai!',
            data: { taskId: task.id },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: task.reminderInterval * 60,
            repeats: true,
        },
    })

    return identifier
}

export const cancelTaskReminder = async (taskId: string): Promise<void> => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync()
    for (const notif of notifications) {
        if (notif.content.data?.taskId === taskId) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier)
        }
    }
}

export const updatePersistentNotification = async (): Promise<void> => {
    await Notifications.dismissAllNotificationsAsync()

    const tasks = await getIncompleteTasks()
    if (tasks.length === 0) return

    const urgentCount = tasks.filter(t => t.priority === 'urgent').length
    const highCount = tasks.filter(t => t.priority === 'high').length

    let title = `📋 ${tasks.length} task aktif`
    if (urgentCount > 0) {
        title = `🔴 ${urgentCount} urgent, ${tasks.length - urgentCount} lainnya`
    } else if (highCount > 0) {
        title = `🟠 ${highCount} high priority, ${tasks.length - highCount} lainnya`
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body: tasks.slice(0, 3).map(t => `• ${t.title}`).join('\n'),
            sticky: true,
        },
        trigger: null,
    })
}

export const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync()
    await Notifications.dismissAllNotificationsAsync()
}
