import React from 'react';
import {
  getRealmDisplayName,
  parseRealmGroupNumber,
  type StoreRealmProduct,
} from '../../data/storeRealmProducts';
import { formatAmountSmart } from '../../utils/formatNumber';
import { useActivatorPackagePrice } from '../../hooks/useActivatorPackagePrice';
import { ActivateE1Logo } from './ActivateE1Logo';

export interface ActivateProductCardProps {
  product: StoreRealmProduct;
  /** Side peek in accordion carousel — image + name only */
  variant?: 'center' | 'peek';
}

export function ActivateProductCard({
  product,
  variant = 'center',
}: ActivateProductCardProps) {
  const isPeek = variant === 'peek';
  const groupIdx = parseRealmGroupNumber(product.level);
  const priceQuote = useActivatorPackagePrice(isPeek ? 0 : groupIdx);

  const displayPrice =
    !isPeek && priceQuote.priceE1 != null
      ? formatAmountSmart(priceQuote.priceE1)
      : null;

  return (
    <div
      className={`group relative flex w-full overflow-hidden ${
        isPeek
          ? 'activate-product-card--peek cursor-pointer'
          : 'activate-product-card--center cursor-default'
      }`}
      style={{
        boxShadow: `0 16px 40px -8px ${product.themeHex}55`,
      }}
    >
      <img
        src={product.img}
        alt={product.name}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://placehold.co/400x600/${product.themeHex.replace('#', '')}/FFF?text=${encodeURIComponent(getRealmDisplayName(product.name))}`;
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: isPeek
            ? `linear-gradient(to top, ${product.themeHex}DD 0%, ${product.themeHex}99 35%, ${product.themeHex}33 65%, transparent 100%)`
            : `linear-gradient(to top, ${product.themeHex}EE 0%, ${product.themeHex}BB 25%, ${product.themeHex}44 55%, transparent 100%)`,
        }}
      />

      <div className="activate-card-overlay absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center px-6 pointer-events-none">
        {!isPeek ? (
          <span className="activate-card-price inline-flex items-baseline justify-center gap-1.5">
            {priceQuote.isLoading ? (
              '…'
            ) : displayPrice != null ? (
              <>
                {displayPrice}
                <ActivateE1Logo variant="white" className="h-[0.52em] w-auto translate-y-[0.04em]" />
              </>
            ) : (
              '—'
            )}
          </span>
        ) : null}
        <h3
          className={`activate-card-name text-center text-white drop-shadow-md leading-snug ${
            isPeek ? 'activate-card-name--peek' : 'activate-card-name--center'
          }`}
        >
          {getRealmDisplayName(product.name)}
        </h3>
      </div>
    </div>
  );
}
