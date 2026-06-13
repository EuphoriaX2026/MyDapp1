import { useAccount } from 'wagmi';
import { AppIcon } from '../icons/AppIcon';
import {
  getWalletDeepLink,
  isInsecureWalletContext,
  openSafePalDappBrowser,
  shouldShowMobileWalletHelp,
  tryOpenWalletDeepLink,
} from '../../utils/mobileWalletLinks';
import { hasUserWalletConnectIntent } from '../../utils/walletConnectIntent';
import '../../styles/mobile-wallet-connect-help.css';

/**
 * Bottom sheet while the user waits for their chosen wallet app (WalletConnect).
 * Shown only after an explicit Connect Wallet action — not on auto-reconnect.
 */
export function MobileWalletConnectHelp() {
  const { status, connector } = useAccount();
  const showHelp = shouldShowMobileWalletHelp();
  const isUserConnecting = status === 'connecting';
  const walletName = connector?.name;
  const needsHttps = isInsecureWalletContext();
  const walletKey = walletName?.toLowerCase() ?? '';
  const isSafePal = walletKey.includes('safepal');

  if (!showHelp || !isUserConnecting || !walletName || !hasUserWalletConnectIntent()) {
    return null;
  }

  const handleOpenInWalletBrowser = () => {
    const pageUrl = window.location.href;
    const deepLink = walletName ? getWalletDeepLink(walletName, pageUrl) : null;
    if (deepLink) {
      tryOpenWalletDeepLink(deepLink);
      return;
    }
    if (isSafePal || needsHttps) {
      openSafePalDappBrowser(pageUrl);
    }
  };

  const showWalletBrowserBtn = Boolean(
    (walletName && getWalletDeepLink(walletName, window.location.href)) || isSafePal || needsHttps,
  );

  return (
    <div className="mobile-wallet-connect-help" role="status" aria-live="polite">
      <div className="mobile-wallet-connect-help__card">
        <p className="mobile-wallet-connect-help__title">
          <AppIcon icon="lucide:smartphone" width={18} height={18} />
          Waiting for {walletName}
        </p>
        <p className="mobile-wallet-connect-help__text">
          Open the {walletName} app and approve the connection under WalletConnect / Pending
          Requests.
        </p>
        {needsHttps ? (
          <p className="mobile-wallet-connect-help__warn">
            You are on HTTP. Deep links may not open wallet apps on emulators — use{' '}
            <strong>npm run dev:https</strong> or open the site inside your wallet&apos;s DApp
            browser.
          </p>
        ) : null}
        {showWalletBrowserBtn ? (
          <button
            type="button"
            className="mobile-wallet-connect-help__btn"
            onClick={handleOpenInWalletBrowser}
          >
            {isSafePal ? 'Open site in SafePal Browser' : `Open site in ${walletName}`}
          </button>
        ) : null}
        <p className="mobile-wallet-connect-help__hint">
          If nothing happens, install {walletName}, return here, tap Connect Wallet, and select the
          same wallet again.
        </p>
      </div>
    </div>
  );
}
