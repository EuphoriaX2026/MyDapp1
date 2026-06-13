import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import BankABI from '../abis/Bank-titan.json';

/** Fallback when Bank oracle has not returned a positive price yet. */
export const BANK_ERX_PRICE_USD_FALLBACK = 0.0111;

export const BANK_ERX_PRICE_REFETCH_MS = 15_000;

const BANK_ADDRESS = TITAN_CONTRACTS.Bank as `0x${string}`;

export interface UseBankErxPriceUsdOptions {
  /** Also read `lastErxPrice` (for % change in wallet market data). */
  includeLastPrice?: boolean;
  refetchInterval?: number;
  enabled?: boolean;
}

export function parseBankErxPriceWei(raw: bigint | undefined): number {
  if (raw === undefined || raw === 0n) return 0;
  const value = Number.parseFloat(formatUnits(raw, 18));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Single on-chain source for Bank.getErxPriceUsd (and optional lastErxPrice).
 */
export function useBankErxPriceUsd(options?: UseBankErxPriceUsdOptions) {
  const includeLastPrice = options?.includeLastPrice ?? false;
  const refetchInterval = options?.refetchInterval ?? BANK_ERX_PRICE_REFETCH_MS;
  const enabled = options?.enabled ?? true;

  const single = useReadContract({
    address: BANK_ADDRESS,
    abi: BankABI.abi,
    functionName: 'getErxPriceUsd',
    query: {
      enabled: enabled && !includeLastPrice,
      refetchInterval,
    },
  });

  const batch = useReadContracts({
    contracts: [
      {
        address: BANK_ADDRESS,
        abi: BankABI.abi,
        functionName: 'getErxPriceUsd',
      },
      {
        address: BANK_ADDRESS,
        abi: BankABI.abi,
        functionName: 'lastErxPrice',
      },
    ],
    query: {
      enabled: enabled && includeLastPrice,
      refetchInterval,
    },
  });

  const erxPriceUsdWei = useMemo(() => {
    if (includeLastPrice) {
      return (batch.data?.[0]?.result as bigint | undefined) ?? 0n;
    }
    return (single.data as bigint | undefined) ?? 0n;
  }, [includeLastPrice, batch.data, single.data]);

  const lastErxPriceUsdWei = useMemo(() => {
    if (!includeLastPrice) return 0n;
    return (batch.data?.[1]?.result as bigint | undefined) ?? 0n;
  }, [includeLastPrice, batch.data]);

  const erxPriceUsd = useMemo(() => parseBankErxPriceWei(erxPriceUsdWei), [erxPriceUsdWei]);
  const lastErxPriceUsd = useMemo(
    () => parseBankErxPriceWei(lastErxPriceUsdWei),
    [lastErxPriceUsdWei],
  );

  const erxPriceUsdOrFallback =
    erxPriceUsd > 0 ? erxPriceUsd : BANK_ERX_PRICE_USD_FALLBACK;

  const isLoading = includeLastPrice ? batch.isLoading : single.isLoading;
  const isError = includeLastPrice ? batch.isError : single.isError;

  const refetch = useMemo(
    () => (includeLastPrice ? batch.refetch : single.refetch),
    [includeLastPrice, batch.refetch, single.refetch],
  );

  return {
    erxPriceUsdWei,
    erxPriceUsd,
    lastErxPriceUsdWei,
    lastErxPriceUsd,
    /** Human USD with project fallback when oracle is zero/unavailable. */
    erxPriceUsdOrFallback,
    isLoading,
    isError,
    refetch,
  };
}
