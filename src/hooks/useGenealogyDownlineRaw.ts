import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Address } from 'viem';

import { contracts } from '../config/wagmi';
import LensABI from '../abis/Lens-titan.json';
import { isZeroAddress } from '../utils/genealogyLayout';
import { useUserPointsMatrix } from './useUserPointsMatrix';

const GROUP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

export type DownlineLeg = 'self' | 'left' | 'right' | 'none';

export type GroupFilter = 'all' | (typeof GROUP_IDS)[number];

async function resolveDownlineLeg(
  viewer: Address,
  target: Address,
  readTreeInfo: (addr: Address) => Promise<{ parentAddress: Address; positionInParentLeg: number }>,
): Promise<DownlineLeg> {
  if (viewer.toLowerCase() === target.toLowerCase()) {
    return 'self';
  }

  let current: Address = target;
  for (let depth = 0; depth < 256; depth += 1) {
    const info = await readTreeInfo(current);
    const parent = info.parentAddress;
    if (isZeroAddress(parent)) return 'none';
    if (parent.toLowerCase() === viewer.toLowerCase()) {
      return info.positionInParentLeg === 0 ? 'left' : 'right';
    }
    current = parent;
  }
  return 'none';
}

/** Viewer RAW on the leg branch that contains `target` (per group). */
export function useGenealogyDownlineRaw(
  viewerAddress: Address | undefined,
  targetAddress: Address | undefined,
) {
  const publicClient = usePublicClient();
  const { groupsData, isLoading: pointsLoading } = useUserPointsMatrix(viewerAddress);
  const [leg, setLeg] = useState<DownlineLeg | 'loading'>('loading');

  useEffect(() => {
    if (!viewerAddress || !targetAddress || !publicClient) {
      setLeg('none');
      return;
    }

    let cancelled = false;
    setLeg('loading');

    const readTreeInfo = async (addr: Address) => {
      const result = await publicClient.readContract({
        address: contracts.TITAN_LENS as `0x${string}`,
        abi: LensABI.abi,
        functionName: 'getUserTreeInfo',
        args: [addr],
      });
      return result as { parentAddress: Address; positionInParentLeg: number };
    };

    void resolveDownlineLeg(viewerAddress, targetAddress, readTreeInfo).then((resolved) => {
      if (!cancelled) setLeg(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, [viewerAddress, targetAddress, publicClient]);

  const rawForGroup = useCallback(
    (group: GroupFilter): bigint => {
      if (leg === 'loading' || leg === 'none') return 0n;
      const groups = group === 'all' ? GROUP_IDS : [group];
      let total = 0n;
      for (const g of groups) {
        const row = groupsData[g];
        if (leg === 'self') {
          total += row.rawLeft + row.rawRight;
        } else if (leg === 'left') {
          total += row.rawLeft;
        } else {
          total += row.rawRight;
        }
      }
      return total;
    },
    [leg, groupsData],
  );

  return {
    rawForGroup,
    isLoading: pointsLoading || leg === 'loading',
    leg,
  };
}
