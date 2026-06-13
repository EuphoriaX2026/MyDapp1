import { useCallback } from 'react';
import { QBIT_USD_PRICE, WALLET_STABLE_PRICES, getWalletCoinUsdPrice } from '../config/wallet-coins';
import { useEuphoriaExchange } from './useEuphoriaExchange';

/**
 * USD prices aligned with MyWallet Coins tab (ERX from EDex getCurrentPrice).
 */
export function useEdexTokenPrices() {
  const { currentPrice, isLoadingPrice } = useEuphoriaExchange();
  const erxPriceUsd = currentPrice > 0 ? currentPrice : 0;

  const getTokenUsdPrice = useCallback(
    (symbol: string) => getWalletCoinUsdPrice(symbol, erxPriceUsd),
    [erxPriceUsd],
  );

  return {
    erxPriceUsd,
    qbitPriceUsd: QBIT_USD_PRICE,
    stableUsd: {
      DAI: WALLET_STABLE_PRICES.DAI,
      E1: WALLET_STABLE_PRICES.E1,
      QBit: QBIT_USD_PRICE,
    },
    getTokenUsdPrice,
    isLoading: isLoadingPrice,
  };
}
