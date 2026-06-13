import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { useAccountModal, useChainModal } from '@rainbow-me/rainbowkit'
import { useOpenConnectModal } from './useOpenConnectModal'
import { CURRENT_CHAIN, NETWORK_MODE, CHAINS } from '@/config/networks'
import { ERX_CONTRACTS, isContractDeployed } from '@/config/erx-contracts'
import { formatEther } from 'viem'

export const useWallet = () => {
    const { address, isConnected, isConnecting } = useAccount()
    const { connect, connectors, error: connectError } = useConnect()
    const { disconnect } = useDisconnect()
    const { openConnectModal } = useOpenConnectModal()
    const { openAccountModal } = useAccountModal()
    const { openChainModal } = useChainModal()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()

    // Get MATIC balance
    const { data: balance, isLoading: balanceLoading } = useBalance({
        address: address,
    })

    // Get ERX Phase 2 token balance (if address is available)
    const { data: erxBalance, isLoading: erxBalanceLoading } = useBalance({
        address: address,
        token: ERX_CONTRACTS.ERX as `0x${string}`,
        query: {
            enabled: isContractDeployed(ERX_CONTRACTS.ERX),
        },
    })

    // Network status checks
    const isOnCurrentNetwork = chainId === CURRENT_CHAIN.id
    const isOnSupportedChain = CHAINS.some(chain => chain.id === chainId)

    // Switch to current network (Testnet or Mainnet based on env)
    const switchToCurrentNetwork = () => {
        switchChain({ chainId: CURRENT_CHAIN.id })
    }

    const formatBalance = (balance: bigint | undefined) => {
        if (!balance) return '0'
        return formatEther(balance).slice(0, 8) // Show up to 8 decimal places
    }


    // Enhanced connection status
    const getConnectionStatus = () => {
        if (isConnecting) return 'connecting'
        if (!isConnected) return 'disconnected'
        if (!isOnSupportedChain) return 'wrong-network'
        return 'connected'
    }

    // Formatted balances with loading states
    const getFormattedBalance = () => {
        if (balanceLoading) return 'Loading...'
        if (!balance) return '0 MATIC'
        return `${formatBalance(balance.value)} ${balance.symbol}`
    }

    const getFormattedERXBalance = () => {
        if (erxBalanceLoading) return 'Loading...'
        if (!erxBalance) return '0 ERX'
        return `${formatBalance(erxBalance.value)} ${erxBalance.symbol || 'ERX'}`
    }

    return {
        // Connection state
        address,
        isConnected,
        isConnecting,
        chainId,
        isOnCurrentNetwork,
        isOnSupportedChain,
        currentNetworkMode: NETWORK_MODE,

        // Connection actions
        connect,
        disconnect,
        connectors,
        connectError,

        // Modal controls
        openConnectModal,
        openAccountModal,
        openChainModal,

        // Chain switching (ERX Phase 2 Multi-Network)
        switchToCurrentNetwork,
        switchChain,

        // Balances (QBIT REMOVED - ERX Phase 2 only)
        balance,
        erxBalance,
        balanceLoading,
        erxBalanceLoading,

        // Formatted balances
        getFormattedBalance,
        getFormattedERXBalance,
        formatBalance,

        // Connection status
        getConnectionStatus,
    }
}