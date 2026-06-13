import { formatUnits } from 'viem';

const USD_SCALE = 10n ** 18n;
const BPS_DENOM = 10_000n;
/** Life-fee branch threshold — gross USD (18-decimal fixed point). */
export const LIFE_FEE_GROSS_THRESHOLD_USD = 10_000n * USD_SCALE;

export type WithdrawE1Quote = {
  grossUsd: bigint;
  feeUsd: bigint;
  payableUsd: bigint;
  feeBpsApplied: bigint;
};

export function computeWithdrawE1Quote(params: {
  totalShares: bigint;
  pricePerShareUSD: bigint;
  applicableCapUsd: bigint;
  isSubjectToLifeFee: boolean;
  lifeFeeBPS: bigint;
}): WithdrawE1Quote {
  const { totalShares, pricePerShareUSD, applicableCapUsd, isSubjectToLifeFee, lifeFeeBPS } =
    params;

  const grossUsd =
    totalShares === 0n || pricePerShareUSD === 0n
      ? 0n
      : (totalShares * pricePerShareUSD) / USD_SCALE;

  if (!isSubjectToLifeFee || lifeFeeBPS === 0n) {
    const payableUsd = grossUsd > applicableCapUsd ? applicableCapUsd : grossUsd;
    return { grossUsd, feeUsd: 0n, payableUsd, feeBpsApplied: 0n };
  }

  if (grossUsd < LIFE_FEE_GROSS_THRESHOLD_USD) {
    const feeUsd = (grossUsd * lifeFeeBPS) / BPS_DENOM;
    const afterFee = grossUsd - feeUsd;
    const payableUsd = afterFee > applicableCapUsd ? applicableCapUsd : afterFee;
    return { grossUsd, feeUsd, payableUsd, feeBpsApplied: lifeFeeBPS };
  }

  const capped = grossUsd > applicableCapUsd ? applicableCapUsd : grossUsd;
  const feeUsd = (capped * lifeFeeBPS) / BPS_DENOM;
  const payableUsd = capped - feeUsd;
  return { grossUsd, feeUsd, payableUsd, feeBpsApplied: lifeFeeBPS };
}

export function formatUsdWei(value: bigint, fractionDigits = 2): string {
  const n = Number(formatUnits(value, 18));
  return n.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Lifetime withdrawals — display as 100k when cumulative USD ≥ 1,000. */
export function formatLifetimeWithdrawalsUsd(amountWei: bigint): string {
  const usd = Number(formatUnits(amountWei, 18));
  if (usd >= 1000) return '100k';
  return usd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatE1FromUsdWei(amountWei: bigint, fractionDigits = 2): string {
  return formatUsdWei(amountWei, fractionDigits);
}
