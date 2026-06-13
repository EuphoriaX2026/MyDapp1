import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import LedgerABI from '../abis/Ledger-titan.json';

export type ActivationKind = 'first' | 'renewal';

export function useActivationKind(groupIdx: number) {
  const { address } = useAccount();
  const enabled = !!address && groupIdx > 0;

  const { data: hasFirstActivated, isLoading: loadingFlag } = useReadContract({
    address: TITAN_CONTRACTS.Ledger as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'userFirstActivationInGroup',
    args: enabled ? [address, groupIdx] : undefined,
    query: { enabled },
  });

  const { data: groupExpiryRaw, isLoading: loadingExpiry } = useReadContract({
    address: TITAN_CONTRACTS.Ledger as `0x${string}`,
    abi: LedgerABI.abi,
    functionName: 'userPackageGroupExpiry',
    args: enabled ? [address, groupIdx] : undefined,
    query: { enabled },
  });

  return useMemo(() => {
    const isLoading = enabled && (loadingFlag || loadingExpiry);
    /** Ledger flag set after the user's first activation in this group. */
    const isFirstActivation = hasFirstActivated !== true;
    const kind: ActivationKind = isFirstActivation ? 'first' : 'renewal';
    const groupExpiry =
      groupExpiryRaw !== undefined ? (groupExpiryRaw as bigint) : undefined;

    return {
      kind,
      isFirstActivation,
      isRenewal: !isFirstActivation,
      isLoading,
      hasFirstActivatedInGroup: hasFirstActivated === true,
      groupExpiry,
    };
  }, [enabled, groupExpiryRaw, hasFirstActivated, loadingExpiry, loadingFlag]);
}
