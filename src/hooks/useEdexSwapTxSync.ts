import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { pollBalanceRefresh } from '../utils/pollBalanceRefresh';

export type EdexSwapAction = 'APPROVE' | 'TRADE' | null;

type TxCompletePayload = {
  hash: `0x${string}`;
  kind: Exclude<EdexSwapAction, null>;
  success: boolean;
  blockNumber?: number;
  gasPaidPol?: string;
  confirmedAt: string;
};

type UseEdexSwapTxSyncArgs = {
  hash?: `0x${string}`;
  isConfirmed: boolean;
  isConfirming: boolean;
  isWriteError?: boolean;
  actionType: EdexSwapAction;
  setActionType: (value: EdexSwapAction) => void;
  refetchBalances: () => Promise<unknown>;
  resetTransaction?: () => void;
  onApproveSuccess?: (payload: TxCompletePayload) => void;
  onTradeSuccess?: (payload: TxCompletePayload) => void;
  onTxFailed?: (payload: TxCompletePayload) => void;
};

export function useEdexSwapTxSync({
  hash,
  isConfirmed,
  isConfirming,
  isWriteError = false,
  actionType,
  setActionType,
  refetchBalances,
  resetTransaction,
  onApproveSuccess,
  onTradeSuccess,
  onTxFailed,
}: UseEdexSwapTxSyncArgs) {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const processedHashRef = useRef<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const invalidateWalletQueries = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['balance'] });
    await queryClient.invalidateQueries({ queryKey: ['readContract'] });
  }, [queryClient]);

  useEffect(() => {
    if (isWriteError && hash && processedHashRef.current !== hash) {
      processedHashRef.current = hash;
      const kind = actionType;
      if (!kind) return;
      const payload: TxCompletePayload = {
        hash,
        kind,
        success: false,
        confirmedAt: new Date().toISOString(),
      };
      onTxFailed?.(payload);
      setActionType(null);
      resetTransaction?.();
      return;
    }

    if (isConfirming) {
      setStatusMessage(
        actionType === 'APPROVE'
          ? 'Confirming unlimited approval on Polygon Amoy…'
          : 'Confirming swap on Polygon Amoy…',
      );
      return;
    }

    if (!isConfirmed || !hash || processedHashRef.current === hash) return;

    const kind = actionType;
    if (!kind) return;

    processedHashRef.current = hash;

    void (async () => {
      setSyncing(true);
      setStatusMessage(
        kind === 'APPROVE'
          ? 'Approval confirmed — syncing allowance & balances…'
          : 'Swap confirmed — syncing wallet balances…',
      );

      let success = true;
      let blockNumber: number | undefined;
      let gasPaidPol: string | undefined;
      let confirmedAt = new Date().toISOString();

      try {
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          success = receipt.status === 'success';
          blockNumber = Number(receipt.blockNumber);
          gasPaidPol = formatEther(receipt.gasUsed * receipt.effectiveGasPrice);
          const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
          confirmedAt = new Date(Number(block.timestamp) * 1000).toISOString();
        }
      } catch {
        success = false;
      }

      await invalidateWalletQueries();
      await pollBalanceRefresh(refetchBalances, { attempts: 12, intervalMs: 1_000 });

      setSyncing(false);
      setStatusMessage(null);

      const payload: TxCompletePayload = {
        hash,
        kind,
        success,
        blockNumber,
        gasPaidPol,
        confirmedAt,
      };

      if (success) {
        if (kind === 'APPROVE') onApproveSuccess?.(payload);
        else onTradeSuccess?.(payload);
      } else {
        onTxFailed?.(payload);
      }

      setActionType(null);
      resetTransaction?.();
    })();
  }, [
    actionType,
    hash,
    invalidateWalletQueries,
    isConfirming,
    isConfirmed,
    isWriteError,
    onApproveSuccess,
    onTradeSuccess,
    onTxFailed,
    publicClient,
    refetchBalances,
    resetTransaction,
    setActionType,
  ]);

  return {
    syncing,
    statusMessage,
    isTxBusy: isConfirming || syncing,
  };
}
