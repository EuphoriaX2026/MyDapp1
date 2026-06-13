/**
 * Development logging utilities
 * These functions only log in development mode to keep production builds clean
 */

export const devLog = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args)
    }
}

export const devWarn = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.warn(...args)
    }
}

export const devError = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(...args)
    }
}

export const devGroup = (label: string, callback: () => void) => {
    if (process.env.NODE_ENV === 'development') {
        console.group(label)
        callback()
        console.groupEnd()
    }
}

export const devTable = (data: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.table(data)
    }
}

export const devTime = (label: string) => {
    if (process.env.NODE_ENV === 'development') {
        console.time(label)
    }
}

export const devTimeEnd = (label: string) => {
    if (process.env.NODE_ENV === 'development') {
        console.timeEnd(label)
    }
}

// Legacy console methods that should be avoided in production
export const productionSafeConsole = {
    log: devLog,
    warn: devWarn,
    error: devError,
    group: devGroup,
    table: devTable,
    time: devTime,
    timeEnd: devTimeEnd
}
