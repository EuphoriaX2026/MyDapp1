import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface CartProduct {
  id: number;
  hash: string;
  name: string;
  level: string;
  price: number;
  img: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  addItem: (product: CartProduct) => void;
  removeItem: (productId: number) => void;
  getQuantity: (productId: number) => number;
  totalCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItem = (product: CartProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity - 1 } : p));
      }
      return prev.filter((p) => p.id !== productId);
    });
  };

  const getQuantity = (productId: number) => {
    return cartItems.find((p) => p.id === productId)?.quantity ?? 0;
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addItem, removeItem, getQuantity, totalCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
