import { AppIcon } from '../icons/AppIcon';
import React, { useState, useEffect, useRef } from 'react';
import { formatUsd } from '../../utils/formatNumber';

interface StoreSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// دیتای تستی برای پیشنهادها و محصولات (در آینده از کانتراکت Lens خوانده می‌شود)
const MOCK_SUGGESTIONS = ["men's shoes", "men's shorts", "nike techs men", "men slides"];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Air Jordan 4 "Toro"', category: "Men's Shoes", price: 220, img: 'https://placehold.co/400x500/f5f5f5/333?text=Jordan+4' },
  { id: 2, name: 'Air Jordan 3 "World\'s Best"', category: "Men's Shoes", price: 215, img: 'https://placehold.co/400x500/f5f5f5/333?text=Jordan+3' },
  { id: 3, name: 'Air Jordan 1 Retro Low OG "Banned"', category: "Men's Shoes", price: 145, img: 'https://placehold.co/400x500/f5f5f5/333?text=Jordan+1' },
  { id: 4, name: 'Nike Air Force 1 \'07', category: "Men's Shoes", price: 115, img: 'https://placehold.co/400x500/f5f5f5/333?text=Air+Force+1' },
  { id: 5, name: 'Nike Free Metcon 7', category: "Men's Training Shoes", price: 125, img: 'https://placehold.co/400x500/f5f5f5/333?text=Metcon+7' },
];

export function StoreSearchOverlay({ isOpen, onClose }: StoreSearchOverlayProps) {
  const [query, setQuery] = useState('men');
  const inputRef = useRef<HTMLInputElement>(null);

  // فوکوس خودکار روی اینپوت هنگام باز شدن
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // قفل کردن اسکرول صفحه زیرین
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // تابع هوشمند برای بولد کردن کلمه سرچ شده در میان پیشنهادات
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span className="text-[#757575]">
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <strong key={i} className="text-black font-medium">{part}</strong> 
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      {/* پنل سفید اصلی (Mega Menu) */}
      <div className="w-full bg-white min-h-[400px] max-h-[85vh] overflow-y-auto pb-10 animate-in slide-in-from-top-4 duration-300">
        
        {/* ======================= */}
        {/* 1. Header Row (نوار جستجو) */}
        {/* ======================= */}
        <div className="w-full px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer hidden">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="black">
              <path d="M21.94 5.46c-2.3-1.04-5.32-1.05-8.15-.36-2.58.62-4.91 1.76-6.84 3.23-1.63 1.25-3.04 2.82-4.14 4.54-.7.1-.98-.22-1.09-.43-.16-.32-.23-.88.16-1.52.48-.82 1.48-1.5 2.85-2.02.43-.16.63-.64.44-1.06-.18-.42-.65-.63-1.07-.46-1.74.65-3.05 1.57-3.72 2.7-.49.83-.54 1.76-.14 2.5.47 1.01 1.5 1.51 2.92 1.41 1.34 2.1 3.22 3.86 5.48 5.16 2.07 1.19 4.38 1.83 6.7 1.83 2.14 0 4.14-.54 5.92-1.59 2.06-1.22 3.65-2.92 4.67-4.98 1.05-2.12 1.39-4.3.99-6.35-.34-1.74-1.56-3.15-3.56-4.06zm-.94 7.21c-.81 1.63-2.07 2.98-3.71 3.95-1.42.84-3.02 1.27-4.72 1.27-1.85 0-3.69-.5-5.35-1.46-1.84-1.07-3.41-2.58-4.63-4.39.23-.03.47-.07.72-.11 3.03-.54 5.86-1.84 8.2-3.79 1.71-1.42 3.2-3.16 4.38-5.1.04-.08.08-.15.12-.23 1.24.59 2.1 1.55 2.33 2.76.27 1.43-.04 3.05-.8 4.7z"/>
            </svg>
          </div>

          {/* Search Input Centered */}
          <div className="flex-1 max-w-3xl mx-auto flex items-center bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors rounded-full px-4 py-2.5 group">
            <AppIcon icon="lucide:search" className="w-5 h-5 text-black mr-3 shrink-0" strokeWidth={2} />
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search" 
              className="bg-transparent text-base font-medium text-black placeholder-gray-500 w-full focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                <AppIcon icon="lucide:x" className="w-4 h-4 text-black" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Cancel Button */}
          <div className="flex-shrink-0 ml-6">
            <button onClick={onClose} className="text-[15px] font-medium text-black hover:text-gray-500 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* ======================= */}
        {/* 2. AI & Results Area */}
        {/* ======================= */}
        {query.trim().length > 0 && (
          <div className="w-full mx-auto px-6 mt-4 flex flex-col gap-10">
            
            {/* Left Column: Suggestions */}
            <div className="w-full flex-shrink-0">
              <h3 className="text-gray-400 text-xs font-medium mb-4 tracking-wide">Top Suggestions</h3>
              <ul className="flex flex-col gap-3">
                {MOCK_SUGGESTIONS.map((suggestion, idx) => (
                  <li key={idx} className="text-lg cursor-pointer hover:text-black transition-colors">
                    {renderHighlightedText(suggestion, query)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: AI + Products */}
            <div className="flex-1 flex flex-col">
              
              {/* E.ONE AI Banner */}
              <div className="flex items-center gap-3 mb-8 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#E5F7A3] flex items-center justify-center transition-transform group-hover:scale-110">
                  <AppIcon icon="lucide:sparkles" className="w-5 h-5 text-black" strokeWidth={2} />
                </div>
                <span className="text-base font-bold text-black">
                  Ask E.ONE AI: <span className="font-normal">{query}</span>
                </span>
              </div>

              {/* Product Grid (Horizontal Scroll on Mobile, Grid on Desktop) */}
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x hide-scrollbar">
                {MOCK_PRODUCTS.map((product) => (
                  <div key={product.id} className="min-w-[200px] w-full snap-start cursor-pointer group">
                    {/* تصویر با پس زمینه خاکستری خنثی نایکی */}
                    <div className="w-full aspect-[4/5] bg-[#f5f5f5] mb-3 overflow-hidden">
                      <img 
                        src={product.img} 
                        alt={product.name} 
                        className="w-full h-full object-contain mix-blend-multiply scale-90 group-hover:scale-100 transition-transform duration-500"
                      />
                    </div>
                    {/* اطلاعات محصول */}
                    <div className="flex flex-col gap-0.5 pr-2">
                      <h4 className="text-base font-medium text-black leading-tight">{product.name}</h4>
                      <p className="text-[15px] text-[#757575]">{product.category}</p>
                      <p className="text-[15px] font-medium text-black mt-1">{formatUsd(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
