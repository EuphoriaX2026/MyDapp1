import { useEuphoriaExchange } from '../hooks/useEuphoriaExchange'
import { useWallet } from '../hooks/useWallet'
import { useState } from 'react'

export const HookStatusDebug = () => {
  const { isConnected } = useWallet()
  const [selectedStablecoin, setSelectedStablecoin] = useState<string>('')

  // Test the main hook
  let hookStatus = 'Loading...'
  let hookData: ReturnType<typeof useEuphoriaExchange> | null = null
  
  try {
    hookData = useEuphoriaExchange()
    hookStatus = 'Success'
  } catch (error) {
    hookStatus = `Error: ${error instanceof Error ? error.message : String(error)}`
  }

  // Test individual hook calls
  let stablecoinInfoStatus = 'Not tested'
  let priceStatus = 'Not tested'
  
  if (hookData && selectedStablecoin) {
    try {
      const stablecoinInfo = hookData.useStablecoinInfo(selectedStablecoin as any)
      stablecoinInfoStatus = stablecoinInfo ? 'Success' : 'Null result'
    } catch (error) {
      stablecoinInfoStatus = `Error: ${error instanceof Error ? error.message : String(error)}`
    }

    try {
      const priceData = hookData.useERXPrice(selectedStablecoin as any)
      priceStatus = priceData?.data ? 'Success' : 'No data'
    } catch (error) {
      priceStatus = `Error: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #17a2b8', 
      margin: '10px', 
      backgroundColor: '#d1ecf1' 
    }}>
      <h3>Hook Status Debug</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Main Hook Status:</strong> {hookStatus}
      </div>
      
      {hookData && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <strong>Stablecoins:</strong> {hookData.stablecoinAddresses?.length || 0} found
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Test Stablecoin: </label>
            <select 
              value={selectedStablecoin} 
              onChange={(e) => setSelectedStablecoin(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              <option value="">Select stablecoin</option>
              {hookData.stablecoinAddresses?.map((addr: string) => (
                <option key={addr} value={addr}>
                  {addr}
                </option>
              ))}
            </select>
          </div>
          
          {selectedStablecoin && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <strong>Stablecoin Info Status:</strong> {stablecoinInfoStatus}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Price Hook Status:</strong> {priceStatus}
              </div>
            </>
          )}
        </>
      )}
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        This component tests each hook individually to identify failures
      </div>
    </div>
  )
}
