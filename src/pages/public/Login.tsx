import { AppIcon } from '../../components/icons/AppIcon';
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { normalizePathname } from '../../utils/appRoutes';
import { useAccount } from 'wagmi';
import { useOpenConnectModal } from '../../hooks/useOpenConnectModal';
import { useDisconnectWallet } from '../../hooks/useDisconnectWallet';
import { useIsWalletRegistered } from '../../hooks/useIsWalletRegistered';
import { SafePalDappBrowserButton } from '../../components/wallet/SafePalDappBrowserButton';
import { isMobile } from '../../utils/mobile';
import { useWallet } from '../../hooks/useWallet';
import { Loader } from '../../components/Loader';
import { LegalDisclaimerModal } from '../../components/ui/LegalDisclaimerModal';
import { useDisclaimer } from '../../hooks/useDisclaimer';
import { media } from '../../assets/media';

/* =========================================
   1. NAVBAR COMPONENT
========================================= */
const NAV_LINKS = [
  { name: 'Home', path: '/login' },
  { name: 'Services', path: '/services' },
  { name: 'EDex', path: '/public-edex' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
] as const;

interface NavbarProps {
  onConnect: () => void;
  isConnected: boolean;
  address?: string;
  /** Glass pill bar — use on Public EDex only; Login keeps default layout */
  variant?: 'default' | 'glass';
  /** Shown when wallet is not connected (e.g. Register / Login on landing) */
  connectLabel?: string;
  /** Public EDex: tap connected wallet → Disconnect only */
  walletMenuVariant?: 'disconnect' | 'login';
  walletMenuOpen?: boolean;
  onWalletContinue?: () => void;
  walletContinueLabel?: string;
  onDisconnect?: () => void;
  isDisconnecting?: boolean;
}

export function Navbar({
  onConnect,
  isConnected,
  address,
  variant = 'default',
  connectLabel = 'Connect Wallet',
  walletMenuVariant,
  walletMenuOpen = false,
  onWalletContinue,
  walletContinueLabel = 'Login',
  onDisconnect,
  isDisconnecting = false,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePath = normalizePathname(location.pathname);

  const connectButtonText =
    isConnected && address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : connectLabel;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (path !== '#') {
      navigate(path);
      setMobileOpen(false);
    }
  };

  const isNavLinkActive = (link: (typeof NAV_LINKS)[number]) => {
    if (link.path === '#') return false;
    const normalized = normalizePathname(link.path);
    if (variant === 'glass') {
      return activePath === normalized;
    }
    return link.name === 'Home' && (activePath === '/login' || activePath === '/');
  };

  const desktopLinkClass = (link: (typeof NAV_LINKS)[number]) => {
    const active = isNavLinkActive(link);
    if (variant === 'glass') {
      return `px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 ${
        active
          ? 'text-[#1a1a2e] font-bold'
          : 'text-[#374151] hover:text-[#1a1a2e] hover:bg-white/60'
      }`;
    }
    return `px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 ${
      active
        ? 'text-[#1a1a2e] font-bold'
        : 'text-[#6b7280] hover:text-[#1a1a2e] hover:bg-white/60'
    }`;
  };

  const mobileLinkClass = (link: (typeof NAV_LINKS)[number]) => {
    const active = isNavLinkActive(link);
    if (variant === 'glass') {
      return `px-4 py-2.5 text-sm rounded-xl transition-all ${
        active
          ? 'text-[#1a1a2e] font-bold bg-white/60'
          : 'text-[#374151] hover:text-[#1a1a2e] hover:bg-white/40'
      }`;
    }
    return `px-4 py-2.5 text-sm rounded-xl transition-all ${
      active
        ? 'text-[#1a1a2e] font-bold bg-white/60'
        : 'text-[#6b7280] hover:text-[#1a1a2e] hover:bg-white/40'
    }`;
  };

  const logoClassName =
    variant === 'glass'
      ? 'h-5 md:h-7 w-auto object-contain drop-shadow-sm'
      : 'h-7 md:h-10 w-auto object-contain drop-shadow-sm';

  const navBarRow = (
    <>
      <div className="relative flex items-center justify-between py-2.5">
        {/* Left Side: Logo + Nav Menu (Grouped together) */}
        <div className="flex items-center gap-12 justify-start flex-1">
          {/* Custom Logo Image */}
          <a href="#" className="flex items-center shrink-0">
            <img 
              src={media.logos.main2} 
              alt="E.ONE Logo" 
              className={logoClassName} 
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={desktopLinkClass(link)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Right Side: Connect Wallet Button (Isolated and Prominent) */}
        <div className="relative flex items-center" data-wallet-menu>
          <button
            type="button"
            onClick={onConnect}
            disabled={isDisconnecting}
            className="hidden md:flex items-center justify-center px-7 py-2.5 rounded-full bg-white text-[#1a1a2e] text-sm transition-all duration-300 hover:bg-white/90 border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer disabled:opacity-60"
          >
            {connectButtonText}
          </button>
          {walletMenuVariant && isConnected && walletMenuOpen ? (
            <div
              className={`absolute left-1/2 top-full z-[60] mt-2 hidden min-w-[11rem] -translate-x-1/2 overflow-hidden rounded-2xl md:block ${
                variant === 'glass'
                  ? 'border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl'
                  : 'border border-white/40 bg-white/95 shadow-xl backdrop-blur-xl'
              }`}
            >
              {walletMenuVariant === 'login' && onWalletContinue ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWalletContinue();
                  }}
                  className={`w-full px-4 py-3 text-center text-sm font-medium uppercase tracking-wider transition-colors border-b ${
                    variant === 'glass'
                      ? 'border-white/15 text-white hover:bg-white/15'
                      : 'border-gray-100 text-[#1a1a2e] hover:bg-white/80'
                  }`}
                >
                  {walletContinueLabel}
                </button>
              ) : null}
              {onDisconnect ? (
                <button
                  type="button"
                  disabled={isDisconnecting}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDisconnect();
                  }}
                  className={`w-full px-4 py-3 text-center text-sm font-medium uppercase tracking-wider transition-colors disabled:opacity-60 ${
                    variant === 'glass'
                      ? 'text-white hover:bg-white/15'
                      : 'text-[#1a1a2e] hover:bg-white/80'
                  }`}
                >
                  {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/40 transition-colors text-[#1a1a2e]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <AppIcon icon="lucide:x" className="w-6 h-6" /> : <AppIcon icon="lucide:menu" className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_rgba(78,135,255,0.15)] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
                className={mobileLinkClass(link)}
              >
                {link.name}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={onConnect}
            disabled={isDisconnecting}
            className="mt-4 w-full flex items-center justify-center px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm shadow-sm border border-gray-100 disabled:opacity-60"
          >
            {connectButtonText}
          </button>
          {isConnected && onDisconnect ? (
            <div className="mt-2 flex flex-col gap-2">
              {walletMenuVariant === 'login' && onWalletContinue ? (
                <button
                  type="button"
                  onClick={onWalletContinue}
                  className="w-full flex items-center justify-center px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-bold shadow-sm border border-gray-100"
                >
                  {walletContinueLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onDisconnect}
                disabled={isDisconnecting}
                className={`w-full flex items-center justify-center px-5 py-3 rounded-full text-sm font-bold disabled:opacity-60 ${
                  variant === 'glass'
                    ? 'border border-white/20 bg-white/10 text-white backdrop-blur-lg hover:bg-white/15'
                    : 'border border-gray-200 bg-white/90 text-[#1a1a2e]'
                }`}
              >
                {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );

  return (
    <nav
      className={
        variant === 'glass'
          ? 'fixed top-4 left-0 right-0 z-50 w-full'
          : 'fixed top-4 left-0 right-0 mx-auto w-full max-w-7xl z-50 px-6 md:px-10'
      }
    >
      {variant === 'glass' ? (
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-0 h-full w-screen -translate-x-1/2 bg-white/5 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          aria-hidden
        />
      ) : null}
      {variant === 'glass' ? (
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">{navBarRow}</div>
      ) : (
        navBarRow
      )}
    </nav>
  );
}

/* =========================================
   2. HERO SECTION
========================================= */
export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full pt-36 pb-16 md:pt-24 md:pb-24 flex items-center">
      {/* Mesh gradients (Refined color distribution and soft white fade) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Strong Blue - Extended from Top Left to Bottom Left */}
        <div
          className="absolute top-[-15%] left-[-10%] w-[130%] h-[150%] md:w-[1800px] md:h-[2000px]"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, rgba(78, 135, 255, 0.62) 0%, rgba(78, 135, 255, 0.12) 40%, transparent 80%)",
            filter: "blur(140px)",
          }}
        />

        {/* Intense Pink - Focused Top/Center Right */}
        <div
          className="absolute top-[-5%] -right-[10%] w-[110%] h-[120%] md:w-[1500px] md:h-[1500px]"
          style={{
            background:
              "radial-gradient(circle at 80% 35%, rgba(219, 44, 245, 0.65) 0%, rgba(219, 44, 245, 0.22) 50%, transparent 85%)",
            filter: "blur(130px)",
          }}
        />

        {/* Soft Blending Layer for Bottom White Fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/80 to-transparent z-[1]"
        />

        {/* Soft Purple Transition Halo (Intersectional) */}
        <div
          className="absolute top-[20%] left-[30%] w-[60%] h-[60%] md:w-[1000px] md:h-[1000px] opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, rgba(219, 44, 245, 0.15) 0%, rgba(78, 135, 255, 0.1) 50%, transparent 80%)",
            filter: "blur(150px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="max-w-xl">
          {/* Subtitle */}
          <p className="text-[11px] uppercase tracking-[0.25em] font-medium text-[#71717A] mb-6">
            Experience a new generation of features
          </p>

          {/* Main Title - Reverted to Uppercase / 3 Lines */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.6rem] font-medium leading-[1.2] tracking-tight text-[#1a1a2e] mb-10 uppercase">
            IN BLOCKCHAIN, <br />
            CODES ARE TRUST AND <br />
            MATHEMATICS IS SURVIVAL.
          </h1>

          <button className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d1d5db] bg-white/70 backdrop-blur-md text-[#1a1a2e] text-[13px] hover:bg-white hover:border-[#4E87FF]/40 hover:shadow-[0_8px_24px_rgba(78,135,255,0.2)] transition-all duration-300 cursor-pointer">
            Learn more
            <AppIcon icon="lucide:arrow-right" className="w-5 h-5 text-[#4E87FF] group-hover:text-[#DB2CF5] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* --- COINS IMAGE (Side by Side, No Overlap) --- */}
        <div className="relative flex justify-center md:justify-end items-center z-20 mt-6 md:mt-0">
           <div className="relative w-full md:w-[110%] max-w-lg">
             {/* Static Premium Effect: Glowing Aura (38% Opacity) */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[#DB2CF5] to-[#4E87FF] rounded-full blur-[80px] opacity-[0.38] scale-90 pointer-events-none" />
             
             <img 
               src={media.logos.coins} 
               alt="E.ONE Trading Assets" 
               className="relative w-full h-auto object-contain drop-shadow-2xl"
             />
           </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   MAIN EXPORT (LOGIN)
========================================= */
export const Login = () => {
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const [isLoading, setIsLoading] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useOpenConnectModal();
  const { disconnectWallet, isDisconnecting } = useDisconnectWallet();
  const { isConnecting } = useWallet();
  /** Wallet already connected on first paint (e.g. Home from public-edex) — do not auto-redirect */
  const connectedOnArrivalRef = useRef(isConnected);

  const { isRegistered, isFetched } = useIsWalletRegistered();

  useEffect(() => {
    if (!isConnected) {
      connectedOnArrivalRef.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    if (!walletMenuOpen) return;
    const close = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-wallet-menu]')) return;
      setWalletMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [walletMenuOpen]);

  // Redirect only after the user connects on this page (not when visiting while already connected)
  useEffect(() => {
    if (connectedOnArrivalRef.current) return;
    if (!isConnected || isConnecting || !isFetched) return;

    setIsLoading(true);
    const target = isRegistered ? '/' : '/register';
    const timer = setTimeout(() => {
      navigate(target, { replace: true });
    }, 600);
    return () => clearTimeout(timer);
  }, [isConnected, isConnecting, isRegistered, isFetched, navigate]);

  const handleConnect = () => {
    if (!isConnected) {
      setWalletMenuOpen(false);
      openConnectModal?.();
      return;
    }
    setWalletMenuOpen((open) => !open);
  };

  const handleWalletContinue = () => {
    setWalletMenuOpen(false);
    if (!isFetched) return;
    if (isRegistered) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  const handleDisconnect = () => {
    setWalletMenuOpen(false);
    void disconnectWallet();
  };

  const walletContinueLabel = isRegistered ? 'Login' : 'Register';

  const connectLabel =
    isConnected && address
      ? undefined
      : !address || !isFetched
        ? 'Register'
        : isRegistered
          ? 'Login'
          : 'Register';

  if (isLoading || (isConnected && isConnecting)) {
    return <Loader />;
  }

  return (
    <>
      <LegalDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={acceptDisclaimer}
        onDecline={() => {
          window.location.href = 'https://google.com';
        }}
      />

      <style>
        {`
          @keyframes wave {
            0%, 100% { transform: translateX(0px) rotate(0deg); }
            25% { transform: translateX(-15px) rotate(-1deg); }
            75% { transform: translateX(15px) rotate(1deg); }
          }
        `}
      </style>

      {/* Main Wrapper */}
      <div 
        className="bg-[#F8F9FE] text-[#1a1a2e] min-h-screen w-full overflow-x-hidden flex flex-col selection:bg-[#DB2CF5] selection:text-white relative"
      >
        <Navbar
          onConnect={handleConnect}
          isConnected={isConnected}
          address={address}
          connectLabel={connectLabel ?? 'Register'}
          walletMenuVariant={isConnected ? 'login' : undefined}
          walletMenuOpen={walletMenuOpen}
          onWalletContinue={handleWalletContinue}
          walletContinueLabel={walletContinueLabel}
          onDisconnect={handleDisconnect}
          isDisconnecting={isDisconnecting}
        />
        {isMobile() && !isConnected ? (
          <div className="fixed bottom-4 left-1/2 z-40 w-[min(28rem,calc(100vw-24px))] -translate-x-1/2 px-3">
            <SafePalDappBrowserButton className="w-full" />
          </div>
        ) : null}
        <HeroSection />
      </div>
    </>
  );
}
