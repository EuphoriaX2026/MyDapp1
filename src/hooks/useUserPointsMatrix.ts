import { useReadContracts } from 'wagmi';
import { contracts } from '../config/wagmi';
import LensABI from '../abis/Lens-titan.json';
import LedgerABI from '../abis/Ledger-titan.json';
import type { GroupPointsData } from './usePointsMatrix';

/** Point ledger + pending for an arbitrary user (lazy-loaded ID card). */
export function useUserPointsMatrix(userAddress: `0x${string}` | undefined) {
  const lensCalls = Array.from({ length: 7 }, (_, i) => ({
    address: contracts.TITAN_LENS as `0x${string}`,
    abi: LensABI.abi,
    functionName: 'getPointLedger' as const,
    args: [userAddress, i + 1] as const,
  }));

  const ledgerCalls = Array.from({ length: 7 }, (_, i) => ({
    address: contracts.TITAN_LEDGER as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'userPendingPoints' as const,
    args: [userAddress, i + 1] as const,
  }));

  const { data, isLoading, isError } = useReadContracts({
    contracts: [...lensCalls, ...ledgerCalls],
    query: { enabled: !!userAddress },
  });

  const groupsData: Record<number, GroupPointsData> = {};

  if (data && userAddress) {
    for (let i = 1; i <= 7; i++) {
      const lensResult = data[i - 1]?.result as
        | readonly [bigint, bigint, bigint, bigint]
        | undefined;
      const ledgerResult = data[7 + (i - 1)]?.result as
        | { left: bigint; right: bigint; weekId: bigint }
        | undefined;

      groupsData[i] = {
        groupIdx: i,
        rawLeft: lensResult?.[0] ?? 0n,
        rawRight: lensResult?.[1] ?? 0n,
        paidLeft: lensResult?.[2] ?? 0n,
        paidRight: lensResult?.[3] ?? 0n,
        pendingLeft: ledgerResult?.left ?? 0n,
        pendingRight: ledgerResult?.right ?? 0n,
        balancesCreated: lensResult?.[2] ?? 0n,
      };
    }
  } else {
    for (let i = 1; i <= 7; i++) {
      groupsData[i] = {
        groupIdx: i,
        rawLeft: 0n,
        rawRight: 0n,
        paidLeft: 0n,
        paidRight: 0n,
        pendingLeft: 0n,
        pendingRight: 0n,
        balancesCreated: 0n,
      };
    }
  }

  return { groupsData, isLoading, isError };
}
