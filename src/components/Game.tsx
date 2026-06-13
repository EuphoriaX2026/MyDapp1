import React from 'react';
import EarningChart from '../components/EarningChart';
import { media } from '../assets/media';

export default function Game() {
  const slide1 = [
    {
      title: "CASINO",
      description: "DIVE INTO OUR IN-HOUSE\nGAMES LIVE CASINO AND SLOTS",
      imageUrl: media.game.casino, 
      gridClass: "col-span-1 row-span-2", 
      bgClass: "bg-gradient-to-br from-[#1a1025] to-[#3a1b5c]", 
      imageClass: "object-contain object-right-bottom w-[85%] h-[90%] left-auto right-0 bottom-0", 
    },
    { 
      title: "Market", 
      description: "EXPLORE THE LATEST\nMARKET TRENDS",
      imageUrl: media.game.market, 
      gridClass: "col-span-1 row-span-1", 
      bgClass: "bg-gradient-to-r from-[#171b3d] to-[#2b449e]", 
      imageClass: "object-contain object-right-bottom w-[75%] h-[100%] left-auto right-0 bottom-0",
    },
    { 
      title: "Points", 
      description: "EARN & REDEEM\nYOUR REWARDS",
      imageUrl: media.game.points, 
      gridClass: "col-span-1 row-span-1", 
      bgClass: "bg-gradient-to-r from-[#200e36] to-[#511e90]", 
      imageClass: "object-contain object-right-bottom w-[75%] h-[100%] left-auto right-0 bottom-0",
    }
  ];

  const slide2 = [
    {
      title: "Sports",
      description: "BET ON FOOTBALL CRICKET\nNFL ESPORTS",
      imageUrl: media.game.sports,
      gridClass: "col-span-1 row-span-2", 
      bgClass: "bg-gradient-to-br from-[#1a122e] via-[#2a1340] to-[#5a1c6a]", 
      imageClass: "object-contain object-right-bottom w-[85%] h-[100%] left-auto right-0 bottom-0", 
    },
    { 
      title: "RACING", 
      description: "FAST PACED ACTION\nAND TOURNAMENTS",
      imageUrl: media.game.magicBags, 
      gridClass: "col-span-1 row-span-1", 
      bgClass: "bg-gradient-to-r from-[#111322] to-[#1c2e52]", 
      imageClass: "object-contain object-right-bottom w-[75%] h-[90%] left-auto right-0 bottom-0",
    },
    { 
      title: "Turbo", 
      description: "JOIN THE ROOMS\nAND WIN BIG",
      imageUrl: media.game.turbo, 
      gridClass: "col-span-1 row-span-1", 
      bgClass: "bg-gradient-to-r from-[#1c121e] to-[#47152f]", 
      imageClass: "object-contain object-right-bottom w-[75%] h-[90%] left-auto right-0 bottom-0",
    }
  ];

  const renderCard = (card: any, index: number) => (
    <div
      key={index}
      className={`
        relative flex flex-col overflow-hidden group transition-all duration-300 ease-out
        cursor-pointer active:scale-[0.98]
        ${card.bgClass}
        ${card.gridClass}
      `}
      style={{
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)", 
      }}
    >
      {/* تصویر در سمت راست-پایین */}
      <img
        src={card.imageUrl}
        alt={card.title}
        className={`absolute z-0 transition-transform duration-700 ease-out group-hover:scale-105 ${card.imageClass}`}
      />
      
      {/* سایه گرادیانت برای خوانایی بهتر متن‌ها */}
      <div className="absolute inset-y-0 left-0 w-[80%] bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10 pointer-events-none"></div>
      
      {/* محتوا در سمت چپ-بالا */}
      <div className="relative z-20 flex flex-col justify-start items-start text-left pt-3 pl-3 w-full h-full pointer-events-none">
        <h3 className="text-white text-sm font-bold uppercase tracking-wide drop-shadow-md">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-white/70 text-[9px] font-medium whitespace-pre-line mt-1 leading-snug tracking-wide drop-shadow-md">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-transparent flex flex-col gap-6 overflow-hidden pt-2 pb-6">
        
      <div className="w-full relative">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          <div className="min-w-full flex-shrink-0 snap-center grid grid-cols-2 gap-3 auto-rows-[110px] px-1">
            {slide1.map((card, index) => renderCard(card, index))}
          </div>

          <div className="min-w-full flex-shrink-0 snap-center grid grid-cols-2 gap-3 auto-rows-[110px] px-1">
            {slide2.map((card, index) => renderCard(card, index))}
          </div>

        </div>
      </div>

      <div className="w-full px-1">
        <EarningChart />
      </div>

    </div>
  );
}
