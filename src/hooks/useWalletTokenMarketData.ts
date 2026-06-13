import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';

import { getEdexAbi } from '../config/edex-abi';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import {
  QBIT_USD_PRICE,
  WALLET_STABLE_PRICES,
  type WalletCoinSymbol,
} from '../config/wallet-coins';
import { useCryptoPrices } from './useCryptoPrices';
import { useBankErxPriceUsd } from './useBankErxPriceUsd';

const edexAbi = getEdexAbi();
/** Finapp crypto-index Watchlist sparkline colors */
export const WALLET_TOKEN_PROFIT_COLOR = '#1DCC70';
export const WALLET_TOKEN_LOSS_COLOR = '#FF396F';

export type TokenChartTrend = 'profit' | 'loss';

export const TOKEN_CHART_TREND_COLORS: Record<TokenChartTrend, string> = {
  profit: WALLET_TOKEN_PROFIT_COLOR,
  loss: WALLET_TOKEN_LOSS_COLOR,
};

export interface TokenMarketSnapshot {
  symbol: WalletCoinSymbol;
  priceUsd: number;
  changePct: number;
  changeLabel: string;
  isPositive: boolean;
  chartTrend: TokenChartTrend;
  chartColor: string;
}

function parseUsdPrice(raw: bigint | undefined): number {
  if (raw === undefined || raw === 0n) return 0;
  const value = Number.parseFloat(formatUnits(raw, 18));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function computeChangePct(current: number, previous: number): number {
  if (current <= 0 || previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

function formatChangeLabel(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function resolveChartTrend(changePct: number): TokenChartTrend {
  return changePct < 0 ? 'loss' : 'profit';
}

function buildSnapshot(
  symbol: WalletCoinSymbol,
  priceUsd: number,
  changePct: number,
): TokenMarketSnapshot {
  const chartTrend = resolveChartTrend(changePct);
  return {
    symbol,
    priceUsd,
    changePct,
    changeLabel: formatChangeLabel(changePct),
    isPositive: changePct >= 0,
    chartTrend,
    chartColor: TOKEN_CHART_TREND_COLORS[chartTrend],
  };
}

/**
 * On-chain market data for MyWallet Coins tab.
 * ERX: EDex getCurrentPrice + lastPrice (Bank fallback).
 * Stables (E1, DAI, QBit): ecosystem USD peg.
 * POL: live market quote (no on-chain oracle in ERX/Titan stack).
 */
export function useWalletTokenMarketData() {
  const {
    erxPriceUsd: erxBankPrice,
    lastErxPriceUsd: erxBankLast,
    isLoading: isBankPriceLoading,
  } = useBankErxPriceUsd({ includeLastPrice: true, refetchInterval: 10_000 });

  const { data: onChainPrices, isLoading: isEdexLoading } = useReadContracts({
    contracts: [
      {
        address: ERX_CONTRACTS.EDex as `0x${string}`,
        abi: edexAbi,
        functionName: 'getCurrentPrice',
      },
      {
        address: ERX_CONTRACTS.EDex as `0x${string}`,
        abi: edexAbi,
        functionName: 'lastPrice',
      },
    ],
    query: { refetchInterval: 10_000 },
  });

  const { polygon, isLoading: isPolygonLoading } = useCryptoPrices();

  const erxDexPrice = parseUsdPrice(onChainPrices?.[0]?.result as bigint | undefined);
  const erxDexLast = parseUsdPrice(onChainPrices?.[1]?.result as bigint | undefined);

  const erxPriceUsd = erxDexPrice > 0 ? erxDexPrice : erxBankPrice;
  const erxChangePct = useMemo(() => {
    if (erxDexPrice > 0 && erxDexLast > 0) {
      return computeChangePct(erxDexPrice, erxDexLast);
    }
    if (erxBankPrice > 0 && erxBankLast > 0) {
      return computeChangePct(erxBankPrice, erxBankLast);
    }
    return 0;
  }, [erxBankLast, erxBankPrice, erxDexLast, erxDexPrice]);

  const snapshots = useMemo((): Record<WalletCoinSymbol, TokenMarketSnapshot> => {
    const polPrice =
      polygon?.current_price && polygon.current_price > 0
        ? polygon.current_price
        : WALLET_STABLE_PRICES.POL;
    const polChange = polygon?.price_change_percentage_24h ?? 0;

    return {
      ERX: buildSnapshot('ERX', erxPriceUsd, erxChangePct),
      E1: buildSnapshot('E1', WALLET_STABLE_PRICES.E1, 0),
      QBit: buildSnapshot('QBit', QBIT_USD_PRICE, 0),
      DAI: buildSnapshot('DAI', WALLET_STABLE_PRICES.DAI, 0),
      USDT: buildSnapshot('USDT', WALLET_STABLE_PRICES.DAI, 0),
      POL: buildSnapshot('POL', polPrice, polChange),
    };
  }, [erxChangePct, erxPriceUsd, polygon?.current_price, polygon?.price_change_percentage_24h]);

  const getSnapshot = (symbol: WalletCoinSymbol) => snapshots[symbol];

  return {
    snapshots,
    getSnapshot,
    erxPriceUsd,
    isLoading: isEdexLoading || isBankPriceLoading || isPolygonLoading,
  };
}
