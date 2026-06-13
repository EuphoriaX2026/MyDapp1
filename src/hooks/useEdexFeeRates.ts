import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import EConfigsABI from '../abis/econfigs.json';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import {
  EDEX_FEE_ACTION,
  resolveEdexFeeCategory,
} from '../config/edex-fees';
import { feeRatesToBps } from '../utils/edexSwapMath';

const econfigsAbi = (EConfigsABI as { abi?: unknown }).abi ?? EConfigsABI;

export function useEdexFeeRates(
  mode: 'BUY' | 'SELL',
  usdAmountWei: bigint,
) {
  const category = resolveEdexFeeCategory(usdAmountWei);
  const actionType = mode === 'BUY' ? EDEX_FEE_ACTION.BUY : EDEX_FEE_ACTION.SELL;

  const { data: feeRates, isLoading } = useReadContract({
    address: ERX_CONTRACTS.EConfigs as `0x${string}`,
    abi: econfigsAbi,
    functionName: 'getFeeRates',
    args: [BigInt(category), actionType],
    query: { refetchInterval: 15_000 },
  });

  const feeBps = useMemo(() => {
    if (!feeRates || !Array.isArray(feeRates)) return 500;
    const [treasury, updateFund] = feeRates as [bigint, bigint];
    const bps = feeRatesToBps(treasury, updateFund);
    return bps > 0 ? bps : 500;
  }, [feeRates]);

  return { feeBps, feeCategory: category, isLoading };
}
