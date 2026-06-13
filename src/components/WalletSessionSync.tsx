import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { purgeLegacyAccountsStorageOnce } from '../utils/purgeLegacyAccountsStorage';

/**
 * Invalidates cached wallet reads when the connected account changes or disconnects.
 * Prevents stale balances / contract data from a previous wallet session.
 */
export function WalletSessionSync() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const prevAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    purgeLegacyAccountsStorageOnce();
  }, []);

  useEffect(() => {
    const current = isConnected && address ? address.toLowerCase() : undefined;
    const previous = prevAddressRef.current;

    if (previous === current) return;

    prevAddressRef.current = current;

    if (previous !== undefined || current !== undefined) {
      void queryClient.invalidateQueries();
    }
  }, [address, isConnected, queryClient]);

  return null;
}
