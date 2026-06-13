const PURGE_FLAG = 'eone_legacy_accounts_purged_v1';

/** One-time cleanup of multi-wallet Accounts localStorage keys (wallet list, custom names, pending switch). */
export function purgeLegacyAccountsStorageOnce(): void {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(PURGE_FLAG) === '1') return;

  localStorage.removeItem('eone_registered_wallet_addresses');

  try {
    sessionStorage.removeItem('eone_pending_switch_wallet');
  } catch {
    /* ignore */
  }

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('wallet-name-')) keysToRemove.push(key);
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  localStorage.setItem(PURGE_FLAG, '1');
}
