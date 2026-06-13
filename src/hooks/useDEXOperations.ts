import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { type Address, formatUnits, parseUnits } from 'viem'
import { contracts } from '../config/wagmi'

// QuickSwap Router ABI (simplified for common functions)
const QUICKSWAP_ROUTER_ABI = [
    {
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        name: 'swapExactTokensForTokens',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        name: 'swapExactETHForTokens',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'amountOutMin', type: 'uint256' },
            { name: 'path', type: 'address[]' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        name: 'swapExactTokensForETH',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'amountOut', type: 'uint256' },
            { name: 'path', type: 'address[]' },
        ],
        name: 'getAmountsIn',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'path', type: 'address[]' },
        ],
        name: 'getAmountsOut',
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const

export interface SwapParams {
    tokenIn: Address
    tokenOut: Address
    amountIn: string
    amountOutMin: string
    slippageTolerance?: number
    deadline?: number
}

export const useDEXOperations = () => {
    const { address } = useAccount()
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    // Get quote for token swap
    const useSwapQuote = (amountIn: string, tokenIn: Address, tokenOut: Address) => {
        const path = [tokenIn, tokenOut]
        const parsedAmountIn = amountIn ? parseUnits(amountIn, 18) : BigInt(0)

        return useReadContract({
            address: contracts.SWAP_ROUTER,
            abi: QUICKSWAP_ROUTER_ABI,
            functionName: 'getAmountsOut',
            args: [parsedAmountIn, path],
            query: {
                enabled: !!amountIn && amountIn !== '0' && !!tokenIn && !!tokenOut,
            },
        })
    }

    // Simulate swap to check if it will succeed
    const useSimulateSwap = (params: SwapParams) => {
        const { tokenIn, tokenOut, amountIn, amountOutMin } = params
        const path = [tokenIn, tokenOut]
        const deadline = Math.floor(Date.now() / 1000) + (params.deadline || 1200) // 20 minutes default
        const parsedAmountIn = parseUnits(amountIn || '0', 18)
        const parsedAmountOutMin = parseUnits(amountOutMin || '0', 18)

        return useSimulateContract({
            address: contracts.SWAP_ROUTER,
            abi: QUICKSWAP_ROUTER_ABI,
            functionName: 'swapExactTokensForTokens',
            args: [parsedAmountIn, parsedAmountOutMin, path, address || '0x0', BigInt(deadline)],
            query: {
                enabled: !!(address && amountIn && amountIn !== '0' && tokenIn && tokenOut),
            },
        })
    }

    // Execute token swap
    const swapTokens = async (params: SwapParams) => {
        if (!address) throw new Error('Wallet not connected')

        const { tokenIn, tokenOut, amountIn, amountOutMin } = params
        const path = [tokenIn, tokenOut]
        const deadline = Math.floor(Date.now() / 1000) + (params.deadline || 1200) // 20 minutes default
        const parsedAmountIn = parseUnits(amountIn, 18)
        const parsedAmountOutMin = parseUnits(amountOutMin, 18)

        return writeContract({
            address: contracts.SWAP_ROUTER,
            abi: QUICKSWAP_ROUTER_ABI,
            functionName: 'swapExactTokensForTokens',
            args: [parsedAmountIn, parsedAmountOutMin, path, address, BigInt(deadline)],
        })
    }

    // Swap MATIC to tokens
    const swapMATICForTokens = async (tokenOut: Address, amountIn: string, amountOutMin: string, deadline?: number) => {
        if (!address) throw new Error('Wallet not connected')

        const path = [contracts.WMATIC, tokenOut]
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline || 1200)
        const parsedAmountOutMin = parseUnits(amountOutMin, 18)

        return writeContract({
            address: contracts.SWAP_ROUTER,
            abi: QUICKSWAP_ROUTER_ABI,
            functionName: 'swapExactETHForTokens',
            args: [parsedAmountOutMin, path, address, BigInt(deadlineTimestamp)],
            value: parseUnits(amountIn, 18),
        })
    }

    // Swap tokens to MATIC
    const swapTokensForMATIC = async (tokenIn: Address, amountIn: string, amountOutMin: string, deadline?: number) => {
        if (!address) throw new Error('Wallet not connected')

        const path = [tokenIn, contracts.WMATIC]
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline || 1200)
        const parsedAmountIn = parseUnits(amountIn, 18)
        const parsedAmountOutMin = parseUnits(amountOutMin, 18)

        return writeContract({
            address: contracts.SWAP_ROUTER,
            abi: QUICKSWAP_ROUTER_ABI,
            functionName: 'swapExactTokensForETH',
            args: [parsedAmountIn, parsedAmountOutMin, path, address, BigInt(deadlineTimestamp)],
        })
    }

    // Calculate slippage
    const calculateSlippage = (amountOut: string, slippagePercent: number) => {
        const amount = parseFloat(amountOut)
        const slippageAmount = amount * (slippagePercent / 100)
        const minAmount = amount - slippageAmount
        return minAmount.toString()
    }

    // Format swap amounts
    const formatSwapAmount = (amount: bigint, decimals = 18) => {
        return formatUnits(amount, decimals)
    }

    return {
        // Quote and simulation
        useSwapQuote,
        useSimulateSwap,

        // Swap functions
        swapTokens,
        swapMATICForTokens,
        swapTokensForMATIC,

        // Utility functions
        calculateSlippage,
        formatSwapAmount,

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