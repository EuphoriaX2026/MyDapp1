import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { type Abi } from 'viem';
import EConfigsABI from '../abis/econfigs.json';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import { EDEX_FEE_ACTION } from '../config/edex-fees';
import { useEguardPenalty } from './useEguardPenalty';
import {
  EGUARD_PENALTY_FEE_BPS,
  bpsToFraction,
  feeRatesToBps,
} from '../utils/edexSwapMath';

const econfigsAbi = ((EConfigsABI as { abi?: Abi }).abi ?? EConfigsABI) as Abi;

const E1_TRANSFER_FEE_BPS = 250;
const DAI_TRANSFER_FEE_BPS = 100;
const ERX_TRANSFER_FEE_FALLBACK_BPS = 700;
const TRANSFER_FEE_CATEGORY = 0;

export interface UseTransferFeeQuoteParams {
  tokenSymbol: string;
  amount: string;
  senderAddress?: `0x${string}`;
}

export function useTransferFeeQuote({
  tokenSymbol,
  amount,
  senderAddress,
}: UseTransferFeeQuoteParams) {
  const isErx = tokenSymbol === 'ERX';
  const isE1 = tokenSymbol === 'E1';

  const { isPenalized, isLoading: penaltyLoading } = useEguardPenalty(
    isErx ? senderAddress : undefined,
  );

  const { data: feeRates, isLoading: feeRatesLoading } = useReadContract({
    address: ERX_CONTRACTS.EConfigs as `0x${string}`,
    abi: econfigsAbi,
    functionName: 'getFeeRates',
    args: [BigInt(TRANSFER_FEE_CATEGORY), BigInt(EDEX_FEE_ACTION.TRANSFER)],
    query: {
      enabled: isErx && !isPenalized,
      refetchInterval: 15_000,
    },
  });

  const feeBps = useMemo(() => {
    if (isE1) return E1_TRANSFER_FEE_BPS;
    if (!isErx) {
      if (tokenSymbol === 'DAI') return DAI_TRANSFER_FEE_BPS;
      return 0;
    }
    if (isPenalized) return EGUARD_PENALTY_FEE_BPS;
    if (!feeRates || !Array.isArray(feeRates)) return ERX_TRANSFER_FEE_FALLBACK_BPS;
    const [treasuryRate, updateFundRate] = feeRates as [bigint, bigint];
    const bps = feeRatesToBps(treasuryRate, updateFundRate);
    return bps > 0 ? bps : ERX_TRANSFER_FEE_FALLBACK_BPS;
  }, [isE1, isErx, isPenalized, feeRates, tokenSymbol]);

  const feePercentage = feeBps / 100;

  const amountNum = useMemo(() => {
    const value = parseFloat(amount);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [amount]);

  const feeAmount = amountNum * bpsToFraction(feeBps);
  const netAmount = amountNum - feeAmount;

  const isLoading = isErx && (penaltyLoading || (!isPenalized && feeRatesLoading));

  return {
    feePercentage,
    feeAmount,
    netAmount,
    isPenalized: isErx && isPenalized,
    isLoading,
  };
}
