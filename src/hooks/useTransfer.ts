import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi'
import { useAccount } from 'wagmi'
import { type Address, parseUnits, parseEther, isAddress } from 'viem'
import { contracts, ERC20_ABI, TOKEN_DECIMALS } from '../config/wagmi'

export interface TransferState {
    isLoading: boolean
    isSuccess: boolean
    error: string | null
    hash: string | null
    preserveSuccess?: boolean // Flag to preserve success state
}

export const useTransfer = () => {
    const { address } = useAccount()
    const [transferState, setTransferState] = useState<TransferState>({
        isLoading: false,
        isSuccess: false,
        error: null,
        hash: null,
        preserveSuccess: false,
    })

    // For ERC20 transfers
    const { writeContract, data: contractHash, isPending: isContractPending, error: contractError, reset: resetContract } = useWriteContract()
    const { isLoading: isContractConfirming, isSuccess: isContractConfirmed } = useWaitForTransactionReceipt({
        hash: contractHash,
    })

    // For native coin transfers (POL)
    const { sendTransaction, data: nativeHash, isPending: isNativePending, error: nativeError, reset: resetNative } = useSendTransaction()
    const { isLoading: isNativeConfirming, isSuccess: isNativeConfirmed } = useWaitForTransactionReceipt({
        hash: nativeHash,
    })

    // useEffect to handle contract transaction state changes
    useEffect(() => {
        console.log('Contract state changed:', {
            contractHash,
            isContractPending,
            isContractConfirming,
            isContractConfirmed,
            contractError: contractError?.message
        })

        if (contractHash && !transferState.hash) {
            console.log('Setting contract hash:', contractHash)
            setTransferState(prev => ({ ...prev, hash: contractHash }))
        }

        if (isContractConfirmed && contractHash) {
            console.log('Contract transaction confirmed')
            setTransferState(prev => ({
                ...prev,
                isLoading: false,
                isSuccess: true,
                error: null,
                preserveSuccess: true // Preserve success state
            }))
        }

        if (contractError && !isContractPending && !isContractConfirming) {
            console.log('Contract error:', contractError.message)
            setTransferState(prev => ({
                ...prev,
                isLoading: false,
                isSuccess: false,
                error: contractError.message
            }))
        }
    }, [contractHash, isContractPending, isContractConfirming, isContractConfirmed, contractError, transferState.hash])

    // useEffect to handle native transaction state changes
    useEffect(() => {
        console.log('Native state changed:', {
            nativeHash,
            isNativePending,
            isNativeConfirming,
            isNativeConfirmed,
            nativeError: nativeError?.message
        })

        if (nativeHash && !transferState.hash) {
            console.log('Setting native hash:', nativeHash)
            setTransferState(prev => ({ ...prev, hash: nativeHash }))
        }

        if (isNativeConfirmed && nativeHash) {
            console.log('Native transaction confirmed')
            setTransferState(prev => ({
                ...prev,
                isLoading: false,
                isSuccess: true,
                error: null,
                preserveSuccess: true // Preserve success state
            }))
        }

        if (nativeError && !isNativePending && !isNativeConfirming) {
            console.log('Native error:', nativeError.message)
            setTransferState(prev => ({
                ...prev,
                isLoading: false,
                isSuccess: false,
                error: nativeError.message
            }))
        }
    }, [nativeHash, isNativePending, isNativeConfirming, isNativeConfirmed, nativeError, transferState.hash])

    // Get token contract address based on symbol or address
    const getTokenAddress = (symbolOrAddress: string): Address | null => {
        // Check if it's already an address
        if (symbolOrAddress.startsWith('0x') && symbolOrAddress.length === 42) {
            return symbolOrAddress as Address
        }

        // Otherwise, treat as symbol
        switch (symbolOrAddress.toLowerCase()) {
            case 'erx':
                return contracts.ERX_TOKEN
            case 'usdc':
                return (contracts.USDC as Address) || null
            case 'usdt':
                return contracts.USDT
            case 'dai':
                return contracts.DAI
            default:
                return null
        }
    }

    // Get token decimals based on symbol or address
    const getTokenDecimals = (symbolOrAddress: string): number => {
        // Check if it's already an address
        if (symbolOrAddress.startsWith('0x') && symbolOrAddress.length === 42) {
            // Look up decimals from TOKEN_DECIMALS config
            const decimals = (TOKEN_DECIMALS as any)[symbolOrAddress]
            return decimals || 18 // Default to 18 if not found
        }

        // Otherwise, treat as symbol
        switch (symbolOrAddress.toLowerCase()) {
            case 'erx':
                return 18
            case 'usdc':
            case 'usdt':
                return 6
            case 'dai':
                return 18
            case 'pol':
            case 'matic':
                return 18
            default:
                return 18
        }
    }

    // Transfer function
    const transfer = async (
        symbolOrAddress: string,
        toAddress: string,
        amount: string
    ): Promise<void> => {
        if (!address) {
            throw new Error('Wallet not connected')
        }

        if (!isAddress(toAddress)) {
            throw new Error('Invalid recipient address')
        }

        if (!amount || parseFloat(amount) <= 0) {
            throw new Error('Invalid amount')
        }

        console.log('Transfer function called with:', { symbolOrAddress, toAddress, amount })

        // Set initial loading state
        setTransferState({
            isLoading: true,
            isSuccess: false,
            error: null,
            hash: null,
            preserveSuccess: false,
        })

        try {
            if (symbolOrAddress.toLowerCase() === 'pol' || symbolOrAddress.toLowerCase() === 'matic') {
                // Native POL transfer
                const value = parseEther(amount)
                console.log('Calling sendTransaction with:', { to: toAddress, value: value.toString() })

                sendTransaction({
                    to: toAddress as Address,
                    value,
                })

                console.log('sendTransaction called successfully')
            } else {
                // ERC20 token transfer
                const tokenAddress = getTokenAddress(symbolOrAddress)
                if (!tokenAddress) {
                    throw new Error(`Unsupported token: ${symbolOrAddress}`)
                }

                const decimals = getTokenDecimals(symbolOrAddress)
                const parsedAmount = parseUnits(amount, decimals)

                console.log('Calling writeContract with:', {
                    address: tokenAddress,
                    amount: parsedAmount.toString(),
                    decimals
                })

                writeContract({
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'transfer',
                    args: [toAddress as Address, parsedAmount],
                })

                console.log('writeContract called successfully')
            }
        } catch (error: any) {
            console.error('Transfer error:', error)
            setTransferState({
                isLoading: false,
                isSuccess: false,
                error: error.message || 'Transfer failed',
                hash: null,
                preserveSuccess: false,
            })
            throw error
        }
    }

    // Reset transfer state
    const resetTransfer = () => {
        console.log('Resetting transfer state')
        setTransferState({
            isLoading: false,
            isSuccess: false,
            error: null,
            hash: null,
            preserveSuccess: false,
        })

        // Reset wagmi hook states to clear any persisting errors
        try {
            resetContract?.()
        } catch (e) {
            console.warn('Error resetting contract:', e)
        }

        try {
            resetNative?.()
        } catch (e) {
            console.warn('Error resetting native:', e)
        }
    }

    // Determine overall state from both contract and native transfers
    const isLoading = transferState.isLoading || isContractPending || isNativePending || isContractConfirming || isNativeConfirming
    const isSuccess = transferState.isSuccess || (isContractConfirmed && contractHash) || (isNativeConfirmed && nativeHash)

    // Handle error states more carefully
    let error = transferState.error
    if (!error && !isSuccess && !isLoading) {
        // Only include wagmi errors if we're not loading and don't have success
        if (contractError && !isContractConfirmed && !isContractPending) {
            error = contractError.message
        } else if (nativeError && !isNativeConfirmed && !isNativePending) {
            error = nativeError.message
        }
    }

    const hash = contractHash || nativeHash || null

    return {
        transfer,
        resetTransfer,
        isLoading,
        isSuccess,
        error,
        hash,
        state: transferState,
    }
}
