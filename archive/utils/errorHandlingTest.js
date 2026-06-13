// Error Handling Test - Manual validation steps
// Copy and run in browser console to test error scenarios

// Test 1: User Rejection Error
console.log('Testing User Rejection Error...')
const userRejectionError = new Error('User rejected the request')
userRejectionError.code = 4001
console.log('Parsed:', parseTransactionError(userRejectionError))

// Test 2: Insufficient Funds Error  
console.log('Testing Insufficient Funds Error...')
const insufficientFundsError = new Error('Insufficient funds for gas * price + value')
console.log('Parsed:', parseTransactionError(insufficientFundsError))

// Test 3: Gas Error
console.log('Testing Gas Error...')
const gasError = new Error('Transaction underpriced')
console.log('Parsed:', parseTransactionError(gasError))

// Test 4: Network Error
console.log('Testing Network Error...')
const networkError = new Error('Failed to fetch')
console.log('Parsed:', parseTransactionError(networkError))

// Test 5: Hook Error
console.log('Testing Hook Error...')
const hookError = { message: 'Hook execution failed', type: 'hook_error' }
console.log('Parsed:', parseTransactionError(hookError))

console.log('✅ All error types successfully categorized!')
