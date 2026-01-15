import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Priority, PRIORITY_COLORS, PRIORITY_LABELS } from '../types'

interface Props {
    priority: Priority
    size?: 'small' | 'medium'
}

const PriorityBadge: React.FC<Props> = ({ priority, size = 'small' }) => {
    const isSmall = size === 'small'

    return (
        <View style={[
            styles.badge,
            { backgroundColor: PRIORITY_COLORS[priority] },
            isSmall ? styles.small : styles.medium
        ]}>
            <Text style={[styles.text, isSmall && styles.textSmall]}>
                {PRIORITY_LABELS[priority]}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    small: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    medium: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    text: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
    },
    textSmall: {
        fontSize: 10,
    },
})

export default PriorityBadge
