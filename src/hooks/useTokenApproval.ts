import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { type Address, formatUnits, parseUnits, maxUint256 } from 'viem'
import { contracts, ERC20_ABI, TOKEN_DECIMALS } from '../config/wagmi'

export interface ApprovalStatus {
    isApproved: boolean
    allowance: bigint
    needsApproval: (amount: string) => boolean
}

export const useTokenApproval = () => {
    const { address } = useAccount()
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    // Check current allowance
    const useAllowance = (tokenAddress: Address, spender: Address, owner?: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [owner || address || '0x0', spender],
            query: {
                enabled: !!(owner || address) && !!spender,
            },
        })
    }

    // Check if token is approved for specific amount
    const useApprovalStatus = (
        tokenAddress: Address,
        spender: Address
    ): ApprovalStatus => {
        const { data: allowance } = useAllowance(tokenAddress, spender)
        const decimals = (TOKEN_DECIMALS as Record<string, number>)[tokenAddress] || 18

        const isApproved = allowance ? allowance > BigInt(0) : false

        const needsApproval = (amount: string) => {
            if (!allowance) return true
            const parsedAmount = parseUnits(amount, decimals)
            return allowance < parsedAmount
        }

        return {
            isApproved,
            allowance: allowance || BigInt(0),
            needsApproval,
        }
    }

    // Approve exact amount
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

    // Approve maximum amount (infinite approval)
    const approveTokenMax = async (tokenAddress: Address, spender: Address) => {
        if (!address) throw new Error('Wallet not connected')

        return writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender, maxUint256],
        })
    }

    // Revoke approval (set to 0)
    const revokeApproval = async (tokenAddress: Address, spender: Address) => {
        if (!address) throw new Error('Wallet not connected')

        return writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spender, BigInt(0)],
        })
    }

    // Batch approve multiple tokens
    const batchApprove = async (
        approvals: Array<{
            tokenAddress: Address
            spender: Address
            amount?: string
            useMax?: boolean
        }>
    ) => {
        if (!address) throw new Error('Wallet not connected')

        const promises = approvals.map(({ tokenAddress, spender, amount, useMax }) => {
            if (useMax) {
                return approveTokenMax(tokenAddress, spender)
            } else if (amount) {
                return approveToken(tokenAddress, spender, amount)
            } else {
                throw new Error('Either amount or useMax must be specified')
            }
        })

        return Promise.all(promises)
    }

    // Check if approval is needed for DEX operations
    const needsApprovalForDEX = (tokenAddress: Address, amount: string) => {
        const { needsApproval } = useApprovalStatus(tokenAddress, contracts.SWAP_ROUTER)
        return needsApproval(amount)
    }

    // Check if approval is needed for staking (Legacy - Stubbed)
    const needsApprovalForStaking = (tokenAddress: Address, amount: string) => {
        return false;
    }

    // Approve for DEX operations
    const approveForDEX = async (tokenAddress: Address, amount?: string, useMax = false) => {
        if (useMax) {
            return approveTokenMax(tokenAddress, contracts.SWAP_ROUTER)
        } else if (amount) {
            return approveToken(tokenAddress, contracts.SWAP_ROUTER, amount)
        } else {
            throw new Error('Either amount or useMax must be specified')
        }
    }

    // Approve for staking (Legacy - Stubbed)
    const approveForStaking = async (tokenAddress: Address, amount?: string, useMax = false) => {
        throw new Error('Staking is deprecated')
    }

    // Format allowance amount
    const formatAllowance = (allowance: bigint, tokenAddress: Address) => {
        const decimals = (TOKEN_DECIMALS as Record<string, number>)[tokenAddress] || 18
        return formatUnits(allowance, decimals)
    }

    // Check if allowance is infinite
    const isInfiniteApproval = (allowance: bigint) => {
        // Check if allowance is close to max uint256 (considering some tokens might have slight variations)
        const threshold = maxUint256 / BigInt(2) // Half of max uint256
        return allowance >= threshold
    }

    return {
        // Read hooks
        useAllowance,
        useApprovalStatus,

        // Basic approval functions
        approveToken,
        approveTokenMax,
        revokeApproval,
        batchApprove,

        // Specific use case functions
        needsApprovalForDEX,
        needsApprovalForStaking,
        approveForDEX,
        approveForStaking,

        // Utility functions
        formatAllowance,
        isInfiniteApproval,

        // Transaction state
        hash,
        isPending,
        isConfirming,
        isConfirmed,
        error,

        // Contract addresses
        contracts,
    }
}