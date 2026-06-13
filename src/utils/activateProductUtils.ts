import { useEffect, useState } from 'react';
import { STORE_REALM_PRODUCTS, getRealmDisplayName } from '../data/storeRealmProducts';
import type { CartLine } from '../components/store/StoreCartPanel';

/** Ensure cart lines always reference the correct product image and metadata. */
export function normalizeActivateCartLine(line: CartLine): CartLine {
  const meta = STORE_REALM_PRODUCTS.find((p) => p.id === line.id);
  if (!meta) {
    return {
      ...line,
      name: getRealmDisplayName(line.name),
    };
  }
  return {
    ...line,
    name: meta.name,
    img: meta.img,
    specs: line.specs || meta.level,
    productHash: line.productHash ?? meta.hash,
  };
}

export function normalizeActivateCart(lines: CartLine[]): CartLine[] {
  return lines.map(normalizeActivateCartLine);
}

export function getActivateProductDisplayName(productId: number, fallbackName: string): string {
  const meta = STORE_REALM_PRODUCTS.find((p) => p.id === productId);
  return getRealmDisplayName(meta?.name ?? fallbackName);
}
