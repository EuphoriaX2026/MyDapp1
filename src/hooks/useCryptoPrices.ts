import { useState, useEffect } from 'react'

interface CoinPrice {
    id: string
    symbol: string
    name: string
    current_price: number
    price_change_percentage_24h: number
    market_cap: number
    total_volume: number
    sparkline_in_7d?: { price: number[] }
}

interface CryptoPricesData {
    bitcoin: CoinPrice | null
    ethereum: CoinPrice | null
    polygon: CoinPrice | null
    isLoading: boolean
    error: string | null
    lastUpdated: Date | null
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets'

export const useCryptoPrices = () => {
    const [data, setData] = useState<CryptoPricesData>({
        bitcoin: null,
        ethereum: null,
        polygon: null,
        isLoading: false,
        error: null,
        lastUpdated: null
    })

    const fetchPrices = async () => {
        setData(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            // Fetch prices for BTC, ETH, and MATIC (Polygon) with sparkline data
            const response = await fetch(
                `${COINGECKO_API_URL}?vs_currency=usd&ids=bitcoin,ethereum,matic-network&order=market_cap_desc&per_page=3&page=1&sparkline=true&price_change_percentage=24h`
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const coinsData = await response.json()

            // Transform the data to our format
            const findCoin = (id: string) => coinsData.find((coin: any) => coin.id === id)

            const bitcoinData = findCoin('bitcoin')
            const ethereumData = findCoin('ethereum')
            const polygonData = findCoin('matic-network')

            const bitcoin: CoinPrice = {
                id: 'bitcoin',
                symbol: 'BTC',
                name: 'Bitcoin',
                current_price: bitcoinData?.current_price || 0,
                price_change_percentage_24h: bitcoinData?.price_change_percentage_24h || 0,
                market_cap: bitcoinData?.market_cap || 0,
                total_volume: bitcoinData?.total_volume || 0,
                sparkline_in_7d: bitcoinData?.sparkline_in_7d ? { price: bitcoinData.sparkline_in_7d.price } : undefined
            }

            const ethereum: CoinPrice = {
                id: 'ethereum',
                symbol: 'ETH',
                name: 'Ethereum',
                current_price: ethereumData?.current_price || 0,
                price_change_percentage_24h: ethereumData?.price_change_percentage_24h || 0,
                market_cap: ethereumData?.market_cap || 0,
                total_volume: ethereumData?.total_volume || 0,
                sparkline_in_7d: ethereumData?.sparkline_in_7d ? { price: ethereumData.sparkline_in_7d.price } : undefined
            }

            const polygon: CoinPrice = {
                id: 'matic-network',
                symbol: 'MATIC',
                name: 'Polygon',
                current_price: polygonData?.current_price || 0,
                price_change_percentage_24h: polygonData?.price_change_percentage_24h || 0,
                market_cap: polygonData?.market_cap || 0,
                total_volume: polygonData?.total_volume || 0,
                sparkline_in_7d: polygonData?.sparkline_in_7d ? { price: polygonData.sparkline_in_7d.price } : undefined
            }

            setData({
                bitcoin,
                ethereum,
                polygon,
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            })

        } catch (error) {
            console.error('Error fetching crypto prices:', error)
            setData(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch prices'
            }))
        }
    }

    useEffect(() => {
        // Fetch prices immediately
        fetchPrices()

        // Set up interval to fetch prices every 60 seconds
        const interval = setInterval(fetchPrices, 60000)

        return () => clearInterval(interval)
    }, [])

    // Helper function to format price
    const formatPrice = (price: number): string => {
        if (price >= 1000) {
            return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        } else {
            return `$${price.toFixed(6)}`
        }
    }

    // Helper function to format percentage change
    const formatChange = (change: number): string => {
        const sign = change >= 0 ? '+' : ''
        return `${sign}${change.toFixed(2)}%`
    }

    return {
        ...data,
        formatPrice,
        formatChange,
        refetch: fetchPrices
    }
}