import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { clearUserWalletConnectIntent } from '../../utils/walletConnectIntent';

/** Clears connect intent once the session settles (connected or idle). */
export function WalletConnectIntentSync() {
  const { status } = useAccount();

  useEffect(() => {
    if (status === 'connected' || status === 'disconnected') {
      clearUserWalletConnectIntent();
    }
  }, [status]);

  return null;
}
