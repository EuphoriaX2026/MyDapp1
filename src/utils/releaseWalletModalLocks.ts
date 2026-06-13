/** Clears scroll locks left behind by RainbowKit / WalletConnect modals. Never removes DOM nodes — React owns those. */

export function releaseWalletModalLocks(): void {
  if (typeof document === 'undefined') return;

  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
  document.documentElement.style.overflow = '';
  document.documentElement.style.paddingRight = '';

  document.body.removeAttribute('data-scroll-locked');
  document.documentElement.removeAttribute('data-scroll-locked');
}
