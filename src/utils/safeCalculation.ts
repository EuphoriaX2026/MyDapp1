// Safe calculation utilities to prevent crashes
export const safeParseFloat = (value: string | number): number => {
    try {
        if (typeof value === 'number') return value
        if (typeof value !== 'string') return 0

        const parsed = parseFloat(value)
        return isNaN(parsed) ? 0 : parsed
    } catch {
        return 0
    }
}

export const safeBigIntOperation = (operation: () => bigint): bigint | null => {
    try {
        const result = operation()
        return result
    } catch (error) {
        console.error('BigInt operation failed:', error)
        return null
    }
}

export const validateNumberInput = (input: string): boolean => {
    if (!input || input === '') return true
    if (input.length > 20) return false
    return /^\d*\.?\d*$/.test(input)
}
