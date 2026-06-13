import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { normalizePathname } from '../../utils/appRoutes';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { Navbar } from './Login';
import { PublicCosmicBackground } from '../../components/ui/PublicCosmicBackground';
import { LegalDisclaimerModal } from '../../components/ui/LegalDisclaimerModal';
import { useDisclaimer } from '../../hooks/useDisclaimer';

const FOG_MASK = 'linear-gradient(to bottom, transparent 0%, black 35%)';

const PAGE_TITLES: Record<string, string> = {
  services: 'Services',
  about: 'About',
  contact: 'Contact',
};

const PATH_TO_PAGE: Record<string, keyof typeof PAGE_TITLES> = {
  '/services': 'services',
  '/about': 'about',
  '/contact': 'contact',
};

export function PublicInfoPage() {
  const location = useLocation();
  const pageKey = PATH_TO_PAGE[normalizePathname(location.pathname)] ?? 'services';
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const title = PAGE_TITLES[pageKey];

  const handleConnect = useCallback(() => {
    if (!isConnected) {
      setWalletMenuOpen(false);
      openConnectModal?.();
      return;
    }
    setWalletMenuOpen((open) => !open);
  }, [isConnected, openConnectModal]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setWalletMenuOpen(false);
  }, [disconnect]);

  return (
    <>
      <LegalDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={acceptDisclaimer}
        onDecline={() => {
          window.location.href = 'https://google.com';
        }}
      />

      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#02071A]">
        <PublicCosmicBackground />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[60%] border-t border-white/20 bg-white/10 backdrop-blur-3xl"
          aria-hidden
          style={{
            maskImage: FOG_MASK,
            WebkitMaskImage: FOG_MASK,
          }}
        />

        <Navbar
          variant="glass"
          onConnect={handleConnect}
          isConnected={isConnected}
          address={address}
          connectLabel="Connect Wallet"
          walletMenuVariant="disconnect"
          walletMenuOpen={walletMenuOpen}
          onDisconnect={handleDisconnect}
        />

        <main className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-16">
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-md text-center text-sm font-medium text-white/80">
            Coming soon.
          </p>
        </main>
      </div>
    </>
  );
}

export default PublicInfoPage;
