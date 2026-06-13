// Test utility to verify decimal detection
import { contracts } from '../config/wagmi'

// Known token decimals for testing
export const KNOWN_DECIMALS = {
    // Stablecoins on Polygon
    [contracts.USDC || '0x0']: 6,
    [contracts.USDT]: 6,
    [contracts.DAI]: 18,

    // Project tokens
    [contracts.ERX_TOKEN]: 18,

    // Other tokens
    [contracts.WMATIC]: 18,
} as const

export const testDecimalDetection = (address: string, detectedDecimals: number) => {
    const knownDecimals = KNOWN_DECIMALS[address as keyof typeof KNOWN_DECIMALS]

    if (knownDecimals) {
        const isCorrect = detectedDecimals === knownDecimals
        console.log(`🧪 Decimal Test for ${address}:`)
        console.log(`   Expected: ${knownDecimals}`)
        console.log(`   Detected: ${detectedDecimals}`)
        console.log(`   Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`)

        return isCorrect
    } else {
        console.log(`🧪 Unknown token ${address}, detected ${detectedDecimals} decimals`)
        return true // Unknown token, can't verify
    }
}

export const getTokenSymbol = (address: string) => {
    const symbols = {
        [contracts.USDC || '0x0']: 'USDC',
        [contracts.USDT]: 'USDT',
        [contracts.DAI]: 'DAI',
        [contracts.ERX_TOKEN]: 'ERX',
        [contracts.WMATIC]: 'WMATIC',
    } as const

    return symbols[address as keyof typeof symbols] || 'Unknown'
}
