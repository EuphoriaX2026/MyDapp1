// Global error tracking utility
let errorCount = 0
const MAX_ERRORS = 10

export const trackError = (source: string, error: any) => {
    errorCount++

    const errorInfo = {
        count: errorCount,
        timestamp: new Date().toISOString(),
        source,
        error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : String(error),
        userAgent: navigator.userAgent,
        url: window.location.href
    }

    console.error(`[ERROR TRACKER #${errorCount}] ${source}:`, errorInfo)

    // Store in sessionStorage for debugging
    try {
        const existingErrors = JSON.parse(sessionStorage.getItem('euphoriaErrors') || '[]')
        existingErrors.push(errorInfo)

        // Keep only last 10 errors
        if (existingErrors.length > MAX_ERRORS) {
            existingErrors.splice(0, existingErrors.length - MAX_ERRORS)
        }

        sessionStorage.setItem('euphoriaErrors', JSON.stringify(existingErrors))
    } catch (storageError) {
        console.warn('Could not store error in sessionStorage:', storageError)
    }

    // If too many errors, trigger emergency reload
    if (errorCount >= MAX_ERRORS) {
        console.error('Too many errors detected, triggering page reload...')
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }
}

export const getStoredErrors = () => {
    try {
        return JSON.parse(sessionStorage.getItem('euphoriaErrors') || '[]')
    } catch {
        return []
    }
}

export const clearStoredErrors = () => {
    try {
        sessionStorage.removeItem('euphoriaErrors')
        errorCount = 0
    } catch {
        console.warn('Could not clear stored errors')
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    trackError('GLOBAL_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    })
})

window.addEventListener('unhandledrejection', (event) => {
    trackError('UNHANDLED_PROMISE_REJECTION', {
        reason: event.reason,
        promise: event.promise
    })
})
