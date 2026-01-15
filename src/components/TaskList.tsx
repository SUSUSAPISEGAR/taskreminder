import React from 'react'
import { FlatList, Text, StyleSheet, View } from 'react-native'
import { Task } from '../types'
import TaskItem from './TaskItem'

interface Props {
    tasks: Task[]
    onToggle: (id: string) => void
    onPress: (task: Task) => void
    onDelete: (id: string) => void
    emptyMessage?: string
}

const TaskList: React.FC<Props> = ({
    tasks,
    onToggle,
    onPress,
    onDelete,
    emptyMessage = 'Tidak ada task'
}) => {
    if (tasks.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        )
    }

    const sortedTasks = React.useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
    }, [tasks])

    return (
        <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TaskItem
                    task={item}
                    onToggle={onToggle}
                    onPress={onPress}
                    onDelete={onDelete}
                />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            initialNumToRender={10}
        />
    )
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: 100,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
})

export default TaskList
