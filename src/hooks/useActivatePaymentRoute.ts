import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import IERC20ABI from '../abis/erx-token.json';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import { formatUnits } from 'viem';
import { E1_TOKEN_DECIMALS } from '../utils/e1Approval';
import { useActivationKind } from './useActivationKind';
import { useActivatorPackagePrice } from './useActivatorPackagePrice';

/** Activation is E1-only — credit cards (ERX) are purchased separately on E-Dex. */
export type ActivatePaymentRoute = 'loading' | 'e1-checkout' | 'e1-insufficient';

export function useActivatePaymentRoute(groupIdx: number) {
  const { address } = useAccount();
  const packagePrice = useActivatorPackagePrice(groupIdx);
  const activationKind = useActivationKind(groupIdx);

  const { data: e1BalanceRaw, isLoading: e1BalanceLoading } = useReadContract({
    address: TITAN_CONTRACTS.E1 as `0x${string}`,
    abi: IERC20ABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return useMemo(() => {
    const priceReady =
      !packagePrice.isLoading &&
      !packagePrice.isError &&
      packagePrice.priceWei != null &&
      packagePrice.priceE1 != null;

    const balanceReady = !address || (!e1BalanceLoading && e1BalanceRaw !== undefined);

    const hasEnoughE1 =
      priceReady &&
      balanceReady &&
      !!address &&
      (e1BalanceRaw as bigint) >= packagePrice.priceWei!;

    if (!priceReady || (address && !balanceReady)) {
      return {
        route: 'loading' as const,
        hasEnoughE1: false,
        packagePrice,
        activationKind,
        e1BalanceRaw,
        priceReady,
        balanceReady,
      };
    }

    if (hasEnoughE1) {
      return {
        route: 'e1-checkout' as const,
        hasEnoughE1: true,
        packagePrice,
        activationKind,
        e1BalanceRaw,
        priceReady,
        balanceReady,
      };
    }

    return {
      route: 'e1-insufficient' as const,
      hasEnoughE1: false,
      packagePrice,
      activationKind,
      e1BalanceRaw,
      priceReady,
      balanceReady,
    };
  }, [
    activationKind,
    address,
    e1BalanceLoading,
    e1BalanceRaw,
    packagePrice,
  ]);
}

export function formatE1BalanceDisplay(balanceRaw: bigint | undefined): number | null {
  if (balanceRaw === undefined) return null;
  return Number(formatUnits(balanceRaw, E1_TOKEN_DECIMALS));
}
