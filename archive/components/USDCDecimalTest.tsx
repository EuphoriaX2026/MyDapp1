import { useState } from 'react'
import { parseUnits, formatUnits } from 'viem'
import { contracts, TOKEN_DECIMALS } from '../config/wagmi'

export const USDCDecimalTest = () => {
  const [testResults, setTestResults] = useState<any[]>([])

  const runTests = () => {
    const results = []

    // Test different amounts with USDC (6 decimals)
    const testCases = [
      { amount: '1', expected: '1000000' },
      { amount: '0.5', expected: '500000' },
      { amount: '100', expected: '100000000' },
      { amount: '0.000001', expected: '1' }, // 1 smallest unit
    ]

    console.log('\n🧪 USDC Decimal Tests Starting...')

    testCases.forEach((testCase, index) => {
      try {
        const parsed = parseUnits(testCase.amount, 6)
        const backToHuman = formatUnits(parsed, 6)
        const isCorrect = parsed.toString() === testCase.expected
        
        const result = {
          id: index + 1,
          input: testCase.amount,
          expected: testCase.expected,
          actual: parsed.toString(),
          backToHuman,
          isCorrect,
          status: isCorrect ? '✅' : '❌'
        }
        
        results.push(result)
        
        console.log(`Test ${index + 1}: ${testCase.amount} USDC`)
        console.log(`  Expected: ${testCase.expected}`)
        console.log(`  Actual: ${parsed.toString()}`)
        console.log(`  Back to human: ${backToHuman}`)
        console.log(`  Status: ${result.status}`)
        console.log('')
      } catch (error) {
        results.push({
          id: index + 1,
          input: testCase.amount,
          expected: testCase.expected,
          actual: 'ERROR',
          backToHuman: 'ERROR',
          isCorrect: false,
          status: '❌',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Test with real USDC contract address
    console.log('\n--- Testing with actual USDC contract ---')
    console.log(`USDC Contract: ${contracts.USDC}`)
    console.log(`Configured Decimals: ${contracts.USDC ? TOKEN_DECIMALS[contracts.USDC] : 'Unknown'}`)
    
    // Test the actual approval scenario
    console.log('\n--- Approval Scenario Test ---')
    try {
      const amount = '1'
      const decimals = contracts.USDC ? TOKEN_DECIMALS[contracts.USDC] : 6
      const parsed = parseUnits(amount, decimals)
      
      console.log(`Approving ${amount} USDC:`)
      console.log(`  Using ${decimals} decimals`)
      console.log(`  parseUnits("${amount}", ${decimals}) = ${parsed.toString()}`)
      console.log(`  Expected for 1 USDC: 1,000,000`)
      console.log(`  Match: ${parsed.toString() === '1000000' ? '✅' : '❌'}`)
      
      results.push({
        id: 'approval-test',
        input: `${amount} USDC`,
        expected: '1000000',
        actual: parsed.toString(),
        backToHuman: formatUnits(parsed, decimals),
        isCorrect: parsed.toString() === '1000000',
        status: parsed.toString() === '1000000' ? '✅' : '❌'
      })
    } catch (error) {
      console.error('Approval test failed:', error)
    }

    setTestResults(results)
    console.log('\n✅ USDC Decimal Tests Completed')
  }

  return (
    <div className="section mt-3">
      <div className="card">
        <div className="card-body">
          <h6 className="card-title">USDC Decimal Tests</h6>
          <p className="text-muted small">
            This component tests USDC decimal handling to ensure 1 USDC = 1,000,000 units (6 decimals)
          </p>
          
          <button 
            className="btn btn-primary btn-sm"
            onClick={runTests}
          >
            Run USDC Tests
          </button>

          {testResults.length > 0 && (
            <div className="mt-3">
              <h6>Test Results:</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Input</th>
                      <th>Expected</th>
                      <th>Actual</th>
                      <th>Back to Human</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result) => (
                      <tr key={result.id} className={result.isCorrect ? 'table-success' : 'table-danger'}>
                        <td>{result.id}</td>
                        <td>{result.input}</td>
                        <td>{result.expected}</td>
                        <td>{result.actual}</td>
                        <td>{result.backToHuman}</td>
                        <td>{result.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-2">
                <small className="text-muted">
                  <strong>Key Points:</strong><br />
                  • USDC has 6 decimals<br />
                  • 1 USDC should equal 1,000,000 units<br />
                  • If you see 1,000,000,000,000,000,000 (1e18), the code is using 18 decimals instead of 6<br />
                  • This would cause massive approval amounts
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
