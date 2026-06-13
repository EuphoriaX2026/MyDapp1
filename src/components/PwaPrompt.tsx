import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { usePwaInstall } from '../hooks/usePwaInstall';
import '../styles/pwa-prompt.css';

const DISMISS_KEY = 'eone-pwa-install-dismissed';

/**
 * Captures `beforeinstallprompt`, shows a custom install CTA, and can
 * optionally auto-prompt after wallet connection.
 */
export const PwaPrompt = () => {
  const { isConnected } = useAccount();
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isConnected || !isInstallable || dismissed) return;

    const timer = window.setTimeout(() => {
      void triggerInstall();
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [isConnected, isInstallable, dismissed, triggerInstall]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const handleInstallClick = () => {
    void triggerInstall();
  };

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="pwa-install-banner" role="region" aria-label="Install E.ONE app">
      <div className="pwa-install-banner__copy">
        <p className="pwa-install-banner__title">Install E.ONE</p>
        <p className="pwa-install-banner__desc">
          Add to your home screen for full-screen Web3 access and faster reloads.
        </p>
      </div>
      <div className="pwa-install-banner__actions">
        <button
          type="button"
          className="pwa-install-banner__btn pwa-install-banner__btn--primary"
          onClick={handleInstallClick}
        >
          Install App
        </button>
        <button
          type="button"
          className="pwa-install-banner__btn pwa-install-banner__btn--ghost"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
