import { usdWeiToNumber } from '../utils/edexSwapMath';

/**
 * Fee tier categories for EConfigs.getFeeRates(category, actionType).
 * Thresholds are USD lower bounds (inclusive) per category index.
 * Adjust when on-chain tier boundaries are confirmed.
 */
export const EDEX_FEE_CATEGORY_THRESHOLDS_USD = [0, 100, 1_000, 10_000] as const;

/** 0 = buy, 1 = sell (matches FeeCollected.direction in EDex events). */
export const EDEX_FEE_ACTION = {
  BUY: 0,
  SELL: 1,
  TRANSFER: 2,
} as const;

export function resolveEdexFeeCategory(usdAmountWei: bigint): number {
  const usd = usdWeiToNumber(usdAmountWei);
  let category = 0;
  for (let i = EDEX_FEE_CATEGORY_THRESHOLDS_USD.length - 1; i >= 0; i--) {
    if (usd >= EDEX_FEE_CATEGORY_THRESHOLDS_USD[i]) {
      category = i;
      break;
    }
  }
  return category;
}
