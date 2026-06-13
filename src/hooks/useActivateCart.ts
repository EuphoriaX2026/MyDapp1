import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGasPrice } from 'wagmi';
import { formatUnits } from 'viem';
import type { CartLine } from '../components/store/StoreCartPanel';
import type { ReportItem } from '../types';
import {
  computePromoDiscount,
  lookupActivatePromoCode,
} from '../data/promoCodes';
import {
  loadActivateCart,
  loadActivatePromo,
  saveActivateCart,
  saveActivatePromo,
} from '../storage/activateCartStorage';
import { normalizeActivateCart, getActivateProductDisplayName } from '../utils/activateProductUtils';

const ESTIMATED_GAS_UNITS = BigInt(200000);

/** E1 activation checkout — separate from ERX store purchases */
export function useActivateCart(options?: { onItemAdded?: () => void }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartLine[]>(() => normalizeActivateCart(loadActivateCart()));
  const [promo, setPromoState] = useState(() => loadActivatePromo().promo);
  const [promoApplied, setPromoApplied] = useState(() => loadActivatePromo().promoApplied);
  const [promoRejected, setPromoRejected] = useState(false);

  useEffect(() => {
    saveActivateCart(cart);
  }, [cart]);

  useEffect(() => {
    saveActivatePromo({ promo, promoApplied });
  }, [promo, promoApplied]);

  const { data: gasPriceData } = useGasPrice({ query: { refetchInterval: 15000 } });

  const networkFeeWei = gasPriceData ? gasPriceData * ESTIMATED_GAS_UNITS : null;
  const networkFeePOL = networkFeeWei ? Number(formatUnits(networkFeeWei, 18)) : null;

  const cartCount = useMemo(() => cart.reduce((n, it) => n + it.qty, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.qty, 0),
    [cart],
  );

  const promoDiscount = useMemo(() => {
    if (!promoApplied) return 0;
    const def = lookupActivatePromoCode(promo);
    if (!def) return 0;
    return computePromoDiscount(subtotal, def);
  }, [promoApplied, promo, subtotal]);

  /** No flat discount — only valid promo codes reduce total */
  const discount = 0;
  const total = Math.max(0, subtotal - discount - promoDiscount);

  /** 1 USD list price = 1 E1 for Panel activation */
  const totalE1 = total;

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it)),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const addToCart = useCallback(
    (
      item: { id?: number; name: string; price: number; img: string; specs?: string; hash?: string },
      quantity = 1,
    ) => {
      const qty = Math.max(1, quantity);
      setCart((prev) => {
        const found = prev.find((c) =>
          item.id != null ? c.id === item.id : c.name === item.name,
        );
        if (found) {
          return prev.map((c) =>
            (item.id != null ? c.id === item.id : c.name === item.name)
              ? { ...c, qty: c.qty + qty }
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
            qty,
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
    setCart(normalizeActivateCart(lines));
  }, []);

  const applyPromo = useCallback(() => {
    const def = lookupActivatePromoCode(promo);
    if (def) {
      setPromoApplied(true);
      setPromoRejected(false);
    } else {
      setPromoApplied(false);
      setPromoRejected(promo.trim().length > 0);
    }
  }, [promo]);

  const onPromoChange = useCallback((val: string) => {
    setPromoState(val);
    setPromoApplied(false);
    setPromoRejected(false);
  }, []);

  const proceedToCheckout = useCallback(() => {
    const cartItems: ReportItem[] = cart.map((line) => ({
      id: line.id,
      name: getActivateProductDisplayName(line.id, line.name),
      price: line.price,
      quantity: line.qty,
      hash: line.productHash ?? `0x${'0'.repeat(64)}`,
    }));

    navigate('/checking', {
      state: {
        cartItems,
        totalSubtotal: subtotal,
        totalErx: totalE1,
        erxPriceUsd: 1,
        paymentToken: 'E1' as const,
        checkoutSource: 'activate' as const,
        returnPath: '/Activate',
      },
    });
  }, [cart, navigate, subtotal, totalE1]);

  return {
    cart,
    cartCount,
    subtotal,
    discount,
    promoDiscount,
    promoApplied,
    promoRejected,
    total,
    totalE1,
    networkFeePOL,
    promo,
    setPromo: onPromoChange,
    applyPromo,
    changeQty,
    removeItem,
    addToCart,
    proceedToCheckout,
    restoreCart,
    setCart,
  };
}
