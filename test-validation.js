import { validateWalletAddress, getInputValidationState } from './src/utils/addressValidation.js'

// Test addresses
const testAddresses = [
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Valid but wrong checksum
    '0xD8DA6BF26964aF9D7EeD9e03E53415D37AA96045', // Valid with correct checksum  
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045123', // Invalid (too long)
    '0xd8da6bf26964af9d7eed9e03e53415d37aa9604', // Invalid (too short)
    '0x0000000000000000000000000000000000000000', // Zero address
    '0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG', // Invalid characters
    '', // Empty
    '0x1234567890123456789012345678901234567890' // Valid mixed case
]

console.log('Testing Address Validation Improvements\n')
console.log('=' * 50)

testAddresses.forEach((address, index) => {
    console.log(`\nTest ${index + 1}: ${address || '(empty)'}`)
    console.log('-'.repeat(40))

    try {
        const validation = validateWalletAddress(address)
        const inputValidation = getInputValidationState(address)

        console.log(`Validation Result:`)
        console.log(`  Valid: ${validation.isValid}`)
        console.log(`  Error: ${validation.error || 'None'}`)
        console.log(`  Normalized: ${validation.normalizedAddress || 'None'}`)
        console.log(`  Auto-corrected: ${validation.normalizedAddress && validation.normalizedAddress !== address.trim() ? 'Yes' : 'No'}`)

        console.log(`Input Validation:`)
        console.log(`  State: ${inputValidation.state}`)
        console.log(`  Message: ${inputValidation.message || 'None'}`)
        console.log(`  Show Checkmark: ${inputValidation.showCheckmark || false}`)

    } catch (error) {
        console.log(`Error: ${error.message}`)
    }
})
