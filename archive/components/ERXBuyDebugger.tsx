import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useEuphoriaExchange } from '../hooks/useEuphoriaExchange'
import { contracts } from '../config/wagmi'
import { type Address, parseUnits } from 'viem'

interface ERXBuyDebuggerProps {
  className?: string
}

export const ERXBuyDebugger = ({ className = '' }: ERXBuyDebuggerProps) => {
  const account = useAccount()
  const { 
    buyERX, 
    stablecoinAddresses, 
    getStablecoinWithMetadata,
    useStablecoinInfo,
    hash, 
    isPending, 
    isConfirmed, 
    error: hookError 
  } = useEuphoriaExchange()
  
  const [amount, setAmount] = useState('1')
  const [selectedStablecoin, setSelectedStablecoin] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)

  // Get balance info for selected stablecoin
  const stablecoinInfo = useStablecoinInfo(selectedStablecoin || undefined)

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`🔍 ERX Debug: ${message}`)
  }

  // Monitor transaction state changes
  useEffect(() => {
    if (hash && hash !== lastTransactionHash) {
      setLastTransactionHash(hash)
      addDebugLog(`🧾 Transaction hash received: ${hash}`)
    }
    
    if (isConfirmed && hash) {
      addDebugLog(`✅ Transaction confirmed: ${hash}`)
      setIsLoading(false)
    }
    
    if (hookError && isLoading) {
      addDebugLog(`❌ Hook Error Detected: ${hookError}`)
      // Enhanced error analysis
      addDebugLog(`🔍 Error Analysis:`)
      addDebugLog(`  - Error type: ${typeof hookError}`)
      addDebugLog(`  - Error message: ${hookError instanceof Error ? hookError.message : String(hookError)}`)
      addDebugLog(`  - Error code: ${(hookError as any)?.code}`)
      addDebugLog(`  - Error reason: ${(hookError as any)?.reason}`)
      addDebugLog(`  - Error data: ${(hookError as any)?.data}`)
      addDebugLog(`  - Contract revert: ${(hookError as any)?.code === 'CALL_EXCEPTION' || !!(hookError as any)?.reason}`)
      
      // Try to extract more details
      if ((hookError as any)?.cause) {
        addDebugLog(`  - Cause: ${JSON.stringify((hookError as any).cause, null, 2)}`)
      }
      
      if ((hookError as any)?.details) {
        addDebugLog(`  - Details: ${(hookError as any).details}`)
      }
      
      if ((hookError as any)?.shortMessage) {
        addDebugLog(`  - Short message: ${(hookError as any).shortMessage}`)
      }
      
      setIsLoading(false)
    }
  }, [hash, isConfirmed, hookError, lastTransactionHash, isLoading])

  const handleTestBuy = async () => {
    if (!account.address || !selectedStablecoin || !amount) {
      addDebugLog('❌ Missing requirements: wallet, stablecoin, or amount')
      return
    }

    setIsLoading(true)
    addDebugLog(`🚀 Starting ERX buy test...`)
    addDebugLog(`📊 Parameters: amount=${amount}, stablecoin=${selectedStablecoin}`)

    try {
      // Get stablecoin metadata
      const stablecoinMeta = getStablecoinWithMetadata(selectedStablecoin)
      
      if (!stablecoinMeta) {
          addDebugLog(`❌ Error: Could not load metadata for stablecoin ${selectedStablecoin}`)
          setIsLoading(false)
          return
      }

      addDebugLog(`💰 Stablecoin: ${stablecoinMeta.symbol} (${stablecoinMeta.decimals} decimals)`)
      
      // Parse amount
      const parsedAmount = parseUnits(amount, stablecoinMeta.decimals)
      addDebugLog(`🔢 Parsed amount: ${parsedAmount.toString()}`)
      
      // Get stablecoin balance info
      const userBalance = stablecoinInfo?.balance || '0'
      const formattedBalance = Number(userBalance) / Math.pow(10, stablecoinMeta.decimals)
      const requiredAmount = Number(amount)
      
      addDebugLog(`💳 Balance Check:`)
      addDebugLog(`  - Your ${stablecoinMeta.symbol} balance: ${formattedBalance.toFixed(6)} ${stablecoinMeta.symbol}`)
      addDebugLog(`  - Required amount: ${requiredAmount} ${stablecoinMeta.symbol}`)
      addDebugLog(`  - Sufficient balance: ${formattedBalance >= requiredAmount ? '✅ YES' : '❌ NO'}`)
      
      if (formattedBalance < requiredAmount) {
        addDebugLog(`🚫 INSUFFICIENT BALANCE: You need ${requiredAmount} ${stablecoinMeta.symbol} but only have ${formattedBalance.toFixed(6)} ${stablecoinMeta.symbol}`)
        addDebugLog(`💡 Please add more ${stablecoinMeta.symbol} to your wallet or try a smaller amount`)
        setIsLoading(false)
        return
      }
      
      // Contract details
      addDebugLog(`📜 ERX Token Contract: ${contracts.ERX_TOKEN}`)
      addDebugLog(`🏦 Stablecoin Contract: ${selectedStablecoin}`)
      
      // Attempt the buy transaction
      addDebugLog(`📞 Calling buyERX function...`)
      await buyERX(selectedStablecoin, amount, stablecoinMeta.decimals)
      
      addDebugLog(`📤 Transaction submitted! Waiting for hash...`)
      // Hash will be captured by useEffect when it becomes available
      
    } catch (error: any) {
      addDebugLog(`❌ ERX Buy Failed: ${error}`)
      
      // Enhanced error analysis
      addDebugLog(`🔍 Error Analysis:`)
      addDebugLog(`  - Error type: ${typeof error}`)
      addDebugLog(`  - Error message: ${error instanceof Error ? error.message : String(error)}`)
      addDebugLog(`  - Error code: ${error?.code}`)
      addDebugLog(`  - Error reason: ${error?.reason}`)
      addDebugLog(`  - Error data: ${error?.data}`)
      addDebugLog(`  - Contract revert: ${error?.code === 'CALL_EXCEPTION' || !!error?.reason}`)
      
      // Check for common insufficient balance error patterns
      const errorMessage = String(error).toLowerCase()
      if (errorMessage.includes('insufficient') || 
          errorMessage.includes('balance') ||
          errorMessage.includes('exceeds') ||
          error?.reason?.includes('ERC20: transfer amount exceeds balance')) {
        const symbol = selectedStablecoin && getStablecoinWithMetadata(selectedStablecoin)?.symbol || 'Stablecoin';
        addDebugLog(`💳 LIKELY CAUSE: Insufficient ${symbol} balance`)
      }
      
      // Try to extract more details
      if ((error as any)?.cause) {
        addDebugLog(`  - Cause: ${JSON.stringify((error as any).cause, null, 2)}`)
      }
      
      if ((error as any)?.details) {
        addDebugLog(`  - Details: ${(error as any).details}`)
      }
      
      if ((error as any)?.shortMessage) {
        addDebugLog(`  - Short message: ${(error as any).shortMessage}`)
      }
      
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setDebugLogs([])
  }

  // Get supported stablecoins
  const stablecoins = stablecoinAddresses

  return (
    <div className={`bg-gray-900 text-white p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-bold mb-4 text-yellow-400">🔬 ERX Buy Transaction Debugger</h3>
      
      {!account.address ? (
        <div className="text-red-400 mb-4">❌ Wallet not connected</div>
      ) : (
        <div className="text-green-400 mb-4">✅ Wallet: {account.address.slice(0, 6)}...{account.address.slice(-4)}</div>
      )}

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            placeholder="Enter amount"
            step="0.01"
            min="0"
          />
        </div>

        {/* Stablecoin Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Stablecoin</label>
          <select
            value={selectedStablecoin || ''}
            onChange={(e) => setSelectedStablecoin(e.target.value as Address)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="">Select stablecoin...</option>
            {stablecoins?.map((addr: string) => {
              const address = addr as Address
              const meta = getStablecoinWithMetadata(address)
              if (!meta) return null
              return (
                <option key={address} value={address}>
                  {meta.symbol} ({address.slice(0, 6)}...{address.slice(-4)})
                </option>
              )
            })}
          </select>
        </div>

        {/* Test Button */}
        <button
          onClick={handleTestBuy}
          disabled={(isLoading || isPending) || !account.address || !selectedStablecoin || !amount}
          className={`w-full py-2 px-4 rounded font-medium ${
            (isLoading || isPending) || !account.address || !selectedStablecoin || !amount
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isPending ? '⏳ Transaction Pending...' : isLoading ? '🔄 Submitting...' : '🚀 Test ERX Buy Transaction'}
        </button>

        {/* Clear Logs Button */}
        {debugLogs.length > 0 && (
          <button
            onClick={clearLogs}
            className="w-full py-1 px-2 rounded text-sm bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            Clear Logs
          </button>
        )}
      </div>

      {/* Transaction State Info */}
      {(isPending || hash || hookError) && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-xs">
          <h4 className="font-semibold mb-2 text-orange-400">🔄 Transaction State</h4>
          {isPending && <div className="text-yellow-400">⏳ Transaction Pending...</div>}
          {hash && <div className="text-green-400">✅ Hash: {hash}</div>}
          {isConfirmed && <div className="text-green-400">🎉 Transaction Confirmed!</div>}
          {hookError && <div className="text-red-400">❌ Error: {String(hookError)}</div>}
        </div>
      )}

      {/* Debug Logs */}
      {debugLogs.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2 text-cyan-400">📋 Debug Logs</h4>
          <div className="bg-black p-3 rounded text-xs font-mono max-h-96 overflow-y-auto">
            {debugLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="mt-4 p-3 bg-gray-800 rounded text-xs">
        <h4 className="font-semibold mb-2 text-cyan-400">📜 Contract Information</h4>
        <div>ERX Token: {contracts.ERX_TOKEN}</div>
        <div className="mt-1">
          Supported Stablecoins: {stablecoins?.length || 0} loaded
        </div>
      </div>
    </div>
  )
}
