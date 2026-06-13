import React from 'react'
import { useWallet } from '../hooks/useWallet'
import { formatUnits } from 'viem'

export const BalanceDebugPanel: React.FC = () => {
  const { balance: nativeBalance, balanceLoading, isConnected, address } = useWallet()

  if (!isConnected) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px', 
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <h4>Balance Debug (Not Connected)</h4>
        <p>Wallet not connected</p>
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Balance Debug Panel</h4>
      <p><strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</p>
      <p><strong>Balance Loading:</strong> {balanceLoading ? 'Yes' : 'No'}</p>
      <p><strong>Native Balance Object:</strong> {nativeBalance ? 'Exists' : 'undefined/null'}</p>
      {nativeBalance && (
        <>
          <p><strong>Balance Value:</strong> {nativeBalance.value?.toString()}</p>
          <p><strong>Balance Symbol:</strong> {nativeBalance.symbol}</p>
          <p><strong>Balance Decimals:</strong> {nativeBalance.decimals}</p>
          <p><strong>Formatted Balance:</strong> {formatUnits(nativeBalance.value, 18)}</p>
        </>
      )}
      <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      <p><strong>Build Mode:</strong> {import.meta.env.MODE}</p>
      <p><strong>Vite Env:</strong> {import.meta.env.DEV ? 'dev' : 'prod'}</p>
    </div>
  )
}
