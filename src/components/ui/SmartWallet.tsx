import { BalanceVisibilityEyeIcon } from '../icons/BalanceVisibilityEyeIcon';
import React, { useState } from 'react';


interface SmartWalletProps {
  className?: string;
  username?: string;
  address?: string;
  totalIncome?: number;
  weeklyYield?: number;
  historicalYield?: number;
}

export const SmartWallet: React.FC<SmartWalletProps> = ({ 
  className = '',
  username = 'Satoshi Nakamoto',
  address = '0x0000000000000000000000000000000000000000',
  totalIncome = 0,
  weeklyYield = 0,
  historicalYield = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  // استخراج ۴ کاراکتر آخر آدرس کیف پول
  const shortAddress = address && address.length >= 4 ? address.slice(-4) : '0000';

  const WALLET_CARDS = [
    {
      id: 1,
      type: 'Total Income',
      balance: totalIncome,
      cardGradient: 'from-[#D8B4FE] to-[#A855F7]',
    },
    {
      id: 2,
      type: 'This Week',
      balance: weeklyYield,
      cardGradient: 'from-[#93C5FD] to-[#3B82F6]',
    },
    {
      id: 3,
      type: 'Last Week',
      balance: historicalYield,
      cardGradient: 'from-[#FDBA74] to-[#F97316]',
    },
  ];

  const handleWalletClick = () => {
    setActiveIndex((prev) => (prev + 1) % WALLET_CARDS.length);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="relative w-[340px] h-[220px] cursor-pointer group perspective-1000"
        onClick={handleWalletClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleWalletClick();
          }
        }}
        aria-label="Cycle wallet cards"
      >
        {/* سایه اصلی زیر کل دسته کارت‌ها */}
        <div className="absolute inset-0 bg-black/20 blur-2xl rounded-3xl translate-y-8 scale-90"></div>

        {WALLET_CARDS.map((card, idx) => {
          // محاسبه موقعیت کارت‌ها به صورت چرخشی (Ring Buffer)
          const offset = (idx - activeIndex + WALLET_CARDS.length) % WALLET_CARDS.length;

          let transformClass = '';
          let zIndexClass = '';

          // منطق قرارگیری کارت‌ها به صورت ۳ بعدی
          if (offset === 0) {
            // کارت جلویی (Active)
            transformClass = 'translate-y-0 scale-100 opacity-100 shadow-[0_20px_40px_rgba(0,0,0,0.2)]';
            zIndexClass = 'z-30';
          } else if (offset === 1) {
            // کارت وسط
            transformClass = '-translate-y-6 scale-95 opacity-80 shadow-md';
            zIndexClass = 'z-20';
          } else {
            // کارت پشتی
            transformClass = '-translate-y-12 scale-90 opacity-50 shadow-sm';
            zIndexClass = 'z-10';
          }

          return (
            <div
              key={card.id}
              className={`absolute bottom-0 w-full h-[190px] rounded-[1.5rem] bg-gradient-to-br ${card.cardGradient} p-5 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${transformClass} ${zIndexClass}`}
            >
              {/* افکت شیشه مات روی هر کارت */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-[1.5rem] pointer-events-none border border-white/40"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* بخش بالایی کارت: نام و نوع */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-white/80 text-[11px] font-bold tracking-widest uppercase drop-shadow-sm block mb-1">
                      {card.type}
                    </span>
                    <span className="text-white font-black text-lg drop-shadow-md tracking-wide block">
                      {username}
                    </span>
                  </div>
                  <span className="font-thin text-white/90 text-xl drop-shadow-md tracking-tighter">
                    VISA
                  </span>
                </div>
                
                {/* بخش پایینی کارت: شماره و موجودی */}
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-white/80 font-mono text-xs tracking-[0.2em] drop-shadow-sm block mb-1.5">
                      **** **** **** {shortAddress}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-3xl font-black tracking-tight drop-shadow-md">
                        {showBalance 
                          ? `$${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : '*****'}
                      </span>
                    </div>
                  </div>

                  {/* دکمه مخفی کردن موجودی (فقط در کارت جلویی فعال است) */}
                  {offset === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full transition-all shadow-inner active:scale-95"
                    >
                      <BalanceVisibilityEyeIcon
                        showBalance={showBalance}
                        className="text-white"
                        width={18}
                        height={18}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};