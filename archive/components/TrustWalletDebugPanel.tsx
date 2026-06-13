import React, { useState, useEffect } from 'react'
import { 
  isTrustWallet, 
  isTrustWalletMobile, 
  getTrustWalletDebugInfo,
  TRUST_WALLET_CONFIG 
} from '../utils/trustWalletFixes'
import { useWallet } from '../hooks/useWallet'

interface TrustWalletDebugProps {
  className?: string
}

export const TrustWalletDebugPanel: React.FC<TrustWalletDebugProps> = ({ className }) => {
  const { isConnected, address } = useWallet()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    setDebugInfo(getTrustWalletDebugInfo())
  }, [])

  const runTrustWalletCompatibilityTest = () => {
    const results: string[] = []
    
    // Test 1: Wallet Detection
    results.push(`✅ Trust Wallet Detection: ${isTrustWallet() ? 'DETECTED' : 'NOT DETECTED'}`)
    results.push(`📱 Mobile Environment: ${isTrustWalletMobile() ? 'YES' : 'NO'}`)
    
    // Test 2: Ethereum Provider
    if (typeof window !== 'undefined' && window.ethereum) {
      results.push(`🔗 Ethereum Provider: AVAILABLE`)
      results.push(`   - isTrust: ${window.ethereum.isTrust || 'false'}`)
      results.push(`   - isTrustWallet: ${window.ethereum.isTrustWallet || 'false'}`)
      results.push(`   - isMetaMask: ${window.ethereum.isMetaMask || 'false'}`)
    } else {
      results.push(`❌ Ethereum Provider: NOT AVAILABLE`)
    }
    
    // Test 3: Configuration
    results.push(`⚙️ Trust Wallet Config:`)
    results.push(`   - Large Approval Amount: ${TRUST_WALLET_CONFIG.LARGE_APPROVAL_AMOUNT}`)
    results.push(`   - Gas Multiplier: ${TRUST_WALLET_CONFIG.GAS_MULTIPLIER}`)
    results.push(`   - Max Gas Limit: ${TRUST_WALLET_CONFIG.MAX_GAS_LIMIT}`)
    results.push(`   - Prefer Exact Approval: ${TRUST_WALLET_CONFIG.PREFER_EXACT_APPROVAL}`)
    
    // Test 4: User Agent Analysis
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()
      results.push(`🌐 User Agent Analysis:`)
      results.push(`   - Contains 'trust': ${userAgent.includes('trust')}`)
      results.push(`   - Contains 'android': ${userAgent.includes('android')}`)
      results.push(`   - Contains 'iphone': ${userAgent.includes('iphone')}`)
      results.push(`   - Contains 'mobile': ${userAgent.includes('mobile')}`)
    }
    
    setTestResults(results)
  }

  if (!isConnected || !isTrustWallet()) {
    return (
      <div className={`card ${className || ''}`}>
        <div className="card-body">
          <h6 className="card-title">🔍 Trust Wallet Debug</h6>
          <div className="alert alert-info">
            {!isConnected ? 
              'Connect your wallet to see Trust Wallet debug information' :
              'Trust Wallet not detected. This panel only shows for Trust Wallet users.'
            }
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className || ''}`}>
      <div className="card-body">
        <h6 className="card-title">🔍 Trust Wallet Debug Panel</h6>
        
        <div className="alert alert-warning mb-3">
          <strong>Trust Wallet Detected!</strong><br />
          This debug panel helps diagnose approval transaction issues specific to Trust Wallet.
        </div>

        {/* Debug Information */}
        <div className="mb-3">
          <h6>📊 Current Status</h6>
          <div className="small">
            <div><strong>Wallet:</strong> Trust Wallet {isTrustWalletMobile() ? '(Mobile)' : '(Desktop)'}</div>
            <div><strong>Address:</strong> {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}</div>
            <div><strong>Environment:</strong> {debugInfo.isTrustWalletMobile ? 'Mobile App' : 'Desktop/Extension'}</div>
          </div>
        </div>

        {/* Quick Fixes */}
        <div className="mb-3">
          <h6>🛠️ Quick Fixes for Common Issues</h6>
          <div className="small text-muted">
            <div>• <strong>Approval Fails:</strong> Using optimized approval amounts for Trust Wallet</div>
            <div>• <strong>Gas Issues:</strong> Automatic gas adjustment (+{(TRUST_WALLET_CONFIG.GAS_MULTIPLIER - 1) * 100}% buffer)</div>
            <div>• <strong>Mobile Issues:</strong> Enhanced mobile wallet detection and handling</div>
            <div>• <strong>Retry Logic:</strong> Automatic retry up to {TRUST_WALLET_CONFIG.MAX_RETRIES} times</div>
          </div>
        </div>

        {/* Test Button */}
        <button 
          className="btn btn-outline-primary btn-sm mb-3"
          onClick={runTrustWalletCompatibilityTest}
        >
          Run Compatibility Test
        </button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-3">
            <h6>🧪 Test Results</h6>
            <div className="bg-light p-2 rounded" style={{ fontSize: '12px' }}>
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Debug Info */}
        <details className="mt-2">
          <summary className="text-muted small">Raw Debug Information</summary>
          <pre className="small text-muted mt-2" style={{ fontSize: '10px' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>

        {/* Help Text */}
        <div className="mt-3 p-2 bg-info text-white rounded small">
          <strong>💡 Tip:</strong> If you're experiencing approval transaction issues, the app now includes 
          Trust Wallet-specific optimizations that should resolve most common problems automatically.
        </div>
      </div>
    </div>
  )
}

export default TrustWalletDebugPanel
