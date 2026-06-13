import { useCallback } from 'react';
import type { FinappNotificationType } from '../components/FinappNotification.types';
import { useFinappNotifications } from '../context/FinappNotificationContext';

const WALLET_TX_TAG = 'wallet-tx-active';

export function useWalletTxNotification() {
  const { push, dismissByTag } = useFinappNotifications();

  const notify = useCallback(
    (message: string, type: FinappNotificationType = 'info', duration?: number) => {
      push(message, {
        type,
        duration: duration ?? (type === 'info' ? 0 : 4000),
        tag: WALLET_TX_TAG,
      });
    },
    [push],
  );

  const notifyConfirming = useCallback(
    (label: string) => {
      notify(label, 'info', 0);
    },
    [notify],
  );

  const notifySuccess = useCallback(
    (label: string) => {
      dismissByTag(WALLET_TX_TAG);
      push(label, { type: 'success', duration: 4000 });
    },
    [dismissByTag, push],
  );

  const notifyError = useCallback(
    (label: string) => {
      dismissByTag(WALLET_TX_TAG);
      push(label, { type: 'error', duration: 4500 });
    },
    [dismissByTag, push],
  );

  const clearNotification = useCallback(() => {
    dismissByTag(WALLET_TX_TAG);
  }, [dismissByTag]);

  return {
    notify,
    notifyConfirming,
    notifySuccess,
    notifyError,
    clearNotification,
  };
}
