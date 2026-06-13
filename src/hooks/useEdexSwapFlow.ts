import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { useEuphoriaExchange } from './useEuphoriaExchange';
import { useEdexTokenPrices } from './useEdexTokenPrices';
import { useOnWalletChange } from './useOnWalletChange';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import { useEdexSwapQuote, resolveSwapRoute } from './useEdexSwapQuote';
import { useEdexSwapTxSync } from './useEdexSwapTxSync';
import type { EdexReviewKind } from '../components/edex/EdexSwapReviewSheet';
import { buildEdexTxRecord } from '../utils/buildEdexTxRecord';
import { saveEdexTransaction } from '../utils/edexTransactionStore';
import type { EdexTxKind } from '../types/edexTransaction';
import {
  EDEX_TOKEN_META,
  STABLE_OPTIONS,
  isStableTradable,
  type StableSymbol,
} from '../config/edex-tokens';
import {
  ERC20_ALLOWANCE_ABI,
  EDEX_AMOUNT_DECIMALS,
  parsePayAmountWei,
  trimAmountToDecimals,
} from '../utils/edexSwapHelpers';
import {
  formatFinancialInputDisplay,
  sanitizeFinancialAmountInput,
} from '../utils/formatNumber';
import { formatTokenAmount } from '../utils/formatLocaleNumber';
import { useWalletTxNotification } from './useWalletTxNotification';
import { useIsWalletRegistered } from './useIsWalletRegistered';

export type EdexSwapVariant = 'app' | 'public';

export interface UseEdexSwapFlowOptions {
  /** `app` = internal DApp (registered users only); `public` = open access */
  variant: EdexSwapVariant;
  /** Transaction report return path */
  returnTo: string;
}

export function useEdexSwapFlow({ variant, returnTo }: UseEdexSwapFlowOptions) {
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const activeAddress = isConnected ? address : undefined;
  const requireRegistration = variant === 'app';

  const {
    currentPrice,
    buyERX,
    sellERX,
    redeemE1,
    approveToken,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    resetError,
    resetTransaction,
  } = useEuphoriaExchange();

  const { erxPriceUsd } = useEdexTokenPrices();

  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [selectedStable, setSelectedStable] = useState<StableSymbol>('DAI');
  const [actionType, setActionType] = useState<'APPROVE' | 'TRADE' | null>(null);
  const [stablePickerOpen, setStablePickerOpen] = useState(false);
  const [stablePickerSide, setStablePickerSide] = useState<'pay' | 'receive' | null>(null);
  const [routeNotice, setRouteNotice] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewKind, setReviewKind] = useState<EdexReviewKind>('swap');
  const [approveSuccessHash, setApproveSuccessHash] = useState<`0x${string}` | undefined>();
  const { notifyConfirming, notifySuccess, notifyError, clearNotification } =
    useWalletTxNotification();

  const { isRegistered: isUserRegistered, isLoading: isRegistrationLoading } = useIsWalletRegistered({
    address: activeAddress,
    enabled: requireRegistration && !!activeAddress,
  });

  const canInteract =
    !requireRegistration || (isUserRegistered === true && !isRegistrationLoading);

  useOnWalletChange(() => {
    setAmount('');
    setActionType(null);
    setRouteNotice(null);
    setReviewOpen(false);
    setApproveSuccessHash(undefined);
    setStablePickerOpen(false);
    setStablePickerSide(null);
    resetError?.();
    resetTransaction?.();
  });

  const swapRoute = useMemo(() => resolveSwapRoute(selectedStable), [selectedStable]);

  const swapSpender = useMemo(() => {
    if (swapRoute === 'e1-store') return TITAN_CONTRACTS.Store;
    return ERX_CONTRACTS.EDex;
  }, [swapRoute]);

  const stableOptionsList = useMemo(() => {
    const symbols =
      variant === 'app'
        ? STABLE_OPTIONS.filter((sym) => mode === 'BUY' || sym !== 'E1')
        : STABLE_OPTIONS;
    return symbols.map((sym) => EDEX_TOKEN_META[sym]);
  }, [variant, mode]);

  const stableTradable = isStableTradable(selectedStable);
  const stableMeta = EDEX_TOKEN_META[selectedStable];
  const erxMeta = EDEX_TOKEN_META.ERX;
  const payMeta = mode === 'BUY' ? stableMeta : erxMeta;
  const receiveMeta = mode === 'BUY' ? erxMeta : stableMeta;

  const balancePollMs = isPending || isConfirming ? 2_000 : 20_000;

  const { data: erxBalance, refetch: refetchERX } = useBalance({
    address: activeAddress,
    token: EDEX_TOKEN_META.ERX.address as `0x${string}`,
    query: {
      enabled: !!activeAddress,
      staleTime: 5_000,
      refetchInterval: balancePollMs,
    },
  });

  const { data: stableBalance, refetch: refetchStable } = useBalance({
    address: activeAddress,
    token: stableMeta.address as `0x${string}`,
    query: {
      enabled: !!activeAddress && stableTradable,
      staleTime: 5_000,
      refetchInterval: balancePollMs,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stableMeta.address as `0x${string}`,
    abi: ERC20_ALLOWANCE_ABI,
    functionName: 'allowance',
    args: activeAddress ? [activeAddress, swapSpender] : undefined,
    query: {
      enabled:
        !!activeAddress &&
        mode === 'BUY' &&
        stableTradable &&
        swapRoute !== 'qbit',
      staleTime: 5_000,
      refetchInterval: balancePollMs,
    },
  });

  const refetchAllBalances = useCallback(async () => {
    await Promise.all([refetchERX(), refetchStable(), refetchAllowance()]);
  }, [refetchAllowance, refetchERX, refetchStable]);

  const erxBalanceNum = useMemo(() => {
    if (!erxBalance) return 0;
    return parseFloat(formatUnits(erxBalance.value, 18));
  }, [erxBalance]);

  const stableBalanceNum = useMemo(() => {
    if (!stableBalance) return 0;
    return parseFloat(formatUnits(stableBalance.value, stableMeta.decimals));
  }, [stableBalance, stableMeta.decimals]);

  const payBalanceNum = mode === 'BUY' ? stableBalanceNum : erxBalanceNum;
  const receiveBalanceNum = mode === 'BUY' ? erxBalanceNum : stableBalanceNum;

  const swapQuote = useEdexSwapQuote({
    mode,
    amount,
    stableMeta,
    stableSymbol: selectedStable,
    erxPriceUsd: currentPrice > 0 ? currentPrice : erxPriceUsd,
    stableTradable,
    userAddress: activeAddress ?? undefined,
  });

  const {
    outputAmount,
    feeAmount,
    rateText,
    inputVal,
    buyUsdWeiForTx,
    usdGross,
    usdNet,
    isPenaltyActive,
    minAmountOutWei,
    isQuoteReady,
    isQuoteLoading,
    erxPrice,
    swapRoute: quoteSwapRoute,
  } = swapQuote;

  const payExceedsBalance = inputVal > 0 && inputVal > payBalanceNum + 1e-12;

  const inputWei = useMemo(
    () =>
      parsePayAmountWei(
        amount,
        mode === 'BUY' ? stableMeta.decimals : 18,
        inputVal,
      ),
    [amount, mode, stableMeta.decimals, inputVal],
  );

  const currentAllowance = allowance ? (allowance as bigint) : 0n;
  const needsApproval = mode === 'BUY' && currentAllowance < inputWei;

  const handleSwapMode = () => {
    if (variant === 'app' && selectedStable === 'E1') return;
    setMode((prev) => (prev === 'BUY' ? 'SELL' : 'BUY'));
    setAmount('');
    setActionType(null);
    setStablePickerOpen(false);
    setStablePickerSide(null);
  };

  useEffect(() => {
    if (variant === 'app' && selectedStable === 'E1' && mode === 'SELL') {
      setMode('BUY');
      setAmount('');
    }
  }, [variant, selectedStable, mode]);

  const toggleStablePicker = (side: 'pay' | 'receive') => {
    if (stablePickerOpen && stablePickerSide === side) {
      setStablePickerOpen(false);
      setStablePickerSide(null);
    } else {
      setStablePickerOpen(true);
      setStablePickerSide(side);
    }
  };

  const handleSelectStable = (symbol: string) => {
    if (variant === 'app' && symbol === 'E1' && mode === 'SELL') {
      setRouteNotice('ERX cannot be swapped for E1. Use E1 → ERX instead.');
      return;
    }
    setSelectedStable(symbol as StableSymbol);
    setAmount('');
    setStablePickerOpen(false);
    setStablePickerSide(null);
  };

  useEffect(() => {
    if (!stablePickerOpen) return;
    const close = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-stable-picker]')) return;
      setStablePickerOpen(false);
      setStablePickerSide(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [stablePickerOpen]);

  const assertCanInteract = useCallback(() => {
    if (!requireRegistration || canInteract) return true;
    setRouteNotice('Complete project registration to use EDex.');
    return false;
  }, [requireRegistration, canInteract]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    openReviewSheet();
  };

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeAddress || !amount || inputVal <= 0 || !assertCanInteract()) return;
    setActionType('APPROVE');
    await approveToken(stableMeta.address, amount, stableMeta.decimals, swapSpender);
  };

  const handleExecute = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeAddress || !amount || inputVal <= 0 || !assertCanInteract()) return;

    switch (quoteSwapRoute) {
      case 'qbit':
        setActionType(null);
        setRouteNotice('QBit swaps are coming soon. Smart contracts are not live yet.');
        return;
      case 'e1-store':
        if (mode !== 'BUY') {
          setActionType(null);
          setRouteNotice('Selling ERX for E1 via Store is not available yet. Use E1 → ERX (redeem).');
          return;
        }
        break;
      default:
        break;
    }

    setActionType('TRADE');

    switch (quoteSwapRoute) {
      case 'edex':
        if (!isQuoteReady || minAmountOutWei <= 0n) {
          setActionType(null);
          setRouteNotice(
            erxPrice <= 0
              ? 'ERX price is unavailable. Check your network connection and try again.'
              : 'Quote is still loading or unavailable. Wait a moment and try again.',
          );
          return;
        }
        if (payExceedsBalance) {
          setActionType(null);
          setRouteNotice(`Insufficient ${payMeta.symbol} balance.`);
          return;
        }
        if (mode === 'BUY' && needsApproval) {
          setActionType(null);
          setRouteNotice(`Approve ${stableMeta.symbol} first, then tap Confirm again.`);
          return;
        }
        try {
          if (mode === 'BUY') {
            await buyERX(buyUsdWeiForTx, stableMeta.address, minAmountOutWei);
          } else {
            await sellERX(amount, stableMeta.address, minAmountOutWei);
          }
        } catch (err) {
          setActionType(null);
          setRouteNotice(err instanceof Error ? err.message : 'Swap failed. Please try again.');
        }
        break;
      case 'e1-store':
        await redeemE1(activeAddress, amount, stableMeta.decimals);
        break;
      default:
        break;
    }
  };

  const handleMax = () => {
    if (mode === 'BUY') {
      if (stableBalance) {
        const raw = formatUnits(stableBalance.value, stableMeta.decimals);
        setAmount(
          variant === 'app'
            ? trimAmountToDecimals(raw, EDEX_AMOUNT_DECIMALS)
            : raw,
        );
      }
    } else if (erxBalance) {
      const raw = formatUnits(erxBalance.value, 18);
      setAmount(
        variant === 'app' ? trimAmountToDecimals(raw, EDEX_AMOUNT_DECIMALS) : raw,
      );
    }
  };

  const payBalance = mode === 'BUY' ? stableMeta.symbol : 'ERX';
  const receiveBalance = mode === 'BUY' ? 'ERX' : stableMeta.symbol;
  const feeSymbol = payMeta.symbol;
  const payUsdValue = usdGross > 0 ? usdGross : 0;
  const receiveUsdValue = usdNet > 0 ? usdNet : 0;

  const displayFee = isPenaltyActive
    ? '20% (Penalty Active)'
    : formatTokenAmount(feeAmount);

  const reviewPayAmount =
    reviewKind === 'approve' ? 'Unlimited' : amount || '0';
  const reviewReceiveAmount =
    reviewKind === 'approve'
      ? 'Max allowance'
      : outputAmount > 0
        ? formatTokenAmount(outputAmount)
        : '0';

  const spenderLabel = swapRoute === 'e1-store' ? 'Store' : 'EDex';

  const persistEdexTxRecord = useCallback(
    (
      txHash: `0x${string}`,
      kind: EdexTxKind,
      success: boolean,
      meta: {
        confirmedAt: string;
        blockNumber?: number;
        gasPaidPol?: string;
      },
    ) => {
      if (!activeAddress) return;
      const record = buildEdexTxRecord({
        hash: txHash,
        kind,
        status: success ? 'success' : 'failed',
        walletAddress: activeAddress,
        payTokenSymbol: payMeta.symbol,
        payTokenAmount: reviewKind === 'approve' ? 'Unlimited' : amount || '0',
        receiveTokenSymbol: reviewKind === 'approve' ? 'Allowance' : receiveMeta.symbol,
        receiveTokenAmount:
          reviewKind === 'approve'
            ? 'Max'
            : outputAmount > 0
              ? formatTokenAmount(outputAmount)
              : '0',
        feeAmount: reviewKind === 'approve' ? undefined : displayFee,
        feeTokenSymbol: reviewKind === 'approve' ? undefined : feeSymbol,
        gasPaidPol: meta.gasPaidPol,
        spender: swapSpender,
        mode,
        stableSymbol: selectedStable,
        blockNumber: meta.blockNumber,
        createdAt: meta.confirmedAt,
      });
      saveEdexTransaction(record);
      return record;
    },
    [
      activeAddress,
      amount,
      displayFee,
      feeSymbol,
      mode,
      outputAmount,
      payMeta.symbol,
      receiveMeta.symbol,
      reviewKind,
      selectedStable,
      swapSpender,
    ],
  );

  const goToTxReport = useCallback(
    (
      txHash: `0x${string}`,
      kind: EdexTxKind,
      success: boolean,
      meta: {
        confirmedAt: string;
        blockNumber?: number;
        gasPaidPol?: string;
      },
    ) => {
      const record = persistEdexTxRecord(txHash, kind, success, meta);
      if (!record) return;
      navigate(`/transaction/${txHash}`, {
        state: { ...record, returnTo },
      });
    },
    [navigate, persistEdexTxRecord, returnTo],
  );

  const { syncing, statusMessage, isTxBusy } = useEdexSwapTxSync({
    hash,
    isConfirmed,
    isConfirming,
    actionType,
    setActionType,
    refetchBalances: refetchAllBalances,
    resetTransaction,
    onApproveSuccess: (payload) => {
      persistEdexTxRecord(payload.hash, 'edex-approve', true, payload);
      setApproveSuccessHash(payload.hash);
      notifySuccess('Unlimited token approval completed.');
      clearNotification();
    },
    onTradeSuccess: (payload) => {
      setReviewOpen(false);
      const kind: EdexTxKind = mode === 'BUY' ? 'edex-swap' : 'edex-sell';
      notifySuccess(mode === 'BUY' ? 'Swap completed successfully.' : 'Sell completed successfully.');
      clearNotification();
      goToTxReport(payload.hash, kind, true, payload);
    },
    onTxFailed: (payload) => {
      setReviewOpen(false);
      const kind: EdexTxKind =
        payload.kind === 'APPROVE' ? 'edex-approve' : mode === 'BUY' ? 'edex-swap' : 'edex-sell';
      notifyError('Transaction was not completed on-chain.');
      clearNotification();
      goToTxReport(payload.hash, kind, false, payload);
    },
  });

  useEffect(() => {
    if (statusMessage && isTxBusy && !approveSuccessHash) {
      notifyConfirming(statusMessage);
    }
  }, [approveSuccessHash, isTxBusy, notifyConfirming, statusMessage]);

  const handleAmountChange = (value: string) => {
    if (variant === 'app') {
      setAmount(sanitizeFinancialAmountInput(value, EDEX_AMOUNT_DECIMALS));
      return;
    }
    setAmount(value.replace(/[^\d.]/g, ''));
  };

  const payAmountDisplay = useMemo(
    () =>
      variant === 'app'
        ? formatFinancialInputDisplay(amount, EDEX_AMOUNT_DECIMALS)
        : amount,
    [variant, amount],
  );

  const openReviewSheet = () => {
    if (!activeAddress) {
      openConnectModal?.();
      return;
    }
    if (!assertCanInteract()) return;
    if (!amount || inputVal <= 0 || payExceedsBalance) return;
    if (quoteSwapRoute === 'qbit') {
      setRouteNotice('QBit swaps are coming soon. Smart contracts are not live yet.');
      return;
    }
    if (quoteSwapRoute === 'e1-store' && mode === 'SELL') {
      setRouteNotice('Selling ERX for E1 via Store is not available yet. Use E1 → ERX (redeem).');
      return;
    }
    resetError?.();
    resetTransaction?.();
    setActionType(null);
    setApproveSuccessHash(undefined);
    setReviewKind(needsApproval ? 'approve' : 'swap');
    setReviewOpen(true);
  };

  const handleApproveContinue = () => {
    setApproveSuccessHash(undefined);
    setReviewOpen(false);
    resetTransaction?.();
  };

  const confirmReview = async () => {
    resetError?.();
    if (reviewKind === 'approve') {
      await handleApprove({ preventDefault: () => undefined } as FormEvent);
      return;
    }
    await handleExecute({ preventDefault: () => undefined } as FormEvent);
  };

  const triggerSubmit = () => {
    if (slideDisabled) return;
    openReviewSheet();
  };

  const slideDisabled =
    !amount ||
    inputVal <= 0 ||
    isPending ||
    isTxBusy ||
    payExceedsBalance ||
    !canInteract ||
    quoteSwapRoute === 'qbit' ||
    (quoteSwapRoute === 'e1-store' && mode === 'SELL');

  const buildSlideLabel = (labels: {
    connect: string;
    confirm: string;
    approve: (stable: string) => string;
    publicSwap?: string;
  }) => {
    if (isPending) return 'Processing...';
    if (isTxBusy) return syncing ? 'Syncing balances…' : 'Confirming…';
    if (!activeAddress) return labels.connect;
    if (requireRegistration && !canInteract) {
      return isRegistrationLoading ? 'Checking registration…' : 'Register to Swap';
    }
    if (isQuoteLoading) return 'Loading quote...';
    if (needsApproval) return labels.approve(selectedStable);
    return labels.publicSwap ?? labels.confirm;
  };

  return {
    variant,
    requireRegistration,
    canInteract,
    isRegistrationLoading,
    activeAddress,
    openConnectModal,
    mode,
    amount,
    payAmountDisplay,
    selectedStable,
    stablePickerOpen,
    stablePickerSide,
    routeNotice,
    setRouteNotice,
    reviewOpen,
    setReviewOpen,
    reviewKind,
    approveSuccessHash,
    setApproveSuccessHash,
    stableOptionsList,
    stableTradable,
    stableMeta,
    payMeta,
    receiveMeta,
    payBalance,
    receiveBalance,
    payBalanceNum,
    receiveBalanceNum,
    payExceedsBalance,
    payUsdValue,
    receiveUsdValue,
    outputAmount,
    displayFee,
    feeSymbol,
    rateText,
    isPenaltyActive,
    isPending,
    isTxBusy,
    syncing,
    isQuoteLoading,
    needsApproval,
    slideDisabled,
    swapDirectionDisabled: variant === 'app' && selectedStable === 'E1',
    reviewPayAmount,
    reviewReceiveAmount,
    spenderLabel,
    handleFormSubmit,
    handleSwapMode,
    toggleStablePicker,
    handleSelectStable,
    handleAmountChange,
    handleMax,
    triggerSubmit,
    openReviewSheet,
    handleApproveContinue,
    confirmReview,
    buildSlideLabel,
  };
}
