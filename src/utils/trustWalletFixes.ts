/**
 * Trust Wallet specific fixes for approval transactions
 * These utilities address known compatibility issues between Trust Wallet mobile and desktop/MetaMask
 */

import { type Address, parseUnits, maxUint256 } from 'viem'
import { estimateGas } from '@wagmi/core'
import { config } from '../config/wagmi'

// Trust Wallet specific transaction configurations
export const TRUST_WALLET_CONFIG = {
    // Use smaller but still very large approval amounts instead of max uint256
    LARGE_APPROVAL_AMOUNT: '1000000000000000000000000000', // 10^27 (safer than max uint256)

    // Gas settings for Trust Wallet mobile
    GAS_MULTIPLIER: 1.2, // 20% gas buffer for mobile wallets
    MAX_GAS_LIMIT: 500000, // Max gas limit to prevent rejections

    // Approval strategies
    PREFER_EXACT_APPROVAL: false, // Set to true if infinite approvals cause issues

    // Transaction retry settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000, // 2 seconds between retries
}

/**
 * Detect if user is using Trust Wallet
 */
export const isTrustWallet = (): boolean => {
    if (typeof window === 'undefined') return false

    // Check multiple Trust Wallet indicators
    return !!(
        window.ethereum?.isTrust ||
        window.ethereum?.isTrustWallet ||
        (window as any).trustwallet ||
        navigator.userAgent.toLowerCase().includes('trust')
    )
}

/**
 * Detect if we're in Trust Wallet's mobile app browser
 */
export const isTrustWalletMobile = (): boolean => {
    if (typeof window === 'undefined') return false

    const userAgent = navigator.userAgent.toLowerCase()
    return (
        isTrustWallet() &&
        /android|iphone|ipad|mobile/i.test(userAgent)
    )
}

/**
 * Get optimal approval amount for Trust Wallet
 * Trust Wallet mobile sometimes has issues with max uint256 approvals
 */
export const getTrustWalletApprovalAmount = (
    requestedAmount: string,
    decimals: number,
    useInfiniteApproval: boolean = true
): bigint => {
    const parsedRequested = parseUnits(requestedAmount, decimals)

    if (!useInfiniteApproval || isTrustWalletMobile()) {
        // For Trust Wallet mobile, use exact amount + small buffer
        const buffer = parsedRequested / 10n // 10% buffer
        return parsedRequested + buffer
    }

    // For desktop or when infinite approval is preferred
    if (TRUST_WALLET_CONFIG.PREFER_EXACT_APPROVAL) {
        return parsedRequested
    }

    // Use large but not max approval amount for Trust Wallet
    if (isTrustWallet()) {
        return parseUnits(TRUST_WALLET_CONFIG.LARGE_APPROVAL_AMOUNT, decimals)
    }

    // Default to max uint256 for other wallets
    return maxUint256
}

/**
 * Enhanced gas estimation for Trust Wallet
 */
export const estimateGasForTrustWallet = async (
    contract: Address,
    abi: any[],
    functionName: string,
    args: any[],
    account: Address
): Promise<bigint> => {
    try {
        // Get base gas estimate
        const baseGas = await estimateGas(config, {
            to: contract,
            account,
        })

        // Apply Trust Wallet specific adjustments
        if (isTrustWalletMobile()) {
            // Mobile wallets often need higher gas limits
            const adjustedGas = BigInt(
                Math.floor(Number(baseGas) * TRUST_WALLET_CONFIG.GAS_MULTIPLIER)
            )

            // Cap at maximum to prevent rejections
            const maxGas = BigInt(TRUST_WALLET_CONFIG.MAX_GAS_LIMIT)
            return adjustedGas > maxGas ? maxGas : adjustedGas
        }

        return baseGas
    } catch (error) {
        console.warn('Gas estimation failed, using fallback:', error)

        // Fallback gas limits for different operations
        if (functionName === 'approve') {
            return BigInt(isTrustWalletMobile() ? 80000 : 60000)
        }

        if (functionName === 'buy') {
            return BigInt(isTrustWalletMobile() ? 200000 : 150000)
        }

        return BigInt(isTrustWalletMobile() ? 150000 : 100000)
    }
}

/**
 * Trust Wallet compatible transaction parameters
 */
export const getTrustWalletTxParams = (baseParams: any) => {
    if (!isTrustWallet()) {
        return baseParams
    }

    return {
        ...baseParams,
        // Trust Wallet specific parameters
        ...(isTrustWalletMobile() && {
            gasLimit: baseParams.gas || baseParams.gasLimit,
            // Remove gasPrice for EIP-1559 compatibility
            maxFeePerGas: undefined,
            maxPriorityFeePerGas: undefined,
        })
    }
}

/**
 * Retry logic for Trust Wallet transactions
 */
export const executeWithTrustWalletRetry = async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Transaction'
): Promise<T> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= TRUST_WALLET_CONFIG.MAX_RETRIES; attempt++) {
        try {
            const result = await operation()

            if (attempt > 1) {
                console.log(`${operationName} succeeded on attempt ${attempt}`)
            }

            return result
        } catch (error) {
            lastError = error as Error

            console.warn(`${operationName} attempt ${attempt} failed:`, error)

            // Don't retry on user rejection
            if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = (error as any).code
                if (errorCode === 4001 || errorCode === 'ACTION_REJECTED') {
                    throw error // User rejected, don't retry
                }
            }

            // Don't retry on the last attempt
            if (attempt === TRUST_WALLET_CONFIG.MAX_RETRIES) {
                break
            }

            // Wait before retry
            await new Promise(resolve =>
                setTimeout(resolve, TRUST_WALLET_CONFIG.RETRY_DELAY)
            )
        }
    }

    throw new Error(
        `${operationName} failed after ${TRUST_WALLET_CONFIG.MAX_RETRIES} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    )
}

/**
 * Enhanced approval function specifically for Trust Wallet compatibility
 */
export const createTrustWalletApprovalParams = (
    tokenAddress: Address,
    spenderAddress: Address,
    amount: string,
    decimals: number
) => {
    const approvalAmount = getTrustWalletApprovalAmount(amount, decimals)

    return {
        address: tokenAddress,
        functionName: 'approve',
        args: [spenderAddress, approvalAmount],
        // Trust Wallet specific configurations
        ...(isTrustWallet() && {
            // Add any Trust Wallet specific transaction options
            value: BigInt(0), // Explicitly set value to 0 for ERC20 approvals
        })
    }
}

/**
 * Debug information for Trust Wallet issues
 */
export const getTrustWalletDebugInfo = () => {
    return {
        isTrustWallet: isTrustWallet(),
        isTrustWalletMobile: isTrustWalletMobile(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
        ethereum: typeof window !== 'undefined' ? {
            isTrust: window.ethereum?.isTrust,
            isTrustWallet: window.ethereum?.isTrustWallet,
            isMetaMask: window.ethereum?.isMetaMask,
        } : {},
        preferExactApproval: TRUST_WALLET_CONFIG.PREFER_EXACT_APPROVAL,
        gasMultiplier: TRUST_WALLET_CONFIG.GAS_MULTIPLIER,
    }
}

/**
 * Log Trust Wallet specific debugging information
 */
export const logTrustWalletDebug = (operation: string, additionalInfo?: any) => {
    if (process.env.NODE_ENV === 'development' && isTrustWallet()) {
        console.log(`[Trust Wallet Debug] ${operation}:`, {
            ...getTrustWalletDebugInfo(),
            ...additionalInfo
        })
    }
}
