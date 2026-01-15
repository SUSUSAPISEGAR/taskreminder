import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Task } from '../types'
import { formatDisplayDate } from '../utils/date'
import PriorityBadge from './PriorityBadge'

interface Props {
    task: Task
    onToggle: (id: string) => void
    onPress: (task: Task) => void
    onDelete: (id: string) => void
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onPress, onDelete }) => {
    return (
        <View style={[styles.container, task.completed && styles.completed]}>
            <TouchableOpacity
                style={[styles.checkbox, task.completed && styles.checkboxChecked]}
                onPress={() => onToggle(task.id)}
                activeOpacity={0.7}
            >
                {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.content}
                onPress={() => onPress(task)}
                onLongPress={() => onDelete(task.id)}
                activeOpacity={0.7}
            >
                <View style={styles.header}>
                    <Text
                        style={[styles.title, task.completed && styles.titleCompleted]}
                        numberOfLines={1}
                    >
                        {task.title}
                    </Text>
                    <PriorityBadge priority={task.priority} />
                </View>

                {task.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {task.description}
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={styles.meta}>
                        {task.type === 'lifetime' ? '♾️ Lifetime' : '📅 Daily'}
                    </Text>
                    {task.carriedOver && (
                        <Text style={styles.carriedOver}>
                            ↩️ dari {formatDisplayDate(task.originalDate!)}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#1E1E2E',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        alignItems: 'center',
    },
    completed: {
        opacity: 0.6,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#6366F1',
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#6366F1',
    },
    checkmark: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        flex: 1,
        marginRight: 8,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    description: {
        fontSize: 13,
        color: '#A0A0A0',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    meta: {
        fontSize: 11,
        color: '#666',
    },
    carriedOver: {
        fontSize: 11,
        color: '#F59E0B',
    },
})

export default React.memo(TaskItem)
