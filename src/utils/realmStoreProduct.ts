import { keccak256, toHex } from 'viem';

export const REALM_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

/** Store.sol credit-card product id — keccak256("Realm {roman}"). */
export function realmCreditCardProductId(groupIdx: number): `0x${string}` {
  const roman = REALM_ROMAN[groupIdx - 1] ?? 'I';
  return keccak256(toHex(`Realm ${roman}`));
}

const WAD = 10n ** 18n;

export function usdPriceToErxWei(cardUsdPrice: number, erxPriceUsdWei: bigint): bigint {
  if (erxPriceUsdWei <= 0n || cardUsdPrice <= 0) return 0n;
  const cardUsdWei = BigInt(cardUsdPrice) * WAD;
  return (cardUsdWei * WAD) / erxPriceUsdWei;
}
