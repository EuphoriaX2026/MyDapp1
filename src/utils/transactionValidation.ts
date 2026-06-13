// Minimum transaction value in USD (1 dollar)
const MIN_TRANSACTION_VALUE_USD = 1.0

export interface ValidationResult {
    isValid: boolean
    message?: string
    actualValue?: number
}

/**
 * Validates minimum transaction value for buying stablecoins
 * @param stablecoinAmount - Amount of stablecoin being purchased (as string)
 * @param stablecoinDecimals - Decimal places for the stablecoin
 * @returns ValidationResult indicating if transaction meets minimum value
 */
export const validateMinimumBuyValue = (
    stablecoinAmount: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _stablecoinDecimals: number // Prefixed with underscore to indicate intentionally unused
): ValidationResult => {
    try {
        const numericAmount = parseFloat(stablecoinAmount)

        if (isNaN(numericAmount) || numericAmount <= 0) {
            return {
                isValid: false,
                message: 'Invalid amount'
            }
        }

        // For stablecoins, 1 token ≈ 1 USD, so we can directly compare
        if (numericAmount < MIN_TRANSACTION_VALUE_USD) {
            return {
                isValid: false,
                message: `Minimum purchase is $${MIN_TRANSACTION_VALUE_USD.toFixed(2)} worth of stablecoins`,
                actualValue: numericAmount
            }
        }

        return {
            isValid: true,
            actualValue: numericAmount
        }
    } catch (error) {
        console.error('Error validating minimum buy value:', error)
        return {
            isValid: false,
            message: 'Error validating transaction amount'
        }
    }
}

/**
 * Validates minimum transaction value for selling tokens
 * @param tokenAmount - Amount of token being sold (as string)
 * @param tokenPrice - Price per token in USD (as bigint with 18 decimals)
 * @param tokenDecimals - Decimal places for the token (usually 18 for ERX/QBIT)
 * @returns ValidationResult indicating if transaction meets minimum value
 */
export const validateMinimumSellValue = (
    tokenAmount: string,
    tokenPrice: bigint,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _tokenDecimals: number = 18 // Prefixed with underscore to indicate intentionally unused
): ValidationResult => {
    try {
        const numericAmount = parseFloat(tokenAmount)

        if (isNaN(numericAmount) || numericAmount <= 0) {
            return {
                isValid: false,
                message: 'Invalid amount'
            }
        }

        if (!tokenPrice || tokenPrice <= 0n) {
            return {
                isValid: false,
                message: 'Token price not available'
            }
        }

        // Calculate the USD value of the tokens being sold
        // tokenPrice is in 18 decimals (wei), so we need to convert
        const priceInUSD = Number(tokenPrice) / 1e18
        const totalValueUSD = numericAmount * priceInUSD

        if (totalValueUSD < MIN_TRANSACTION_VALUE_USD) {
            return {
                isValid: false,
                message: `Minimum sale is $${MIN_TRANSACTION_VALUE_USD.toFixed(2)} worth of tokens (approximately ${(MIN_TRANSACTION_VALUE_USD / priceInUSD).toFixed(6)} tokens)`,
                actualValue: totalValueUSD
            }
        }

        return {
            isValid: true,
            actualValue: totalValueUSD
        }
    } catch (error) {
        console.error('Error validating minimum sell value:', error)
        return {
            isValid: false,
            message: 'Error validating transaction amount'
        }
    }
}

/**
 * Main validation function that determines transaction type and validates accordingly
 * @param amount - Transaction amount as string
 * @param exchangeDirection - Direction of exchange ('STABLECOIN_TO_TOKEN' for buy, 'TOKEN_TO_STABLECOIN' for sell)
 * @param tokenPrice - Price per token in USD (for sell mode)
 * @param decimals - Token decimals
 * @returns ValidationResult
 */
export const validateTransaction = (
    amount: string,
    exchangeDirection: 'STABLECOIN_TO_TOKEN' | 'TOKEN_TO_STABLECOIN',
    tokenPrice?: bigint,
    decimals: number = 18
): ValidationResult => {
    if (exchangeDirection === 'STABLECOIN_TO_TOKEN') {
        // BUY MODE: Buying tokens with stablecoins
        // The amount is in stablecoin units, which are approximately $1 each
        return validateMinimumBuyValue(amount, decimals)
    } else {
        // SELL MODE: Selling tokens for stablecoins
        // Need token price to calculate USD value
        if (!tokenPrice) {
            return {
                isValid: false,
                message: 'Token price required for sell validation'
            }
        }
        return validateMinimumSellValue(amount, tokenPrice, decimals)
    }
}

/**
 * Get formatted error message for UI display
 * @param validationResult - Result from validation function
 * @returns Formatted error message or null if valid
 */
export const getValidationErrorMessage = (validationResult: ValidationResult): string | null => {
    if (validationResult.isValid) {
        return null
    }

    return validationResult.message || 'Transaction amount is invalid'
}

/**
 * Check if transaction amount meets minimum requirements
 * @param amount - Transaction amount
 * @param exchangeDirection - Exchange direction
 * @param tokenPrice - Token price (required for sell mode)
 * @param decimals - Token decimals
 * @returns boolean indicating if transaction is valid
 */
export const isTransactionValid = (
    amount: string,
    exchangeDirection: 'STABLECOIN_TO_TOKEN' | 'TOKEN_TO_STABLECOIN',
    tokenPrice?: bigint,
    decimals: number = 18
): boolean => {
    const validation = validateTransaction(amount, exchangeDirection, tokenPrice, decimals)
    return validation.isValid
}
