import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { type Address, formatUnits, parseUnits } from 'viem'
import { contracts, ERC20_ABI, TOKEN_DECIMALS } from '../config/wagmi'

export const useContractInteraction = () => {
    const { address } = useAccount()
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    // Read token balance
    const useTokenBalance = (tokenAddress: Address, userAddress?: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [userAddress || address || '0x0'],
            query: {
                enabled: !!(userAddress || address),
            },
        })
    }

    // Read token allowance
    const useTokenAllowance = (tokenAddress: Address, spender: Address, owner?: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [owner || address || '0x0', spender],
            query: {
                enabled: !!(owner || address),
            },
        })
    }

    // Read token info using batched calls for better performance
    const useTokenInfo = (tokenAddress: Address) => {
        const { data: tokenInfoResults, isLoading, error } = useReadContracts({
            contracts: [
                {
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'name',
                },
                {
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'symbol',
                },
                {
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'decimals',
                },
                {
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'totalSupply',
                },
            ],
            query: {
                enabled: !!tokenAddress,
            },
        })

        return {
            name: tokenInfoResults?.[0]?.result as string,
            symbol: tokenInfoResults?.[1]?.result as string,
            decimals: tokenInfoResults?.[2]?.result as number,
            totalSupply: tokenInfoResults?.[3]?.result as bigint,
            isLoading,
            error,
        }
    }

    // Transfer tokens
    const transferToken = async (tokenAddress: Address, to: Address, amount: string) => {
        if (!address) throw new Error('Wallet not connected')

        const decimals = (TOKEN_DECIMALS as Record<string, number>)[tokenAddress] || 18
        const parsedAmount = parseUnits(amount, decimals)

        return writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [to, parsedAmount],
        })
    }

    // Approve token spending
    const approveToken = async (tokenAddress: Address, spender: Address, amount: string) => {
        if (!address) throw new Error('Wallet not connected')

        const decimals = (TOKEN_DECIMALS as Record<string, number>)[tokenAddress] || 18
        const parsedAmount = parseUnits(amount, decimals)

        return writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender, parsedAmount],
        })
    }

    // Format token amount
    const formatTokenAmount = (amount: bigint, tokenAddress: Address) => {
        const decimals = (TOKEN_DECIMALS as Record<string, number>)[tokenAddress] || 18
        return formatUnits(amount, decimals)
    }

    // Parse token amount
    const parseTokenAmount = (amount: string, tokenAddress: Address) => {
        const decimals = (TOKEN_DECIMALS as Record<string, number>)[tokenAddress] || 18
        return parseUnits(amount, decimals)
    }

    return {
        // Read hooks
        useTokenBalance,
        useTokenAllowance,
        useTokenInfo,

        // Write functions
        transferToken,
        approveToken,

        // Utility functions
        formatTokenAmount,
        parseTokenAmount,

        // Transaction state
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        error,

        // Contract addresses for convenience
        contracts,
    }
}