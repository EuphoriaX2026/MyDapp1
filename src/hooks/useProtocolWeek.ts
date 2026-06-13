import { useMemo } from 'react';
import { useAccount, useBlock, useReadContract } from 'wagmi';
import { contracts } from '../config/wagmi';
import ConfigsABI from '../abis/Configs-titan.json';
import LedgerABI from '../abis/Ledger-titan.json';

const DEFAULT_ONE_WEEK = 604800n;

/**
 * Canonical protocol week IDs — oneWeek from Configs, current week from chain block timestamp,
 * user start week from Ledger userFirstActivationTimestamp.
 */
export function useProtocolWeek() {
  const { address } = useAccount();

  const { data: block, isLoading: isBlockLoading } = useBlock({ watch: true });

  const { data: oneWeekVal, isLoading: isOneWeekLoading } = useReadContract({
    address: contracts.TITAN_CONFIGS as `0x${string}`,
    abi: ConfigsABI.abi,
    functionName: 'oneWeek',
  });

  const { data: userFirstActivation, isLoading: isActivationTsLoading } = useReadContract({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'userFirstActivationTimestamp',
    args: [address],
    query: { enabled: !!address },
  });

  const oneWeek = oneWeekVal ? (oneWeekVal as bigint) : DEFAULT_ONE_WEEK;
  const chainTimestamp = block?.timestamp;

  const currentWeekId = useMemo(() => {
    if (chainTimestamp === undefined) return 0n;
    return chainTimestamp / oneWeek;
  }, [chainTimestamp, oneWeek]);

  const userStartWeekId = useMemo(() => {
    if (!userFirstActivation) return currentWeekId;
    const ts = userFirstActivation as bigint;
    if (ts <= 0n) return currentWeekId;
    return ts / oneWeek;
  }, [userFirstActivation, currentWeekId]);

  const maxSelectableWeekId = currentWeekId > 0n ? currentWeekId - 1n : 0n;
  const minSelectableWeekId = userStartWeekId;

  const clampWeekId = (weekId: bigint) => {
    if (weekId < minSelectableWeekId) return minSelectableWeekId;
    if (weekId > maxSelectableWeekId) return maxSelectableWeekId;
    return weekId;
  };

  const isLoading =
    isBlockLoading ||
    isOneWeekLoading ||
    (!!address && isActivationTsLoading) ||
    chainTimestamp === undefined;

  return {
    oneWeek,
    currentWeekId,
    userStartWeekId,
    minSelectableWeekId,
    maxSelectableWeekId,
    clampWeekId,
    isLoading,
  };
}
