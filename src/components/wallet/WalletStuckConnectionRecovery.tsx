import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { isMobile } from '../../utils/mobile';
import {
  clearUserWalletConnectIntent,
  hasUserWalletConnectIntent,
} from '../../utils/walletConnectIntent';
import { isInsecureWalletContext } from '../../utils/mobileWalletLinks';
import { useFinappNotifications } from '../../context/FinappNotificationContext';

const STUCK_MS = 18_000;

/**
 * On mobile HTTP (e.g. BlueStacks dev), cancel stale auto-reconnect / WC sessions
 * so the user can pick any wallet again.
 */
export function WalletStuckConnectionRecovery() {
  const { status } = useAccount();
  const { disconnect } = useDisconnect();
  const { push } = useFinappNotifications();

  useEffect(() => {
    if (!isMobile() || !isInsecureWalletContext()) return;
    if (status !== 'connecting' && status !== 'reconnecting') return;

    const timer = window.setTimeout(() => {
      disconnect();
      clearUserWalletConnectIntent();
      push(
        'Wallet connection timed out. Tap Connect Wallet, choose your wallet app, and approve the request.',
        {
          type: 'warning',
          placement: 'public',
          portalSelector: 'body',
          duration: 6000,
          tag: 'wallet-connect-timeout',
        },
      );
    }, hasUserWalletConnectIntent() ? STUCK_MS : 8_000);

    return () => window.clearTimeout(timer);
  }, [status, disconnect, push]);

  return null;
}
