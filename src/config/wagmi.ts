import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, fallback } from 'wagmi'
import { polygon, polygonAmoy } from 'wagmi/chains'
import { CHAINS, NETWORK_MODE, isMainnet } from './networks'
import { ERX_CONTRACTS, TOKENS } from './erx-contracts'
import { TITAN_CONTRACTS } from './my-titan-contracts'
import {
    injectedWallet,
    metaMaskWallet,
    walletConnectWallet,
    coinbaseWallet,
    trustWallet,
    safepalWallet,
    tokenPocketWallet,
    safeWallet,
    rainbowWallet,
    phantomWallet,
    braveWallet,
    ledgerWallet,
    argentWallet
} from '@rainbow-me/rainbowkit/wallets'

// =============================================================================
// WALLETCONNECT PROJECT ID - CRITICAL FOR DEEP LINKING
// Get your free ID at https://cloud.walletconnect.com
// This ID enables native mobile app redirection (Deep Linking)
// =============================================================================
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'f8f1fc035616528fa7f6e2bc37f0b87f' 
// [ACTION REQUIRED]: Replace the default ID above with your production Project ID for best stability.

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
    console.warn('VITE_WALLET_CONNECT_PROJECT_ID is not set. Deep Linking and WalletConnect v2 functionality may be degraded.')
}

// Detect if we're on mobile for wallet configuration
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
}

// Get Custom RPC from localStorage
const getCustomRpc = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('CUSTOM_RPC_URL');
}
const customRpcUrl = getCustomRpc();

export const config = getDefaultConfig({
    appName: 'E1',
    appDescription: 'E1 - Decentralized organization',
    appUrl: typeof window !== 'undefined' ? window.location.origin + window.location.pathname + window.location.hash : 'https://e-one.io',
    appIcon: 'https://e1.org/logo.png',
    projectId,
    chains: CHAINS,

    transports: {
        // Test Network (Amoy)
        [polygonAmoy.id]: fallback([
            ...(customRpcUrl ? [http(customRpcUrl)] : []), // Custom RPC First
            http('https://rpc-amoy.polygon.technology'), // Official
            http('https://polygon-amoy-bor-rpc.publicnode.com'), // PublicNode
            http('https://assets.zebra-nodes.com/rpc/polygon-amoy'), // Zebra
            http('https://rpc.ankr.com/polygon_amoy'), // Ankr
            http('https://amoy.drpc.org'), // DRPC
        ]),
        // Main Network (Polygon Mainnet)
        [polygon.id]: fallback([
            ...(customRpcUrl ? [http(customRpcUrl)] : []), // Custom RPC First
            http('https://polygon-rpc.com'), // Aggregator
            http('https://rpc.ankr.com/polygon'), // Ankr
            http('https://1rpc.io/matic'), // 1RPC (Privacy)
            http('https://polygon.drpc.org'), // DRPC
            http('https://polygon-bor-rpc.publicnode.com'), // PublicNode
            http('https://matic-mainnet.chainstacklabs.com'), // Chainstack
        ]),
    },

    wallets: [
        {
            groupName: 'Recommended',
            wallets: [
                trustWallet,
                safepalWallet,
                tokenPocketWallet,
                walletConnectWallet,
                metaMaskWallet,
            ],
        },
        {
            groupName: 'Popular',
            wallets: [
                rainbowWallet,
                argentWallet,
                ledgerWallet,
            ],
        },
        {
            groupName: 'More Options',
            wallets: [
                braveWallet,
                phantomWallet,
                safeWallet,
            ],
        },
    ],
    ssr: false,
    multiInjectedProviderDiscovery: true,

    ...(isMobileDevice() && {
      initialChain: polygon,
    })
})

// Export chains for easy access
export { CHAINS, NETWORK_MODE }

// ================================================
// Dapp Contract Addresses (ERX + MyTitan)
// ================================================

/**
 * Contract addresses - imported from erx-contracts.ts & my-titan-contracts.ts
 * Determined based on NETWORK_MODE (testnet/mainnet)
 */
export const contracts = {
    // ERX Phase 2 Contracts
    ERX_TOKEN: ERX_CONTRACTS.ERX,
    EDEX: ERX_CONTRACTS.EDex,
    EROUTER: ERX_CONTRACTS.ERouter,
    ECONFIGS: ERX_CONTRACTS.EConfigs,
    EGUARD: ERX_CONTRACTS.EGuard,
    UPDATE_FUND: ERX_CONTRACTS.UpdateFund,
    
    // MyTitan Contracts
    TITAN_ROUTER: TITAN_CONTRACTS.Router,
    TITAN_CONFIGS: TITAN_CONTRACTS.Configs,
    TITAN_LEDGER: TITAN_CONTRACTS.Ledger,
    TITAN_BANK: TITAN_CONTRACTS.Bank,
    TITAN_STORE: TITAN_CONTRACTS.Store,
    TITAN_ASSETMAKER: TITAN_CONTRACTS.AssetMaker,
    TITAN_PANEL: TITAN_CONTRACTS.Panel,
    TITAN_LENS: TITAN_CONTRACTS.Lens,
    TITAN_E1: TITAN_CONTRACTS.E1,
    TITAN_REGISTER: TITAN_CONTRACTS.Register,
    TITAN_ENGINE: TITAN_CONTRACTS.Engine,
    TITAN_ACTIVATOR: TITAN_CONTRACTS.Activator,
    TITAN_MANAGER: TITAN_CONTRACTS.Manager,

    // Stablecoins (Testnet = Mock, Mainnet = Real)
    USDT: TOKENS.USDT,
    DAI: TOKENS.DAI,
    
    // Mainnet only tokens (Mocked if missing in Testnet)
    ...(isMainnet() && 'USDC' in TOKENS ? { USDC: (TOKENS as any).USDC as string } : {}),
    
    // Router & WMATIC
    SWAP_ROUTER: 'SwapRouter' in TOKENS ? (TOKENS as any).SwapRouter : undefined,
    WMATIC: 'WMATIC' in TOKENS ? (TOKENS as any).WMATIC : undefined,
} as const

// Token decimals (Dr. Satoshi's instruction - decimal precision)
export const TOKEN_DECIMALS_MAP = {
    [contracts.ERX_TOKEN]: 18,      // ERX Token
    [contracts.TITAN_E1]: 18,       // MyTitan E1 Token
    [contracts.USDT]: 6,            // USDT (Mock on Testnet, Real on Mainnet)
    [contracts.DAI]: 18,            // DAI
    // Mainnet specific
    ...(isMainnet() && contracts.USDC ? { [contracts.USDC]: 6 } : {}),
} as const

// Backward compatibility export
export const TOKEN_DECIMALS = TOKEN_DECIMALS_MAP

// Common ABI definitions
export const ERC20_ABI = [
    {
        "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "approve", "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable", "type": "function",
    },
    {
        "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
        "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function",
    },
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function",
    },
    {
        "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view", "type": "function",
    },
    {
        "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view", "type": "function",
    },
    {
        "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }],
        "stateMutability": "view", "type": "function",
    },
    {
        "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view", "type": "function",
    },
    {
        "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "transfer", "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable", "type": "function",
    },
    {
        "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable", "type": "function",
    },
] as const