/** Extra Activator read helpers — not yet in compiled artifact exports. */
export const ACTIVATOR_PRICING_ABI = [
  {
    type: 'function',
    name: 'calculatePriceWithPenalty',
    inputs: [
      { name: '_user', type: 'address', internalType: 'address' },
      { name: '_groupIdx', type: 'uint8', internalType: 'uint8' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
] as const;
