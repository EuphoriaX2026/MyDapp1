import { useMemo } from 'react';

interface CoinData {
    id: string;
    price_change_percentage_24h?: number;
    sparkline_in_7d?: { price: number[] };
}

export const useCoinChartData = (coinData: CoinData | null) => {
    return useMemo(() => {
        if (!coinData) {
            // Generate fallback data
            return Array.from({ length: 12 }, (_, i) =>
                Math.random() * 1000 + 500 + (i * 10)
            );
        }

        // Use real sparkline data if available
        if (coinData.sparkline_in_7d?.price && coinData.sparkline_in_7d.price.length > 0) {
            const sparklineData = coinData.sparkline_in_7d.price;

            // Take the last 24 data points (roughly last 24 hours from 7-day data)
            // CoinGecko provides ~168 data points for 7 days (hourly), so last 24 = last day
            const recentData = sparklineData.slice(-24);

            // Further sample to get 12 data points for clean visualization
            const step = Math.max(1, Math.floor(recentData.length / 12));
            const sampledData = [];

            for (let i = 0; i < 12; i++) {
                const index = Math.min(i * step, recentData.length - 1);
                sampledData.push(recentData[index]);
            }

            // Ensure we have exactly 12 data points
            while (sampledData.length < 12) {
                sampledData.push(sampledData[sampledData.length - 1]);
            }

            return sampledData.slice(0, 12);
        }

        // Generate realistic data based on price change
        const isPositive = (coinData.price_change_percentage_24h || 0) >= 0;
        const volatility = Math.abs(coinData.price_change_percentage_24h || 1);

        return Array.from({ length: 12 }, (_, i) => {
            const baseValue = 1000;
            const trend = isPositive ? (i * 20) : (-i * 15);
            const noise = (Math.random() - 0.5) * volatility * 10;
            return Math.max(100, baseValue + trend + noise);
        });
    }, [coinData]);
};
