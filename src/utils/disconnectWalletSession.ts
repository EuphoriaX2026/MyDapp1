import { disconnect as wagmiDisconnect, type Config } from '@wagmi/core';
import type { Connector } from 'wagmi';
import { clearUserWalletConnectIntent } from './walletConnectIntent';
import { releaseWalletModalLocks } from './releaseWalletModalLocks';

const RAINBOWKIT_STORAGE_KEYS = ['rk-latest-id', 'rk-recent', 'WALLETCONNECT_DEEPLINK_CHOICE'] as const;

function clearPersistedWalletSession(config: Config): void {
  try {
    void config.storage?.removeItem('recentConnectorId');
    void config.storage?.removeItem('state');
  } catch {
    /* ignore */
  }

  if (typeof localStorage === 'undefined') return;

  RAINBOWKIT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  const wagmiKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('wagmi.')) wagmiKeys.push(key);
  }
  wagmiKeys.forEach((key) => localStorage.removeItem(key));
}

/** Full wallet logout — disconnects connector and clears wagmi / RainbowKit persistence. */
export async function disconnectWalletSession(
  config: Config,
  connector?: Connector,
): Promise<void> {
  releaseWalletModalLocks();
  clearUserWalletConnectIntent();

  try {
    await wagmiDisconnect(config, connector ? { connector } : {});
  } catch (err) {
    console.warn('[disconnectWalletSession] connector disconnect failed:', err);
  }

  clearPersistedWalletSession(config);
}
