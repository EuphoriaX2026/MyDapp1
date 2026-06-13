import { useMemo } from 'react';
import { type Address, formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import LensABI from '../abis/Lens-titan.json';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import { E1_TOKEN_DECIMALS } from '../utils/e1Approval';

const DEFAULT_PACKAGE_TYPE = 0;

export type ActivatorPriceQuote = {
  priceWei: bigint | null;
  priceE1: number | null;
  isLoading: boolean;
  isError: boolean;
  source: 'lens-usd' | null;
};

/**
 * Activation packages are paid in E1 (USD-pegged), not ERX.
 * Uses Lens.getPackagePriceUSD — never getPackagePrice (that returns ERX for Store cards).
 */
export function useActivatorPackagePrice(groupIdx: number): ActivatorPriceQuote {
  const { address } = useAccount();
  const enabled = groupIdx > 0;

  const { data: lastPkgType } = useReadContract({
    address: TITAN_CONTRACTS.Lens as `0x${string}`,
    abi: LensABI.abi,
    functionName: 'getUsersLastPackageTypeInGroup',
    args: address && enabled ? [address as Address, groupIdx] : undefined,
    query: { enabled: enabled && !!address },
  });

  const packageType =
    lastPkgType !== undefined ? Number(lastPkgType) : DEFAULT_PACKAGE_TYPE;

  const { data: usdPriceWei, isLoading, isError } = useReadContract({
    address: TITAN_CONTRACTS.Lens as `0x${string}`,
    abi: LensABI.abi,
    functionName: 'getPackagePriceUSD',
    args: enabled ? [groupIdx, packageType] : undefined,
    query: { enabled },
  });

  return useMemo((): ActivatorPriceQuote => {
    if (!enabled) {
      return {
        priceWei: null,
        priceE1: null,
        isLoading: false,
        isError: false,
        source: null,
      };
    }

    if (isLoading) {
      return {
        priceWei: null,
        priceE1: null,
        isLoading: true,
        isError: false,
        source: null,
      };
    }

    if (usdPriceWei !== undefined && !isError) {
      const wei = usdPriceWei as bigint;
      return {
        priceWei: wei,
        priceE1: Number(formatUnits(wei, E1_TOKEN_DECIMALS)),
        isLoading: false,
        isError: false,
        source: 'lens-usd',
      };
    }

    return {
      priceWei: null,
      priceE1: null,
      isLoading: false,
      isError: true,
      source: null,
    };
  }, [enabled, isError, isLoading, usdPriceWei]);
}
