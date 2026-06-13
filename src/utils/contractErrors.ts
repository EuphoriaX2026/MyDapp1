import { BaseError } from 'viem';

/** Amoy Store.buyProduct reverts when Store has not approved Bank for ERX (0xfb8f41b2). */
export const STORE_ERX_PIPELINE_MESSAGE =
  'Card purchase is unavailable: Store must approve Bank for ERX on-chain (protocol admin setup). Your ERX approval is fine.';

const REVERT_SIGNATURE_HINTS: Record<string, string> = {
  '0xfb8f41b2': STORE_ERX_PIPELINE_MESSAGE,
};

export function formatContractError(error: unknown): string {
  if (error instanceof BaseError) {
    const raw = error.shortMessage || error.message || '';
    const msg = raw.toLowerCase();
    for (const [sig, hint] of Object.entries(REVERT_SIGNATURE_HINTS)) {
      if (raw.includes(sig)) return hint;
    }
    if (msg.includes('user rejected') || msg.includes('user denied')) {
      return 'Transaction cancelled in wallet.';
    }
    if (msg.includes('reverted')) {
      if (msg.includes('erc20insufficientallowance') || msg.includes('insufficient allowance')) {
        return STORE_ERX_PIPELINE_MESSAGE;
      }
      if (msg.includes('allowance')) {
        return 'Insufficient token allowance. Approve the token first, then try again.';
      }
      if (msg.includes('balance') || msg.includes('transfer amount exceeds')) {
        return 'Insufficient token balance for this swap.';
      }
      if (msg.includes('slippage') || msg.includes('min') || msg.includes('amount out')) {
        return 'Price moved or slippage too tight. Wait a moment and try again.';
      }
      return 'Swap rejected by contract. Check DAI balance, approval, and network (Polygon Amoy).';
    }
    return raw;
  }
  if (error && typeof error === 'object') {
    const err = error as { shortMessage?: string; message?: string };
    const raw = err.shortMessage || err.message || String(error);
    for (const [sig, hint] of Object.entries(REVERT_SIGNATURE_HINTS)) {
      if (raw.includes(sig)) return hint;
    }
    return raw;
  }
  return String(error);
}
