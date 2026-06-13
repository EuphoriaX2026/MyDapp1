import { parseUnits } from 'viem';
import { formatFinancialNumber, sanitizeFinancialAmountInput } from './formatNumber';

export const ERC20_ALLOWANCE_ABI = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const EDEX_AMOUNT_DECIMALS = 2;

export function trimAmountToDecimals(raw: string, decimals: number) {
  const plain = sanitizeFinancialAmountInput(raw, decimals);
  const dotIdx = plain.indexOf('.');
  if (dotIdx === -1) return plain;
  return `${plain.slice(0, dotIdx + 1)}${plain.slice(dotIdx + 1).slice(0, decimals)}`;
}

export function parsePayAmountWei(amount: string, decimals: number, inputVal: number) {
  if (!amount || inputVal <= 0) return 0n;
  try {
    return parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}

export function formatEdexUsdEstimate(usd: number): string {
  return `≈ ${formatFinancialNumber(usd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}
