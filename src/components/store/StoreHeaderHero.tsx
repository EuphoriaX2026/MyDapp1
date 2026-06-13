import { AppIcon } from '../icons/AppIcon';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { StoreSearchOverlay } from './StoreSearchOverlay';

const NAV_ITEMS = ['All', 'Cards', 'Turbo', 'Stocks', 'Education'] as const;
import { media } from '../../assets/media';

const LOGO_SRC = media.logos.main2;

// --- داده‌های اسلایدر (پشتیبانی از عکس و ویدیو) ---
const HERO_SLIDES = [
  {
    id: 1,
    type: 'image', // می‌تواند 'video' باشد
    src: 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?q=80&w=2000&auto=format&fit=crop', // عکس مشابه توروبراوو
    title: 'THE WAIT IS OVER',
    subtitle: "Air Jordan 4 'Toro Bravo' returns in all its bullish glory.",
    cta: 'Explore'
  },
  {
    id: 2,
    type: 'video',
    src: 'https://player.vimeo.com/external/536040854.sd.mp4?s=48dcbc5d43fbafec84fde90708f5d023f05cece8&profile_id=165&oauth2_token_id=57447761', // ویدیوی تستی
    title: 'FEEL THE AIR',
    subtitle: "Experience the new generation of Air Max.",
    cta: 'Shop Now'
  }
];

interface StoreHeaderHeroProps {
  onCartClick?: () => void;
  cartCount?: number;
  cartOpen?: boolean;
  onCloseCart?: () => void;
  cartPanel?: React.ReactNode;
}

export function StoreHeaderHero({
  onCartClick,
  cartCount = 0,
  cartOpen = false,
  onCloseCart,
  cartPanel,
}: StoreHeaderHeroProps) {
  const navigate = useNavigate();
  const { avatar, username } = useProfile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // منطق تغییر اسلاید
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

  const slide = HERO_SLIDES[currentSlide];

  return (
    // با استفاده از w-full این کامپوننت 100% عرض صفحه را پوشش می‌دهد
    <div className="w-full flex flex-col bg-white font-sans overflow-visible">
      
      {/* ========================================== */}
      {/* 1. NAVBAR (دقیقاً مشابه نایکی) */}
      {/* ========================================== */}
      <header className="relative grid w-full h-[60px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 border-b border-gray-100 z-50 bg-white overflow-visible">
        
        {/* Logo (top-left) — +20% size (h-5 → h-6) */}
        <a href="#" className="justify-self-start hover:opacity-70 transition-opacity" aria-label="E.ONE Home">
          <img src={LOGO_SRC} alt="E.ONE" className="h-6 w-auto object-contain" />
        </a>

        {/* Navigation — truly centered in the white header bar */}
        <nav className="hidden items-center justify-center gap-6 justify-self-center">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="relative text-[15px] font-bold text-black tracking-tight whitespace-nowrap transition-colors hover:text-gray-500 after:absolute after:inset-x-0 after:-bottom-[3px] after:h-[3px] after:bg-black after:scale-x-0 after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-4 justify-self-end">
          {/* Search trigger — opens the full-width mega search overlay */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden items-center bg-[#F5F5F5] rounded-full px-3 py-2 w-[180px] hover:bg-[#E5E5E5] transition-colors"
          >
            <AppIcon icon="lucide:search" className="w-5 h-5 text-black mr-2 shrink-0" strokeWidth={2} />
            <span className="bg-transparent text-sm font-medium text-gray-500 w-full text-left">Search</span>
          </button>
          
          {/* Avatar + cart — compact cluster */}
          <div className="flex items-center gap-0">
            <button
              type="button"
              aria-label="Go to Dashboard"
              onClick={() => navigate('/')}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <img
                src={avatar}
                alt={username}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </button>

            <div className="relative -ml-0.5">
            <button
              type="button"
              onClick={onCartClick}
              aria-label="Open cart"
              aria-expanded={cartOpen}
              className={`relative p-1.5 rounded-full transition-colors ${cartOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            >
              <AppIcon icon="lucide:shopping-bag" className="w-5 h-5 text-black" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {cartOpen && cartPanel && (
              <>
                <div
                  className="fixed inset-0 z-[80]"
                  aria-hidden
                  onClick={onCloseCart}
                />
                <div className="absolute right-0 top-full mt-2 z-[90] w-[min(400px,calc(100vw-1.5rem))]">
                  {cartPanel}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* 2. HERO SLIDER (100% Width) */}
      {/* ========================================== */}
      <div className="relative w-full h-[600px] overflow-hidden bg-black flex-shrink-0">
        
        {/* Media Background */}
        <div className="absolute inset-0 w-full h-full">
          {slide.type === 'video' ? (
            <video 
              src={slide.src} 
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              loop 
              muted 
              playsInline
            />
          ) : (
            <img 
              src={slide.src} 
              alt={slide.title} 
              className="w-full h-full object-cover"
            />
          )}
          {/* وینیت (Vignette) تیره برای خوانایی بهتر متن سفید */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Center Content (Typography & CTA) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pt-20">
          <h1 className="text-6xl font-thin text-white uppercase tracking-tighter leading-none mb-4 scale-y-110">
            {slide.title}
          </h1>
          <p className="text-white text-base font-medium mb-8">
            {slide.subtitle}
          </p>
          <button className="bg-white text-black font-bold text-sm px-8 py-3.5 rounded-full hover:bg-gray-200 transition-colors">
            {slide.cta}
          </button>
        </div>

        {/* Bottom Controls (Play/Pause, Arrows) */}
        <div className="absolute bottom-10 right-6 flex items-center gap-3 z-20">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            {isPlaying ? <AppIcon icon="lucide:pause" className="w-4 h-4 fill-white" /> : <AppIcon icon="lucide:play" className="w-4 h-4 fill-white" />}
          </button>
          <button 
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <AppIcon icon="lucide:chevron-left" className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button 
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            <AppIcon icon="lucide:chevron-right" className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

      </div>

      {/* Mega search overlay (full-screen, top layer) */}
      <StoreSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
