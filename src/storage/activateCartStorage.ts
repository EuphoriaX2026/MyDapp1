import type { CartLine } from '../components/store/StoreCartPanel';

const CART_KEY = 'activate-cart-v1';
const PROMO_KEY = 'activate-cart-promo-v1';
const CATALOG_KEY = 'activate-catalog-v1';

export type StoredActivatePromo = {
  promo: string;
  promoApplied: boolean;
};

export type StoredCatalogState = {
  activeIndex: number;
};

export function loadActivateCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveActivateCart(cart: CartLine[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* ignore quota errors */
  }
}

export function loadActivatePromo(): StoredActivatePromo {
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return { promo: '', promoApplied: false };
    const parsed = JSON.parse(raw) as StoredActivatePromo;
    return {
      promo: typeof parsed.promo === 'string' ? parsed.promo : '',
      promoApplied: Boolean(parsed.promoApplied),
    };
  } catch {
    return { promo: '', promoApplied: false };
  }
}

export function saveActivatePromo(state: StoredActivatePromo): void {
  try {
    localStorage.setItem(PROMO_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadActivateCatalogState(): StoredCatalogState {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return { activeIndex: 0 };
    const parsed = JSON.parse(raw) as StoredCatalogState;
    return {
      activeIndex: typeof parsed.activeIndex === 'number' ? parsed.activeIndex : 0,
    };
  } catch {
    return { activeIndex: 0 };
  }
}

export function saveActivateCatalogState(state: StoredCatalogState): void {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
