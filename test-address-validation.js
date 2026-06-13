// Quick test for address validation
import { validateWalletAddress, getInputValidationState } from './src/utils/addressValidation.js'

const testAddresses = [
    '0x777cB0669Cff3599D278E6501c9D0e98Ba4c1777', // Correct checksum
    '0x777cB0669Cff3599D278E6501c9D0e98Ba4C1777', // Incorrect checksum
]

console.log('Testing Address Validation:\n')

testAddresses.forEach((address, index) => {
    console.log(`Test ${index + 1}: ${address}`)

    const validation = validateWalletAddress(address)
    const inputState = getInputValidationState(address)

    console.log(`  validateWalletAddress:`)
    console.log(`    isValid: ${validation.isValid}`)
    console.log(`    normalizedAddress: ${validation.normalizedAddress}`)
    console.log(`    error: ${validation.error || 'none'}`)

    console.log(`  getInputValidationState:`)
    console.log(`    state: ${inputState.state}`)
    console.log(`    message: ${inputState.message || 'none'}`)
    console.log(`    showCheckmark: ${inputState.showCheckmark || false}`)

    console.log('')
})
