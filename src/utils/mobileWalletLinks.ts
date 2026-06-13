import { isAndroid, isMobile } from './mobile';

/** Open a URL via deep link without replacing the current browser tab. */
export function tryOpenWalletDeepLink(url: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** SafePal in-app DApp browser — best path for BlueStacks (injected provider). */
export function buildSafePalDappBrowserLink(pageUrl: string): string {
  return `safepalwallet://dapp?url=${encodeURIComponent(pageUrl)}`;
}

/** Android intent fallback when custom scheme is blocked by the emulator browser. */
export function buildSafePalDappIntentLink(pageUrl: string): string {
  const encoded = encodeURIComponent(pageUrl);
  return `intent://dapp?url=${encoded}#Intent;scheme=safepalwallet;package=io.safepal.wallet;end`;
}

export function openSafePalDappBrowser(pageUrl?: string): void {
  const target = pageUrl ?? window.location.href;
  tryOpenWalletDeepLink(buildSafePalDappBrowserLink(target));
  if (isAndroid()) {
    window.setTimeout(() => {
      tryOpenWalletDeepLink(buildSafePalDappIntentLink(target));
    }, 700);
  }
}

const WALLET_LINKS: Record<string, (url: string) => string> = {
  safepal: buildSafePalDappBrowserLink,
  'safepal wallet': buildSafePalDappBrowserLink,
  trust: (url) => `trust://open_url?coin_id=137&url=${encodeURIComponent(url)}`,
  'trust wallet': (url) => `trust://open_url?coin_id=137&url=${encodeURIComponent(url)}`,
  tokenpocket: (url) => `tpoutside://pull.activity?param=${encodeURIComponent(url)}`,
  'token pocket': (url) => `tpoutside://pull.activity?param=${encodeURIComponent(url)}`,
};

export function getWalletDeepLink(walletName: string, pageUrl: string): string | null {
  const key = walletName.trim().toLowerCase();
  const resolver = WALLET_LINKS[key];
  if (!resolver) return null;
  return resolver(pageUrl);
}

export function isInsecureWalletContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol !== 'https:' && !/localhost|127\.0\.0\.1/.test(window.location.hostname);
}

export function shouldShowMobileWalletHelp(): boolean {
  return isMobile() && isAndroid();
}
