import { useState } from 'react'
import { runSellFunctionalityTests, debugSellCalculation } from '../utils/sellFunctionalityTest'
import { validateBuyFunctionsAndApprovals, quickApprovalTest } from '../utils/buyFunctionValidation'

const SellFunctionalityTestPanel = () => {
    const [testResults, setTestResults] = useState<string>('')
    const [buyValidationResults, setBuyValidationResults] = useState<string>('')
    const [debugInput, setDebugInput] = useState({ amount: '100', price: '0.1', decimals: 18 })
    const [approvalTest, setApprovalTest] = useState({ allowance: '100', requested: '10', decimals: 6 })

    const runSellTests = () => {
        const results = runSellFunctionalityTests()
        setTestResults(results)
        console.log(results)
    }

    const runBuyValidation = () => {
        const results = validateBuyFunctionsAndApprovals()
        setBuyValidationResults(results)
        console.log(results)
    }

    const runDebugCalculation = () => {
        const result = debugSellCalculation(
            debugInput.amount,
            debugInput.price,
            debugInput.decimals
        )
        console.log(`Debug calculation result: ${result}`)
    }

    const runApprovalTest = () => {
        const needsApproval = quickApprovalTest(
            approvalTest.allowance,
            approvalTest.requested,
            approvalTest.decimals
        )
        console.log(`Approval needed: ${needsApproval}`)
    }

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h5>🧪 Buy/Sell Functionality Test Panel</h5>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <button 
                        className="btn btn-primary me-2"
                        onClick={runSellTests}
                    >
                        Run Sell Tests
                    </button>
                    <button 
                        className="btn btn-success"
                        onClick={runBuyValidation}
                    >
                        Validate Buy Functions & Approvals
                    </button>
                </div>

                <div className="mb-3">
                    <h6>Debug Sell Calculation</h6>
                    <div className="row">
                        <div className="col-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Token Amount"
                                value={debugInput.amount}
                                onChange={(e) => setDebugInput({...debugInput, amount: e.target.value})}
                            />
                        </div>
                        <div className="col-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Price USD"
                                value={debugInput.price}
                                onChange={(e) => setDebugInput({...debugInput, price: e.target.value})}
                            />
                        </div>
                        <div className="col-4">
                            <select
                                className="form-control"
                                value={debugInput.decimals}
                                onChange={(e) => setDebugInput({...debugInput, decimals: parseInt(e.target.value)})}
                            >
                                <option value={6}>USDC (6 decimals)</option>
                                <option value={18}>DAI (18 decimals)</option>
                            </select>
                        </div>
                    </div>
                    <button 
                        className="btn btn-secondary mt-2"
                        onClick={runDebugCalculation}
                    >
                        Debug Sell Calculation
                    </button>
                </div>

                <div className="mb-3">
                    <h6>Test Approval Logic</h6>
                    <div className="row">
                        <div className="col-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Current Allowance"
                                value={approvalTest.allowance}
                                onChange={(e) => setApprovalTest({...approvalTest, allowance: e.target.value})}
                            />
                        </div>
                        <div className="col-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Requested Amount"
                                value={approvalTest.requested}
                                onChange={(e) => setApprovalTest({...approvalTest, requested: e.target.value})}
                            />
                        </div>
                        <div className="col-4">
                            <select
                                className="form-control"
                                value={approvalTest.decimals}
                                onChange={(e) => setApprovalTest({...approvalTest, decimals: parseInt(e.target.value)})}
                            >
                                <option value={6}>USDC (6 decimals)</option>
                                <option value={18}>DAI (18 decimals)</option>
                            </select>
                        </div>
                    </div>
                    <button 
                        className="btn btn-info mt-2"
                        onClick={runApprovalTest}
                    >
                        Test Approval Logic
                    </button>
                </div>

                {testResults && (
                    <div className="alert alert-info">
                        <h6>Sell Test Results:</h6>
                        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                            {testResults}
                        </pre>
                    </div>
                )}

                {buyValidationResults && (
                    <div className="alert alert-success">
                        <h6>Buy Function Validation Results:</h6>
                        <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                            {buyValidationResults}
                        </pre>
                    </div>
                )}

                <div className="alert alert-warning">
                    <strong>Testing Instructions:</strong>
                    <ol>
                        <li>Click "Run Sell Tests" to validate sell calculation logic</li>
                        <li>Click "Validate Buy Functions & Approvals" to check buy signatures and approval logic</li>
                        <li>Use debug calculator to test specific scenarios</li>
                        <li>Use approval test to verify allowance logic</li>
                        <li>Check browser console for detailed output</li>
                        <li>Test actual buy/sell functionality in Exchange page</li>
                    </ol>
                </div>

                <div className="alert alert-success">
                    <strong>Implementation Summary:</strong>
                    <ul>
                        <li>✅ ERX sell function ABI added</li>
                        <li>✅ sellERX implementation complete</li>
                        <li>✅ sellQBIT error handling implemented</li>
                        <li>✅ Exchange UI supports sell mode</li>
                        <li>✅ Calculation logic fixed for sell operations</li>
                        <li>🔧 <strong>NEW:</strong> Buy function signatures fixed</li>
                        <li>✅ ERX buy: (usdAmount, tokenSymbol)</li>
                        <li>✅ QBIT buy: (qbitAmount, tokenSymbol)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SellFunctionalityTestPanel
