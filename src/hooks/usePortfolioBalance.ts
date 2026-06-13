import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { useEuphoriaExchange } from './useEuphoriaExchange'
import { useStablecoinInfo } from './useStablecoinInfo'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { TOKENS, ERX_CONTRACTS } from '../config/erx-contracts'
import { ERC20_ABI } from '../config/wagmi'

export const usePortfolioBalance = () => {
    const { isConnected, address } = useAccount()
    const location = useLocation()

    // Only load exchange data on pages that need it
    const shouldLoadExchangeData = useMemo(() => {
        const path = location.pathname
        return path === '/MyWallet' || path === '/wallet' || path === '/Dashboard' || path === '/dashboard' || path === '/edex'
    }, [location.pathname])

    // Get ERX Price
    const { currentPrice: erxPrice } = useEuphoriaExchange()

    // Get ERX Balance
    const { data: erxBalanceData, isLoading: erxLoading } = useReadContract({
        address: ERX_CONTRACTS.ERX,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address || '0x0'],
        query: { enabled: !!address && shouldLoadExchangeData }
    })

    // Get Stablecoin Balances
    const usdtInfo = useStablecoinInfo(shouldLoadExchangeData ? TOKENS.USDT : undefined)
    const daiInfo = useStablecoinInfo(shouldLoadExchangeData ? TOKENS.DAI : undefined)
    
    // Mainnet USDC check
    const usdcAddress = 'USDC' in TOKENS ? (TOKENS as any).USDC : undefined
    const usdcInfo = useStablecoinInfo(shouldLoadExchangeData ? usdcAddress : undefined)

    // Calculate total portfolio value
    const portfolioData = useMemo(() => {
        if (!isConnected || !address || !shouldLoadExchangeData) {
            return {
                totalValue: '0.00',
                breakdown: {
                    erx: { amount: '0.00', value: '0.00' },
                    dai: { amount: '0.00', value: '0.00' },
                    usdc: { amount: '0.00', value: '0.00' },
                    usdt: { amount: '0.00', value: '0.00' },
                },
                isLoading: false,
            }
        }

        const isLoading = erxLoading
        let totalValue = 0

        // ERX calculation
        const erxAmount = erxBalanceData ? Number(formatUnits(erxBalanceData, 18)) : 0
        const erxValue = erxAmount * erxPrice

        // USDT (≈ $1)
        const usdtAmount = usdtInfo?.balance ? Number(formatUnits(usdtInfo.balance, usdtInfo.decimals)) : 0
        const usdtValue = usdtAmount

        // DAI (≈ $1)
        const daiAmount = daiInfo?.balance ? Number(formatUnits(daiInfo.balance, daiInfo.decimals)) : 0
        const daiValue = daiAmount

        // USDC (≈ $1)
        const usdcAmount = usdcInfo?.balance ? Number(formatUnits(usdcInfo.balance, usdcInfo.decimals)) : 0
        const usdcValue = usdcAmount

        totalValue = erxValue + usdtValue + daiValue + usdcValue

        return {
            totalValue: totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            breakdown: {
                erx: {
                    amount: erxAmount.toFixed(4),
                    value: erxValue.toFixed(2)
                },
                dai: {
                    amount: daiAmount.toFixed(2),
                    value: daiValue.toFixed(2)
                },
                usdc: {
                    amount: usdcAmount.toFixed(2),
                    value: usdcValue.toFixed(2)
                },
                usdt: {
                    amount: usdtAmount.toFixed(2),
                    value: usdtValue.toFixed(2)
                },
            },
            isLoading,
        }
    }, [
        isConnected,
        address,
        shouldLoadExchangeData,
        erxBalanceData,
        erxPrice,
        usdtInfo,
        daiInfo,
        usdcInfo,
        erxLoading
    ])

    return portfolioData
}
