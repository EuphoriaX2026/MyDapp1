import { useCallback, useEffect, useState } from 'react';

type BeforeInstallPromptOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: BeforeInstallPromptOutcome; platform: string }>;
}

function isRunningAsInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    nav.standalone === true
  );
}

/**
 * Manages the deferred `beforeinstallprompt` event and native install flow.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isRunningAsInstalledPwa);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      console.log('PWA: deferred prompt saved');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('PWA: app installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('PWA: No installation prompt available');
      return false;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response to install prompt: ${outcome}`);

    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    return outcome === 'accepted';
  }, [deferredPrompt]);

  return {
    deferredPrompt,
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    triggerInstall,
  };
}
