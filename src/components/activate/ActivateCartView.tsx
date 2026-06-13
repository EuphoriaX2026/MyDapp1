import { AppIcon } from '../icons/AppIcon';
import React, { useMemo } from 'react';
import {
  computeRealmValidityDays,
  getRealmDisplayName,
  type StoreRealmProduct,
} from '../../data/storeRealmProducts';
import { formatAmountSmart, formatUsdSmart } from '../../utils/formatNumber';
import { ActivateE1Logo } from './ActivateE1Logo';
import { GlassCard } from '../ui/glass';

export type ActivateCartLine = StoreRealmProduct & { quantity: number };

/** Per-row footprint — matches Store Cart */
const CART_ITEM_ROW_H = 96;
const CART_ITEM_GAP = 12;
const CART_LIST_SCROLL_AFTER = 6;

export interface ActivateCartViewProps {
  cartLines: ActivateCartLine[];
  cartCount: number;
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
  subtotal: number;
  discount: number;
  promoDiscount: number;
  promoApplied: boolean;
  promoRejected: boolean;
  total: number;
  promo: string;
  onPromoChange: (val: string) => void;
  onApplyPromo: () => void;
  networkFeePOL: number | null;
}

function CartItemRows({
  cartLines,
  onChangeQty,
  onRemoveItem,
  listScrollable,
  listSectionStyle,
}: {
  cartLines: ActivateCartLine[];
  onChangeQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  listScrollable: boolean;
  listSectionStyle: React.CSSProperties;
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${listScrollable ? 'custom-scrollbar overflow-y-auto' : ''}`}
      style={listSectionStyle}
    >
      {cartLines.map((item) => {
        const validityDays = computeRealmValidityDays(item.quantity);
        return (
          <GlassCard
            key={item.id}
            glowColor="blue"
            className="activate-stage-card activate-cart-line-card w-full transition-all duration-300 hover:-translate-y-0.5"
          >
            <div
              className="group relative flex shrink-0 gap-4 p-3"
              style={{ minHeight: CART_ITEM_ROW_H }}
            >
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              aria-label="Remove item"
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/60 text-gray-500 shadow-sm backdrop-blur-md transition-all hover:bg-red-50 hover:text-red-500"
            >
              <AppIcon icon="lucide:trash-2" className="h-3.5 w-3.5" />
            </button>

            <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-xl border border-white/80 bg-white/50">
              <img
                src={item.img}
                alt={getRealmDisplayName(item.name)}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between py-1 pr-4">
              <div className="flex items-start justify-between gap-2 pr-6">
                <h4 className="activate-flow-text line-clamp-2 leading-tight">
                  {getRealmDisplayName(item.name)}
                </h4>
                <span className="activate-cart-item-price activate-flow-text shrink-0">
                  {formatUsdSmart(item.price)}
                </span>
              </div>

              <div className="mt-2 flex items-end justify-between">
                <p className="activate-flow-muted text-[13px]">
                  {validityDays.toLocaleString('en-US')} days
                </p>

                <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-1 py-1 shadow-sm backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.id, -1)}
                    aria-label="Decrease quantity"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-black"
                  >
                    <AppIcon icon="lucide:minus" className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                  <span className="activate-cart-item-qty activate-flow-text w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.id, 1)}
                    aria-label="Increase quantity"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-black"
                  >
                    <AppIcon icon="lucide:plus" className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

export function ActivateCartView({
  cartLines,
  cartCount,
  onClose,
  onChangeQty,
  onRemoveItem,
  onCheckout,
  subtotal,
  discount,
  promoDiscount,
  promoApplied,
  promoRejected,
  total,
  promo,
  onPromoChange,
  onApplyPromo,
  networkFeePOL,
}: ActivateCartViewProps) {
  const listSectionStyle = useMemo(() => {
    if (cartLines.length === 0) return undefined;
    const rows = cartLines.length;
    const naturalH = rows * CART_ITEM_ROW_H + Math.max(0, rows - 1) * CART_ITEM_GAP;
    if (rows <= CART_LIST_SCROLL_AFTER) {
      return { minHeight: naturalH };
    }
    const cappedRows = CART_LIST_SCROLL_AFTER;
    const cappedH = cappedRows * CART_ITEM_ROW_H + (cappedRows - 1) * CART_ITEM_GAP;
    return { minHeight: cappedH, maxHeight: cappedH };
  }, [cartLines.length]);

  const listScrollable = cartLines.length > CART_LIST_SCROLL_AFTER;
  const totalDiscount = discount + promoDiscount;
  const checkoutLabel = `${cartCount} items · E1 checkout`;

  if (cartLines.length === 0) {
    return (
      <div className="activate-content-width mt-1 flex flex-col gap-3">
        <p className="activate-cart-subtitle">{checkoutLabel}</p>
        <GlassCard glowColor="blue" className="activate-stage-card w-full">
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100/50">
              <AppIcon
                icon="lucide:shopping-bag"
                style={{ fontSize: '32px', color: '#d1d5db' }}
              />
            </div>
            <p className="activate-flow-muted text-center">Your cart is empty.</p>
          </div>
        </GlassCard>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary btn-block btn-lg activate-continue-btn w-full"
        >
          Back to Activate
        </button>
      </div>
    );
  }

  return (
    <div className="activate-content-width mt-1 flex flex-col gap-3 pb-4">
      <p className="activate-cart-subtitle">{checkoutLabel}</p>

      <CartItemRows
        cartLines={cartLines}
        onChangeQty={onChangeQty}
        onRemoveItem={onRemoveItem}
        listScrollable={listScrollable}
        listSectionStyle={listSectionStyle ?? {}}
      />

      <GlassCard glowColor="blue" className="activate-stage-card activate-cart-summary-card w-full">
        <div className="relative z-10 shrink-0 p-5">
          <div className="relative mb-4 flex gap-2">
            <div className="relative flex-1">
              <AppIcon icon="lucide:tag" className="activate-cart-promo-tag absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Promo Code"
                value={promo}
                onChange={(e) => onPromoChange(e.target.value)}
                className="activate-cart-promo-input activate-flow-text w-full rounded-xl border border-white/60 bg-white/40 py-2.5 pl-9 pr-4 shadow-inner backdrop-blur-md transition-all placeholder:text-[#9ca3af] focus:border-brand-pink/50 focus:outline-none focus:ring-1 focus:ring-brand-pink/50"
              />
            </div>
            <button
              type="button"
              onClick={onApplyPromo}
              className={`activate-flow-text rounded-xl border px-5 py-2.5 backdrop-blur-md transition-all ${
                promoApplied
                  ? 'border-emerald-400 bg-emerald-500/80 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : promoRejected
                    ? 'border-[#FF396F] bg-[#FF396F] text-white shadow-[0_0_15px_rgba(255,57,111,0.35)]'
                    : 'activate-cart-promo-apply--idle border-white/80 bg-white/50 text-[#1a1a2e] shadow-sm hover:bg-white/80'
              }`}
            >
              {promoApplied ? 'Applied' : 'Apply'}
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="activate-cart-summary-row-label activate-flow-muted">Subtotal</span>
              <span className="activate-cart-summary-row-value activate-flow-text">
                {formatUsdSmart(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="activate-cart-summary-row-label activate-cart-discount-label activate-flow-text text-brand-pink">
                Total Discount
              </span>
              <span className="activate-cart-summary-row-value activate-cart-discount-value activate-flow-text text-brand-pink">
                - {formatUsdSmart(totalDiscount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="activate-cart-summary-row-label activate-flow-muted">Fee</span>
              {networkFeePOL !== null ? (
                <span className="activate-cart-summary-row-value activate-flow-text">
                  {cartLines.length > 1
                    ? `~${(networkFeePOL * cartLines.length).toFixed(4)}`
                    : `~${networkFeePOL.toFixed(4)}`}{' '}
                  <span className="activate-flow-muted">POL</span>
                </span>
              ) : (
                <span className="activate-flow-muted flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  Calculating
                </span>
              )}
            </div>

            <div className="my-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            <div className="flex items-end justify-between">
              <span className="activate-cart-summary-row-label activate-flow-text">Total</span>
              <div className="flex items-center gap-2">
                <span className="activate-cart-summary-row-value activate-flow-total-value">
                  {formatAmountSmart(total)}
                </span>
                <ActivateE1Logo className="h-6 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <button
        type="button"
        onClick={onCheckout}
        className="btn btn-primary btn-block btn-lg activate-continue-btn w-full"
      >
        Checkout
      </button>

      <p className="activate-encrypted-session activate-flow-muted flex items-center justify-center gap-1 text-center">
        <AppIcon icon="lucide:shield-check" className="activate-encrypted-session-icon" /> Encrypted Web3 Session
      </p>
    </div>
  );
}
