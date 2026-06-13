import { PRODUCT_IMAGES } from '../assets/media';
export const REALM_VALIDITY_BASE_DAYS = 365;
export const REALM_VALIDITY_DAYS_PER_UNIT = 365;

export interface StoreRealmProduct {
  id: number;
  hash: string;
  name: string;
  /** On-chain group label — G1…G7; use parseRealmGroupNumber() for contract args. */
  level: string;
  price: number;
  img: string;
  themeHex: string;
}

export const STORE_REALM_PRODUCTS: StoreRealmProduct[] = [
  {
    id: 1,
    hash: '0x1c17b5f5bdfe8b89cfc1603956fc202931e9c2f6d2319ef6b39dfca9d8ccf30f',
    name: 'Beginner Realm',
    level: 'G1',
    price: 10,
    img: PRODUCT_IMAGES[1],
    themeHex: '#00F2C3',
  },
  {
    id: 2,
    hash: '0x3bfdddd244fa7ec2ee0abfd6ebd3f9180766ea915c26b2169b0fa54ba0deba1c',
    name: 'Growth Realm',
    level: 'G2',
    price: 30,
    img: PRODUCT_IMAGES[2],
    themeHex: '#FFA500',
  },
  {
    id: 3,
    hash: '0x538d3ab96d7cf40f90e0c03dc80ddec36eff69fb7a72c1c6e1ffb6e6807cc9c3',
    name: 'Winners Realm',
    level: 'G3',
    price: 50,
    img: PRODUCT_IMAGES[3],
    themeHex: '#FF007A',
  },
  {
    id: 4,
    hash: '0x5eed06fb0ec9d27038e8fb47f960bc2188ab635070ffbfdfb34f71a9cfb058a9',
    name: 'Fighters Realm',
    level: 'G4',
    price: 100,
    img: PRODUCT_IMAGES[4],
    themeHex: '#3B82F6',
  },
  {
    id: 5,
    hash: '0x0d3c0529d38c6bfb94ecde004f2f9547d79bfa3fc73bbd8f1d3920addd15d656',
    name: 'Generals Realm',
    level: 'G5',
    price: 300,
    img: PRODUCT_IMAGES[5],
    themeHex: '#9D4EDD',
  },
  {
    id: 6,
    hash: '0xffda91b3699b703e2ef5b45c36ca6d5c5cf1ba1ba9762feee4f04c0ec2323ad1',
    name: 'Kings Realm',
    level: 'G6',
    price: 500,
    img: PRODUCT_IMAGES[6],
    themeHex: '#F43F5E',
  },
  {
    id: 7,
    hash: '0x375e1140df0357f12ac237f8674512727a80b85eb0ab6da17de8e17822a16d8a',
    name: 'Gods Realm',
    level: 'G7',
    price: 1000,
    img: PRODUCT_IMAGES[7],
    themeHex: '#111827',
  },
];

/** Each selected unit adds 365 days of validity. */
export function computeRealmValidityDays(quantity: number): number {
  if (quantity <= 0) return 0;
  return quantity * REALM_VALIDITY_DAYS_PER_UNIT;
}

export function formatRealmDayLabel(days: number): string {
  return `${days.toLocaleString('en-US')} Day`;
}

export function parseRealmGroupNumber(level: string): number {
  const match = level.match(/G(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : 1;
}

/** UI only — strip " Realm" suffix for display (e.g. "Winners Realm" → "Winners"). */
export function getRealmDisplayName(name: string): string {
  return name.replace(/\s+Realm$/i, '');
}

/** UI only — map on-chain group index (1–7) to card display name. Never pass to contracts. */
export function getRealmNameByGroupIdx(groupIdx: number): string {
  const product = STORE_REALM_PRODUCTS.find(
    (p) => parseRealmGroupNumber(p.level) === groupIdx,
  );
  return product ? getRealmDisplayName(product.name) : `G${groupIdx}`;
}

/** UI only — level + realm name, e.g. "Level 1 - Beginner". Never pass to contracts. */
export function getGroupLevelLabel(groupIdx: number): string {
  return `Level ${groupIdx} - ${getRealmNameByGroupIdx(groupIdx)}`;
}

/** UI only — human-readable sequential gate message; eligibility logic still uses numeric groupIdx. */
export function formatSequentialActivationLockReason(
  prevGroupIdx: number,
  groupIdx: number,
): string {
  return `${getGroupLevelLabel(prevGroupIdx)} must be active before activating ${getGroupLevelLabel(groupIdx)}`;
}
