import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGasPrice } from 'wagmi';
import { formatUnits } from 'viem';
import type { CartLine } from '../components/store/StoreCartPanel';
import type { ReportItem } from '../types';
import { useBankErxPriceUsd } from './useBankErxPriceUsd';

const STORE_DISCOUNT_FLAT = 45.5;
const PROMO_RATE = 0.1;
const ESTIMATED_GAS_UNITS = BigInt(200000);

export type UseStoreCartOptions = {
  paymentToken?: 'ERX' | 'E1';
  erxPriceUsdOverride?: number;
  onItemAdded?: () => void;
};

export function useStoreCart(options?: UseStoreCartOptions) {
  const paymentToken = options?.paymentToken ?? 'ERX';
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartSaved, setCartSaved] = useState<number[]>([]);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const { erxPriceUsdOrFallback } = useBankErxPriceUsd();

  const { data: gasPriceData } = useGasPrice({ query: { refetchInterval: 15000 } });

  const erxPriceUsd = options?.erxPriceUsdOverride ?? erxPriceUsdOrFallback;

  const networkFeeWei = gasPriceData ? gasPriceData * ESTIMATED_GAS_UNITS : null;
  const networkFeePOL = networkFeeWei ? Number(formatUnits(networkFeeWei, 18)) : null;

  const cartCount = useMemo(() => cart.reduce((n, it) => n + it.qty, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.qty, 0),
    [cart],
  );

  const discount = cart.length > 0 ? STORE_DISCOUNT_FLAT : 0;
  const promoDiscount = promoApplied ? subtotal * PROMO_RATE : 0;
  const total = Math.max(0, subtotal - discount - promoDiscount);
  const totalErx = erxPriceUsd > 0 ? total / erxPriceUsd : 0;

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it)),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const addToCart = useCallback(
    (item: { id?: number; name: string; price: number; img: string; specs?: string; hash?: string }) => {
      setCart((prev) => {
        const found = prev.find((c) =>
          item.id != null ? c.id === item.id : c.name === item.name,
        );
        if (found) {
          return prev.map((c) =>
            (item.id != null ? c.id === item.id : c.name === item.name)
              ? { ...c, qty: c.qty + 1 }
              : c,
          );
        }
        return [
          ...prev,
          {
            id: item.id ?? Date.now(),
            name: item.name,
            specs: item.specs ?? '',
            price: item.price,
            qty: 1,
            img: item.img,
            productHash: item.hash,
          },
        ];
      });
      options?.onItemAdded?.();
    },
    [options?.onItemAdded],
  );

  const restoreCart = useCallback((lines: CartLine[]) => {
    setCart(lines);
  }, []);

  const toggleCartSaved = useCallback((id: number) => {
    setCartSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const applyPromo = useCallback(() => {
    setPromoApplied(promo.trim().length > 0);
  }, [promo]);

  const proceedToCheckout = useCallback(() => {
    const cartItems: ReportItem[] = cart.map((line) => ({
      id: line.id,
      name: line.name,
      price: line.price,
      quantity: line.qty,
      hash:
        (line as CartLine & { productHash?: string }).productHash ??
        `0x${'0'.repeat(64)}`,
    }));

    navigate('/checking', {
      state: {
        cartItems,
        totalSubtotal: subtotal,
        totalErx,
        erxPriceUsd,
        paymentToken,
        checkoutSource: 'store' as const,
        returnPath: '/store',
      },
    });
  }, [cart, navigate, subtotal, totalErx, erxPriceUsd, paymentToken]);

  return {
    cart,
    cartSaved,
    cartCount,
    subtotal,
    discount,
    promoDiscount,
    promoApplied,
    total,
    totalErx,
    erxPriceUsd,
    networkFeePOL,
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
    setCart,
  };
}
