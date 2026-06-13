/** Valid promo codes for activation checkout — extend as needed. */
export type PromoCodeDefinition = {
  /** Flat discount in USD / E1 */
  discountAmount?: number;
  /** Fraction of subtotal (e.g. 0.1 = 10%) */
  discountRate?: number;
};

export const ACTIVATE_PROMO_CODES: Record<string, PromoCodeDefinition> = {
  WELCOME10: { discountRate: 0.1 },
  ACTIVATE50: { discountAmount: 50 },
};

export function lookupActivatePromoCode(raw: string): PromoCodeDefinition | null {
  const key = raw.trim().toUpperCase();
  if (!key) return null;
  return ACTIVATE_PROMO_CODES[key] ?? null;
}

export function computePromoDiscount(subtotal: number, def: PromoCodeDefinition): number {
  let amount = 0;
  if (def.discountRate != null) {
    amount += subtotal * def.discountRate;
  }
  if (def.discountAmount != null) {
    amount += def.discountAmount;
  }
  return Math.min(subtotal, Math.max(0, amount));
}
