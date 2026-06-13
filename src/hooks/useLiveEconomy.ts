import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { contracts } from '../config/wagmi';
import LedgerABI from '../abis/Ledger-titan.json';
import ConfigsABI from '../abis/Configs-titan.json';
import { useProtocolWeek } from './useProtocolWeek';
import { useWeeklyRftStocks } from './useWeeklyRftStocks';
import { formatUsdWei } from '../utils/withdrawE1Math';

const USD_SCALE = 10n ** 18n;

type WeeklyData = {
  totalSharesGenerated: bigint;
  lockedErxForPayout: bigint;
  pricePerShareUSD: bigint;
  isPriced: boolean;
  isCleanedUp: boolean;
};

/**
 * Live economy for the current (unpriced) protocol week — revenue / shares GEM price estimate.
 */
export function useLiveEconomy() {
  const { currentWeekId, isLoading: isWeekLoading } = useProtocolWeek();

  const {
    data: weeklyRevenueRaw,
    isLoading: isRevenueLoading,
    refetch: refetchRevenue,
  } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'weeklyRevenueE1',
    args: [currentWeekId],
    query: { enabled: currentWeekId >= 0n },
  });

  const {
    data: weeklyDataRaw,
    isLoading: isWeeklyDataLoading,
    refetch: refetchWeeklyData,
  } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'weeklyData',
    args: [currentWeekId],
    query: { enabled: currentWeekId >= 0n },
  });

  const {
    data: rftFloorPriceRaw,
    isLoading: isFloorLoading,
    refetch: refetchFloor,
  } = useReadContract({
    address: contracts.TITAN_CONFIGS as `0x${string}`,
    abi: ConfigsABI.abi,
    functionName: 'rftFloorPrice',
  });

  const {
    totalShares: userGems,
    stocksByGroup,
    isLoading: isUserGemsLoading,
    refetch: refetchUserGems,
  } = useWeeklyRftStocks(currentWeekId);

  const weeklyData = weeklyDataRaw as WeeklyData | undefined;
  const totalSharesGenerated = weeklyData?.totalSharesGenerated ?? 0n;
  const weeklyRevenueE1 = (weeklyRevenueRaw as bigint | undefined) ?? 0n;
  const rftFloorPrice = (rftFloorPriceRaw as bigint | undefined) ?? 0n;

  const liveEstimatedPricePerGem = useMemo(() => {
    if (totalSharesGenerated === 0n) return rftFloorPrice;
    return weeklyRevenueE1 / totalSharesGenerated;
  }, [totalSharesGenerated, weeklyRevenueE1, rftFloorPrice]);

  const estimatedTotalUsd = useMemo(() => {
    if (userGems === 0n || liveEstimatedPricePerGem === 0n) return 0n;
    return (userGems * liveEstimatedPricePerGem) / USD_SCALE;
  }, [userGems, liveEstimatedPricePerGem]);

  const isUsingFloorPrice = totalSharesGenerated === 0n;

  const isLoading =
    isWeekLoading ||
    isRevenueLoading ||
    isWeeklyDataLoading ||
    isFloorLoading ||
    isUserGemsLoading;

  const refetch = async () => {
    await Promise.all([
      refetchRevenue(),
      refetchWeeklyData(),
      refetchFloor(),
      refetchUserGems(),
    ]);
  };

  return {
    currentWeekId,
    weeklyRevenueE1,
    totalSharesGenerated,
    liveEstimatedPricePerGem,
    estimatedTotalUsd,
    userGems,
    stocksByGroup,
    isUsingFloorPrice,
    rftFloorPrice,
    estimatedTotalUsdLabel: formatUsdWei(estimatedTotalUsd),
    livePriceLabel: formatUsdWei(liveEstimatedPricePerGem, 4),
    isLoading,
    refetch,
  };
}
