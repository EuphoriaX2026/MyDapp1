import type { Abi } from 'viem';
import EDexABI from '../abis/edex.json';
import { NETWORK_MODE } from './networks';

const fullAbi = ((EDexABI as { abi?: Abi }).abi ?? EDexABI) as Abi;

/** Mainnet (future deploy) uses slippage args; Amoy deploy matches legacy 2-arg swap. */
export const EDEX_USES_ONCHAIN_MIN_OUT = NETWORK_MODE === 'mainnet';

const legacyBuySell: Abi = [
  {
    type: 'function',
    name: 'buy',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'usdAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'token', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
  {
    type: 'function',
    name: 'sell',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'erxAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'token', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
];

export function getEdexAbi(): Abi {
  if (EDEX_USES_ONCHAIN_MIN_OUT) return fullAbi;

  const withoutSwap = fullAbi.filter(
    (item) => !(item.type === 'function' && (item.name === 'buy' || item.name === 'sell')),
  );
  return [...withoutSwap, ...legacyBuySell];
}
