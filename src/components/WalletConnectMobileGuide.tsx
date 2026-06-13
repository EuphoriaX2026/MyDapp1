import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { isMobile } from '../utils/mobile';
import { hasUserWalletConnectIntent } from '../utils/walletConnectIntent';
import { useFinappNotifications } from '../context/FinappNotificationContext';

const CONNECT_HINT_MS = 14000;

/**
 * Toast hint when WalletConnect enters the connecting state on mobile.
 */
export function WalletConnectMobileGuide() {
  const { status, connector } = useAccount();
  const { push } = useFinappNotifications();
  const lastConnectorId = useRef<string | null>(null);
  const isConnecting = status === 'connecting';

  useEffect(() => {
    if (!isMobile() || !isConnecting || !connector || !hasUserWalletConnectIntent()) return;

    const connectorId = connector.id ?? connector.name;
    if (lastConnectorId.current === connectorId) return;
    lastConnectorId.current = connectorId;

    const walletName = connector.name || 'your wallet';

    push(
      `Connecting to ${walletName}: open the ${walletName} app and approve the WalletConnect request. If nothing opens, use your wallet's in-app DApp browser or run npm run dev:https.`,
      {
        type: 'info',
        placement: 'public',
        portalSelector: 'body',
        duration: CONNECT_HINT_MS,
        tag: 'wallet-connect-mobile',
      },
    );
  }, [isConnecting, connector, push]);

  useEffect(() => {
    if (!isConnecting) {
      lastConnectorId.current = null;
    }
  }, [isConnecting]);

  return null;
}
