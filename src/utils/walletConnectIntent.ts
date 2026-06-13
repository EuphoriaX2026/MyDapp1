/** True only after the user opens the RainbowKit connect modal in this session. */
let userInitiatedWalletConnect = false;

export function markUserWalletConnectIntent(): void {
  userInitiatedWalletConnect = true;
}

export function clearUserWalletConnectIntent(): void {
  userInitiatedWalletConnect = false;
}

export function hasUserWalletConnectIntent(): boolean {
  return userInitiatedWalletConnect;
}
