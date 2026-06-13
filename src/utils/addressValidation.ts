/**
 * Wallet Address Validation Utilities
 *
 * Project rule: a valid wallet address MUST start with `0x` followed by 40 hex characters.
 */

import { getAddress } from 'viem'

/** Strict pattern — valid addresses always start with 0x */
export const WALLET_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

/**
 * Extract the first valid 0x wallet address from arbitrary text (QR, URI, clipboard).
 */
export function extractWalletAddressFromText(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const uriMatch = trimmed.match(/(?:ethereum:|polygon:)?(0x[a-fA-F0-9]{40})/i)
  if (uriMatch) return uriMatch[1]

  if (WALLET_ADDRESS_REGEX.test(trimmed)) return trimmed

  const anywhere = trimmed.match(/(0x[a-fA-F0-9]{40})/i)
  return anywhere ? anywhere[1] : null
}

/**
 * Restrict live input to a 0x-prefixed hex address (max 42 chars).
 */
export function sanitizeWalletAddressInput(raw: string): string {
  if (!raw) return ''

  const value = raw.trimStart()

  if (!value.startsWith('0x')) {
    const hexOnly = value.replace(/[^a-fA-F0-9]/g, '')
    if (value === '0') return '0'
    if (value.startsWith('0') && !value.toLowerCase().startsWith('0x')) {
      const tail = value.slice(1).replace(/[^a-fA-F0-9]/g, '')
      return `0x${tail}`.slice(0, 42)
    }
    return hexOnly ? `0x${hexOnly}`.slice(0, 42) : value.replace(/[^0-9a-fA-Fx]/gi, '').slice(0, 42)
  }

  const hex = value.slice(2).replace(/[^a-fA-F0-9]/g, '')
  return `0x${hex}`.slice(0, 42)
}

/**
 * Apply clipboard / pasted text — returns normalized 0x address or null.
 */
export function parsePastedWalletAddress(text: string): string | null {
  return extractWalletAddressFromText(text)
}

export interface AddressValidationResult {
    isValid: boolean
    error?: string
    normalizedAddress?: string
    addressType?: 'EOA' | 'CONTRACT' | 'UNKNOWN'
}

/**
 * Validates an Ethereum wallet address
 * @param address - The address string to validate
 * @returns Validation result with details
 */
export function validateWalletAddress(address: string): AddressValidationResult {
    // Handle empty or null input
    if (!address || address.trim() === '') {
        return {
            isValid: false,
            error: 'Address cannot be empty'
        }
    }

    const trimmedAddress = address.trim()

    if (!WALLET_ADDRESS_REGEX.test(trimmedAddress)) {
        return {
            isValid: false,
            error: 'Invalid wallet address. Address must start with 0x followed by 40 hexadecimal characters.'
        }
    }

    try {
        // Normalize the address (proper checksum) - this will work for any valid hex address
        const normalizedAddress = getAddress(trimmedAddress)

        // Check for common mistakes
        const validationErrors = checkCommonMistakes(normalizedAddress)
        if (validationErrors.length > 0) {
            return {
                isValid: false,
                error: validationErrors[0]
            }
        }

        return {
            isValid: true,
            normalizedAddress,
            addressType: 'UNKNOWN' // We can't determine this without calling the blockchain
        }
    } catch (error) {
        return {
            isValid: false,
            error: 'Invalid address format. Please verify the address is correct.'
        }
    }
}

/**
 * Checks for common address input mistakes
 * @param address - The normalized address to check
 * @returns Array of error messages
 */
function checkCommonMistakes(address: string): string[] {
    const errors: string[] = []

    // Check for zero address (burn address)
    if (address === '0x0000000000000000000000000000000000000000') {
        errors.push('Cannot send to the zero address (burn address). Please check the recipient address.')
    }

    // Check for common test addresses that should not receive funds
    const dangerousAddresses = [
        '0x000000000000000000000000000000000000dead', // Dead address
        '0x0000000000000000000000000000000000000001', // Test address
        '0x1111111111111111111111111111111111111111', // Test pattern
        '0x2222222222222222222222222222222222222222', // Test pattern
    ]

    if (dangerousAddresses.includes(address)) {
        errors.push('This appears to be a test or burn address. Please verify the recipient address.')
    }

    // Check for addresses that are all the same character (likely typos)
    const withoutPrefix = address.slice(2)
    if (withoutPrefix.split('').every(char => char === withoutPrefix[0])) {
        errors.push('Address appears to contain repeated characters. Please double-check the address.')
    }

    return errors
}

/**
 * Validates an address and provides user-friendly feedback
 * @param address - The address to validate
 * @returns User-friendly validation message or null if valid
 */
export function getAddressValidationMessage(address: string): string | null {
    const result = validateWalletAddress(address)

    if (result.isValid) {
        return null
    }

    return result.error || 'Invalid address'
}

/**
 * Formats an address for display (truncated with ellipsis)
 * @param address - The address to format
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted address string
 */
export function formatAddressForDisplay(address: string, startChars: number = 6, endChars: number = 4): string {
    if (!address || address.length < startChars + endChars) {
        return address
    }

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Checks if an address is likely a contract address based on common patterns
 * Note: This is a heuristic check and not 100% accurate without blockchain queries
 * @param address - The address to check
 * @returns Boolean indicating if it might be a contract
 */
export function isLikelyContractAddress(address: string): boolean {
    if (!WALLET_ADDRESS_REGEX.test(address)) return false

    try {
        // Normalize the address
        const normalizedAddress = getAddress(address)

        // Known contract addresses (can be expanded)
        const knownContracts = [
            '0xa0b86a33e6c8b5cc524db5e8f55ccf36b5c1b2c0', // Example
            // Add more known contract addresses as needed
        ]

        return knownContracts.includes(normalizedAddress.toLowerCase())
    } catch {
        return false
    }
}

/**
 * Validates multiple addresses at once
 * @param addresses - Array of addresses to validate
 * @returns Array of validation results
 */
export function validateMultipleAddresses(addresses: string[]): AddressValidationResult[] {
    return addresses.map(validateWalletAddress)
}

/**
 * Real-time validation for input fields
 * @param address - Current input value
 * @returns Validation state for UI feedback
 */
export function getInputValidationState(address: string): {
    state: 'empty' | 'invalid' | 'valid' | 'warning'
    message?: string
    showCheckmark?: boolean
} {
    if (!address || address.trim() === '') {
        return { state: 'empty' }
    }

    const result = validateWalletAddress(address)

    if (!result.isValid) {
        return {
            state: 'invalid',
            message: result.error
        }
    }

    // Check for potential warnings
    if (result.normalizedAddress) {
        if (result.normalizedAddress !== address.trim()) {
            return {
                state: 'warning',
                message: 'Address checksum will be corrected automatically',
                showCheckmark: true
            }
        }
    }

    return {
        state: 'valid',
        message: 'Valid Ethereum address',
        showCheckmark: true
    }
}
