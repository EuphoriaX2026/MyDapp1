import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { usePointsMatrix } from './usePointsMatrix';
import { useGroupActivationStatus } from './useGroupActivationStatus';
import { useRftIncome } from './useRftIncome';
import {
  DEFAULT_RFT_MULTIPLIERS,
  hasPendingPoints,
  PENDING_STARS_GROUP_IDS,
} from '../utils/pendingStarsSimulation';
import { contracts } from '../config/wagmi';
import ConfigsABI from '../abis/Configs-titan.json';

export function usePendingStarsData() {
  const { groupsData, isLoading: isPointsLoading, refetch: refetchPoints } = usePointsMatrix();
  const {
    groups: activationGroups,
    isLoading: isActivationLoading,
    refetch: refetchActivation,
  } = useGroupActivationStatus();
  const { currentWeekId, isLoading: isWeekLoading } = useRftIncome();

  const multiplierCalls = useMemo(
    () =>
      PENDING_STARS_GROUP_IDS.map((groupIdx) => ({
        address: contracts.TITAN_CONFIGS as `0x${string}`,
        abi: ConfigsABI.abi,
        functionName: 'rftBaseShares' as const,
        args: [groupIdx] as const,
      })),
    [],
  );

  const { data: multiplierData, isLoading: isMultiplierLoading } = useReadContracts({
    contracts: multiplierCalls,
  });

  const multipliersByGroup = useMemo(() => {
    const map: Record<number, bigint> = { ...DEFAULT_RFT_MULTIPLIERS };
    multiplierData?.forEach((result, idx) => {
      if (result.status === 'success' && result.result !== undefined) {
        map[PENDING_STARS_GROUP_IDS[idx]] = result.result as bigint;
      }
    });
    return map;
  }, [multiplierData]);

  const isDataLoading =
    isPointsLoading || isActivationLoading || isWeekLoading || isMultiplierLoading;

  const activeGroups = useMemo(
    () =>
      PENDING_STARS_GROUP_IDS.filter((groupIdx) => activationGroups[groupIdx]?.isActive ?? false),
    [activationGroups],
  );

  const inactiveGroups = useMemo(
    () =>
      PENDING_STARS_GROUP_IDS.filter((groupIdx) => !(activationGroups[groupIdx]?.isActive ?? false)),
    [activationGroups],
  );

  const lostInactivePoints = useMemo(() => {
    let total = 0n;
    for (const groupIdx of PENDING_STARS_GROUP_IDS) {
      const isActive = activationGroups[groupIdx]?.isActive ?? false;
      if (isActive) continue;
      const points = groupsData[groupIdx];
      total += points.pendingLeft + points.pendingRight;
    }
    return total;
  }, [activationGroups, groupsData]);

  const activeGroupsWithPending = useMemo(
    () => activeGroups.filter((groupIdx) => hasPendingPoints(groupsData[groupIdx])),
    [activeGroups, groupsData],
  );

  return {
    groupsData,
    activationGroups,
    currentWeekId,
    multipliersByGroup,
    isDataLoading,
    activeGroups,
    inactiveGroups,
    lostInactivePoints,
    activeGroupsWithPending,
    canClaimStars: activeGroupsWithPending.length > 0,
    refetchPoints,
    refetchActivation,
  };
}
