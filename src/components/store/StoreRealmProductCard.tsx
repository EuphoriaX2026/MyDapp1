import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StoreRealmProduct } from '../../data/storeRealmProducts';

interface StoreRealmProductCardProps {
  product: StoreRealmProduct;
  onAdd: (product: StoreRealmProduct) => void;
}

export function StoreRealmProductCard({ product, onAdd }: StoreRealmProductCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      onClick={() => navigate(`/nft-details/${product.id}`)}
      className="group relative flex h-[480px] w-full max-w-[320px] cursor-pointer overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3 mx-auto"
      style={{
        boxShadow: isRevealed
          ? `0 32px 60px -8px ${product.themeHex}CC, 0 0 0 1px ${product.themeHex}40`
          : `0 16px 40px -8px ${product.themeHex}55`,
      }}
    >
      <img
        src={product.img}
        alt={product.name}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
          isRevealed ? 'scale-[1.10] -translate-y-2' : 'scale-100 translate-y-0'
        }`}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = `https://placehold.co/400x600/${product.themeHex.replace('#', '')}/FFF?text=${product.level}`;
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: isRevealed
            ? `linear-gradient(to top, ${product.themeHex}FF 0%, ${product.themeHex}DD 30%, ${product.themeHex}66 60%, transparent 100%)`
            : `linear-gradient(to top, ${product.themeHex}EE 0%, ${product.themeHex}BB 25%, ${product.themeHex}44 55%, transparent 100%)`,
          transition: 'background 0.5s ease',
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-7 px-6">
        <div
          className="overflow-hidden transition-all duration-500 ease-out flex flex-col items-center"
          style={{
            maxHeight: isRevealed ? '56px' : '0',
            opacity: isRevealed ? 1 : 0,
            transform: isRevealed ? 'translateY(0)' : 'translateY(12px)',
            marginBottom: isRevealed ? '4px' : '0',
          }}
        >
          <span
            className="price text-[34px] text-white drop-shadow-lg leading-none"
            style={{ fontWeight: 900, letterSpacing: '-0.03em' }}
          >
            ${product.price}
          </span>
        </div>

        <h3
          className="text-center text-white mb-4 drop-shadow-md leading-snug"
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          {product.name}
        </h3>

        <div className="w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="w-full max-w-[200px] rounded-full border border-white/50 bg-white/20 px-8 py-3 text-[14px] font-bold tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:bg-white/35 hover:shadow-xl active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
