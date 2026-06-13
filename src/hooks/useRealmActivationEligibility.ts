import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import PanelABI from '../abis/Panel-titan.json';
import { formatSequentialActivationLockReason } from '../data/storeRealmProducts';

export type RealmActivationGate = {
  canActivate: boolean;
  isLoading: boolean;
  lockReason: string | null;
  prevGroupIdx: number | null;
  prevGroupActive: boolean;
};

function isGroupActive(expiryTimestamp: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return expiryTimestamp > now;
}

/** Mirrors Activator sequential rule: G(X) requires G(X-1) still active. */
export function useRealmActivationEligibility(groupIdx: number): RealmActivationGate {
  const { address } = useAccount();
  const prevGroupIdx = groupIdx > 1 ? groupIdx - 1 : null;

  const { data: prevTimestamps, isLoading } = useReadContract({
    address: TITAN_CONTRACTS.Panel as `0x${string}`,
    abi: PanelABI.abi,
    functionName: 'getUserGroupTimestamps',
    args: address && prevGroupIdx ? [address, prevGroupIdx] : undefined,
    query: { enabled: !!address && prevGroupIdx != null },
  });

  return useMemo((): RealmActivationGate => {
    if (groupIdx <= 1) {
      return {
        canActivate: true,
        isLoading: false,
        lockReason: null,
        prevGroupIdx: null,
        prevGroupActive: true,
      };
    }

    if (!address) {
      return {
        canActivate: false,
        isLoading: false,
        lockReason: 'Connect wallet to activate',
        prevGroupIdx,
        prevGroupActive: false,
      };
    }

    if (isLoading || prevTimestamps === undefined) {
      return {
        canActivate: false,
        isLoading: true,
        lockReason: null,
        prevGroupIdx,
        prevGroupActive: false,
      };
    }

    const expiry = (prevTimestamps as readonly [bigint, bigint])[1] ?? 0n;
    const prevActive = isGroupActive(expiry);

    if (prevActive) {
      return {
        canActivate: true,
        isLoading: false,
        lockReason: null,
        prevGroupIdx,
        prevGroupActive: true,
      };
    }

    return {
      canActivate: false,
      isLoading: false,
      lockReason: formatSequentialActivationLockReason(prevGroupIdx!, groupIdx),
      prevGroupIdx,
      prevGroupActive: false,
    };
  }, [address, groupIdx, isLoading, prevGroupIdx, prevTimestamps]);
}
