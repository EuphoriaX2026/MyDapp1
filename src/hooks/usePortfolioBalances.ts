import { useMemo, useCallback } from 'react'
import { useAccount, useBalance, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { EDEX_TOKEN_META } from '../config/edex-tokens'
import { ERX_CONTRACTS, TOKENS, isContractDeployed } from '../config/erx-contracts'
import { TITAN_CONTRACTS } from '../config/my-titan-contracts'
import { ERC20_ABI, TOKEN_DECIMALS_MAP } from '../config/wagmi'

export interface TokenBalanceValue {
  /** Human-readable formatted balance */
  formatted: string
  /** Numeric value for calculations */
  value: number
  /** Raw on-chain balance */
  raw: bigint
}

export interface PortfolioBalancesResult {
  balances: {
    pol: TokenBalanceValue
    erx: TokenBalanceValue
    dai: TokenBalanceValue
    e1: TokenBalanceValue
    usdt: TokenBalanceValue
    qbit: TokenBalanceValue
  }
  isLoading: boolean
  isError: boolean
  isConnected: boolean
  refetch: () => Promise<void>
}

/** @deprecated Use PortfolioBalancesResult */
export type AccountBalancesResult = PortfolioBalancesResult

const ZERO_BALANCE: TokenBalanceValue = {
  formatted: '0',
  value: 0,
  raw: 0n,
}

function toBalanceValue(raw: bigint | undefined, decimals: number): TokenBalanceValue {
  if (raw === undefined) return ZERO_BALANCE
  const formatted = formatUnits(raw, decimals)
  const value = Number.parseFloat(formatted)
  return {
    formatted,
    value: Number.isFinite(value) ? value : 0,
    raw,
  }
}

/**
 * Single on-chain source for wallet token balances (POL + ERC20 multicall).
 * Uses REAL E1 from TITAN_CONTRACTS — never the USDT mock.
 */
export function usePortfolioBalances(): PortfolioBalancesResult {
  const { address, isConnected } = useAccount()
  const enabled = !!address && isConnected

  const {
    data: nativeBalance,
    isLoading: isNativeLoading,
    isError: isNativeError,
    refetch: refetchNative,
  } = useBalance({
    address,
    query: { enabled },
  })

  const qbitAddress = EDEX_TOKEN_META.QBit.address as `0x${string}`
  const qbitEnabled = isContractDeployed(qbitAddress)

  const {
    data: tokenResults,
    isLoading: isTokensLoading,
    isError: isTokensError,
    refetch: refetchTokens,
  } = useReadContracts({
    contracts: [
      {
        address: ERX_CONTRACTS.ERX,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        address: TOKENS.DAI,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        address: TITAN_CONTRACTS.E1,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        address: TOKENS.USDT,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      ...(qbitEnabled
        ? [
            {
              address: qbitAddress,
              abi: ERC20_ABI,
              functionName: 'balanceOf' as const,
              args: [address ?? '0x0000000000000000000000000000000000000000'] as const,
            },
          ]
        : []),
    ],
    query: { enabled },
  })

  const balances = useMemo(() => {
    const polDecimals = nativeBalance?.decimals ?? 18
    const erxDecimals = TOKEN_DECIMALS_MAP[ERX_CONTRACTS.ERX] ?? 18
    const daiDecimals = TOKEN_DECIMALS_MAP[TOKENS.DAI] ?? 18
    const e1Decimals = TOKEN_DECIMALS_MAP[TITAN_CONTRACTS.E1] ?? 18
    const usdtDecimals = TOKEN_DECIMALS_MAP[TOKENS.USDT] ?? 6
    const qbitDecimals = EDEX_TOKEN_META.QBit.decimals

    return {
      pol: toBalanceValue(nativeBalance?.value, polDecimals),
      erx: toBalanceValue(tokenResults?.[0]?.result as bigint | undefined, erxDecimals),
      dai: toBalanceValue(tokenResults?.[1]?.result as bigint | undefined, daiDecimals),
      e1: toBalanceValue(tokenResults?.[2]?.result as bigint | undefined, e1Decimals),
      usdt: toBalanceValue(tokenResults?.[3]?.result as bigint | undefined, usdtDecimals),
      qbit: qbitEnabled
        ? toBalanceValue(tokenResults?.[4]?.result as bigint | undefined, qbitDecimals)
        : ZERO_BALANCE,
    }
  }, [nativeBalance, qbitEnabled, tokenResults])

  const refetch = useCallback(async () => {
    await Promise.all([refetchNative(), refetchTokens()])
  }, [refetchNative, refetchTokens])

  return {
    balances,
    isLoading: isNativeLoading || isTokensLoading,
    isError: isNativeError || isTokensError,
    isConnected,
    refetch,
  }
}

/** @deprecated Use usePortfolioBalances */
export const useAccountBalances = usePortfolioBalances
