/**
 * MyTitan Phase - Contract Addresses
 * 
 * Architecture of specialized MyTitan ecosystem:
 * - CORE: Router, Configs, Ledger, Bank, Store, UpdateFund, AssetMaker
 * - MLM/BUSINESS: Panel, Lens, Register, Engine, Activator
 * - TOKEN: E1
 */

import { NETWORK_MODE } from './networks'

// ⚠️ Zero Address - Fallback for undeployed contracts
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

// 🧪 Testnet Addresses (Polygon Amoy)
// Addresses deployed from MyTitan project
const TESTNET_CONTRACTS = {
  Router: "0xb5fd9d359a133C56A2DA64FACab2895cB4667117",
  Configs: "0xa1Ecc50B2187A8FdDeD1B0CfA32F67edb2B9c035",
  Ledger: "0x05D9d0279Cf3C0e4bBEa42589FaD45e9D80A4B37",
  Bank: "0x6264012808423C7B95c6269834fC5EE6A82ccAaa",
  /** Amoy Store hotfix (2026-06) — buyProduct / redeemE1; supersedes 0x83316c… */
  Store: "0x8BaD8c341F0E0fB67096881CaF37B4baf7201DF8",
  UpdateFund: ZERO_ADDRESS, // Need actual if updated later
  AssetMaker: "0x21da191e07A5EE6479eB9999C0E622DC2Cf06733",
  Panel: "0xEe3E79BF496Cc79a857B1d34d352417e71D089eE",
  Lens: "0x6634CbA86826c16FA9D4De272aA91D3C9825BE63",
  E1: "0xe1c2FDF975532A25765cc26273A51E736789d1E1",
  Register: "0x91Fc32754aA4c37bAFEC3549eB5781142976a666",
  Engine: "0x50655E1Df16436D981e80d1560DdD32093f2e250",
  Activator: "0xa0336CDf7EbeEDCba0B76eB26Ce1827818B00d4C",
  Manager: "0xa28BD7D5494c691FD2527a2CeF49E5FEA1F54CF8",
  Turbo: "0x52AB6a74eB77F95aE5C6184E3833893B1C50b10f",
} as const

// 🚀 Mainnet Addresses (Polygon)
// TODO: Replace with actual deployed addresses for MyTitan Polygon mainnet
const MAINNET_CONTRACTS = {
  Router: ZERO_ADDRESS,
  Configs: ZERO_ADDRESS,
  Ledger: ZERO_ADDRESS,
  Bank: ZERO_ADDRESS,
  Store: ZERO_ADDRESS,
  UpdateFund: ZERO_ADDRESS,
  AssetMaker: ZERO_ADDRESS,
  Panel: ZERO_ADDRESS,
  Lens: ZERO_ADDRESS,
  E1: ZERO_ADDRESS,
  Register: ZERO_ADDRESS,
  Engine: ZERO_ADDRESS,
  Activator: ZERO_ADDRESS,
  Manager: ZERO_ADDRESS,
  Turbo: ZERO_ADDRESS,
} as const

// Export main MyTitan contracts based on environment
export const TITAN_CONTRACTS = NETWORK_MODE === 'mainnet'
  ? MAINNET_CONTRACTS
  : TESTNET_CONTRACTS

export type TitanContractName = keyof typeof TITAN_CONTRACTS
export type TitanContractAddress = typeof TITAN_CONTRACTS[TitanContractName]
