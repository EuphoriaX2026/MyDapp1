import { useState, useEffect } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { formatEther, type Address } from 'viem'
import { contracts, ERC20_ABI } from '../config/wagmi'

// ERX Contract ABI for buy and sell functions
const ERX_CONTRACT_ABI = [
    {
        inputs: [
            { name: 'usdAmount', type: 'uint256' },
            { name: 'tokenSymbol', type: 'string' }
        ],
        name: 'buy',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'erxAmount', type: 'uint256' },
            { name: 'tokenSymbol', type: 'string' }
        ],
        name: 'sell',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    // Include standard ERC20 functions that might be needed
    ...ERC20_ABI
] as const

/** Safe dependency key — JSON.stringify throws on BigInt (e.g. parseUnits amounts). */
function serializeForDeps(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'bigint') return value.toString();
    if (Array.isArray(value)) {
        return `[${value.map(serializeForDeps).join(',')}]`;
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
        } catch {
            return String(value);
        }
    }
    return String(value);
}

interface GasEstimate {
    gasLimit: bigint
    gasPrice: bigint
    maxFeePerGas?: bigint
    maxPriorityFeePerGas?: bigint
    estimatedCostInEth: string
    estimatedCostInUsd: string
    isLoading: boolean
    error: string | null
}

export const useGasEstimation = (
    contractAddress?: Address,
    functionName?: string,
    args?: any[],
    value?: bigint,
    maticPriceUsd?: number // Optional MATIC price in USD for conversion
) => {
    const [gasEstimate, setGasEstimate] = useState<GasEstimate>({
        gasLimit: BigInt(0),
        gasPrice: BigInt(0),
        estimatedCostInEth: '0',
        estimatedCostInUsd: '0',
        isLoading: false,
        error: null
    })

    const publicClient = usePublicClient()
    const { data: walletClient } = useWalletClient()

    useEffect(() => {
        const estimateGas = async () => {
            if (!publicClient || !walletClient || !contractAddress) {
                return
            }

            setGasEstimate(prev => ({ ...prev, isLoading: true, error: null }))

            try {
                // Get current gas price and fee data (EIP-1559 support)
                const [gasPrice, feeData] = await Promise.all([
                    publicClient.getGasPrice(),
                    publicClient.estimateFeesPerGas().catch(() => null) // EIP-1559 fees if supported
                ])

                let gasLimit: bigint

                if (functionName && args) {
                    // Determine which ABI to use based on contract address and function name
                    const getAbiForContract = (contractAddr: Address, functionName: string) => {
                        // ERX contract functions
                        if (contractAddr === contracts.ERX_TOKEN) {
                            if (functionName === 'buy' || functionName === 'sell') {
                                return ERX_CONTRACT_ABI
                            }
                        }



                        // For standard ERC20 functions (approve, transfer, etc.)
                        if (functionName === 'approve' || functionName === 'transfer' || functionName === 'transferFrom') {
                            return ERC20_ABI
                        }

                        // Default fallback to ERC20 ABI
                        return ERC20_ABI
                    }

                    // Estimate gas for specific contract function
                    try {
                        gasLimit = await publicClient.estimateContractGas({
                            address: contractAddress,
                            abi: getAbiForContract(contractAddress, functionName) as any,
                            functionName: functionName as any,
                            args: args as any,
                            value: value || BigInt(0),
                            account: walletClient.account?.address
                        } as any)
                    } catch (error) {
                        // Fallback to a reasonable default if estimation fails
                        console.warn('Gas estimation failed, using default:', error)

                        // Use more realistic defaults based on function type
                        if (functionName === 'approve') {
                            gasLimit = BigInt(60000) // Approval transactions
                        } else if (functionName === 'buy' || functionName === 'sell') {
                            gasLimit = BigInt(450000) // Exchange transactions
                        } else {
                            gasLimit = BigInt(500000) // Other transactions
                        }
                    }
                } else {
                    // Default gas limit for simple transfers or approvals
                    gasLimit = BigInt(500000)
                }

                // Add 10% buffer to gas limit to avoid out-of-gas errors  
                const bufferedGasLimit = (gasLimit * BigInt(110)) / BigInt(100)

                // Use EIP-1559 fees if available, otherwise use legacy gas price
                const effectiveGasPrice = feeData?.maxFeePerGas || gasPrice

                // Calculate total cost in ETH (or MATIC)
                const totalCostWei = bufferedGasLimit * effectiveGasPrice
                const estimatedCostInEth = formatEther(totalCostWei)

                // Convert to USD if MATIC price is provided
                const estimatedCostInUsd = maticPriceUsd
                    ? (parseFloat(estimatedCostInEth) * maticPriceUsd).toFixed(4)
                    : '0'

                setGasEstimate({
                    gasLimit: bufferedGasLimit,
                    gasPrice: effectiveGasPrice,
                    maxFeePerGas: feeData?.maxFeePerGas,
                    maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
                    estimatedCostInEth,
                    estimatedCostInUsd,
                    isLoading: false,
                    error: null
                })

            } catch (error) {
                console.error('Gas estimation error:', error)
                setGasEstimate(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to estimate gas'
                }))
            }
        }

        estimateGas()
    }, [publicClient, walletClient, contractAddress, functionName, serializeForDeps(args), value, maticPriceUsd])

    return gasEstimate
}

// Hook to get current MATIC price in USD
export const useMaticPrice = () => {
    const [maticPrice, setMaticPrice] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMaticPrice = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Using CoinGecko API to get MATIC price
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd')
                const data = await response.json()

                if (data['matic-network']?.usd) {
                    setMaticPrice(data['matic-network'].usd)
                } else {
                    throw new Error('Failed to fetch MATIC price')
                }
            } catch (error) {
                console.error('Error fetching MATIC price:', error)
                setError(error instanceof Error ? error.message : 'Failed to fetch MATIC price')
                // Fallback to a more realistic current MATIC price
                setMaticPrice(0.55) // More realistic current MATIC price (~$0.55)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMaticPrice()

        // Update price every 5 minutes
        const interval = setInterval(fetchMaticPrice, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    return { maticPrice, isLoading, error }
}

// Utility function to estimate gas for different exchange operations
export const useExchangeGasEstimation = (
    exchangeDirection: 'STABLECOIN_TO_TOKEN' | 'TOKEN_TO_STABLECOIN',
    toCurrency?: 'ERX',
    fromCurrency?: Address,
    _amount?: string, // Marked as unused but kept for future use
    needsApproval?: boolean
) => {
    const { maticPrice } = useMaticPrice()

    // Determine the contract address and function based on the operation
    const getContractAndFunction = () => {
        if (needsApproval) {
            // Approval transaction - much lower gas needed
            return {
                contractAddress: fromCurrency,
                functionName: 'approve',
                estimatedGasLimit: BigInt(60000) // More realistic approval gas limit
            }
        }

        if (exchangeDirection === 'STABLECOIN_TO_TOKEN') {
            // Buy transaction
            if (toCurrency === 'ERX') {
                return {
                    contractAddress: contracts.ERX_TOKEN,
                    functionName: 'buy', // ERX buy function
                    estimatedGasLimit: BigInt(450000)
                }
            } else {
                 return {
                    contractAddress: undefined,
                    functionName: undefined,
                    estimatedGasLimit: BigInt(0)
                 }
            }
        } else {
            // Sell transaction
            if (fromCurrency === contracts.ERX_TOKEN) {
                return {
                    contractAddress: contracts.ERX_TOKEN,
                    functionName: 'sell', // ERX sell function
                    estimatedGasLimit: BigInt(350000)
                }
            } else {
                 return {
                    contractAddress: undefined,
                    functionName: undefined,
                    estimatedGasLimit: BigInt(0)
                 }
            }
        }

        return {
            contractAddress: undefined,
            functionName: undefined,
            estimatedGasLimit: BigInt(100000)
        }
    }

    const { contractAddress, functionName, estimatedGasLimit } = getContractAndFunction()

    // Use the general gas estimation hook
    const gasEstimate = useGasEstimation(
        contractAddress,
        functionName,
        undefined, // args - we'll estimate without specific args for now
        undefined, // value
        maticPrice || undefined
    )

    // If the hook estimation fails, provide fallback values
    if (gasEstimate.error || gasEstimate.gasLimit === BigInt(0)) {
        // Use more realistic fallback gas price based on current Polygon conditions
        // Base fee: 0 gwei, Priority fee: 27.6-60 gwei, so total around 30-60 gwei
        const fallbackGasPrice = BigInt(30 * 1e9) // 30 gwei in wei
        const fallbackCostWei = estimatedGasLimit * fallbackGasPrice
        const fallbackCostEth = formatEther(fallbackCostWei)
        const fallbackCostUsd = maticPrice
            ? (parseFloat(fallbackCostEth) * maticPrice).toFixed(4)
            : '0.010' // More realistic fallback

        return {
            ...gasEstimate,
            gasLimit: estimatedGasLimit,
            gasPrice: fallbackGasPrice,
            estimatedCostInEth: fallbackCostEth,
            estimatedCostInUsd: fallbackCostUsd,
            isLoading: false
        }
    }

    return gasEstimate
}
