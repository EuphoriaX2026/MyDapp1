import { AppIcon } from '../../components/icons/AppIcon';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useBankErxPriceUsd } from '../../hooks/useBankErxPriceUsd';
import { GlassCard, GlassButton } from '../../components/ui/glass';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, addItem, removeItem, totalCount } = useCart();

  const { erxPriceUsdOrFallback: erxPriceUsd } = useBankErxPriceUsd();

  const totalSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalErx = erxPriceUsd > 0 ? totalSubtotal / erxPriceUsd : 0;

  const handleCheckout = () => {
    navigate('/checking', {
      state: { cartItems, totalSubtotal, totalErx, erxPriceUsd, paymentToken: 'ERX' },
    });
  };

  return (
    <div className="dapp-page flex flex-col overflow-x-hidden pb-24 text-brand-surface-dark">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/30 bg-white/10 px-6 pb-4 pt-10 backdrop-blur-xl">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 border border-white/80 shadow-sm hover:bg-white hover:shadow-md transition-all text-[#1a1a2e]"
        >
          <AppIcon icon="lucide:arrow-left" className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-bold tracking-tight text-[#1a1a2e]">Cart</h1>
        {/* Cart count badge */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 border border-white/80 relative">
          <AppIcon icon="lucide:shopping-bag" className="w-5 h-5 text-[#1a1a2e]" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DB2CF5] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#F8F9FE]">
              {totalCount}
            </span>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative z-10 flex-1 px-2 pt-6">

        {cartItems.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(219,44,245,0.08)' }}
            >
              <AppIcon icon="lucide:shopping-bag" className="w-12 h-12 text-[#DB2CF5] opacity-60" />
            </div>
            <h3 className="text-[18px] font-bold text-[#1a1a2e] mb-2">Your cart is empty</h3>
            <p className="text-[14px] font-medium text-[#8E8E93] mb-8">
              Discover our realms and start building your ecosystem.
            </p>
            <button
              onClick={() => navigate('/store')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#4E87FF] to-[#DB2CF5] text-white text-[14px] font-bold shadow-[0_8px_24px_rgba(108,92,231,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Browse Realms
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* ── Cart Items ── */}
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[1.25rem] p-4 flex items-center gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-[1rem] bg-gray-100 overflow-hidden shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black text-white bg-[#6C5CE7] px-1.5 py-0.5 rounded-md">
                        {item.level}
                      </span>
                      <h4 className="text-[13px] font-bold text-[#1a1a2e] truncate">{item.name}</h4>
                    </div>
                    <div className="text-[12px] text-[#8E8E93] font-medium">
                      <span className="font-bold text-[#4E87FF]">${item.price}</span> / unit
                    </div>
                  </div>

                  {/* Quantity + Row total */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center bg-[#F8F9FE] rounded-full p-1 border border-gray-100">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#1a1a2e] hover:bg-white hover:shadow-sm transition-all"
                      >
                        <AppIcon icon="lucide:minus" className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-[13px] font-bold">{item.quantity}</span>
                      <button
                        onClick={() => addItem(item)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#1a1a2e] hover:bg-white hover:shadow-sm transition-all"
                      >
                        <AppIcon icon="lucide:plus" className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[13px] font-black text-[#1a1a2e]">
                      ${item.price * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Checkout Summary Card ── */}
            <div className="mt-4 bg-white/80 backdrop-blur-2xl border border-white shadow-[0_24px_80px_rgba(78,135,255,0.15)] rounded-[2rem] p-6 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#DB2CF5] to-[#4E87FF] rounded-full blur-[60px] opacity-10 pointer-events-none" />

              <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-5">Payment Summary</h3>

              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#8E8E93] font-medium">Items ({totalCount})</span>
                  <span className="font-bold text-[#1a1a2e]">${totalSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[#8E8E93] font-medium">Network Fee</span>
                  <span className="font-bold text-[#10b981]">Free</span>
                </div>
                <div className="h-[1px] w-full bg-gray-100 my-1" />
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[#1a1a2e] font-bold text-[18px]">Total</span>
                    <div className="text-[#8E8E93] text-[12px] font-medium mt-1">Payment in ERX</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[24px] font-black text-[#DB2CF5] leading-none">
                      {totalErx.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                      <span className="text-[14px]">ERX</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white text-[15px] font-bold bg-gradient-to-r from-[#4E87FF] via-[#6C5CE7] to-[#DB2CF5] border border-white/20 shadow-[0_8px_24px_rgba(108,92,231,0.4),inset_0_3px_6px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_32px_rgba(108,92,231,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
              >
                <AppIcon icon="lucide:credit-card" className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
