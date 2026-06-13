import type { GroupPointsData } from '../hooks/usePointsMatrix';
import { getGroupLevelLabel } from '../data/storeRealmProducts';

export const PENDING_STARS_GROUP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

export const DEFAULT_RFT_MULTIPLIERS: Record<number, bigint> = {
  1: 1n,
  2: 3n,
  3: 5n,
  4: 10n,
  5: 30n,
  6: 50n,
  7: 100n,
};

export type GroupSimulation = {
  groupIdx: number;
  groupName: string;
  oldRawLeft: bigint;
  oldRawRight: bigint;
  newPendingLeft: bigint;
  newPendingRight: bigint;
  finalRawLeft: bigint;
  finalRawRight: bigint;
  matches: bigint;
  remainingLeft: bigint;
  remainingRight: bigint;
  multiplier: bigint;
  newRftShares: bigint;
};

export function formatPendingStarsBigInt(value: bigint) {
  return value.toString();
}

export function hasPendingPoints(points: GroupPointsData) {
  return points.pendingLeft > 0n || points.pendingRight > 0n;
}

export function buildPendingStarsSimulations(
  groupIds: number[],
  groupsData: Record<number, GroupPointsData>,
  multipliersByGroup: Record<number, bigint>,
): GroupSimulation[] {
  return groupIds.map((groupIdx) =>
    simulateGroupConversion(
      groupIdx,
      groupsData[groupIdx],
      multipliersByGroup[groupIdx] ?? DEFAULT_RFT_MULTIPLIERS[groupIdx],
    ),
  );
}

export function simulateGroupConversion(
  groupIdx: number,
  points: GroupPointsData,
  multiplier: bigint,
): GroupSimulation {
  const finalRawLeft = points.rawLeft + points.pendingLeft;
  const finalRawRight = points.rawRight + points.pendingRight;
  const matches = finalRawLeft < finalRawRight ? finalRawLeft : finalRawRight;
  const remainingLeft = finalRawLeft - matches;
  const remainingRight = finalRawRight - matches;
  const newRftShares = matches * multiplier;

  return {
    groupIdx,
    groupName: getGroupLevelLabel(groupIdx),
    oldRawLeft: points.rawLeft,
    oldRawRight: points.rawRight,
    newPendingLeft: points.pendingLeft,
    newPendingRight: points.pendingRight,
    finalRawLeft,
    finalRawRight,
    matches,
    remainingLeft,
    remainingRight,
    multiplier,
    newRftShares,
  };
}

export function defaultExpandedGroupCards(displayGroupIds: number[]) {
  const expanded: Record<number, boolean> = {};
  displayGroupIds.forEach((groupIdx) => {
    expanded[groupIdx] = groupIdx === 1;
  });
  return expanded;
}

export function sumPendingPoints(simulations: GroupSimulation[]) {
  return simulations.reduce(
    (sum, sim) => sum + sim.newPendingLeft + sim.newPendingRight,
    0n,
  );
}

export function sumMatches(simulations: GroupSimulation[]) {
  return simulations.reduce((sum, sim) => sum + sim.matches, 0n);
}

export function sumNewRftShares(simulations: GroupSimulation[]) {
  return simulations.reduce((sum, sim) => sum + sim.newRftShares, 0n);
}
