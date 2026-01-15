import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Analytics, PRIORITY_COLORS, PRIORITY_LABELS, Priority } from '../types'
import { calculateAnalytics } from '../services/analytics'

const AnalyticsScreen: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const data = await calculateAnalytics()
                setAnalytics(data)
            }
            load()
        }, [])
    )

    if (!analytics) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Loading...</Text>
            </View>
        )
    }

    const maxDayTasks = Math.max(...analytics.dailyStats.map(d => d.total), 1)

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Statistik</Text>
                <Text style={styles.subtitle}>30 hari terakhir</Text>
            </View>

            <View style={styles.cardsRow}>
                <View style={styles.card}>
                    <Text style={styles.cardValue}>{Math.round(analytics.completionRate)}%</Text>
                    <Text style={styles.cardLabel}>Completion Rate</Text>
                </View>
                <View style={styles.card}>
                    <Text style={[styles.cardValue, { color: '#10B981' }]}>{analytics.streakDays}</Text>
                    <Text style={styles.cardLabel}>Streak Hari</Text>
                </View>
            </View>

            <View style={styles.cardsRow}>
                <View style={styles.card}>
                    <Text style={[styles.cardValue, { color: '#F59E0B' }]}>{Math.round(analytics.carryOverRate)}%</Text>
                    <Text style={styles.cardLabel}>Carry Over Rate</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardValue}>
                        {Object.values(analytics.tasksByPriority).reduce((a, b) => a + b, 0)}
                    </Text>
                    <Text style={styles.cardLabel}>Total Tasks</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completion per Hari</Text>
                <View style={styles.chartContainer}>
                    {analytics.dailyStats.slice(-14).map((day, idx) => {
                        const height = day.total > 0 ? (day.completed / day.total) * 100 : 0
                        const dayNum = day.date.split('-')[2]
                        return (
                            <View key={day.date} style={styles.barWrapper}>
                                <View style={styles.barBg}>
                                    <View style={[styles.barFill, { height: `${height}%` }]} />
                                </View>
                                <Text style={styles.barLabel}>{dayNum}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Task per Priority</Text>
                {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => {
                    const count = analytics.tasksByPriority[p]
                    const total = Object.values(analytics.tasksByPriority).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? (count / total) * 100 : 0

                    return (
                        <View key={p} style={styles.priorityRow}>
                            <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                            <Text style={styles.priorityLabel}>{PRIORITY_LABELS[p]}</Text>
                            <View style={styles.priorityBarBg}>
                                <View style={[
                                    styles.priorityBarFill,
                                    { width: `${percentage}%`, backgroundColor: PRIORITY_COLORS[p] }
                                ]} />
                            </View>
                            <Text style={styles.priorityCount}>{count}</Text>
                        </View>
                    )
                })}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Insight</Text>
                <View style={styles.insightCard}>
                    {analytics.completionRate >= 80 && (
                        <Text style={styles.insightText}>🎉 Mantap! Completion rate di atas 80%</Text>
                    )}
                    {analytics.completionRate < 50 && (
                        <Text style={styles.insightText}>💪 Ayo tingkatkan! Completion rate masih di bawah 50%</Text>
                    )}
                    {analytics.carryOverRate > 30 && (
                        <Text style={styles.insightText}>⚠️ Banyak task tertunda. Coba kurangi beban atau prioritaskan.</Text>
                    )}
                    {analytics.streakDays >= 7 && (
                        <Text style={styles.insightText}>🔥 Streak {analytics.streakDays} hari! Keep it up!</Text>
                    )}
                    {analytics.streakDays === 0 && (
                        <Text style={styles.insightText}>📌 Mulai streak baru hari ini dengan menyelesaikan semua task!</Text>
                    )}
                    {analytics.tasksByPriority.urgent > analytics.tasksByPriority.low && (
                        <Text style={styles.insightText}>🚨 Banyak task urgent. Pertimbangkan untuk mendelegasi atau reschedule.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D14',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    loading: {
        color: '#666',
        textAlign: 'center',
        marginTop: 100,
    },
    header: {
        paddingTop: 44,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        backgroundColor: '#1E1E2E',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    cardValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#6366F1',
    },
    cardLabel: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 16,
    },
    chartContainer: {
        flexDirection: 'row',
        height: 120,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E2E',
        borderRadius: 16,
        padding: 16,
        paddingBottom: 24,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    barBg: {
        width: 12,
        height: 80,
        backgroundColor: '#2A2A3A',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 6,
    },
    barLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 6,
    },
    priorityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    priorityLabel: {
        width: 70,
        fontSize: 14,
        color: '#AAA',
    },
    priorityBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#1E1E2E',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 12,
    },
    priorityBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    priorityCount: {
        width: 30,
        fontSize: 14,
        color: '#FFF',
        textAlign: 'right',
    },
    insightCard: {
        backgroundColor: '#1E1E2E',
        borderRadius: 16,
        padding: 16,
    },
    insightText: {
        fontSize: 14,
        color: '#CCC',
        marginBottom: 10,
        lineHeight: 22,
    },
})

export default AnalyticsScreen
