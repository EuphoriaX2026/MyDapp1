/**
 * Suppress common deprecation warnings from third-party libraries
 * This file helps silence known warnings that we can't fix directly
 */

// Suppress specific console warnings in development
if (process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn
    const originalError = console.error

    console.warn = (...args) => {
        const message = args.join(' ')

        // Suppress known React 19 compatibility warnings from third-party libraries
        const suppressPatterns = [
            'Warning: React.jsx: type is invalid',
            'Warning: validateDOMNesting',
            'Warning: Each child in a list should have a unique "key" prop',
            'ReactDOM.render is no longer supported',
            'componentWillMount',
            'componentWillReceiveProps',
            'componentWillUpdate',
            'findDOMNode',
            'peer dependency',
            'use-sync-external-store',
            'Lit is in dev mode',
            'differs from the actual page url'
        ]

        if (!suppressPatterns.some(pattern => message.includes(pattern))) {
            originalWarn(...args)
        }
    }

    console.error = (...args) => {
        const message = args.join(' ')

        // Suppress known errors that don't affect functionality
        const suppressErrorPatterns = [
            'ResizeObserver loop limit exceeded',
            'Non-passive event listener',
            'Declined to execute inline event handler'
        ]

        if (!suppressErrorPatterns.some(pattern => message.includes(pattern))) {
            originalError(...args)
        }
    }
}

export { }
