import { useState } from 'react'
import { validateWalletAddress, getInputValidationState } from '../utils/addressValidation'

export default function AddressValidationDemo() {
  const [testAddress, setTestAddress] = useState('')
  const [validationResult, setValidationResult] = useState<any>(null)
  const [inputValidation, setInputValidation] = useState<any>(null)

  const handleAddressChange = (value: string) => {
    setTestAddress(value)
    const validation = validateWalletAddress(value)
    const inputValidation = getInputValidationState(value)
    setValidationResult(validation)
    setInputValidation(inputValidation)
  }

  const testAddresses = [
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // Valid but wrong checksum
    '0xD8DA6BF26964aF9D7EeD9e03E53415D37AA96045', // Valid with correct checksum
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045123', // Invalid (too long)
    '0xd8da6bf26964af9d7eed9e03e53415d37aa9604', // Invalid (too short)
    '0x0000000000000000000000000000000000000000', // Zero address
  ]

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>Address Validation Demo</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Test Address:</label>
            <input
              type="text"
              className={`form-control ${
                inputValidation?.state === 'invalid' ? 'is-invalid' :
                inputValidation?.state === 'valid' ? 'is-valid' :
                inputValidation?.state === 'warning' ? 'is-warning' : ''
              }`}
              value={testAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Enter an Ethereum address"
            />
            {inputValidation?.message && (
              <div className={`form-text ${
                inputValidation.state === 'invalid' ? 'text-danger' :
                inputValidation.state === 'warning' ? 'text-warning' :
                'text-success'
              }`}>
                {inputValidation.message}
                {inputValidation.showCheckmark && ' ✓'}
              </div>
            )}
          </div>

          <div className="mb-3">
            <h6>Quick Test Addresses:</h6>
            {testAddresses.map((addr, index) => (
              <button
                key={index}
                className="btn btn-sm btn-outline-secondary me-2 mb-2"
                onClick={() => handleAddressChange(addr)}
                style={{ fontSize: '12px' }}
              >
                {addr.substring(0, 10)}...{addr.substring(addr.length - 4)}
              </button>
            ))}
          </div>

          {validationResult && (
            <div className="mb-3">
              <h6>Validation Result:</h6>
              <div className={`alert ${validationResult.isValid ? 'alert-success' : 'alert-danger'}`}>
                <strong>Valid:</strong> {validationResult.isValid ? 'Yes' : 'No'}<br/>
                {validationResult.error && (
                  <>
                    <strong>Error:</strong> {validationResult.error}<br/>
                  </>
                )}
                {validationResult.normalizedAddress && (
                  <>
                    <strong>Normalized:</strong> {validationResult.normalizedAddress}<br/>
                    <strong>Auto-corrected:</strong> {validationResult.normalizedAddress !== testAddress ? 'Yes' : 'No'}
                  </>
                )}
              </div>
            </div>
          )}

          {inputValidation && (
            <div className="mb-3">
              <h6>Input Validation State:</h6>
              <div className={`alert ${
                inputValidation.state === 'invalid' ? 'alert-danger' :
                inputValidation.state === 'warning' ? 'alert-warning' :
                inputValidation.state === 'valid' ? 'alert-success' :
                'alert-info'
              }`}>
                <strong>State:</strong> {inputValidation.state}<br/>
                {inputValidation.message && (
                  <>
                    <strong>Message:</strong> {inputValidation.message}<br/>
                  </>
                )}
                <strong>Show Checkmark:</strong> {inputValidation.showCheckmark ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
