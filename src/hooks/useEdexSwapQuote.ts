import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { parseUnits, type Abi } from 'viem';
import EConfigsABI from '../abis/econfigs.json';
import { getEdexAbi } from '../config/edex-abi';
import { resolveEdexFeeCategory } from '../config/edex-fees';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import type { EdexTokenMeta, StableSymbol } from '../config/edex-tokens';
import {
  QBIT_USD_PRICE,
  WALLET_STABLE_PRICES,
  getWalletCoinUsdPrice,
} from '../config/wallet-coins';
import { useEguardPenalty } from './useEguardPenalty';
import {
  computeExpectedErxOutWei,
  computeExpectedStableOutWei,
  computeSwapQuote,
  decimalUsdPriceToWei,
  EDEX_ALTERNATE_ROUTE_FEE_BPS,
  EDEX_ALTERNATE_ROUTE_FEE_RATE_WEI,
  EDEX_SLIPPAGE_BPS,
  EGUARD_PENALTY_FEE_BPS,
  EGUARD_PENALTY_FEE_RATE_WEI,
  USD_DECIMALS,
  feeRateWeiToBps,
  humanAmountToWei,
  slippageMinOutWei,
  tokenAmountToUsdWei,
} from '../utils/edexSwapMath';
import { formatErxPrice } from '../utils/formatNumber';

const econfigsAbi = ((EConfigsABI as { abi?: Abi }).abi ?? EConfigsABI) as Abi;
const edexAbi = getEdexAbi();

export type EdexSwapRoute = 'edex' | 'e1-store' | 'qbit';

export function resolveSwapRoute(stableSymbol: StableSymbol): EdexSwapRoute {
  if (stableSymbol === 'E1') return 'e1-store';
  if (stableSymbol === 'QBit') return 'qbit';
  return 'edex';
}

export interface UseEdexSwapQuoteParams {
  mode: 'BUY' | 'SELL';
  amount: string;
  stableMeta: EdexTokenMeta;
  stableSymbol: StableSymbol;
  erxPriceUsd: number;
  stableTradable: boolean;
  userAddress?: `0x${string}`;
  /** Basis points subtracted from expected output (default 200 = 2%). */
  slippageBps?: number;
}

export function useEdexSwapQuote({
  mode,
  amount,
  stableMeta,
  stableSymbol,
  erxPriceUsd,
  stableTradable,
  userAddress,
  slippageBps = EDEX_SLIPPAGE_BPS,
}: UseEdexSwapQuoteParams) {
  const swapRoute = resolveSwapRoute(stableSymbol);
  const isAlternateRoute = swapRoute !== 'edex';

  const inputVal = useMemo(() => {
    const v = parseFloat(amount);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [amount]);

  const stableUsd = useMemo(() => {
    if (stableSymbol === 'E1') return WALLET_STABLE_PRICES.E1;
    if (stableSymbol === 'QBit') return QBIT_USD_PRICE;
    return getWalletCoinUsdPrice(stableSymbol, erxPriceUsd);
  }, [stableSymbol, erxPriceUsd]);

  const erxPrice = erxPriceUsd > 0 ? erxPriceUsd : 0;

  const usdAmountWei = useMemo(() => {
    if (inputVal <= 0) return 0n;
    if (mode === 'BUY') {
      return tokenAmountToUsdWei(amount, stableMeta.decimals, stableUsd);
    }
    try {
      return parseUnits((inputVal * erxPrice).toFixed(10), 18);
    } catch {
      return 0n;
    }
  }, [mode, amount, stableMeta.decimals, stableUsd, inputVal, erxPrice]);

  const { isPenalized, isLoading: penaltyLoading } = useEguardPenalty(
    isAlternateRoute ? undefined : userAddress,
  );

  const feeCategory = useMemo(
    () => resolveEdexFeeCategory(usdAmountWei),
    [usdAmountWei],
  );

  const direction = mode === 'BUY' ? 0 : 1;
  const { data: feeRates, isLoading: feeRatesLoading } = useReadContract({
    address: ERX_CONTRACTS.EConfigs as `0x${string}`,
    abi: econfigsAbi,
    functionName: 'getFeeRates',
    args: [BigInt(feeCategory), direction],
    query: {
      enabled: !isAlternateRoute && stableTradable && usdAmountWei > 0n,
      refetchInterval: 15_000,
    },
  });

  const { data: onChainErxPriceWei } = useReadContract({
    address: ERX_CONTRACTS.EDex as `0x${string}`,
    abi: edexAbi,
    functionName: 'getCurrentPrice',
    query: {
      enabled: !isAlternateRoute && stableTradable,
      refetchInterval: 10_000,
    },
  });

  const totalBaseFeeWei = useMemo((): bigint | null => {
    if (isAlternateRoute) return EDEX_ALTERNATE_ROUTE_FEE_RATE_WEI;
    if (isPenalized) return EGUARD_PENALTY_FEE_RATE_WEI;
    if (feeRates && Array.isArray(feeRates)) {
      const [treasuryFeeRate, updateFundFeeRate] = feeRates as [bigint, bigint];
      return treasuryFeeRate + updateFundFeeRate;
    }
    if (!feeRatesLoading && inputVal > 0) {
      return EDEX_ALTERNATE_ROUTE_FEE_RATE_WEI;
    }
    return null;
  }, [isAlternateRoute, isPenalized, feeRates, feeRatesLoading, inputVal]);

  const usingFallbackFee =
    !isAlternateRoute && !isPenalized && inputVal > 0 && !(feeRates && Array.isArray(feeRates));

  const feeBps = useMemo(() => {
    if (isAlternateRoute) return EDEX_ALTERNATE_ROUTE_FEE_BPS;
    if (isPenalized) return EGUARD_PENALTY_FEE_BPS;
    if (totalBaseFeeWei === null) return 0;
    return feeRateWeiToBps(totalBaseFeeWei);
  }, [isAlternateRoute, isPenalized, totalBaseFeeWei]);

  const isPenaltyActive = !isAlternateRoute && isPenalized;

  const buyUsdWei = mode === 'BUY' ? usdAmountWei : 0n;

  const mathQuote = useMemo(() => {
    if (inputVal <= 0 || erxPrice <= 0 || totalBaseFeeWei === null) return null;
    return computeSwapQuote({
      mode,
      payAmountHuman: inputVal,
      payTokenDecimals: mode === 'BUY' ? stableMeta.decimals : 18,
      payTokenUsd: mode === 'BUY' ? stableUsd : erxPrice,
      receiveTokenDecimals: mode === 'BUY' ? 18 : stableMeta.decimals,
      receiveTokenUsd: mode === 'BUY' ? erxPrice : stableUsd,
      erxPriceUsd: erxPrice,
      feeBps,
    });
  }, [mode, inputVal, stableMeta.decimals, stableUsd, erxPrice, feeBps, totalBaseFeeWei]);

  const quote = useMemo(() => {
    if (!mathQuote) {
      return {
        outputAmount: 0,
        feeAmount: 0,
        usdGross: 0,
        usdNet: 0,
        rateText: '',
        feeBps,
        feeCategory,
        totalBaseFeeWei,
        isPenaltyActive,
        swapRoute,
      };
    }

    const rateText =
      mode === 'BUY'
        ? `1 ${stableSymbol} ≈ ${formatErxPrice(mathQuote.ratePerOnePay)} ERX`
        : `1 ERX ≈ ${formatErxPrice(mathQuote.ratePerOnePay)} ${stableSymbol}`;

    return {
      outputAmount: mathQuote.outputAmount,
      feeAmount: mathQuote.feeAmount,
      usdGross: mathQuote.usdGross,
      usdNet: mathQuote.usdNet,
      rateText,
      feeBps,
      feeCategory,
      totalBaseFeeWei,
      isPenaltyActive,
      swapRoute,
    };
  }, [mathQuote, mode, stableSymbol, feeBps, feeCategory, totalBaseFeeWei, isPenaltyActive, swapRoute]);

  const erxPriceWei = useMemo(() => {
    if (onChainErxPriceWei && (onChainErxPriceWei as bigint) > 0n) {
      return onChainErxPriceWei as bigint;
    }
    return decimalUsdPriceToWei(erxPrice);
  }, [onChainErxPriceWei, erxPrice]);

  const stablePriceWei = useMemo(() => {
    if (stableUsd <= 0) return 0n;
    try {
      return parseUnits(stableUsd.toString(), USD_DECIMALS);
    } catch {
      return 0n;
    }
  }, [stableUsd]);

  const outputDecimals = mode === 'BUY' ? 18 : stableMeta.decimals;

  const outputAmountWei = useMemo(() => {
    if (isAlternateRoute || totalBaseFeeWei === null || inputVal <= 0) {
      return humanAmountToWei(quote.outputAmount, outputDecimals);
    }

    if (mode === 'BUY') {
      if (erxPriceWei > 0n) {
        return computeExpectedErxOutWei(usdAmountWei, erxPriceWei, totalBaseFeeWei);
      }
      return humanAmountToWei(quote.outputAmount, outputDecimals);
    }

    let erxAmountWei = 0n;
    try {
      erxAmountWei = parseUnits(amount, 18);
    } catch {
      return 0n;
    }

    return computeExpectedStableOutWei(
      erxAmountWei,
      erxPriceWei,
      stablePriceWei,
      stableMeta.decimals,
      totalBaseFeeWei,
    );
  }, [
    isAlternateRoute,
    totalBaseFeeWei,
    inputVal,
    quote.outputAmount,
    outputDecimals,
    mode,
    usdAmountWei,
    erxPriceWei,
    amount,
    stablePriceWei,
    stableMeta.decimals,
  ]);

  const effectiveSlippageBps = usingFallbackFee ? slippageBps + 500 : slippageBps;
  const minAmountOutWei = slippageMinOutWei(outputAmountWei, effectiveSlippageBps);

  const buyUsdWeiForTx = buyUsdWei;

  const isQuoteLoading =
    !isAlternateRoute && inputVal > 0 && !!userAddress && penaltyLoading;

  const isQuoteReady =
    isAlternateRoute ||
    (inputVal > 0 &&
      erxPrice > 0 &&
      totalBaseFeeWei !== null &&
      outputAmountWei > 0n &&
      minAmountOutWei > 0n &&
      (mode === 'BUY' ? buyUsdWeiForTx > 0n : true));

  return {
    ...quote,
    inputVal,
    usdAmountWei,
    buyUsdWeiForTx,
    stableUsd,
    erxPrice,
    outputAmountWei,
    minAmountOutWei,
    slippageBps: effectiveSlippageBps,
    isQuoteReady,
    isQuoteLoading,
    isPenaltyLoading: isAlternateRoute ? false : penaltyLoading,
    isFeeRatesLoading: isAlternateRoute ? false : !isPenalized && feeRatesLoading,
  };
}
