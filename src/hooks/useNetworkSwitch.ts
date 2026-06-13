/**
 * ERX Phase 2 - Network Switch Hook
 * Hook for managing switch between Testnet and Mainnet
 */

import { useSwitchChain, useChainId } from 'wagmi'
import { CURRENT_CHAIN, NETWORK_MODE, CHAINS, CURRENT_NETWORK_INFO } from '@/config/networks'

export function useNetworkSwitch() {
  const { switchChain, isPending } = useSwitchChain()
  const chainId = useChainId()
  
  const isOnCurrentNetwork = chainId === CURRENT_CHAIN.id
  const isOnSupportedNetwork = CHAINS.some(chain => chain.id === chainId)
  
  /**
   * Switch to current network (based on NETWORK_MODE)
   */
  const switchToCurrentNetwork = () => {
    if (!isOnCurrentNetwork) {
      switchChain({ chainId: CURRENT_CHAIN.id })
    }
  }
  
  /**
   * Get current network name
   */
  const getCurrentNetworkName = () => {
    return CURRENT_NETWORK_INFO.name
  }
  
  /**
   * Get Block Explorer URL
   */
  const getExplorerUrl = (address?: string, type: 'address' | 'tx' = 'address') => {
    const baseUrl = CURRENT_NETWORK_INFO.explorer
    if (!address) return baseUrl
    return `${baseUrl}/${type}/${address}`
  }
  
  /**
   * Get Faucet URL (Testnet only)
   */
  const getFaucetUrl = () => {
    return CURRENT_NETWORK_INFO.faucet
  }
  
  return {
    // Network info
    networkMode: NETWORK_MODE,
    currentChain: CURRENT_CHAIN,
    currentNetworkInfo: CURRENT_NETWORK_INFO,
    
    // Status
    isOnCurrentNetwork,
    isOnSupportedNetwork,
    isSwitching: isPending,
    
    // Actions
    switchToCurrentNetwork,
    switchChain,
    
    // Utilities
    getCurrentNetworkName,
    getExplorerUrl,
    getFaucetUrl,
  }
}
