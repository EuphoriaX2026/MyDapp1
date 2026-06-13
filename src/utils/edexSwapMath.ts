import { formatUnits, parseUnits } from 'viem';
import { NETWORK_MODE } from '../config/networks';

export const USD_DECIMALS = 18;
export const ERX_DECIMALS = 18;

export const FEE_RATE_SCALE = 10n ** 18n;

/** Parse a single EConfigs fee rate (1e18-scaled) into basis points (500 = 5%). */
export function feeRateWeiToBps(feeRateWei: bigint): number {
  if (feeRateWei <= 0n) return 0;
  return Number(feeRateWei) / 1e14;
}

/** Parse EConfigs treasury + updateFund rates into basis points (500 = 5%). */
export function feeRatesToBps(treasuryRate: bigint, updateFundRate: bigint): number {
  return feeRateWeiToBps(treasuryRate + updateFundRate);
}

export function bpsToFraction(bps: number): number {
  return bps / 10_000;
}

/** Token amount (human) → USD wei (18 decimals). */
export function tokenAmountToUsdWei(
  amountHuman: string,
  tokenDecimals: number,
  usdPerToken: number,
): bigint {
  if (!amountHuman || usdPerToken <= 0) return 0n;
  try {
    const tokenWei = parseUnits(amountHuman, tokenDecimals);
    const priceWei = parseUnits(usdPerToken.toString(), USD_DECIMALS);
    return (tokenWei * priceWei) / 10n ** BigInt(tokenDecimals);
  } catch {
    return 0n;
  }
}

/** USD wei (18) → token amount wei. */
export function usdWeiToTokenWei(
  usdWei: bigint,
  tokenDecimals: number,
  usdPerToken: number,
): bigint {
  if (usdWei <= 0n || usdPerToken <= 0) return 0n;
  const priceWei = parseUnits(usdPerToken.toString(), USD_DECIMALS);
  return (usdWei * 10n ** BigInt(tokenDecimals)) / priceWei;
}

export function usdWeiToNumber(usdWei: bigint): number {
  return Number(formatUnits(usdWei, USD_DECIMALS));
}

export function erxWeiToNumber(erxWei: bigint): number {
  return Number(formatUnits(erxWei, ERX_DECIMALS));
}

export function tokenWeiToNumber(tokenWei: bigint, decimals: number): number {
  return Number(formatUnits(tokenWei, decimals));
}

export interface SwapQuoteInput {
  mode: 'BUY' | 'SELL';
  payAmountHuman: number;
  payTokenDecimals: number;
  payTokenUsd: number;
  receiveTokenDecimals: number;
  receiveTokenUsd: number;
  erxPriceUsd: number;
  feeBps: number;
}

export interface SwapQuoteResult {
  outputAmount: number;
  feeAmount: number;
  feeSymbolSide: 'pay' | 'receive';
  usdGross: number;
  usdNet: number;
  ratePerOnePay: number;
  ratePerOneReceive: number;
}

export function computeSwapQuote(input: SwapQuoteInput): SwapQuoteResult {
  const {
    mode,
    payAmountHuman,
    payTokenDecimals,
    payTokenUsd,
    receiveTokenDecimals,
    receiveTokenUsd,
    erxPriceUsd,
    feeBps,
  } = input;

  const empty: SwapQuoteResult = {
    outputAmount: 0,
    feeAmount: 0,
    feeSymbolSide: 'pay',
    usdGross: 0,
    usdNet: 0,
    ratePerOnePay: 0,
    ratePerOneReceive: 0,
  };

  if (payAmountHuman <= 0 || erxPriceUsd <= 0) return empty;

  const feeFrac = bpsToFraction(feeBps);

  if (mode === 'BUY') {
    const usdGross = payAmountHuman * payTokenUsd;
    const feeUsd = usdGross * feeFrac;
    const usdNet = usdGross - feeUsd;
    const outputErx = usdNet / erxPriceUsd;
    const feePayToken = payTokenUsd > 0 ? feeUsd / payTokenUsd : 0;
    const ratePerOnePay = payTokenUsd > 0 ? (payTokenUsd * (1 - feeFrac)) / erxPriceUsd : 0;

    return {
      outputAmount: outputErx,
      feeAmount: feePayToken,
      feeSymbolSide: 'pay',
      usdGross,
      usdNet,
      ratePerOnePay,
      ratePerOneReceive: erxPriceUsd,
    };
  }

  const usdGross = payAmountHuman * erxPriceUsd;
  const feeUsd = usdGross * feeFrac;
  const usdNet = usdGross - feeUsd;
  const outputStable = receiveTokenUsd > 0 ? usdNet / receiveTokenUsd : 0;
  const feeErx = payAmountHuman * feeFrac;
  const ratePerOnePay = erxPriceUsd > 0 ? (erxPriceUsd * (1 - feeFrac)) / receiveTokenUsd : 0;

  return {
    outputAmount: outputStable,
    feeAmount: feeErx,
    feeSymbolSide: 'pay',
    usdGross,
    usdNet,
    ratePerOnePay,
    ratePerOneReceive: receiveTokenUsd,
  };
}

/** EGuard anti-spam penalty — 20% fee when active. */
export const EGUARD_PENALTY_FEE_BPS = 2000;
export const EGUARD_PENALTY_FEE_RATE_WEI = 200n * 10n ** 16n;

/** Store.sol redeemE1 / QBit placeholder route — fixed 5% fee. */
export const EDEX_ALTERNATE_ROUTE_FEE_BPS = 500;
export const EDEX_ALTERNATE_ROUTE_FEE_RATE_WEI = 500n * 10n ** 14n;

/** Testnet bonding curve is volatile — use wider minOut buffer. */
export const EDEX_SLIPPAGE_BPS = NETWORK_MODE === 'testnet' ? 1000 : 200;

/** Float USD price → 18-decimal wei without locale/scientific notation surprises. */
export function decimalUsdPriceToWei(price: number): bigint {
  if (!Number.isFinite(price) || price <= 0) return 0n;
  try {
    const fixed = price.toFixed(USD_DECIMALS);
    const [intPart, fracPart = ''] = fixed.split('.');
    const normalized = `${intPart}.${fracPart.padEnd(USD_DECIMALS, '0').slice(0, USD_DECIMALS)}`;
    return parseUnits(normalized, USD_DECIMALS);
  } catch {
    return 0n;
  }
}

export function humanAmountToWei(amount: number, decimals: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) return 0n;
  try {
    const normalized = amount.toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: decimals,
    });
    return parseUnits(normalized, decimals);
  } catch {
    return 0n;
  }
}

/** minOut = expectedOut × (1 − slippage), default 2%. */
export function slippageMinOutWei(
  expectedWei: bigint,
  slippageBps: number = EDEX_SLIPPAGE_BPS,
): bigint {
  if (expectedWei <= 0n) return 0n;
  const clampedBps = Math.min(Math.max(slippageBps, 0), 9_900);
  const factor = BigInt(10_000 - clampedBps);
  return (expectedWei * factor) / 10_000n;
}

/** On-chain-accurate BUY quote: EDex.buy(usdAmount, token, minErxOut). */
export function computeExpectedErxOutWei(
  usdAmountWei: bigint,
  erxPriceWei: bigint,
  totalFeeRateWei: bigint,
): bigint {
  if (usdAmountWei <= 0n || erxPriceWei <= 0n) return 0n;
  const feeWei = (usdAmountWei * totalFeeRateWei) / FEE_RATE_SCALE;
  const usdNet = usdAmountWei - feeWei;
  return (usdNet * 10n ** BigInt(ERX_DECIMALS)) / erxPriceWei;
}

/** On-chain-accurate SELL quote: EDex.sell(erxAmount, token, minStableOut). */
export function computeExpectedStableOutWei(
  erxAmountWei: bigint,
  erxPriceWei: bigint,
  stablePriceWei: bigint,
  stableDecimals: number,
  totalFeeRateWei: bigint,
): bigint {
  if (erxAmountWei <= 0n || erxPriceWei <= 0n || stablePriceWei <= 0n) return 0n;
  const usdGross = (erxAmountWei * erxPriceWei) / 10n ** BigInt(ERX_DECIMALS);
  const feeWei = (usdGross * totalFeeRateWei) / FEE_RATE_SCALE;
  const usdNet = usdGross - feeWei;
  return (usdNet * 10n ** BigInt(stableDecimals)) / stablePriceWei;
}
