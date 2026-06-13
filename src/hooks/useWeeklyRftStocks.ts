import { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { contracts } from '../config/wagmi';
import LedgerABI from '../abis/Ledger-titan.json';

export type WeeklyGroupStock = {
  groupIdx: number;
  shares: bigint;
};

/** Per-group RFT shares and weekly claim status for a selected week. */
export function useWeeklyRftStocks(selectedWeekId: bigint) {
  const { address } = useAccount();

  const stockCalls = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        address: contracts.TITAN_LEDGER as `0x${string}`,
        abi: LedgerABI.abi,
        functionName: 'userSharesInWeekByGroup' as const,
        args: [address, i + 1, selectedWeekId] as const,
      })),
    [address, selectedWeekId],
  );

  const { data: stockData, isLoading: stocksLoading, refetch: refetchStocks } = useReadContracts({
    contracts: stockCalls,
    query: { enabled: !!address },
  });

  const { data: claimedUsdRaw, isLoading: claimLoading, refetch: refetchClaimed } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'weeklyUsdClaimedTotal',
    args: address ? [address, selectedWeekId] : undefined,
    query: { enabled: !!address },
  });

  const stocksByGroup = useMemo((): Record<number, WeeklyGroupStock> => {
    const map: Record<number, WeeklyGroupStock> = {};
    for (let i = 1; i <= 7; i++) {
      const shares = (stockData?.[i - 1]?.result as bigint | undefined) ?? 0n;
      map[i] = { groupIdx: i, shares };
    }
    return map;
  }, [stockData]);

  const totalShares = useMemo(
    () => Object.values(stocksByGroup).reduce((sum, row) => sum + row.shares, 0n),
    [stocksByGroup],
  );

  const weeklyUsdClaimed = (claimedUsdRaw as bigint | undefined) ?? 0n;
  const hasClaimedWeek = weeklyUsdClaimed > 0n;

  return {
    stocksByGroup,
    totalShares,
    weeklyUsdClaimed,
    hasClaimedWeek,
    isLoading: stocksLoading || claimLoading,
    refetch: async () => {
      await Promise.all([refetchStocks(), refetchClaimed()]);
    },
  };
}
