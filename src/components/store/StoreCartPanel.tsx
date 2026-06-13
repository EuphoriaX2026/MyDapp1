import { AppIcon } from '../icons/AppIcon';
import React, { useMemo } from 'react';
import { formatUsd } from '../../utils/formatNumber';

export type CartLine = {
  id: number;
  name: string;
  specs: string;
  price: number;
  qty: number;
  img: string;
  productHash?: string;
};

/** Per-row footprint: 80px thumb + padding — list height grows with item count */
const CART_ITEM_ROW_H = 96;
const CART_ITEM_GAP = 12;
const CART_LIST_PADDING_Y = 40;
const CART_LIST_SCROLL_AFTER = 6;

interface StoreCartPanelProps {
  cart: CartLine[];
  cartCount: number;
  cartSaved: number[];
  subtotal: number;
  discount: number;
  promoDiscount: number;
  promoApplied: boolean;
  total: number;
  promo: string;
  onPromoChange: (val: string) => void;
  onApplyPromo: () => void;
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onToggleCartSaved: (id: number) => void;
  onProceedCheckout: () => void;
  networkFeePOL?: number | null;
}

export const StoreCartPanel: React.FC<StoreCartPanelProps> = ({
  cart,
  cartCount,
  subtotal,
  discount,
  promoDiscount,
  promoApplied,
  total,
  promo,
  onPromoChange,
  onApplyPromo,
  onClose,
  onChangeQty,
  onRemoveItem,
  onProceedCheckout,
  networkFeePOL = null,
}) => {

  const listSectionStyle = useMemo(() => {
    if (cart.length === 0) return { minHeight: 140 };
    const rows = cart.length;
    const naturalH =
      rows * CART_ITEM_ROW_H + Math.max(0, rows - 1) * CART_ITEM_GAP + CART_LIST_PADDING_Y;
    if (rows <= CART_LIST_SCROLL_AFTER) {
      return { minHeight: naturalH };
    }
    const cappedRows = CART_LIST_SCROLL_AFTER;
    const cappedH =
      cappedRows * CART_ITEM_ROW_H +
      (cappedRows - 1) * CART_ITEM_GAP +
      CART_LIST_PADDING_Y;
    return { minHeight: cappedH, maxHeight: cappedH };
  }, [cart.length]);

  const listScrollable = cart.length > CART_LIST_SCROLL_AFTER;

  return (
    <div className="flex flex-col max-h-[min(92vh,820px)] bg-white/70 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] w-[360px] relative overflow-y-auto custom-scrollbar">
      <div className="p-5 flex justify-between items-center border-b border-gray-200/50 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Store Cart</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">{cartCount} items · ERX checkout</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cart"
          className="w-10 h-10 rounded-full bg-white/50 hover:bg-white border border-gray-200/60 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm"
        >
          <AppIcon icon="lucide:x" className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      <div
        className={`shrink-0 p-5 flex flex-col gap-3 ${listScrollable ? 'overflow-y-auto custom-scrollbar' : ''}`}
        style={listSectionStyle}
      >
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100/50 flex items-center justify-center mb-2">
              <AppIcon icon="lucide:shield-check" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium text-center">Your cart is empty.</p>
            <p className="text-xs text-center">Pay with ERX — NFT + E1 cashback on purchase.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="group relative shrink-0 bg-white/40 backdrop-blur-md border border-white/60 rounded-[1.25rem] p-3 flex gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              style={{ minHeight: CART_ITEM_ROW_H }}
            >
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label="Remove item"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm z-10"
              >
                <AppIcon icon="lucide:trash-2" className="w-3.5 h-3.5" />
              </button>

              <div className="w-[80px] h-[80px] bg-white/50 rounded-xl overflow-hidden shrink-0 border border-white/80">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
              </div>

              <div className="flex flex-col flex-1 justify-between py-1 pr-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 pr-6">{item.name}</h4>
                  {item.specs && <p className="text-[10px] font-medium text-gray-500 mt-1">{item.specs}</p>}
                </div>

                <div className="flex justify-between items-end mt-2">
                  <span className="font-black text-gray-900">{formatUsd(item.price)}</span>

                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full px-1 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => onChangeQty(item.id, -1)}
                      aria-label="Decrease quantity"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-black transition-colors"
                    >
                      <AppIcon icon="lucide:minus" className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                    <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => onChangeQty(item.id, 1)}
                      aria-label="Increase quantity"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-black transition-colors"
                    >
                      <AppIcon icon="lucide:plus" className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="bg-white/50 backdrop-blur-2xl border-t border-white/60 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-5 shrink-0 relative z-10">
          <div className="flex gap-2 mb-4 relative">
            <div className="relative flex-1">
              <AppIcon icon="lucide:tag" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Promo Code"
                value={promo}
                onChange={(e) => onPromoChange(e.target.value)}
                className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/50 transition-all placeholder:text-gray-400 text-gray-900 shadow-inner"
              />
            </div>
            <button
              type="button"
              onClick={onApplyPromo}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md border transition-all ${
                promoApplied
                  ? 'bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white/50 border-white/80 text-gray-800 hover:bg-white/80 shadow-sm'
              }`}
            >
              {promoApplied ? 'Applied' : 'Apply'}
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mb-5">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatUsd(subtotal)}</span>
            </div>
            {(discount > 0 || promoDiscount > 0) && (
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-brand-pink">Total Discount</span>
                <span className="text-brand-pink">- {formatUsd(discount + promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-gray-500">Network Fee (Est.)</span>
              {networkFeePOL !== null ? (
                <span className="text-gray-900 text-xs font-bold">
                  {cart.length > 1
                    ? `~${(networkFeePOL * cart.length).toFixed(4)}`
                    : `~${networkFeePOL.toFixed(4)}`}{' '}
                  <span className="text-gray-500 font-medium">POL</span>
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  Calculating
                </span>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-1" />

            <div className="flex justify-between items-end">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatUsd(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedCheckout}
            className="w-full group relative bg-black/80 backdrop-blur-xl border border-gray-600/50 text-white rounded-2xl py-3.5 flex items-center justify-center overflow-hidden transition-all hover:bg-black/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          >
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-base font-bold tracking-wide">Proceed to Checkout</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transform group-hover:translate-x-1 transition-transform border border-white/10">
                <AppIcon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            </div>
          </button>

          <p className="text-center text-[10px] font-medium text-gray-400 mt-3 flex items-center justify-center gap-1">
            <AppIcon icon="lucide:shield-check" className="w-3 h-3" /> Encrypted Web3 Session
          </p>
        </div>
      )}
    </div>
  );
};
