import { useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { contracts } from '../config/wagmi';
import PanelABI from '../abis/Panel-titan.json';

export type GroupActivationStatus = {
  groupIdx: number;
  isActive: boolean;
  registrationTimestamp: bigint;
  groupExpiryTimestamp: bigint;
};

function isGroupActive(expiryTimestamp: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return expiryTimestamp > now;
}

/** Batch-read Panel.getUserGroupTimestamps for G1–G7. */
export function useGroupActivationStatus() {
  const { address } = useAccount();

  const calls = Array.from({ length: 7 }, (_, i) => ({
    address: contracts.TITAN_PANEL as `0x${string}`,
    abi: PanelABI.abi,
    functionName: 'getUserGroupTimestamps' as const,
    args: [address, i + 1] as const,
  }));

  const { data, isLoading, refetch } = useReadContracts({
    contracts: calls,
    query: { enabled: !!address },
  });

  const groups = useMemo((): Record<number, GroupActivationStatus> => {
    const result: Record<number, GroupActivationStatus> = {};
    for (let i = 1; i <= 7; i++) {
      const row = data?.[i - 1]?.result as readonly [bigint, bigint] | undefined;
      const registrationTimestamp = row?.[0] ?? 0n;
      const groupExpiryTimestamp = row?.[1] ?? 0n;
      result[i] = {
        groupIdx: i,
        isActive: isGroupActive(groupExpiryTimestamp),
        registrationTimestamp,
        groupExpiryTimestamp,
      };
    }
    return result;
  }, [data]);

  return { groups, isLoading, refetch };
}
