#!/usr/bin/env node

/**
 * Test script to verify the complete address validation and transaction flow
 */

import { validateWalletAddress, getInputValidationState } from './src/utils/addressValidation.js';

console.log('=== Testing Complete Address Validation Flow ===\n');

// Test cases for different address formats
const testCases = [
    {
        name: 'Valid checksummed address',
        address: '0x742d35Cc6634C0532925a3b8C6c5b738F0b2dcC1',
        expectedValid: true,
        expectedState: 'valid'
    },
    {
        name: 'Valid non-checksummed address (lowercase)',
        address: '0x742d35cc6634c0532925a3b8c6c5b738f0b2dcc1',
        expectedValid: true,
        expectedState: 'warning', // Should show warning and auto-correct
        shouldAutoCorrect: true
    },
    {
        name: 'Valid non-checksummed address (uppercase)',
        address: '0X742D35CC6634C0532925A3B8C6C5B738F0B2DCC1',
        expectedValid: true,
        expectedState: 'warning',
        shouldAutoCorrect: true
    },
    {
        name: 'Invalid address (too short)',
        address: '0x742d35cc6634c0532925a3b8c6c5b738f0b2dc',
        expectedValid: false,
        expectedState: 'invalid'
    },
    {
        name: 'Invalid address (no 0x prefix)',
        address: '742d35cc6634c0532925a3b8c6c5b738f0b2dcc1',
        expectedValid: false,
        expectedState: 'invalid'
    },
    {
        name: 'Invalid address (contains invalid characters)',
        address: '0x742d35cc6634c0532925a3b8c6c5b738f0b2dcg1',
        expectedValid: false,
        expectedState: 'invalid'
    },
    {
        name: 'Zero address (burn address)',
        address: '0x0000000000000000000000000000000000000000',
        expectedValid: false,
        expectedState: 'invalid'
    },
    {
        name: 'Empty address',
        address: '',
        expectedValid: false,
        expectedState: 'invalid'
    }
];

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. Testing: ${testCase.name}`);
    console.log(`   Input: "${testCase.address}"`);

    try {
        // Test core validation function
        const validationResult = validateWalletAddress(testCase.address);
        console.log(`   Core validation result:`, validationResult);

        // Test input validation state function
        const inputState = getInputValidationState(testCase.address);
        console.log(`   Input state result:`, inputState);

        // Check expectations
        let testPassed = true;
        let issues = [];

        if (validationResult.isValid !== testCase.expectedValid) {
            testPassed = false;
            issues.push(`Expected isValid: ${testCase.expectedValid}, got: ${validationResult.isValid}`);
        }

        if (inputState.state !== testCase.expectedState) {
            testPassed = false;
            issues.push(`Expected state: ${testCase.expectedState}, got: ${inputState.state}`);
        }

        // Check auto-correction for warning states
        if (testCase.shouldAutoCorrect && inputState.state === 'warning') {
            if (!validationResult.normalizedAddress) {
                testPassed = false;
                issues.push('Expected normalized address for auto-correction');
            } else if (validationResult.normalizedAddress === testCase.address) {
                testPassed = false;
                issues.push('Expected normalized address to be different from input');
            } else {
                console.log(`   Auto-corrected to: "${validationResult.normalizedAddress}"`);
            }
        }

        if (testPassed) {
            console.log(`   ✅ PASSED`);
            passedTests++;
        } else {
            console.log(`   ❌ FAILED`);
            issues.forEach(issue => console.log(`      - ${issue}`));
        }

    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }
});

console.log(`\n=== Test Summary ===`);
console.log(`Passed: ${passedTests}/${totalTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
    console.log(`\n🎉 All tests passed! Address validation is working correctly.`);
    console.log(`\n📝 Expected behavior in the UI:`);
    console.log(`   • Valid checksummed addresses: Green checkmark, Send button enabled`);
    console.log(`   • Non-checksummed addresses: Orange warning icon, auto-corrects on blur/submit, Send button enabled`);
    console.log(`   • Invalid addresses: Red X icon, error message, Send button disabled`);
    console.log(`   • Empty addresses: No validation shown until user types, Send button disabled`);
} else {
    console.log(`\n⚠️  Some tests failed. Please review the validation logic.`);
    process.exit(1);
}
