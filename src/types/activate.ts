export type ActivationFlowKind = 'renewal-e1';
/** renewal-e1 = E1 checkout path (renewal OR balance-first fast-track with sufficient E1). */

export type ActivatePackageSelection = {
  productId: number;
  /** On-chain Activator / Panel group index (1–7). */
  groupIdx: number;
  /** UI display label only (e.g. "Winners"). */
  name: string;
  /** On-chain label G1…G7 — keep for contract routing; do not replace with display names. */
  level: string;
  img: string;
  themeHex: string;
  flowKind: ActivationFlowKind;
  /** True when the user has already activated this group at least once. */
  isRenewal: boolean;
  requiredE1Wei: string;
  requiredE1: number;
};

export type ActivateCheckoutState = {
  selection: ActivatePackageSelection;
  totalSubtotal: number;
  totalErx: number;
  erxPriceUsd: number;
  paymentToken: 'E1' | 'ERX';
  checkoutSource: 'activate';
  returnPath?: string;
};
