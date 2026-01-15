import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { Task, Priority, TaskType, PRIORITY_COLORS, PRIORITY_LABELS } from '../types'
import { getToday, formatDisplayDate } from '../utils/date'

interface Props {
    visible: boolean
    onClose: () => void
    onSave: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'carriedOver'>) => void
    initialDate?: string
    editTask?: Task
}

const REMINDER_OPTIONS = [
    { label: 'Tidak ada', value: 0 },
    { label: '30 menit', value: 30 },
    { label: '1 jam', value: 60 },
    { label: '2 jam', value: 120 },
    { label: '4 jam', value: 240 },
]

const AddTaskModal: React.FC<Props> = ({
    visible,
    onClose,
    onSave,
    initialDate,
    editTask
}) => {
    const [title, setTitle] = useState(editTask?.title || '')
    const [description, setDescription] = useState(editTask?.description || '')
    const [type, setType] = useState<TaskType>(editTask?.type || 'daily')
    const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium')
    const [reminderInterval, setReminderInterval] = useState(editTask?.reminderInterval || 60)

    React.useEffect(() => {
        if (visible) {
            setTitle(editTask?.title || '')
            setDescription(editTask?.description || '')
            setType(editTask?.type || 'daily')
            setPriority(editTask?.priority || 'medium')
            setReminderInterval(editTask?.reminderInterval || 60)
        }
    }, [visible, editTask])

    React.useEffect(() => {
        if (!visible && !editTask) {
            setTitle('')
            setDescription('')
            setType('daily')
            setPriority('medium')
            setReminderInterval(60)
        }
    }, [visible, editTask])

    const handleSave = () => {
        if (!title.trim()) return

        onSave({
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            priority,
            scheduledDate: initialDate || getToday(),
            reminderInterval,
        })

        onClose()
    }

    const reset = () => {
        onClose()
    }

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={StyleSheet.absoluteFill}
                    onPress={reset}
                />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {editTask ? 'Edit Task' : 'Task Baru'}
                        </Text>
                        <Text style={styles.headerDate}>
                            {formatDisplayDate(initialDate || getToday())}
                        </Text>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Judul</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Apa yang mau dikerjakan?"
                            placeholderTextColor="#666"
                        />

                        <Text style={styles.label}>Deskripsi (opsional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Detail tambahan..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={3}
                        />

                        <Text style={styles.label}>Tipe</Text>
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'daily' && styles.typeBtnActive]}
                                onPress={() => setType('daily')}
                            >
                                <Text style={styles.typeEmoji}>📅</Text>
                                <Text style={[styles.typeBtnText, type === 'daily' && styles.typeBtnTextActive]}>
                                    Daily
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'lifetime' && styles.typeBtnActive]}
                                onPress={() => setType('lifetime')}
                            >
                                <Text style={styles.typeEmoji}>♾️</Text>
                                <Text style={[styles.typeBtnText, type === 'lifetime' && styles.typeBtnTextActive]}>
                                    Lifetime
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Prioritas</Text>
                        <View style={styles.priorityRow}>
                            {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.priorityBtn,
                                        { borderColor: PRIORITY_COLORS[p] },
                                        priority === p && { backgroundColor: PRIORITY_COLORS[p] }
                                    ]}
                                    onPress={() => setPriority(p)}
                                >
                                    <Text style={[
                                        styles.priorityBtnText,
                                        priority === p && styles.priorityBtnTextActive
                                    ]}>
                                        {PRIORITY_LABELS[p]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Reminder</Text>
                        <View style={styles.reminderRow}>
                            {REMINDER_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.reminderBtn,
                                        reminderInterval === opt.value && styles.reminderBtnActive
                                    ]}
                                    onPress={() => setReminderInterval(opt.value)}
                                >
                                    <Text style={[
                                        styles.reminderBtnText,
                                        reminderInterval === opt.value && styles.reminderBtnTextActive
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={reset}>
                            <Text style={styles.cancelBtnText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={!title.trim()}
                        >
                            <Text style={styles.saveBtnText}>Simpan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#141420',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A3A',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    headerDate: {
        fontSize: 14,
        color: '#6366F1',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#1E1E2E',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    typeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#1E1E2E',
        padding: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#2A2A3A',
    },
    typeBtnActive: {
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    typeEmoji: {
        fontSize: 18,
    },
    typeBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#888',
    },
    typeBtnTextActive: {
        color: '#FFF',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    priorityBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
    },
    priorityBtnTextActive: {
        color: '#FFF',
    },
    reminderRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    reminderBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: '#1E1E2E',
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    reminderBtnActive: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    reminderBtnText: {
        fontSize: 13,
        color: '#888',
    },
    reminderBtnTextActive: {
        color: '#FFF',
    },
    actions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#2A2A3A',
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#2A2A3A',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
    },
    saveBtn: {
        flex: 2,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#6366F1',
        alignItems: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.5,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
})

export default AddTaskModal
