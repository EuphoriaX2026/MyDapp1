import { useEffect, useMemo, useState } from 'react';

import { buildDecorativeSparklinePrices } from '../config/mywallet2-area-chart-data';
import {
  QBIT_USD_PRICE,
  WALLET_STABLE_PRICES,
  type WalletCoinSymbol,
} from '../config/wallet-coins';
import { useWalletTokenMarketData } from './useWalletTokenMarketData';

/** CoinGecko 7d sparkline ≈ 1 point/hour → last 24 = 24h hourly. */
const HOURLY_WINDOW = 24;

const COINGECKO_SPARKLINE_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=matic-network,dai,tether,usd-coin&sparkline=true&price_change_percentage=24h';

const ERX_HISTORY_SESSION_KEY = 'mywallet2-erx-sparkline-history';

function readErxHistorySession(): number[] {
  try {
    const raw = sessionStorage.getItem(ERX_HISTORY_SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is number => typeof v === 'number' && v > 0);
  } catch {
    return [];
  }
}

function writeErxHistorySession(values: number[]) {
  try {
    sessionStorage.setItem(ERX_HISTORY_SESSION_KEY, JSON.stringify(values));
  } catch {
    /* ignore quota */
  }
}

/** Last N hourly samples from CoinGecko sparkline (no flat padding). */
function sliceHourlySparkline(prices: number[] | undefined, hours = HOURLY_WINDOW): number[] {
  if (!prices?.length) return [];
  const hourly = prices.slice(-168);
  const window = hourly.slice(-hours);
  return window.length >= 2 ? window : hourly.length >= 2 ? hourly : [];
}

function duplicateIfSinglePoint(values: number[]): number[] {
  if (values.length === 1) return [values[0], values[0]];
  return values;
}

/**
 * Live sparkline price series per wallet token.
 * POL / DAI / USDT / E1(USDC): CoinGecko hourly (24h).
 * ERX: on-chain samples from session start → now.
 * QBit: decorative always-positive green chart.
 */
export function useWalletTokenSparklines() {
  const { snapshots, erxPriceUsd, isLoading: isMarketLoading } = useWalletTokenMarketData();
  const [geckoSpark, setGeckoSpark] = useState<Record<string, number[]>>({});
  const [isGeckoLoading, setIsGeckoLoading] = useState(true);
  const [erxHistory, setErxHistory] = useState<number[]>(readErxHistorySession);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(COINGECKO_SPARKLINE_URL);
        if (!response.ok) return;
        const coins = (await response.json()) as Array<{
          id: string;
          sparkline_in_7d?: { price: number[] };
        }>;
        if (cancelled) return;
        const next: Record<string, number[]> = {};
        for (const coin of coins) {
          next[coin.id] = coin.sparkline_in_7d?.price ?? [];
        }
        setGeckoSpark(next);
      } catch {
        /* keep last good sparklines */
      } finally {
        if (!cancelled) setIsGeckoLoading(false);
      }
    };

    void load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (erxPriceUsd <= 0) return;
    setErxHistory((prev) => {
      let next = prev;

      if (prev.length === 0) {
        const snap = snapshots.ERX;
        const prior =
          snap.changePct !== 0 && snap.priceUsd > 0
            ? snap.priceUsd / (1 + snap.changePct / 100)
            : null;
        if (prior && prior !== erxPriceUsd) {
          next = [prior, erxPriceUsd];
        } else {
          next = [erxPriceUsd];
        }
      } else {
        const last = prev[prev.length - 1];
        if (last === erxPriceUsd) return prev;
        next = [...prev, erxPriceUsd];
      }

      writeErxHistorySession(next);
      return next;
    });
  }, [erxPriceUsd, snapshots.ERX]);

  const series = useMemo((): Record<WalletCoinSymbol, number[]> => {
    const polHourly = sliceHourlySparkline(geckoSpark['matic-network']);
    const daiHourly = sliceHourlySparkline(geckoSpark.dai);
    const usdtHourly = sliceHourlySparkline(geckoSpark.tether);
    const usdcHourly = sliceHourlySparkline(geckoSpark['usd-coin']);

    const polSnap = snapshots.POL;
    const polFallback =
      polSnap.priceUsd > 0
        ? sliceHourlySparkline(
            Array.from({ length: HOURLY_WINDOW }, (_, i) => {
              const t = i / (HOURLY_WINDOW - 1);
              const start = polSnap.priceUsd / (1 + polSnap.changePct / 100);
              return start + (polSnap.priceUsd - start) * t;
            }),
          )
        : [];

    return {
      ERX: duplicateIfSinglePoint(erxHistory),
      POL: polHourly.length > 0 ? polHourly : polFallback,
      DAI: daiHourly.length > 0 ? daiHourly : sliceHourlySparkline(
        Array.from({ length: HOURLY_WINDOW }, () => WALLET_STABLE_PRICES.DAI),
      ),
      USDT: usdtHourly.length > 0 ? usdtHourly : sliceHourlySparkline(
        Array.from({ length: HOURLY_WINDOW }, () => 1),
      ),
      E1: usdcHourly.length > 0 ? usdcHourly : sliceHourlySparkline(
        Array.from({ length: HOURLY_WINDOW }, () => WALLET_STABLE_PRICES.E1),
      ),
      QBit: buildDecorativeSparklinePrices(QBIT_USD_PRICE, 12),
    };
  }, [erxHistory, geckoSpark, snapshots]);

  return {
    series,
    isLoading: isMarketLoading || isGeckoLoading,
  };
}
