import { useState } from 'react'

export const ExchangeDebug = () => {
  const [fromAmount, setFromAmount] = useState('')

  const handleFromAmountChange = (value: string) => {
    console.log('Input changed to:', value)
    try {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFromAmount(value)
      }
    } catch (error) {
      console.error('Error in handleFromAmountChange:', error)
    }
  }

  console.log('ExchangeDebug rendering, fromAmount:', fromAmount)

  return (
    <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
      <h2>Exchange Debug Component</h2>
      <div>
        <label>From Amount:</label>
        <input 
          type="text" 
          value={fromAmount}
          onChange={(e) => handleFromAmountChange(e.target.value)}
          placeholder="Enter amount"
          style={{ 
            padding: '10px', 
            margin: '10px', 
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>
      <div>Current value: {fromAmount}</div>
    </div>
  )
}
