import { useCallback, useState } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { disconnectWalletSession } from '../utils/disconnectWalletSession';

export function useDisconnectWallet() {
  const config = useConfig();
  const { connector } = useAccount();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const disconnectWallet = useCallback(async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);
    try {
      await disconnectWalletSession(config, connector ?? undefined);
    } finally {
      setIsDisconnecting(false);
    }
  }, [config, connector, isDisconnecting]);

  return { disconnectWallet, isDisconnecting };
}
