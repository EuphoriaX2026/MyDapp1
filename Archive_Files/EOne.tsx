import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from "lucide-react";
import { useAccount, useReadContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import RegisterABI from '../abis/Register-titan.json';
import { useWallet } from '../hooks/useWallet';
import { Loader } from '../components/Loader';

/* =========================================
   1. NAVBAR COMPONENT
========================================= */
const navLinks = ["Home", "Services", "Exchange", "About", "Contact"];

interface NavbarProps {
  onConnect: () => void;
  isConnected: boolean;
  address?: string;
}

export function Navbar({ onConnect, isConnected, address }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-0 right-0 mx-auto w-[92%] max-w-6xl z-50">
      {/* Container with NO background/border */}
      <div className="relative px-2 py-2.5 flex items-center justify-between">
        
        {/* Left Side: Logo + Nav Menu (Moved closer to logo) */}
        <div className="flex items-center gap-10 lg:gap-20">
          {/* Custom Logo Image */}
          <a href="#" className="flex items-center shrink-0">
            {/* Ensure LOGO (2).png is in your public/assets/ folder */}
            <img 
              src="/assets/LOGO (2).png" 
              alt="E.ONE Logo" 
              className="h-7 md:h-10 w-auto object-contain drop-shadow-sm" 
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className={`px-3.5 py-1.5 text-sm rounded-full transition-all duration-200 ${
                  link === "Home"
                    ? "text-[#1a1a2e] font-bold"
                    : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-white/60"
                }`}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Connect Wallet Button (Fitted to Header Menu Style) */}
        <button 
          onClick={onConnect}
          className="hidden md:flex items-center justify-center px-7 py-2.5 rounded-full bg-white text-[#1a1a2e] text-sm transition-all duration-300 hover:bg-white/90 border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-pointer"
        >
          {isConnected && address 
            ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` 
            : "Connect Wallet"}
        </button>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-white/40 transition-colors text-[#1a1a2e]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_rgba(78,135,255,0.15)] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className={`px-4 py-2.5 text-sm rounded-xl transition-all ${
                  link === "Home"
                    ? "text-[#1a1a2e] font-bold bg-white/60"
                    : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-white/40"
                }`}
              >
                {link}
              </a>
            ))}
          </div>
          <button 
            onClick={onConnect}
            className="mt-4 w-full flex items-center justify-center px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm shadow-sm border border-gray-100"
          >
            {isConnected && address 
              ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` 
              : "Connect Wallet"}
          </button>
        </div>
      )}
    </nav>
  );
}

/* =========================================
   2. HERO SECTION
========================================= */
export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full pt-20 pb-16 md:pt-24 md:pb-24 flex items-center">
      {/* Mesh gradients (Refined color distribution and soft white fade) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Strong Blue - Focused Top Left */}
        <div
          className="absolute top-[-15%] left-[-10%] w-[130%] h-[120%] md:w-[1800px] md:h-[1500px]"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(78, 135, 255, 0.48) 0%, rgba(78, 135, 255, 0.15) 35%, transparent 70%)",
            filter: "blur(120px)",
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="max-w-xl">
          {/* Subtitle */}
          <p className="text-[11px] uppercase tracking-[0.25em] font-medium text-[#8E8E93] mb-6">
            Experience a new generation of features
          </p>

          {/* Main Title - Split into 3 lines, Uppercase */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.6rem] font-medium leading-[1.2] tracking-tight text-[#1a1a2e] mb-10 uppercase">
            IN BLOCKCHAIN, <br />
            CODES ARE TRUST AND <br />
            MATHEMATICS IS SURVIVAL.
          </h1>

          <button className="group flex items-center gap-3 px-8 py-4 rounded-full border border-[#d1d5db] bg-white/70 backdrop-blur-md text-[#1a1a2e] text-[15px] hover:bg-white hover:border-[#4E87FF]/40 hover:shadow-[0_8px_24px_rgba(78,135,255,0.2)] transition-all duration-300 cursor-pointer">
            Learn more
            <ArrowRight className="w-5 h-5 text-[#4E87FF] group-hover:text-[#DB2CF5] group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* --- COINS IMAGE (Side by Side, No Overlap) --- */}
        <div className="relative flex justify-center md:justify-end items-center z-20">
           <div className="relative w-full md:w-[110%] max-w-lg">
             {/* Static Premium Effect: Glowing Aura (38% Opacity) */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[#DB2CF5] to-[#4E87FF] rounded-full blur-[80px] opacity-[0.38] scale-90 pointer-events-none" />
             
             <img 
               src="/assets/Coins.png" 
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
   MAIN EXPORT (E.ONE)
========================================= */
export const EOne = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { isConnecting } = useWallet();

  const registerAddress = TITAN_CONTRACTS.Register;

  // Read User validity
  const { data: isRegistered, isFetched } = useReadContract({
    address: registerAddress as `0x${string}`,
    abi: RegisterABI.abi,
    functionName: 'isUserAddressRegistered',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Action logic
  useEffect(() => {
    if (isConnected && !isConnecting && isFetched) {
      if (isRegistered) {
        setIsLoading(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } else {
        setIsLoading(true);
        setTimeout(() => {
          navigate('/register');
        }, 1500);
      }
    }
  }, [isConnected, isConnecting, isRegistered, isFetched, navigate]);

  const handleConnect = () => {
    if (!isConnected) {
      openConnectModal?.();
    } else {
        // If already connected but somehow stuck, re-evaluate
        if (isFetched) {
            if (isRegistered) navigate('/');
            else navigate('/register');
        }
    }
  };

  if (isLoading || (isConnected && isConnecting)) {
    return <Loader />;
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap');
          
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
        style={{ fontFamily: '"Inter Tight", sans-serif' }}
      >
        <Navbar onConnect={handleConnect} isConnected={isConnected} address={address} />
        <HeroSection />
      </div>
    </>
  );
}
