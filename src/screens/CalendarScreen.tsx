import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Task } from '../types'
import {
    getTasks,
    getTasksForDate,
    toggleTaskComplete,
    deleteTask,
    addTask,
    updateTask
} from '../services/storage'
import {
    getToday,
    getMonthDays,
    getFirstDayOfMonth,
    formatDisplayDate,
    isToday,
    isPast
} from '../utils/date'
import TaskList from '../components/TaskList'
import AddTaskModal from '../components/AddTaskModal'
import { scheduleTaskReminder, cancelTaskReminder, updatePersistentNotification } from '../services/notification'

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const CalendarScreen: React.FC = () => {
    const today = getToday()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(today)
    const [tasks, setTasks] = useState<Task[]>([])
    const [allTasks, setAllTasks] = useState<Task[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const loadTasks = async () => {
        const all = await getTasks()
        setAllTasks(all)
        const dateTasks = await getTasksForDate(selectedDate)
        setTasks(dateTasks)
    }

    useFocusEffect(
        useCallback(() => {
            loadTasks()
        }, [selectedDate])
    )

    const getTaskCountForDate = (date: string): number => {
        return allTasks.filter(t => t.scheduledDate === date).length
    }

    const hasIncompleteForDate = (date: string): boolean => {
        return allTasks.some(t => t.scheduledDate === date && !t.completed)
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const handleToggle = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
        await toggleTaskComplete(id)
        if (task.completed) {
            await cancelTaskReminder(id)
        } else {
            await scheduleTaskReminder({ ...task, completed: !task.completed })
        }
        await updatePersistentNotification()
        loadTasks()
    }

    const handleDelete = (id: string) => {
        Alert.alert(
            'Hapus Task',
            'Yakin mau hapus task ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        setTasks(prev => prev.filter(t => t.id !== id))
                        await cancelTaskReminder(id)
                        await deleteTask(id)
                        await updatePersistentNotification()
                        loadTasks()
                    }
                }
            ]
        )
    }

    const handleSave = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'carriedOver'>) => {
        if (taskToEdit) {
            await updateTask(taskToEdit.id, taskData)
            setTaskToEdit(undefined)
        } else {
            const newTask = await addTask(taskData)
            await scheduleTaskReminder(newTask)
        }
        await updatePersistentNotification()
        loadTasks()
    }

    const handlePress = (task: Task) => {
        setTaskToEdit(task)
        setModalVisible(true)
    }

    const monthDays = getMonthDays(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const paddingDays = Array(firstDay).fill(null)

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Kalender</Text>
            </View>

            <View style={styles.monthNav}>
                <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                    <Text style={styles.navBtnText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
                <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                    <Text style={styles.navBtnText}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
                {WEEKDAYS.map(day => (
                    <Text key={day} style={styles.weekdayText}>{day}</Text>
                ))}
            </View>

            <View style={styles.daysGrid}>
                {paddingDays.map((_, i) => (
                    <View key={`pad-${i}`} style={styles.dayCell} />
                ))}
                {monthDays.map(date => {
                    const dayNum = parseInt(date.split('-')[2])
                    const taskCount = getTaskCountForDate(date)
                    const hasIncomplete = hasIncompleteForDate(date)
                    const isSelected = date === selectedDate
                    const isTodayDate = isToday(date)
                    const isPastDate = isPast(date)

                    return (
                        <TouchableOpacity
                            key={date}
                            style={[
                                styles.dayCell,
                                isSelected && styles.dayCellSelected,
                                isTodayDate && styles.dayCellToday
                            ]}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Text style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                isPastDate && !isSelected && styles.dayTextPast
                            ]}>
                                {dayNum}
                            </Text>
                            {taskCount > 0 && (
                                <View style={[
                                    styles.taskDot,
                                    hasIncomplete ? styles.taskDotIncomplete : styles.taskDotComplete
                                ]} />
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>

            <View style={styles.selectedSection}>
                <View style={styles.selectedHeader}>
                    <Text style={styles.selectedTitle}>{formatDisplayDate(selectedDate)}</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addBtnText}>+ Task</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.taskListContainer}>
                    <TaskList
                        tasks={tasks}
                        onToggle={handleToggle}
                        onPress={handlePress}
                        onDelete={handleDelete}
                        emptyMessage="Tidak ada task"
                    />
                </View>
            </View>

            <AddTaskModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                    setTaskToEdit(undefined)
                }}
                onSave={handleSave}
                initialDate={selectedDate}
                editTask={taskToEdit}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    navBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBtnText: {
        fontSize: 28,
        color: '#6366F1',
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    weekdayRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    weekdayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    dayCellSelected: {
        backgroundColor: '#6366F1',
        borderRadius: 10,
    },
    dayCellToday: {
        borderWidth: 2,
        borderColor: '#6366F1',
        borderRadius: 10,
    },
    dayText: {
        fontSize: 15,
        color: '#FFF',
    },
    dayTextSelected: {
        fontWeight: '700',
    },
    dayTextPast: {
        color: '#555',
    },
    taskDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 2,
    },
    taskDotIncomplete: {
        backgroundColor: '#F59E0B',
    },
    taskDotComplete: {
        backgroundColor: '#10B981',
    },
    selectedSection: {
        flex: 1,
        backgroundColor: '#141420',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: 16,
        padding: 16,
    },
    selectedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    selectedTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    addBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: '600',
    },
    taskListContainer: {
        flex: 1,
    },
})

export default CalendarScreen
