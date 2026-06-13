import { useState } from 'react'

export const IsolatedExchangeInput = () => {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (value: string) => {
    console.log('IsolatedExchangeInput: Input changed to:', value)
    
    try {
      // Basic validation like in the real component
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setInputValue(value)
      }
    } catch (error) {
      console.error('IsolatedExchangeInput: Error:', error)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ff6b6b', 
      margin: '10px', 
      backgroundColor: '#ffe8e8' 
    }}>
      <h3>Isolated Exchange Input (Real UI Logic)</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>Real Exchange Input: </label>
        <input
          type="text"
          className="form-control form-control-lg pe-0 border-0"
          placeholder="0"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          style={{ padding: '8px', marginLeft: '10px', fontSize: '16px' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Current Value:</strong> {inputValue || 'empty'}
      </div>
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        This mimics the exact input logic from the real Exchange component
      </div>
    </div>
  )
}
