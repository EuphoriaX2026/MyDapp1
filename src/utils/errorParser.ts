// Utility for parsing and categorizing wallet/transaction errors into user-friendly messages

export interface ParsedError {
    type: 'user_rejection' | 'insufficient_funds' | 'network_error' | 'gas_error' | 'approval_error' | 'hook_error' | 'system_error' | 'unknown'
    title: string
    message: string
    action?: string
}

/**
 * Parses common wallet and transaction errors into user-friendly messages
 * @param error - The error object from wallet or contract interaction
 * @returns ParsedError with user-friendly title and message
 */
export const parseTransactionError = (error: any): ParsedError => {
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    const errorCode = error?.code || error?.reason
    const errorType = error?.type

    // Hook or system errors
    if (errorType === 'hook_error' || errorMessage.includes('Hook error') || errorMessage.includes('System Error')) {
        return {
            type: 'hook_error',
            title: 'System Connection Error',
            message: 'There was a problem connecting to the blockchain system.',
            action: 'Please refresh the page and try again. If the problem persists, check your wallet connection.'
        }
    }

    // User rejected the transaction
    if (
        errorMessage.includes('User rejected') ||
        errorMessage.includes('user rejected') ||
        errorMessage.includes('User denied') ||
        errorMessage.includes('user denied') ||
        errorMessage.includes('Transaction was rejected') ||
        errorMessage.includes('rejected the request') ||
        errorMessage.includes('User cancelled') ||
        errorMessage.includes('user cancelled') ||
        errorMessage.includes('Transaction cancelled') ||
        errorCode === 4001 || // MetaMask user rejection
        errorCode === 'ACTION_REJECTED'
    ) {
        return {
            type: 'user_rejection',
            title: 'Transaction Cancelled',
            message: 'You cancelled the transaction in your wallet. No funds were transferred and no fees were charged.',
            action: 'Click "Try Again" when you\'re ready to proceed with the transaction.'
        }
    }

    // Enhanced insufficient funds detection - Check for custom error structure
    if (
        error?.type === 'insufficient_balance' ||
        errorMessage.includes('insufficient funds') ||
        errorMessage.includes('insufficient balance') ||
        errorMessage.includes('Insufficient') ||
        errorMessage.includes('transfer amount exceeds balance') ||
        errorMessage.includes('ERC20: transfer amount exceeds balance') ||
        errorMessage.includes('not enough balance') ||
        errorMessage.includes('exceeds allowance') ||
        errorMessage.includes('balance') ||
        errorCode === 'UNPREDICTABLE_GAS_LIMIT' // Often indicates insufficient balance
    ) {
        // Use custom message if provided
        if (error?.type === 'insufficient_balance' && error?.message) {
            return {
                type: 'insufficient_funds',
                title: 'Insufficient Balance',
                message: error.message,
                action: `Please add more ${error.token || 'tokens'} to your wallet or try a smaller amount.`
            }
        }

        return {
            type: 'insufficient_funds',
            title: 'Insufficient Balance',
            message: 'You don\'t have enough funds in your wallet to complete this transaction.',
            action: 'Please check your balance or try a smaller amount. Make sure you have enough tokens plus gas fees (POL) for the transaction.'
        }
    }

    // Gas related errors
    if (
        errorMessage.includes('gas') ||
        errorMessage.includes('Gas') ||
        errorMessage.includes('out of gas') ||
        errorMessage.includes('gas limit') ||
        errorMessage.includes('gas price') ||
        errorMessage.includes('transaction underpriced') ||
        errorMessage.includes('max fee per gas')
    ) {
        return {
            type: 'gas_error',
            title: 'Transaction Fee Issue',
            message: 'There was a problem with the network transaction fee (gas). This could be due to network congestion or insufficient POL for fees.',
            action: 'Please ensure you have enough POL in your wallet for gas fees and try again. You may need to increase the gas limit in your wallet settings.'
        }
    }

    // Network errors
    if (
        errorMessage.includes('network') ||
        errorMessage.includes('Network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('Could not connect')
    ) {
        return {
            type: 'network_error',
            title: 'Network Connection Error',
            message: 'Unable to connect to the blockchain network.',
            action: 'Please check your internet connection and try again.'
        }
    }

    // Approval errors
    if (
        errorMessage.includes('approval') ||
        errorMessage.includes('Approval') ||
        errorMessage.includes('allowance') ||
        errorMessage.includes('approve')
    ) {
        return {
            type: 'approval_error',
            title: 'Token Approval Error',
            message: 'There was an issue approving your tokens for exchange.',
            action: 'Please try the approval process again.'
        }
    }

    // Enhanced contract execution errors - Check for custom error structure
    if (
        error?.type === 'smart_contract_error' ||
        errorMessage.includes('execution reverted') ||
        errorMessage.includes('revert') ||
        errorMessage.includes('transaction failed') ||
        errorMessage.includes('smart contract error')
    ) {
        // Use custom message if provided
        if (error?.type === 'smart_contract_error' && error?.message) {
            return {
                type: 'unknown',
                title: 'Smart Contract Error',
                message: error.message,
                action: error.reason ? `Reason: ${error.reason}. Please try again or contact support if the problem persists.` : 'Please try again or contact support if the problem persists.'
            }
        }

        return {
            type: 'unknown',
            title: 'Transaction Failed',
            message: 'The transaction could not be completed due to a smart contract error.',
            action: 'Please try again or contact support if the problem persists.'
        }
    }

    // Default for unknown errors
    return {
        type: 'unknown',
        title: 'Transaction Error',
        message: 'An unexpected error occurred during the transaction.',
        action: 'Please try again or contact support if the problem persists.'
    }
}

/**
 * Formats error for development debugging while keeping user message clean
 * @param error - The original error
 * @param parsedError - The parsed user-friendly error
 * @returns Debug information for console logging
 */
export const formatErrorForDebug = (error: any, parsedError: ParsedError) => {
    return {
        userFacing: parsedError,
        technical: {
            message: error?.message || error?.toString(),
            code: error?.code,
            stack: error?.stack,
            fullError: error
        },
        timestamp: new Date().toISOString()
    }
}

/**
 * Gets appropriate icon for error type
 * @param errorType - The error type
 * @returns Ionic icon object
 */
export const getErrorIcon = (errorType: ParsedError['type']): string => {
    switch (errorType) {
        case 'user_rejection':
            return 'lucide:hand'
        case 'insufficient_funds':
            return 'lucide:wallet'
        case 'network_error':
            return 'lucide:wifi'
        case 'gas_error':
            return 'lucide:gauge'
        case 'approval_error':
            return 'lucide:circle-check'
        case 'hook_error':
        case 'system_error':
            return 'lucide:wrench'
        default:
            return 'lucide:circle-alert'
    }
}

/**
 * Gets appropriate color class for error type
 * @param errorType - The error type
 * @returns CSS color class
 */
export const getErrorColor = (errorType: ParsedError['type']): string => {
    switch (errorType) {
        case 'user_rejection':
            return 'text-warning'
        case 'insufficient_funds':
            return 'text-danger'
        case 'network_error':
            return 'text-info'
        case 'gas_error':
            return 'text-warning'
        case 'approval_error':
            return 'text-primary'
        case 'hook_error':
        case 'system_error':
            return 'text-secondary'
        default:
            return 'text-danger'
    }
}
