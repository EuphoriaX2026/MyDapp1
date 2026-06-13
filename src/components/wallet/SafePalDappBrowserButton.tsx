import { AppIcon } from '../icons/AppIcon';
import { openSafePalDappBrowser, shouldShowMobileWalletHelp } from '../../utils/mobileWalletLinks';
import '../../styles/mobile-wallet-connect-help.css';

/** Android / BlueStacks — open the DApp inside SafePal for reliable injected connect. */
export function SafePalDappBrowserButton({ className = '' }: { className?: string }) {
  if (!shouldShowMobileWalletHelp()) return null;

  return (
    <button
      type="button"
      className={`mobile-wallet-safepal-btn ${className}`.trim()}
      onClick={() => openSafePalDappBrowser()}
    >
      <AppIcon icon="lucide:external-link" width={16} height={16} />
      Open in SafePal Browser
    </button>
  );
}
