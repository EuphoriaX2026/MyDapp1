/**
 * Address Validation Test Component
 * 
 * This component provides a testing interface for wallet address validation
 * functionality. It allows testing various address formats and edge cases.
 */

import React, { useState } from 'react'
import { IonIcon } from '@ionic/react'
import { checkmarkCircleOutline, closeCircleOutline, warningOutline, informationCircleOutline } from 'ionicons/icons'
import { validateWalletAddress, getInputValidationState, formatAddressForDisplay } from '../utils/addressValidation'

export const AddressValidationTestPanel: React.FC = () => {
  const [testAddress, setTestAddress] = useState('')
  const [testResults, setTestResults] = useState<any>(null)

  const testAddresses = [
    { 
      label: 'Valid Address', 
      value: '0x742d35Cc6634C0532925a3b8D7C6A1cd5Ba6FB9C' 
    },
    { 
      label: 'Invalid Checksum', 
      value: '0x742d35cc6634c0532925a3b8d7c6a1cd5ba6fb9c' 
    },
    { 
      label: 'Zero Address', 
      value: '0x0000000000000000000000000000000000000000' 
    },
    { 
      label: 'Too Short', 
      value: '0x742d35Cc6634C0532925a3b8D7C6A1cd5Ba6F' 
    },
    { 
      label: 'Invalid Characters', 
      value: '0x742d35Cc6634C0532925a3b8D7C6A1cd5Ba6FB9G' 
    },
    { 
      label: 'No 0x Prefix', 
      value: '742d35Cc6634C0532925a3b8D7C6A1cd5Ba6FB9C' 
    },
    { 
      label: 'Empty String', 
      value: '' 
    }
  ]

  const handleTestAddress = (address: string) => {
    setTestAddress(address)
    const validation = validateWalletAddress(address)
    const inputValidation = getInputValidationState(address)
    
    setTestResults({
      validation,
      inputValidation,
      formatted: validation.isValid ? formatAddressForDisplay(address) : null
    })
  }

  const getValidationIcon = (state: string) => {
    switch (state) {
      case 'valid':
        return checkmarkCircleOutline
      case 'invalid':
        return closeCircleOutline
      case 'warning':
        return warningOutline
      default:
        return informationCircleOutline
    }
  }

  const getValidationColor = (state: string) => {
    switch (state) {
      case 'valid':
        return '#28a745'
      case 'invalid':
        return '#dc3545'
      case 'warning':
        return '#ffc107'
      default:
        return '#6c757d'
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="card-title mb-0">🧪 Address Validation Test Panel</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Test Address:</label>
          <input
            type="text"
            className={`form-control ${
              testResults?.inputValidation?.state === 'invalid' ? 'is-invalid' :
              testResults?.inputValidation?.state === 'valid' ? 'is-valid' :
              testResults?.inputValidation?.state === 'warning' ? 'is-warning' : ''
            }`}
            value={testAddress}
            onChange={(e) => handleTestAddress(e.target.value)}
            placeholder="Enter wallet address to test..."
          />
          {testResults?.inputValidation?.message && (
            <div className={`form-text ${
              testResults.inputValidation.state === 'invalid' ? 'text-danger' :
              testResults.inputValidation.state === 'valid' ? 'text-success' :
              testResults.inputValidation.state === 'warning' ? 'text-warning' : ''
            }`}>
              <IonIcon 
                icon={getValidationIcon(testResults.inputValidation.state)} 
                style={{ color: getValidationColor(testResults.inputValidation.state), marginRight: '5px' }}
              />
              {testResults.inputValidation.message}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Quick Tests:</label>
          <div className="d-flex flex-wrap gap-2">
            {testAddresses.map((test, index) => (
              <button
                key={index}
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleTestAddress(test.value)}
              >
                {test.label}
              </button>
            ))}
          </div>
        </div>

        {testResults && (
          <div className="border rounded p-3 bg-light">
            <h6>Validation Results:</h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Basic Validation:</strong>
                <ul className="list-unstyled mt-2">
                  <li>
                    <IonIcon 
                      icon={testResults.validation.isValid ? checkmarkCircleOutline : closeCircleOutline}
                      style={{ color: testResults.validation.isValid ? '#28a745' : '#dc3545', marginRight: '5px' }}
                    />
                    Valid: {testResults.validation.isValid ? 'Yes' : 'No'}
                  </li>
                  {testResults.validation.error && (
                    <li className="text-danger">
                      <IonIcon icon={closeCircleOutline} style={{ marginRight: '5px' }} />
                      Error: {testResults.validation.error}
                    </li>
                  )}
                  {testResults.validation.normalizedAddress && (
                    <li className="text-success">
                      <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '5px' }} />
                      Normalized: {testResults.formatted}
                    </li>
                  )}
                </ul>
              </div>
              <div className="col-md-6">
                <strong>UI Validation:</strong>
                <ul className="list-unstyled mt-2">
                  <li>
                    <IonIcon 
                      icon={getValidationIcon(testResults.inputValidation.state)}
                      style={{ color: getValidationColor(testResults.inputValidation.state), marginRight: '5px' }}
                    />
                    State: {testResults.inputValidation.state}
                  </li>
                  {testResults.inputValidation.showCheckmark && (
                    <li className="text-success">
                      <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: '5px' }} />
                      Show Checkmark: Yes
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3">
          <h6>Test Scenarios:</h6>
          <ul className="list-unstyled">
            <li>✅ Valid addresses show green checkmark</li>
            <li>❌ Invalid addresses show red error</li>
            <li>⚠️ Checksum corrections show yellow warning</li>
            <li>🚫 Zero/burn addresses are blocked</li>
            <li>🔤 Format validation prevents typos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddressValidationTestPanel
