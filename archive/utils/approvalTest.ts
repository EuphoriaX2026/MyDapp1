import { parseUnits, formatUnits } from 'viem'
import { contracts, TOKEN_DECIMALS } from '../config/wagmi'

// Utility function to test approval amounts
export const testApprovalAmount = (amount: string, tokenAddress: string) => {
    console.log('\n=== APPROVAL AMOUNT TEST ===')
    console.log(`Testing amount: ${amount}`)
    console.log(`Token address: ${tokenAddress}`)

    // Get decimals
    const decimals = (TOKEN_DECIMALS as any)[tokenAddress] || 18
    console.log(`Token decimals: ${decimals}`)

    try {
        // Calculate parseUnits
        const parsedAmount = parseUnits(amount, decimals)
        console.log(`parseUnits result: ${parsedAmount.toString()}`)

        // Show human-readable format
        const backToHuman = formatUnits(parsedAmount, decimals)
        console.log(`Back to human: ${backToHuman}`)

        // Show examples for different tokens
        console.log('\n--- Examples ---')

        if (tokenAddress === contracts.USDC) {
            console.log('USDC Examples (6 decimals):')
            console.log('- 1 USDC = 1,000,000 units')
            console.log('- 0.5 USDC = 500,000 units')
            console.log('- 100 USDC = 100,000,000 units')
        } else if (tokenAddress === contracts.DAI) {
            console.log('DAI Examples (18 decimals):')
            console.log('- 1 DAI = 1,000,000,000,000,000,000 units')
            console.log('- 0.5 DAI = 500,000,000,000,000,000 units')
        }

        // Check if the amount seems reasonable
        const numericAmount = parseFloat(amount)
        if (decimals === 6 && numericAmount === 1) {
            const expected = 1_000_000
            const actual = Number(parsedAmount)
            console.log(`\n✅ USDC Test: Expected ${expected}, Got ${actual}, Match: ${expected === actual}`)
        } else if (decimals === 18 && numericAmount === 1) {
            const expected = BigInt('1000000000000000000')
            console.log(`\n✅ 18-decimal Test: Expected ${expected.toString()}, Got ${parsedAmount.toString()}, Match: ${expected === parsedAmount}`)
        }

        return {
            input: amount,
            decimals,
            parsed: parsedAmount.toString(),
            backToHuman
        }
    } catch (error) {
        console.error('❌ Error in testApprovalAmount:', error)
        return null
    }
}

// Test function for common scenarios
export const runApprovalTests = () => {
    console.log('\n🧪 Running Approval Amount Tests...')

    // Test USDC (6 decimals)
    console.log('\n--- USDC Tests ---')
    testApprovalAmount('1', contracts.USDC || '0x0')
    testApprovalAmount('0.5', contracts.USDC || '0x0')
    testApprovalAmount('100', contracts.USDC || '0x0')

    // Test DAI (18 decimals)
    console.log('\n--- DAI Tests ---')
    testApprovalAmount('1', contracts.DAI)
    testApprovalAmount('0.5', contracts.DAI)
    testApprovalAmount('100', contracts.DAI)

    console.log('\n✅ Approval tests completed')
}

// Export for use in components
export { parseUnits, formatUnits }
