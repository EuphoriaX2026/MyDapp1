import { useState } from 'react'
import { USDCDecimalTest } from './USDCDecimalTest'
import SellFunctionalityTestPanel from './SellFunctionalityTestPanel'
import { ERXBuyDebugger } from './ERXBuyDebugger'
import TrustWalletDebugPanel from './TrustWalletDebugPanel'
import { testApprovalAmount, runApprovalTests } from '../utils/approvalTest'
import { debugStablecoinDecimals } from '../utils/stablecoinDebug'
import { TOKEN_DECIMALS } from '../config/wagmi'
import { type Address, parseUnits } from 'viem'

interface ExchangeDevToolsProps {
  // Props for debug information
  exchangeDirection: 'STABLECOIN_TO_TOKEN' | 'TOKEN_TO_STABLECOIN'
  fromTokenAddress?: Address | string
  spenderContract?: Address | string
  fromAmount: string
  fromTokenDecimals: number
  selectedStablecoin?: Address | null
  stablecoinDecimals: number
  currentAllowance?: bigint
  approvalNeeded?: boolean
  checkNeedsApproval: (allowance: bigint | undefined, amount: string, decimals: number) => boolean
  stablecoinInfo?: any
  stablecoinAddresses?: Address[]
}

export const ExchangeDevTools = ({
  exchangeDirection,
  fromTokenAddress,
  spenderContract,
  fromAmount,
  fromTokenDecimals,
  selectedStablecoin,
  stablecoinDecimals,
  currentAllowance,
  approvalNeeded,
  checkNeedsApproval,
  stablecoinInfo,
  stablecoinAddresses
}: ExchangeDevToolsProps) => {
  const [isVisible, setIsVisible] = useState(false)

  // Debug environment variables
  console.log('Environment Debug:', {
    'import.meta.env.DEV': import.meta.env.DEV,
    'import.meta.env.MODE': import.meta.env.MODE,
    'import.meta.env.PROD': import.meta.env.PROD
  })

  // Only render in development environment (using Vite's environment variable)
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <div className="exchange-dev-tools">
      {/* Dev Tools Toggle Button */}
      <div className="section mt-3">
        <div className="text-center">
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => setIsVisible(!isVisible)}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              zIndex: 1000,
              borderRadius: '20px',
              fontSize: '12px',
              padding: '5px 15px'
            }}
          >
            {isVisible ? '🔧 Hide Dev Tools' : '🔧 Dev Tools'}
          </button>
        </div>
      </div>

      {/* Dev Tools Panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            background: 'white',
            border: '2px solid #007bff',
            borderRadius: '10px',
            padding: '20px',
            zIndex: 1001,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">🔧 Exchange Dev Tools</h6>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </button>
          </div>

          {/* Approval Debug Information */}
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Debug: Approval Status</h6>
              <div className="small text-muted">
                <div>Exchange Direction: {exchangeDirection}</div>
                <div>From Token Address: {fromTokenAddress || 'None'}</div>
                <div>Spender Contract: {spenderContract || 'None'}</div>
                <div>From Amount: {fromAmount}</div>
                <div>From Token Decimals: {fromTokenDecimals}</div>
                <div>Selected Stablecoin: {selectedStablecoin || 'None'}</div>
                <div>Stablecoin Decimals: {stablecoinDecimals}</div>
                <div>Current Allowance: {currentAllowance?.toString() || 'Loading...'}</div>
                <div>Approval Needed (Hook): {approvalNeeded ? 'Yes' : 'No'}</div>
                <div>Approval Needed (Function): {currentAllowance ? (checkNeedsApproval(currentAllowance, fromAmount, fromTokenDecimals) ? 'Yes' : 'No') : 'Unknown'}</div>
                
                {/* Decimal Configuration Debug */}
                {selectedStablecoin && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <strong>Decimal Configuration Check:</strong>
                    <br />
                    - Address: {selectedStablecoin}
                    <br />
                    - Configured in TOKEN_DECIMALS: {(TOKEN_DECIMALS as any)[selectedStablecoin] || 'NOT CONFIGURED'}
                    <br />
                    - From stablecoinInfo: {stablecoinInfo?.decimals || 'Not available'}
                    <br />
                    - Final decimals used: {stablecoinDecimals}
                    <br />
                    {selectedStablecoin.toLowerCase().startsWith('0x3c49') && (
                      <div className="text-warning">
                        ⚠️ This appears to be USDC (Native) on Polygon - should use 6 decimals!
                      </div>
                    )}
                    {!(TOKEN_DECIMALS as any)[selectedStablecoin] && (
                      <div className="text-danger">
                        ❌ This address is NOT configured in TOKEN_DECIMALS!
                        <br />
                        This will cause incorrect approval amounts.
                      </div>
                    )}
                  </div>
                )}
                
                {fromAmount && fromTokenDecimals && (
                  <div>
                    <strong>Approval Amount Test:</strong>
                    <br />
                    - Input: "{fromAmount}" with {fromTokenDecimals} decimals
                    <br />
                    - parseUnits result: {(() => {
                      try {
                        return parseUnits(fromAmount, fromTokenDecimals).toString()
                      } catch (e) {
                        return 'Error calculating'
                      }
                    })()}
                    <br />
                    - For USDC (6 decimals): 1 USDC = 1,000,000 units
                    <br />
                    - For DAI (18 decimals): 1 DAI = 1,000,000,000,000,000,000 units
                    <br />
                    <button 
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => {
                        if (fromTokenAddress && fromAmount) {
                          testApprovalAmount(fromAmount, fromTokenAddress as Address)
                        }
                        runApprovalTests()
                      }}
                    >
                      Run Approval Tests
                    </button>
                  </div>
                )}

                {/* Stablecoin Debug Button */}
                {stablecoinAddresses && (
                  <div className="mt-2">
                    <button 
                      className="btn btn-sm btn-outline-info"
                      onClick={() => {
                        console.log('🔍 Running stablecoin decimal debugging...')
                        debugStablecoinDecimals(stablecoinAddresses)
                      }}
                    >
                      Debug Stablecoin Decimals
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trust Wallet Debug Panel */}
          <TrustWalletDebugPanel className="mb-3" />

          {/* USDC Decimal Test Component */}
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">USDC Decimal Test</h6>
              <USDCDecimalTest />
            </div>
          </div>

          {/* Sell Functionality Test Panel */}
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="card-title">Sell Functionality Test</h6>
              <SellFunctionalityTestPanel />
            </div>
          </div>

          {/* ERX Buy Debugger */}
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">ERX Buy Transaction Debugger</h6>
              <ERXBuyDebugger />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExchangeDevTools
