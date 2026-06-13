/**
 * ERX Phase 2 - Network Configuration
 * Multi-Network Support: Testnet (Amoy) and Mainnet (Polygon)
 */

import { polygon, polygonAmoy } from 'wagmi/chains'

export type NetworkMode = 'testnet' | 'mainnet'

// Detect environment from Environment Variables
export const NETWORK_MODE: NetworkMode = 
  (import.meta.env.VITE_NETWORK_MODE as NetworkMode) || 'testnet'

// Select active networks based on environment
export const CHAINS = NETWORK_MODE === 'mainnet' 
  ? [polygon] as const
  : [polygonAmoy] as const

// Current active network
export const CURRENT_CHAIN = CHAINS[0]

// Network info for user display
export const NETWORK_INFO = {
  testnet: {
    name: 'Polygon Amoy Testnet',
    chainId: 80002,
    symbol: 'POL',
    explorer: 'https://amoy.polygonscan.com',
    faucet: 'https://faucet.polygon.technology',
  },
  mainnet: {
    name: 'Polygon Mainnet',
    chainId: 137,
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
    faucet: null,
  },
} as const

// Current network info
export const CURRENT_NETWORK_INFO = NETWORK_INFO[NETWORK_MODE]

// Helper function to check if is testnet
export const isTestnet = () => NETWORK_MODE === 'testnet'
export const isMainnet = () => NETWORK_MODE === 'mainnet'
