import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi'
import { parseUnits, formatUnits, maxUint256 } from 'viem'
import { useState, useEffect } from 'react'
import { ERX_CONTRACTS, TOKENS } from '../config/erx-contracts'
import { TITAN_CONTRACTS } from '../config/my-titan-contracts'
import { slippageMinOutWei, tokenAmountToUsdWei } from '../utils/edexSwapMath'
import { formatContractError } from '../utils/contractErrors'
import { EDEX_USES_ONCHAIN_MIN_OUT, getEdexAbi } from '../config/edex-abi'

// Import ABIs
import IERC20ABI from '../abis/mock-usdt.json'
import StoreABI from '../abis/Store-titan.json'

const dexAbi = getEdexAbi()

// Utility types and data
export interface StablecoinMetadata {
    address: string
    symbol: string
    decimals: number
    logo: string
    priority: number
}

// Stablecoin configurations
const STABLECOINS: Record<string, StablecoinMetadata> = {
    [TOKENS.USDT.toLowerCase()]: { address: TOKENS.USDT, symbol: 'USDT', decimals: 6, logo: '', priority: 1 },
    [TOKENS.DAI.toLowerCase()]: { address: TOKENS.DAI, symbol: 'DAI', decimals: 18, logo: '', priority: 2 },
}

export const useEuphoriaExchange = () => {
    // --------------------------------------------------------
    // 1. State & Utils
    // --------------------------------------------------------
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const [isApproving, setIsApproving] = useState(false)
    const { data: hash, isPending, error, writeContract, reset } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
        pollingInterval: 2_000,
        confirmations: 1,
    })

    // --------------------------------------------------------
    // 2. Read Functions (Price & Data)
    // --------------------------------------------------------
    
    const erc20AbiInterface = (IERC20ABI as any).abi || IERC20ABI;
    const storeAbiInterface = (StoreABI as any).abi || StoreABI;

    // Get current ERX price
    const { data: priceData, isLoading: isLoadingPrice } = useReadContract({
        address: ERX_CONTRACTS.EDex as `0x${string}`,
        abi: dexAbi,
        functionName: 'getCurrentPrice',
        query: { 
            refetchInterval: 10000, 
        } 
    })

    const currentPrice = priceData ? parseFloat(formatUnits(priceData as bigint, 18)) : 0

    // --------------------------------------------------------
    // 3. Write Functions (Buy & Sell)
    // --------------------------------------------------------

    /**
     * Approve token access with safe settings and logging
     */
    const approveToken = async (
        tokenAddress: string,
        _amount: string,
        _decimals: number = 18,
        spender: string = ERX_CONTRACTS.EDex,
    ) => {
        setIsApproving(true)
        console.log(`[Approve] Unlimited approval for ${tokenAddress} → ${spender}`);

        try {
            await writeContract({
                address: tokenAddress as `0x${string}`,
                abi: IERC20ABI.abi || IERC20ABI,
                functionName: 'approve',
                args: [spender as `0x${string}`, maxUint256],
            })
            
            console.log("[Approve] Transaction sent to wallet");
        } catch (err: any) {
            console.error("[Approve] Failed detailed error:", err)
            // Handling common errors
            if (err.message && err.message.includes("User rejected")) {
                console.warn("[Approve] User rejected transaction");
            }
            setIsApproving(false)
        }
    }

    /** EDex.buy — Amoy: (usdAmount, token); mainnet: (usdAmount, token, minErxAmountOut). */
    const buyERX = async (
        usdAmountWei: bigint,
        tokenAddress: string,
        minAmountOut: bigint,
    ) => {
        if (usdAmountWei <= 0n) {
            throw new Error('Invalid USD amount for buy')
        }
        if (minAmountOut <= 0n) {
            throw new Error('minAmountOut must be greater than zero (check slippage quote)')
        }

        const token = tokenAddress as `0x${string}`
        const dexAddress = ERX_CONTRACTS.EDex as `0x${string}`

        try {
            if (EDEX_USES_ONCHAIN_MIN_OUT) {
                const request = {
                    address: dexAddress,
                    abi: dexAbi,
                    functionName: 'buy' as const,
                    args: [usdAmountWei, token, minAmountOut] as const,
                    account: address,
                }
                if (publicClient && address) {
                    await publicClient.simulateContract(request)
                }
                await writeContract({
                    address: request.address,
                    abi: request.abi,
                    functionName: request.functionName,
                    args: request.args,
                })
            } else {
                const request = {
                    address: dexAddress,
                    abi: dexAbi,
                    functionName: 'buy' as const,
                    args: [usdAmountWei, token] as const,
                    account: address,
                }
                if (publicClient && address) {
                    await publicClient.simulateContract(request)
                }
                await writeContract({
                    address: request.address,
                    abi: request.abi,
                    functionName: request.functionName,
                    args: request.args,
                })
            }
        } catch (err) {
            console.error('Buy ERX Failed:', err)
            throw new Error(formatContractError(err))
        }
    }

    /** Convert human token amount → USD wei then buy (stable USD price from wallet-coins). */
    const buyERXWithTokenAmount = async (
        amount: string,
        tokenAddress: string,
        decimals: number,
        usdPerToken: number,
        expectedErxOutWei: bigint,
    ) => {
        const usdWei = tokenAmountToUsdWei(amount, decimals, usdPerToken)
        const minOut = slippageMinOutWei(expectedErxOutWei)
        return buyERX(usdWei, tokenAddress, minOut)
    }

    /** Store.redeemE1(user, e1Amount) — E1 → ERX via Store.sol (5% fee on-chain). */
    const redeemE1 = async (
        userAddress: `0x${string}`,
        e1Amount: string,
        decimals: number = 18,
    ) => {
        try {
            const amountWei = parseUnits(e1Amount, decimals)
            await writeContract({
                address: TITAN_CONTRACTS.Store as `0x${string}`,
                abi: storeAbiInterface,
                functionName: 'redeemE1',
                args: [userAddress, amountWei],
            })
        } catch (err) {
            console.error('redeemE1 Failed:', err)
        }
    }

    /** EDex.sell — Amoy: (erxAmount, token); mainnet: (erxAmount, token, minStableAmountOut). */
    const sellERX = async (
        erxAmount: string,
        tokenAddress: string,
        minAmountOut: bigint,
    ) => {
        if (minAmountOut <= 0n) {
            throw new Error('minAmountOut must be greater than zero (check slippage quote)')
        }

        const amountWei = parseUnits(erxAmount, 18)
        const token = tokenAddress as `0x${string}`
        const dexAddress = ERX_CONTRACTS.EDex as `0x${string}`

        try {
            if (EDEX_USES_ONCHAIN_MIN_OUT) {
                const request = {
                    address: dexAddress,
                    abi: dexAbi,
                    functionName: 'sell' as const,
                    args: [amountWei, token, minAmountOut] as const,
                    account: address,
                }
                if (publicClient && address) {
                    await publicClient.simulateContract(request)
                }
                await writeContract({
                    address: request.address,
                    abi: request.abi,
                    functionName: request.functionName,
                    args: request.args,
                })
            } else {
                const request = {
                    address: dexAddress,
                    abi: dexAbi,
                    functionName: 'sell' as const,
                    args: [amountWei, token] as const,
                    account: address,
                }
                if (publicClient && address) {
                    await publicClient.simulateContract(request)
                }
                await writeContract({
                    address: request.address,
                    abi: request.abi,
                    functionName: request.functionName,
                    args: request.args,
                })
            }
        } catch (err) {
            console.error('Sell ERX Failed:', err)
            throw new Error(formatContractError(err))
        }
    }

    // --------------------------------------------------------
    // 4. Stablecoin Helpers
    // --------------------------------------------------------
    
    const stablecoinAddresses = Object.values(STABLECOINS).map(s => s.address)

    const getStablecoinWithMetadata = (address: string): StablecoinMetadata | undefined => {
        return STABLECOINS[address.toLowerCase()]
    }

    const useStablecoinInfo = (address: string | undefined) => {
        if (!address) return { symbol: '', decimals: 18, balance: '0', allowance: '0', isLoading: false };
        
        return {
            symbol: STABLECOINS[address.toLowerCase()]?.symbol || 'UNKNOWN',
            decimals: STABLECOINS[address.toLowerCase()]?.decimals || 18,
            balance: '0',
            allowance: '0',
            isLoading: false
        }
    }

    // --------------------------------------------------------
    // 5. Utilities
    // --------------------------------------------------------
    const resetError = () => {
        // Function to reset error state if needed
        console.log("Resetting error state")
        if (reset) reset();
    }

    const checkAllowance = async (tokenAddress: string, owner: string, spender: string) => {
        // Manually reading allowance for better control
        // This is just a placeholder, better to use useReadContract in component
        return 0n; 
    }

    // Adding to hook body (before return)
    useEffect(() => {
        if (isConfirmed) {
            console.log("[Transaction] Confirmed on chain!");
            setIsApproving(false); // Re-enable button
        }
    }, [isConfirmed]);

    return {
        // Data
        currentPrice,
        isLoadingPrice,
        
        // Actions
        approveToken,
        buyERX,
        buyERXWithTokenAmount,
        redeemE1,
        sellERX,
        
        // Transaction Status
        hash,
        isPending,     
        isConfirming,  
        isConfirmed,   
        isApproving,
        setIsApproving,
        error,
        resetError,
        checkAllowance,
        resetTransaction: reset,

        // Addresses
        dexAddress: ERX_CONTRACTS.EDex,

        // Stablecoin Helpers
        stablecoinAddresses,
        getStablecoinWithMetadata,
        useStablecoinInfo,
        
        // Legacy hooks compatibility (mapped to current properties)
        useCurrentERXPrice: () => ({ data: currentPrice, isLoading: isLoadingPrice }),
        useERXPrice: () => ({ data: currentPrice, isLoading: isLoadingPrice }),
        useQBITCurrentPrice: () => ({ data: 0, isLoading: false }), 
    }
}