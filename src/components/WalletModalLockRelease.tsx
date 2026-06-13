import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { releaseWalletModalLocks } from '../utils/releaseWalletModalLocks';

/** Clears RainbowKit body scroll locks after navigation — safe, no DOM teardown. */
export function WalletModalLockRelease() {
  const location = useLocation();

  useEffect(() => {
    releaseWalletModalLocks();
  }, [location.pathname, location.search]);

  return null;
}

/** Unfreeze sidebar scroll / clicks after a wallet modal attempt. */
export function useReleaseLocksOnSidebarOpen(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    releaseWalletModalLocks();
  }, [isOpen]);
}
