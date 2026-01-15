import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Task } from '../types'
import { getTodayTasks, toggleTaskComplete, deleteTask, addTask, processCarryOver, updateTask } from '../services/storage'
import { updatePersistentNotification, scheduleTaskReminder, cancelTaskReminder, requestPermissions } from '../services/notification'
import { checkForUpdates } from '../services/update'
import { getToday, formatDisplayDate } from '../utils/date'
import TaskList from '../components/TaskList'
import AddTaskModal from '../components/AddTaskModal'

const HomeScreen: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined)
    const [carryOverCount, setCarryOverCount] = useState(0)

    const loadTasks = async () => {
        const todayTasks = await getTodayTasks()
        setTasks(todayTasks)
        await updatePersistentNotification()
    }

    const checkCarryOver = async () => {
        const count = await processCarryOver()
        if (count > 0) {
            setCarryOverCount(count)
        }
    }

    useFocusEffect(
        useCallback(() => {
            checkCarryOver().then(loadTasks)
        }, [])
    )

    useEffect(() => {
        requestPermissions()
        checkForUpdates()
    }, [])

    const handleToggle = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        setTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === id ? { ...t, completed: !t.completed } : t
            )
        )

        await toggleTaskComplete(id)
        if (!task.completed) {
            await cancelTaskReminder(id)
        } else {
            await scheduleTaskReminder(task)
        }
        await updatePersistentNotification()
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
                        setTasks(prevTasks => prevTasks.filter(t => t.id !== id))
                        await cancelTaskReminder(id)
                        await deleteTask(id)
                        await updatePersistentNotification()
                    }
                }
            ]
        )
    }

    const handleSave = async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'carriedOver'>) => {
        if (taskToEdit) {
            await updateTask(taskToEdit.id, taskData)
            setTasks(prev => prev.map(t => t.id === taskToEdit.id ? { ...t, ...taskData } : t))
            setTaskToEdit(undefined)
        } else {
            const newTask = await addTask(taskData)
            setTasks(prevTasks => [...prevTasks, newTask])
            await scheduleTaskReminder(newTask)
        }
        await updatePersistentNotification()
    }

    const handlePress = (task: Task) => {
        setTaskToEdit(task)
        setModalVisible(true)
    }

    const completedCount = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hari Ini</Text>
                    <Text style={styles.date}>{formatDisplayDate(getToday())}</Text>
                </View>
                <View style={styles.stats}>
                    <Text style={styles.statsText}>{completedCount}/{tasks.length}</Text>
                    <Text style={styles.statsLabel}>selesai</Text>
                </View>
            </View>

            {carryOverCount > 0 && (
                <View style={styles.carryOverBanner}>
                    <Text style={styles.carryOverText}>
                        ↩️ {carryOverCount} task dari kemarin dipindahkan
                    </Text>
                </View>
            )}

            <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>

            <TaskList
                tasks={tasks}
                onToggle={handleToggle}
                onPress={handlePress}
                onDelete={handleDelete}
                emptyMessage="Tidak ada task hari ini"
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <AddTaskModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false)
                    setTaskToEdit(undefined)
                }}
                onSave={handleSave}
                initialDate={getToday()}
                editTask={taskToEdit}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 60,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    date: {
        fontSize: 16,
        color: '#6366F1',
        marginTop: 4,
    },
    stats: {
        alignItems: 'flex-end',
    },
    statsText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6366F1',
    },
    statsLabel: {
        fontSize: 14,
        color: '#666',
    },
    carryOverBanner: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    carryOverText: {
        color: '#F59E0B',
        fontSize: 14,
        textAlign: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    progressBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#1E1E2E',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
        width: 40,
        textAlign: 'right',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFF',
        marginTop: -2,
    },
})

export default HomeScreen
