import { useCallback } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { markUserWalletConnectIntent } from '../utils/walletConnectIntent';

/** RainbowKit connect modal — marks user intent so mobile help does not flash on auto-reconnect. */
export function useOpenConnectModal() {
  const { openConnectModal, connectModalOpen } = useConnectModal();

  const open = useCallback(() => {
    markUserWalletConnectIntent();
    openConnectModal?.();
  }, [openConnectModal]);

  return { openConnectModal: open, connectModalOpen };
}
