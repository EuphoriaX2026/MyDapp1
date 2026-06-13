/**
 * ERX Phase 2 - Contract Addresses
 * 
 * Architecture of 5 specialized contracts:
 * - ERX.sol: Token (mint, burn, transfer)
 * - EDex.sol: Exchange (buy, sell)
 * - EConfigs.sol: Settings and Fees
 * - ERouter.sol: Routing and Addressing
 * - EGuard.sol: Security and Guard
 */

import { NETWORK_MODE } from './networks'

// ⚠️ Zero Address - For undeployed contracts
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

// 🧪 Testnet Addresses (Polygon Amoy)
const TESTNET_CONTRACTS = {
  ERouter: '0x431F4137Ce7860d2fe2E4c1F225AF8c92c57a1aA' as const,
  ERX: '0x111D252EB63c68727d9f81563394C53C03177111' as const,
  EConfigs: '0xB9dCa224787B6d1960606D2CaB6e57AE9A0afB1B' as const,
  EGuard: '0x3E4a29Aae1745b39357905fd8EE941805A711BBc' as const,
  EDex: '0xFBc7F803b1d01A9848eB8f6bd1D65BE79eade59c' as const,
  UpdateFund: '0x85f517B78Bf26485dfcD302868B84a0A029A8E43' as const,
} as const

// 🚀 Mainnet Addresses (Polygon) - Update after deployment
const MAINNET_CONTRACTS = {
  ERouter: ZERO_ADDRESS,   // TODO: Update after deployment
  ERX: ZERO_ADDRESS,        // TODO: Update after deployment
  EConfigs: ZERO_ADDRESS,   // TODO: Update after deployment
  EGuard: ZERO_ADDRESS,     // TODO: Update after deployment
  EDex: ZERO_ADDRESS,       // TODO: Update after deployment
  UpdateFund: ZERO_ADDRESS, // TODO: Update after deployment
} as const

// Mock Tokens (Testnet only)
const TESTNET_MOCKS = {
  USDT: '0x9827f46a80b4f7a6F458b66DCaD42963Ad7B64D6' as const,
  DAI: '0xEF4205228471Ce53778Ee56dD90712D688ECab0a' as const,
  SwapRouter: '0xf0780dA7dF56a3372237c618BD762F1Fe43C64D4' as const,
  WMATIC: '0x0000000000000000000000000000000000000000' as const, // Placeholder for Amoy WMATIC
} as const

// Mainnet Real Tokens (Real Polygon addresses)
const MAINNET_TOKENS = {
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const, // Tether USD
  DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' as const,  // Dai Stablecoin
  USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as const, // USDC Native
  SwapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' as const, // QuickSwap
} as const

// Export main contracts based on environment
export const ERX_CONTRACTS = NETWORK_MODE === 'mainnet'
  ? MAINNET_CONTRACTS
  : TESTNET_CONTRACTS

// Export tokens based on environment
export const TOKENS = NETWORK_MODE === 'mainnet'
  ? MAINNET_TOKENS
  : TESTNET_MOCKS

// 🛡️ Helper: Check if contract is deployed
export const isContractDeployed = (address: string): boolean => {
  return address !== ZERO_ADDRESS && address.length === 42 && address.startsWith('0x')
}

// 🛡️ Helper: Check if all contracts are deployed
export const areAllContractsDeployed = (): boolean => {
  return Object.values(ERX_CONTRACTS).every(isContractDeployed)
}

// Type definitions
export type ContractName = keyof typeof ERX_CONTRACTS
export type ContractAddress = typeof ERX_CONTRACTS[ContractName]
