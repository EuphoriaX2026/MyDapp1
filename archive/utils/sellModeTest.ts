// Test utility for verifying sell mode calculations
import { parseUnits, formatUnits } from 'viem'

export const testSellModeCalculation = () => {
    console.log('=== TESTING SELL MODE CALCULATION ===')

    // Test case: Selling 100 ERX where 1 ERX = 0.1 DAI
    const inputAmount = '100' // 100 ERX
    const tokenPrice = parseUnits('0.1', 18) // 0.1 DAI per ERX (in wei)
    const inputDecimals = 18 // ERX decimals
    const outputDecimals = 18 // DAI decimals

    console.log('Test Parameters:')
    console.log('- Input Amount:', inputAmount, 'ERX')
    console.log('- Token Price:', formatUnits(tokenPrice, 18), 'DAI per ERX')
    console.log('- Input Decimals:', inputDecimals)
    console.log('- Output Decimals:', outputDecimals)

    // Parse input amount
    const parsedInput = parseUnits(inputAmount, inputDecimals)
    console.log('- Parsed Input (wei):', parsedInput.toString())

    // Calculate output for sell mode
    // Formula: outputAmount = (inputAmount * price) / 10^(18 - outputDecimals)
    const scaleFactor = 10n ** BigInt(18 - outputDecimals)
    const outputAmount = (parsedInput * tokenPrice) / (10n ** 18n) / scaleFactor

    console.log('Calculation:')
    console.log('- Scale Factor:', scaleFactor.toString())
    console.log('- Raw Output (wei):', outputAmount.toString())
    console.log('- Formatted Output:', formatUnits(outputAmount, outputDecimals), 'DAI')

    const expectedOutput = 10 // 100 ERX * 0.1 DAI/ERX = 10 DAI
    const actualOutput = parseFloat(formatUnits(outputAmount, outputDecimals))

    console.log('Results:')
    console.log('- Expected:', expectedOutput, 'DAI')
    console.log('- Actual:', actualOutput, 'DAI')
    console.log('- Match:', Math.abs(actualOutput - expectedOutput) < 0.001 ? '✅ PASS' : '❌ FAIL')

    // Test with USDC (6 decimals)
    console.log('\n=== TESTING WITH USDC (6 decimals) ===')
    const usdcDecimals = 6
    const usdcScaleFactor = 10n ** BigInt(18 - usdcDecimals)
    const usdcOutputAmount = (parsedInput * tokenPrice) / (10n ** 18n) / usdcScaleFactor

    console.log('USDC Calculation:')
    console.log('- USDC Scale Factor:', usdcScaleFactor.toString())
    console.log('- USDC Output (wei):', usdcOutputAmount.toString())
    console.log('- USDC Formatted:', formatUnits(usdcOutputAmount, usdcDecimals), 'USDC')

    const usdcActual = parseFloat(formatUnits(usdcOutputAmount, usdcDecimals))
    console.log('- Expected:', expectedOutput, 'USDC')
    console.log('- Actual:', usdcActual, 'USDC')
    console.log('- Match:', Math.abs(usdcActual - expectedOutput) < 0.001 ? '✅ PASS' : '❌ FAIL')
}

// Run the test
if (typeof window !== 'undefined') {
    // Browser environment
    (window as any).testSellModeCalculation = testSellModeCalculation
    console.log('Test function available as window.testSellModeCalculation()')
} else {
    // Node environment
    testSellModeCalculation()
}
