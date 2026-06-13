import { AppIcon } from '../../components/icons/AppIcon';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StoreHeaderHero } from '../../components/store/StoreHeaderHero';
import { StoreCartPanel } from '../../components/store/StoreCartPanel';
import { StoreMainContent } from '../../components/store/StoreMainContent';
import { StoreRealmsSection } from '../../components/store/StoreRealmsSection';
import { useStoreCart } from '../../hooks/useStoreCart';
import type { ReportItem } from '../../types';
import type { StoreRealmProduct } from '../../data/storeRealmProducts';
import { PRODUCT_IMAGES } from '../../assets/media';

type StoreView = 'ecosystem' | 'realms';

export default function Store() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [storeView, setStoreView] = useState<StoreView>('ecosystem');

  const storeCart = useStoreCart({
    onItemAdded: () => setCartOpen(true),
  });

  const {
    cart,
    cartSaved,
    cartCount,
    subtotal,
    discount,
    promoDiscount,
    promoApplied,
    total,
    promo,
    setPromo,
    setPromoApplied,
    changeQty,
    removeItem,
    addToCart,
    toggleCartSaved,
    applyPromo,
    proceedToCheckout,
    restoreCart,
    networkFeePOL,
  } = storeCart;

  useEffect(() => {
    const st = location.state as {
      openCart?: boolean;
      cartItems?: ReportItem[];
    } | null;

    if (st?.openCart && st?.cartItems?.length) {
      restoreCart(
        st.cartItems.map((item, idx) => ({
          id: typeof item.id === 'number' ? item.id : idx + 1,
          name: item.name,
          specs: '',
          price: item.price,
          qty: item.quantity,
          img: PRODUCT_IMAGES[1],
          productHash: item.hash,
        })),
      );
      setCartOpen(true);
      navigate('/store', { replace: true, state: {} });
    }
  }, [location.state, navigate, restoreCart]);

  const handleRealmAdd = (product: StoreRealmProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      specs: product.level,
      hash: product.hash,
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col relative isolate">
      <div className="relative z-10 flex w-full flex-1 flex-col">
        <StoreHeaderHero
          cartOpen={cartOpen}
          cartCount={cartCount}
          onCartClick={() => setCartOpen((v) => !v)}
          onCloseCart={() => setCartOpen(false)}
          cartPanel={
            <StoreCartPanel
              cart={cart}
              cartCount={cartCount}
              cartSaved={cartSaved}
              subtotal={subtotal}
              discount={discount}
              promoDiscount={promoDiscount}
              promoApplied={promoApplied}
              total={total}
              promo={promo}
              onPromoChange={(value) => {
                setPromo(value);
                setPromoApplied(false);
              }}
              onApplyPromo={applyPromo}
              onClose={() => setCartOpen(false)}
              onChangeQty={changeQty}
              onRemoveItem={removeItem}
              onToggleCartSaved={toggleCartSaved}
              onProceedCheckout={proceedToCheckout}
              networkFeePOL={networkFeePOL}
            />
          }
        />

        <main className="relative z-0 w-full flex-1 font-sans bg-transparent">
          {storeView === 'realms' && (
            <div className="px-8 pt-6">
              <button
                type="button"
                onClick={() => setStoreView('ecosystem')}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 mb-4"
              >
                <AppIcon icon="lucide:chevron-left" className="w-4 h-4" />
                Back to Ecosystem
              </button>
            </div>
          )}

          {storeView === 'ecosystem' ? (
            <StoreMainContent
              onAddToCart={addToCart}
              onShowRealms={() => setStoreView('realms')}
            />
          ) : (
            <div className="px-8 pb-10">
              <StoreRealmsSection onAddRealm={handleRealmAdd} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
