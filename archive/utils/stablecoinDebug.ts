// Debugging utility to identify stablecoin decimal issues
import { formatUnits, parseUnits } from 'viem'
import { TOKEN_DECIMALS } from '../config/wagmi'

export const debugStablecoinDecimals = (stablecoinAddresses: string[]) => {
    console.log('=== STABLECOIN DECIMAL DEBUGGING ===')

    stablecoinAddresses.forEach((address, index) => {
        console.log(`\n${index + 1}. Address: ${address}`)

        // Check if address is in TOKEN_DECIMALS
        const configuredDecimals = (TOKEN_DECIMALS as any)[address]
        console.log(`   - Configured decimals: ${configuredDecimals || 'NOT CONFIGURED'}`)

        // Identify the token type
        if (address.toLowerCase().startsWith('0x3c49')) {
            console.log('   - Type: Likely USDC (Native) on Polygon')
            console.log('   - Expected decimals: 6')
        } else if (address === '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174') {
            console.log('   - Type: USDC.e (Bridged from Ethereum)')
            console.log('   - Expected decimals: 6')
        } else if (address === '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063') {
            console.log('   - Type: DAI')
            console.log('   - Expected decimals: 18')
        } else if (address === '0xc2132D05D31c914a87C6611C10748AEb04B58e8F') {
            console.log('   - Type: USDT')
            console.log('   - Expected decimals: 6')
        } else {
            console.log('   - Type: Unknown stablecoin')
            console.log('   - Please verify decimals manually')
        }

        // Test approval calculation with different decimal assumptions
        const testAmount = '10' // 10 tokens

        console.log(`   - Testing approval for ${testAmount} tokens:`)

        // With 6 decimals (USDC/USDT)
        const amount6 = parseUnits(testAmount, 6)
        console.log(`     * With 6 decimals: ${amount6.toString()} wei (${formatUnits(amount6, 6)} tokens)`)

        // With 18 decimals (DAI/fallback)
        const amount18 = parseUnits(testAmount, 18)
        console.log(`     * With 18 decimals: ${amount18.toString()} wei (${formatUnits(amount18, 18)} tokens)`)

        // Current system would use
        const currentDecimals = configuredDecimals || 18
        const currentAmount = parseUnits(testAmount, currentDecimals)
        console.log(`     * Current system uses: ${currentAmount.toString()} wei (${currentDecimals} decimals)`)

        if (!configuredDecimals) {
            console.log('   ⚠️  WARNING: This address is not configured and will use 18 decimals as fallback!')
            console.log('   💡 SOLUTION: Add this address to TOKEN_DECIMALS in wagmi.ts')
        }
    })

    console.log('\n=== SUMMARY ===')
    const unconfigured = stablecoinAddresses.filter(addr => !(TOKEN_DECIMALS as any)[addr])
    if (unconfigured.length > 0) {
        console.log(`❌ Found ${unconfigured.length} unconfigured stablecoin(s):`)
        unconfigured.forEach(addr => console.log(`   - ${addr}`))
        console.log('\n📋 Add these to TOKEN_DECIMALS in src/config/wagmi.ts:')
        unconfigured.forEach(addr => {
            if (addr.toLowerCase().startsWith('0x3c49')) {
                console.log(`   '${addr}': 6, // USDC (Native) on Polygon`)
            } else {
                console.log(`   '${addr}': 6, // TODO: Verify decimals for this token`)
            }
        })
    } else {
        console.log('✅ All stablecoins are properly configured!')
    }
}

// Test specific approval amount calculation
export const testApprovalAmount = (
    address: string,
    amount: string,
    expectedDecimals: number
) => {
    console.log(`\n=== TESTING APPROVAL FOR ${address} ===`)
    console.log(`Amount: ${amount} tokens`)
    console.log(`Expected decimals: ${expectedDecimals}`)

    const configuredDecimals = (TOKEN_DECIMALS as any)[address]
    const fallbackDecimals = configuredDecimals || 18

    console.log(`Configured decimals: ${configuredDecimals || 'NOT CONFIGURED'}`)
    console.log(`Fallback decimals: ${fallbackDecimals}`)

    // Calculate with expected decimals
    const expectedWei = parseUnits(amount, expectedDecimals)
    console.log(`Expected result: ${expectedWei.toString()} wei`)

    // Calculate with current system
    const actualWei = parseUnits(amount, fallbackDecimals)
    console.log(`Actual result: ${actualWei.toString()} wei`)

    // Check if they match
    const isCorrect = expectedWei === actualWei
    console.log(`Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`)

    if (!isCorrect) {
        const difference = actualWei > expectedWei ? actualWei / expectedWei : expectedWei / actualWei
        console.log(`Difference: ${difference.toString()}x ${actualWei > expectedWei ? 'too much' : 'too little'}`)
    }

    return {
        address,
        amount,
        expectedDecimals,
        configuredDecimals,
        fallbackDecimals,
        expectedWei: expectedWei.toString(),
        actualWei: actualWei.toString(),
        isCorrect
    }
}

// Make available in browser console
if (typeof window !== 'undefined') {
    (window as any).debugStablecoinDecimals = debugStablecoinDecimals
        ; (window as any).testApprovalAmount = testApprovalAmount
    console.log('Debug functions available:')
    console.log('- window.debugStablecoinDecimals(addresses)')
    console.log('- window.testApprovalAmount(address, amount, expectedDecimals)')
}
