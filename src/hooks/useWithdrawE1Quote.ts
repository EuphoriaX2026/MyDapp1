import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { contracts } from '../config/wagmi';
import { useWeeklyRftStocks } from './useWeeklyRftStocks';
import { useRftIncome } from './useRftIncome';
import {
  computeWithdrawE1Quote,
  formatLifetimeWithdrawalsUsd,
  formatUsdWei,
  formatE1FromUsdWei,
} from '../utils/withdrawE1Math';
import LedgerABI from '../abis/Ledger-titan.json';
import LensABI from '../abis/Lens-titan.json';
import ConfigsABI from '../abis/Configs-titan.json';

const PACKAGE_TYPE_CLASSIC = 0;
const PACKAGE_TYPE_VIP = 1;

type WeeklyData = {
  totalSharesGenerated: bigint;
  lockedErxForPayout: bigint;
  pricePerShareUSD: bigint;
  isPriced: boolean;
  isCleanedUp: boolean;
};

export function useWithdrawE1Quote() {
  const { address } = useAccount();
  const { currentWeekId, totalIncomeUSD, isLoading: isWeekLoading } = useRftIncome();

  const targetWeekId = currentWeekId > 0n ? currentWeekId - 1n : 0n;

  const {
    totalShares,
    hasClaimedWeek,
    isLoading: isStocksLoading,
    refetch: refetchStocks,
  } = useWeeklyRftStocks(targetWeekId);

  const { data: weeklyDataRaw, isLoading: isWeeklyDataLoading } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'weeklyData',
    args: [targetWeekId],
    query: { enabled: targetWeekId >= 0n },
  });

  const { data: highestActiveGroupRaw, isLoading: isCapInfoLoading } = useReadContract({
    address: contracts.TITAN_LENS as `0x${string}`,
    abi: LensABI.abi,
    functionName: 'getUserIncomeCapInfo',
    args: [address],
    query: { enabled: !!address },
  });

  const highestActiveGroup = Number((highestActiveGroupRaw as number | undefined) ?? 0);
  const capGroupIdx = highestActiveGroup > 0 ? highestActiveGroup : 1;

  const { data: baseCapRaw, isLoading: isBaseCapLoading } = useReadContract({
    address: contracts.TITAN_CONFIGS as `0x${string}`,
    abi: ConfigsABI.abi,
    functionName: 'weeklyUsdErxCap',
    args: [capGroupIdx, PACKAGE_TYPE_CLASSIC],
    query: { enabled: !!address },
  });

  const { data: vipCapRaw, isLoading: isVipCapLoading } = useReadContract({
    address: contracts.TITAN_CONFIGS as `0x${string}`,
    abi: ConfigsABI.abi,
    functionName: 'weeklyUsdErxCap',
    args: [capGroupIdx, PACKAGE_TYPE_VIP],
    query: { enabled: !!address },
  });

  const { data: isSubjectToLifeFeeRaw, isLoading: isLifeFeeFlagLoading } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'isSubjectToLifeFee',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: lifeFeeBpsRaw, isLoading: isLifeFeeBpsLoading } = useReadContract({
    address: contracts.TITAN_CONFIGS as `0x${string}`,
    abi: ConfigsABI.abi,
    functionName: 'lifeFeeBPS',
  });

  const { data: userIsVipRaw, isLoading: isVipLoading } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'userIsVIP',
    args: [address],
    query: { enabled: !!address },
  });

  const weeklyData = weeklyDataRaw as WeeklyData | undefined;
  const pricePerShareUSD = weeklyData?.pricePerShareUSD ?? 0n;
  const isWeekPriced = weeklyData?.isPriced ?? false;

  const baseCapUsd = (baseCapRaw as bigint | undefined) ?? 0n;
  const vipCapUsd = (vipCapRaw as bigint | undefined) ?? 0n;
  const isSubjectToLifeFee = Boolean(isSubjectToLifeFeeRaw);
  const lifeFeeBPS = (lifeFeeBpsRaw as bigint | undefined) ?? 0n;
  const userIsVip = Boolean(userIsVipRaw);
  const applicableCapUsd = userIsVip ? vipCapUsd : baseCapUsd;

  const quote = useMemo(
    () =>
      computeWithdrawE1Quote({
        totalShares,
        pricePerShareUSD,
        applicableCapUsd,
        isSubjectToLifeFee,
        lifeFeeBPS,
      }),
    [totalShares, pricePerShareUSD, applicableCapUsd, isSubjectToLifeFee, lifeFeeBPS],
  );

  const isLoading =
    isWeekLoading ||
    isStocksLoading ||
    isWeeklyDataLoading ||
    isCapInfoLoading ||
    isBaseCapLoading ||
    isVipCapLoading ||
    isLifeFeeFlagLoading ||
    isLifeFeeBpsLoading ||
    isVipLoading;

  const canWithdraw =
    !!address &&
    totalShares > 0n &&
    !hasClaimedWeek &&
    isWeekPriced &&
    quote.payableUsd > 0n;

  return {
    targetWeekId,
    totalShares,
    pricePerShareUSD,
    highestActiveGroup,
    baseCapUsd,
    vipCapUsd,
    userIsVip,
    isSubjectToLifeFee,
    lifeFeeBPS,
    lifetimeWithdrawalsUsd: totalIncomeUSD,
    lifetimeWithdrawalsLabel: formatLifetimeWithdrawalsUsd(totalIncomeUSD),
    quote,
    grossLabel: formatUsdWei(quote.grossUsd),
    feeLabel: formatUsdWei(quote.feeUsd),
    netE1Label: formatE1FromUsdWei(quote.payableUsd),
    feePercentLabel:
      quote.feeBpsApplied > 0n
        ? `${Number(quote.feeBpsApplied) / 100}%`
        : '0%',
    hasClaimedWeek,
    isWeekPriced,
    canWithdraw,
    isLoading,
    refetchStocks,
  };
}
