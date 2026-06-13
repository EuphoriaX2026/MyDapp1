import React, { useCallback, useEffect, useRef, useState } from 'react';
import { STORE_REALM_PRODUCTS, type StoreRealmProduct } from '../../data/storeRealmProducts';
import {
  loadActivateCatalogState,
  saveActivateCatalogState,
} from '../../storage/activateCartStorage';
import { ActivateProductCard } from './ActivateProductCard';
import { ActivateProductDetails } from './ActivateProductDetails';
import { useRealmActivationEligibility } from '../../hooks/useRealmActivationEligibility';
import { parseRealmGroupNumber } from '../../data/storeRealmProducts';

export interface ActivateRealmCatalogProps {
  onProceedToInvoice: (
    product: StoreRealmProduct,
    priceWei: bigint,
    priceE1: number,
    isRenewal: boolean,
  ) => void;
  networkFeePOL?: number | null;
}

const PRODUCT_COUNT = STORE_REALM_PRODUCTS.length;
const SWIPE_THRESHOLD_PX = 48;

type SlideDirection = 'next' | 'prev';

function wrapIndex(index: number): number {
  return (index + PRODUCT_COUNT) % PRODUCT_COUNT;
}

function getSlideDirection(from: number, to: number): SlideDirection {
  const forward = (to - from + PRODUCT_COUNT) % PRODUCT_COUNT;
  const backward = (from - to + PRODUCT_COUNT) % PRODUCT_COUNT;
  return forward <= backward ? 'next' : 'prev';
}

export function ActivateRealmCatalog({
  onProceedToInvoice,
  networkFeePOL = null,
}: ActivateRealmCatalogProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const stored = loadActivateCatalogState().activeIndex;
    return ((stored % PRODUCT_COUNT) + PRODUCT_COUNT) % PRODUCT_COUNT;
  });
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('next');
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    saveActivateCatalogState({ activeIndex });
  }, [activeIndex]);

  const navigateTo = useCallback((index: number) => {
    const nextIndex = wrapIndex(index);
    if (nextIndex === activeIndex) return;
    setSlideDirection(getSlideDirection(activeIndex, nextIndex));
    setActiveIndex(nextIndex);
  }, [activeIndex]);

  const goPrev = useCallback(() => navigateTo(activeIndex - 1), [activeIndex, navigateTo]);
  const goNext = useCallback(() => navigateTo(activeIndex + 1), [activeIndex, navigateTo]);

  const prevIndex = wrapIndex(activeIndex - 1);
  const nextIndex = wrapIndex(activeIndex + 1);

  const centerProduct = STORE_REALM_PRODUCTS[activeIndex];
  const prevProduct = STORE_REALM_PRODUCTS[prevIndex];
  const nextProduct = STORE_REALM_PRODUCTS[nextIndex];
  const centerGroupIdx = parseRealmGroupNumber(centerProduct.level);
  const centerEligibility = useRealmActivationEligibility(centerGroupIdx);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD_PX) goNext();
    else if (delta < -SWIPE_THRESHOLD_PX) goPrev();
  };

  const centerEnterClass =
    slideDirection === 'next'
      ? 'activate-accordion-center--enter-next'
      : 'activate-accordion-center--enter-prev';

  return (
    <div className="activate-catalog-wrap">
      <div
        className="activate-accordion"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Networking packages carousel"
        aria-roledescription="carousel"
      >
        <button
          key={`side-left-${prevIndex}`}
          type="button"
          className="activate-accordion-side activate-accordion-side--left activate-accordion-side--refresh"
          onClick={goPrev}
          aria-label={`Show ${prevProduct.name}`}
        >
          <ActivateProductCard variant="peek" product={prevProduct} />
        </button>

        <div
          key={`center-${activeIndex}`}
          className={`activate-accordion-center ${centerEnterClass}${
            !centerEligibility.canActivate && !centerEligibility.isLoading
              ? ' opacity-75'
              : ''
          }`}
          aria-live="polite"
          aria-label={`${centerProduct.name}, package ${centerProduct.id} of ${PRODUCT_COUNT}`}
        >
          <ActivateProductCard variant="center" product={centerProduct} />
        </div>

        <button
          key={`side-right-${nextIndex}`}
          type="button"
          className="activate-accordion-side activate-accordion-side--right activate-accordion-side--refresh"
          onClick={goNext}
          aria-label={`Show ${nextProduct.name}`}
        >
          <ActivateProductCard variant="peek" product={nextProduct} />
        </button>
      </div>

      <div key={`details-${activeIndex}`} className="activate-center-details-wrap">
        <ActivateProductDetails
          product={centerProduct}
          onProceedToInvoice={onProceedToInvoice}
          networkFeePOL={networkFeePOL}
        />
      </div>
    </div>
  );
}
