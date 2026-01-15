export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
}

export const getToday = (): string => {
    return formatDate(new Date())
}

export const parseDate = (dateStr: string): Date => {
    return new Date(dateStr + 'T00:00:00')
}

export const isToday = (dateStr: string): boolean => {
    return dateStr === getToday()
}

export const isPast = (dateStr: string): boolean => {
    return dateStr < getToday()
}

export const isFuture = (dateStr: string): boolean => {
    return dateStr > getToday()
}

export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
}

export const getMonthDays = (year: number, month: number): string[] => {
    const days: string[] = []
    const daysCount = getDaysInMonth(year, month)
    for (let d = 1; d <= daysCount; d++) {
        const date = new Date(year, month, d)
        days.push(formatDate(date))
    }
    return days
}

export const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
}

export const formatDisplayDate = (dateStr: string): string => {
    const date = parseDate(dateStr)
    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    })
}

export const getDaysDiff = (date1: string, date2: string): number => {
    const d1 = parseDate(date1)
    const d2 = parseDate(date2)
    const diff = d2.getTime() - d1.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const addDays = (dateStr: string, days: number): string => {
    const date = parseDate(dateStr)
    date.setDate(date.getDate() + days)
    return formatDate(date)
}

export const getLast30Days = (): string[] => {
    const days: string[] = []
    const today = getToday()
    for (let i = 29; i >= 0; i--) {
        days.push(addDays(today, -i))
    }
    return days
}
