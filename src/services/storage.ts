import AsyncStorage from '@react-native-async-storage/async-storage'
import { Task, AppState } from '../types'
import { getToday, isPast } from '../utils/date'

const STORAGE_KEY = 'task_reminder_app_state'

const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const sanitizeTask = (task: any): Task => {
    return {
        ...task,
        completed: task.completed === true || task.completed === 'true',
        carriedOver: task.carriedOver === true || task.carriedOver === 'true',
        reminderInterval: typeof task.reminderInterval === 'number' ? task.reminderInterval : parseInt(task.reminderInterval) || 0
    }
}

export const getAppState = async (): Promise<AppState> => {
    const data = await AsyncStorage.getItem(STORAGE_KEY)
    if (!data) {
        return { lastOpenedDate: getToday(), tasks: [] }
    }
    const parsed = JSON.parse(data)
    return {
        ...parsed,
        tasks: parsed.tasks.map(sanitizeTask)
    }
}

export const saveAppState = async (state: AppState): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const getTasks = async (): Promise<Task[]> => {
    const state = await getAppState()
    return state.tasks
}

export const getTasksForDate = async (date: string): Promise<Task[]> => {
    const tasks = await getTasks()
    return tasks.filter(t => t.scheduledDate === date)
}

export const getTodayTasks = async (): Promise<Task[]> => {
    const tasks = await getTasks()
    const today = getToday()
    return tasks.filter(t =>
        (t.scheduledDate === today) ||
        (t.type === 'lifetime' && !t.completed)
    )
}

export const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'carriedOver'>): Promise<Task> => {
    const state = await getAppState()
    const newTask: Task = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
        completed: false,
        carriedOver: false
    }
    state.tasks.push(newTask)
    await saveAppState(state)
    return newTask
}

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const state = await getAppState()
    const idx = state.tasks.findIndex(t => t.id === taskId)
    if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...updates }
        await saveAppState(state)
    }
}

export const deleteTask = async (taskId: string): Promise<void> => {
    const state = await getAppState()
    state.tasks = state.tasks.filter(t => t.id !== taskId)
    await saveAppState(state)
}

export const toggleTaskComplete = async (taskId: string): Promise<void> => {
    const state = await getAppState()
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
        task.completed = !task.completed
        task.completedAt = task.completed ? new Date().toISOString() : undefined
        await saveAppState(state)
    }
}

export const processCarryOver = async (): Promise<number> => {
    const state = await getAppState()
    const today = getToday()

    if (state.lastOpenedDate === today) {
        return 0
    }

    let carriedCount = 0
    const updatedTasks = state.tasks.map(task => {
        if (!task.completed && isPast(task.scheduledDate) && task.type === 'daily') {
            carriedCount++
            return {
                ...task,
                carriedOver: true,
                originalDate: task.originalDate || task.scheduledDate,
                scheduledDate: today
            }
        }
        return task
    })

    state.tasks = updatedTasks
    state.lastOpenedDate = today
    await saveAppState(state)

    return carriedCount
}

export const getIncompleteTasks = async (): Promise<Task[]> => {
    const tasks = await getTasks()
    const today = getToday()
    return tasks.filter(t => !t.completed && (t.scheduledDate === today || t.type === 'lifetime'))
}
