import { formatFinancialNumber } from '../utils/formatNumber';
import { useEuphoriaExchange } from './useEuphoriaExchange';
import { usePortfolioBalances } from './usePortfolioBalances';

/** USD prices for portfolio total — synced with Dashboard.tsx */
const PORTFOLIO_USD_PRICES = {
  POL: 0.45,
  DAI: 1.0,
  E1: 1.0,
} as const;

export function formatPortfolioTotalUsd(
  erxAmount: number,
  polAmount: number,
  daiAmount: number,
  e1Amount: number,
  erxPriceUsd: number,
): string {
  const totalRaw =
    erxAmount * erxPriceUsd +
    polAmount * PORTFOLIO_USD_PRICES.POL +
    daiAmount * PORTFOLIO_USD_PRICES.DAI +
    e1Amount * PORTFOLIO_USD_PRICES.E1;

  return formatFinancialNumber(totalRaw);
}

export const useTotalBalance = () => {
  const { balances, isLoading: isBalancesLoading, isConnected } = usePortfolioBalances();
  const { currentPrice: currentERXPrice, isLoading: isLoadingPrice } = useEuphoriaExchange();

  const totalValueFormatted = formatPortfolioTotalUsd(
    balances.erx.value,
    balances.pol.value,
    balances.dai.value,
    balances.e1.value,
    currentERXPrice,
  );

  const isLoading = isLoadingPrice || isBalancesLoading;

  return {
    /** Formatted USD total for UI (matches ProfileCard) */
    totalValue: totalValueFormatted,
    totalValueFormatted,
    isLoading,
    isConnected,
  };
};
