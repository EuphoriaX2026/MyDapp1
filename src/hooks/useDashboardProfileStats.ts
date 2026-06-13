import { useMemo } from 'react';
import { useGroupActivationStatus } from './useGroupActivationStatus';
import { useRftIncome } from './useRftIncome';
import {
  computeDashboardRating,
  formatEarnedE1FromWithdrawals,
} from '../utils/dashboardProfileStats';

export function useDashboardProfileStats(statusNum: number) {
  const { totalIncomeUSD } = useRftIncome();
  const { groups } = useGroupActivationStatus();

  const ratingDisplay = useMemo(
    () => computeDashboardRating(statusNum, groups),
    [statusNum, groups],
  );

  const earnedFormatted = useMemo(
    () => formatEarnedE1FromWithdrawals(totalIncomeUSD),
    [totalIncomeUSD],
  );

  return { ratingDisplay, earnedFormatted };
}
