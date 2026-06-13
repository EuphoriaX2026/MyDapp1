# Smart Contract Integration Guide

This document provides comprehensive information about smart contract integration in the EuphoriaX application using the latest versions of viem, wagmi, and RainbowKit on the Polygon blockchain.

## Overview

EuphoriaX is fully integrated with Polygon blockchain smart contracts, supporting:
- **Token Operations**: Transfer, approve, balance checking
- **DEX Trading**: Token swapping via QuickSwap
- **Staking**: ERX and QBIT token staking pools
- **Multi-chain Support**: Polygon mainnet and Mumbai testnet

## Technology Stack

- **viem**: v2.31.2 - Ethereum interface library
- **wagmi**: v2.15.6 - React hooks for Ethereum
- **RainbowKit**: v2.22.7 - Wallet connection UI
- **React Query**: v5.80.7 - Data fetching and caching

## Configuration

### 1. Wagmi Configuration (`src/config/wagmi.ts`)

The wagmi configuration includes:
- **Supported Chains**: Polygon mainnet and Mumbai testnet
- **Wallet Connectors**: MetaMask, WalletConnect, Coinbase, Trust Wallet
- **Contract Addresses**: All major tokens and protocol contracts
- **ABIs**: Standard ERC20 and custom contract ABIs

```typescript
// Key configuration elements
export const config = getDefaultConfig({
  appName: 'EuphoriaX',
  projectId: process.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [polygon, polygonMumbai],
  wallets: [/* wallet configurations */],
})
```

### 2. Provider Setup (`src/providers/index.tsx`)

Wraps the application with necessary providers:
- **WagmiProvider**: Blockchain state management
- **QueryClientProvider**: React Query integration
- **RainbowKitProvider**: Wallet UI components

## Available Hooks

### 1. useWallet (`src/hooks/useWallet.ts`)

Basic wallet functionality:
```typescript
const {
  address,
  isConnected,
  connect,
  disconnect,
  balance,
  switchToPolygon,
  getFormattedBalance
} = useWallet()
```

### 2. useContractInteraction (`src/hooks/useContractInteraction.ts`)

Core smart contract interactions:
```typescript
const {
  useTokenBalance,
  useTokenInfo,
  transferToken,
  approveToken,
  formatTokenAmount
} = useContractInteraction()
```

**Key Features:**
- Read token balances and metadata
- Transfer tokens
- Approve token spending
- Format amounts with proper decimals

### 3. useDEXOperations (`src/hooks/useDEXOperations.ts`)

Decentralized exchange operations:
```typescript
const {
  useSwapQuote,
  swapTokens,
  swapMATICForTokens,
  calculateSlippage
} = useDEXOperations()
```

**Supported Operations:**
- Token-to-token swaps
- MATIC-to-token swaps
- Token-to-MATIC swaps
- Price quotes and slippage calculation
- Transaction simulation

### 4. useStaking (`src/hooks/useStaking.ts`)

Staking pool interactions:
```typescript
const {
  useStakedBalance,
  useEarnedRewards,
  stakeTokens,
  unstakeTokens,
  claimRewards,
  calculateAPY
} = useStaking()
```

**Features:**
- Stake ERX and QBIT tokens
- Track staked balances and rewards
- Calculate APY
- Claim earned rewards

### 5. useTokenApproval (`src/hooks/useTokenApproval.ts`)

Token approval management:
```typescript
const {
  useApprovalStatus,
  approveForDEX,
  approveForStaking,
  revokeApproval,
  isInfiniteApproval
} = useTokenApproval()
```

**Capabilities:**
- Check approval status
- Approve tokens for specific contracts
- Infinite approvals for better UX
- Batch approvals
- Revoke approvals

## Contract Addresses

### Tokens
- **ERX Token**: `0x11113847E021391e127B96be13070C7eF2931111`
- **QBIT Token**: `0x2222d23f6AF73d835727cA5233604af03Fd12222`
- **WMATIC**: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`
- **USDC**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **USDT**: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

### DEX & Protocols
- **QuickSwap Router**: `0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff`
- **SushiSwap Router**: `0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506`

### Staking Pools
- **ERX Staking Pool**: `0x11113847E021391e127B96be13070C7eF2931111`
- **QBIT Staking Pool**: `0x2222d23f6AF73d835727cA5233604af03Fd12222`

> **Note**: Replace placeholder addresses with actual deployed contract addresses.

## Usage Examples

### 1. Basic Token Transfer

```typescript
import { useContractInteraction } from '../hooks/useContractInteraction'

const { transferToken, isPending, isConfirmed } = useContractInteraction()

const handleTransfer = async () => {
  try {
    await transferToken(
      contracts.ERX_TOKEN,
      '0x742d35Cc6634C0532925a3b8D6ab4E1f22E6C0f2',
      '10.5'
    )
  } catch (error) {
    console.error('Transfer failed:', error)
  }
}
```

### 2. Token Swap

```typescript
import { useDEXOperations } from '../hooks/useDEXOperations'
import { useTokenApproval } from '../hooks/useTokenApproval'

const { swapTokens } = useDEXOperations()
const { approveForDEX, needsApprovalForDEX } = useTokenApproval()

const handleSwap = async () => {
  const amount = '100'
  const tokenIn = contracts.ERX_TOKEN
  const tokenOut = contracts.USDC
  
  // Check if approval is needed
  if (needsApprovalForDEX(tokenIn, amount)) {
    await approveForDEX(tokenIn, amount)
    // Wait for approval confirmation
  }
  
  // Execute swap
  await swapTokens({
    tokenIn,
    tokenOut,
    amountIn: amount,
    amountOutMin: '95', // 5% slippage
    slippageTolerance: 5
  })
}
```

### 3. Staking Operations

```typescript
import { useStaking } from '../hooks/useStaking'
import { useTokenApproval } from '../hooks/useTokenApproval'

const { stakeTokens, useStakedBalance } = useStaking()
const { approveForStaking } = useTokenApproval()

const handleStake = async () => {
  const amount = '1000'
  const poolAddress = contracts.ERX_STAKING_POOL
  
  // Approve tokens for staking
  await approveForStaking(contracts.ERX_TOKEN, amount)
  
  // Stake tokens
  await stakeTokens(poolAddress, amount)
}
```

## Transaction Handling

All write operations return transaction hashes and provide loading states:

```typescript
const { 
  hash,           // Transaction hash
  isPending,      // Transaction is being submitted
  isConfirming,   // Transaction is being mined
  isConfirmed,    // Transaction is confirmed
  error          // Error if transaction fails
} = useContractInteraction()

// Use these states to provide user feedback
if (isPending) return <div>Submitting transaction...</div>
if (isConfirming) return <div>Waiting for confirmation...</div>
if (isConfirmed) return <div>Transaction confirmed!</div>
if (error) return <div>Error: {error.message}</div>
```

## Error Handling

Common error scenarios and handling:

1. **Wallet Not Connected**: Check `isConnected` before operations
2. **Insufficient Balance**: Check token balances before transfers
3. **Insufficient Allowance**: Use approval hooks before operations
4. **Network Issues**: Provide retry mechanisms
5. **Transaction Failures**: Display user-friendly error messages

## Best Practices

1. **Always check wallet connection** before contract interactions
2. **Validate inputs** before sending transactions
3. **Handle loading states** for better UX
4. **Implement proper error handling** with user-friendly messages
5. **Use transaction simulation** when possible to predict failures
6. **Cache contract reads** using React Query integration
7. **Batch approvals** when multiple operations are needed

## Environment Setup

Required environment variables:
```env
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

Get your WalletConnect project ID from: https://cloud.walletconnect.com

## Testing

- **Mainnet**: Use small amounts for initial testing
- **Mumbai Testnet**: Use for development and testing
- **Contract Verification**: Always verify contracts on Polygonscan
- **Transaction Monitoring**: Monitor transactions on block explorers

## Security Considerations

1. **Never hardcode private keys** in the application
2. **Validate all user inputs** before contract calls
3. **Use infinite approvals carefully** - inform users about implications
4. **Implement slippage protection** for DEX operations
5. **Regular security audits** of smart contracts
6. **Keep dependencies updated** to latest secure versions

## Support

For issues or questions:
1. Check the [Wagmi documentation](https://wagmi.sh)
2. Review [Viem documentation](https://viem.sh)
3. Consult [RainbowKit guides](https://rainbowkit.com)
4. Check Polygon network status and documentation