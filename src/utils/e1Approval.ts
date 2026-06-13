import { maxUint256, parseUnits, type Address } from 'viem';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';

/** Matches Panel / Activator E1 flows. */
export const E1_TOKEN_DECIMALS = 18;

export const INFINITE_ALLOWANCE_THRESHOLD = maxUint256 / 2n;

export function isInfiniteAllowance(allowance: bigint): boolean {
  return allowance >= INFINITE_ALLOWANCE_THRESHOLD;
}

export function requiredE1Wei(requiredE1: number): bigint {
  return parseUnits(requiredE1.toString(), E1_TOKEN_DECIMALS);
}

/** True when spender already has infinite or sufficient E1 allowance. */
export function hasE1Allowance(allowance: bigint, requiredWei: bigint): boolean {
  if (isInfiniteAllowance(allowance)) return true;
  return allowance >= requiredWei;
}

/** @deprecated Use hasE1Allowance with Activator spender + wei amount */
export function hasE1PanelAllowance(allowance: bigint, requiredE1: number): boolean {
  return hasE1Allowance(allowance, requiredE1Wei(requiredE1));
}

export function activatorSpender(): Address {
  return TITAN_CONTRACTS.Activator as Address;
}
