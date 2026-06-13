import { formatUnits } from 'viem';
import type { GroupActivationStatus } from '../hooks/useGroupActivationStatus';

/** Free, Inactive, and Blocked users always show rating 0. */
const ZERO_RATING_STATUSES = new Set([0, 2, 3]);

/** Highest active Activate group (G1–G7 → 1–7), or 0 when ineligible. */
export function computeDashboardRating(
  statusNum: number,
  groups: Record<number, GroupActivationStatus>,
): number {
  if (ZERO_RATING_STATUSES.has(statusNum)) return 0;

  for (let groupIdx = 7; groupIdx >= 1; groupIdx--) {
    if (groups[groupIdx]?.isActive) return groupIdx;
  }

  return 0;
}

/** Cumulative E1 received via Withdraw E1 (USD wei, 1:1 E1 peg). */
export function formatEarnedE1FromWithdrawals(totalIncomeUsdWei: bigint): string {
  const e1Amount = Number(formatUnits(totalIncomeUsdWei, 18));

  if (e1Amount >= 1000) {
    return `${(e1Amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  return Math.floor(e1Amount).toString();
}
