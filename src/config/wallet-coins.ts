/**
 * Shared coin metadata & USD prices — source of truth for MyWallet (Coins tab) and EDex.
 * Token logos are loaded from src/assets/img/tokens/.
 */
import erxLogo from '../assets/img/tokens/erx-logo.png';
import e1Token from '../assets/img/tokens/E1.png';
import qbitToken from '../assets/img/tokens/QBit.png';
import daiLogo from '../assets/img/tokens/multi-collateral-dai-dai-logo.png';
import polLogo from '../assets/img/tokens/pol.svg';
import usdtLogo from '../assets/img/tokens/tether-usdt-logo.png';

export const WALLET_STABLE_PRICES = {
  POL: 0.45,
  DAI: 1.0,
  E1: 1.0,
  QBit: 100.0,
} as const;

/** QBit USD valuation (hardcoded until on-chain oracle is wired). */
export const QBIT_USD_PRICE = 100 as const;

export type WalletCoinSymbol = 'ERX' | 'E1' | 'QBit' | 'DAI' | 'POL' | 'USDT';

export interface WalletCoinMeta {
  symbol: WalletCoinSymbol;
  name: string;
  logo: string;
}

export const WALLET_COINS: Record<WalletCoinSymbol, WalletCoinMeta> = {
  ERX: {
    symbol: 'ERX',
    name: 'ERX Token',
    logo: erxLogo,
  },
  E1: {
    symbol: 'E1',
    name: 'E1 Token',
    logo: e1Token,
  },
  QBit: {
    symbol: 'QBit',
    name: 'QBit Token',
    logo: qbitToken,
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    logo: daiLogo,
  },
  POL: {
    symbol: 'POL',
    name: 'Polygon Ecosystem Token',
    logo: polLogo,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    logo: usdtLogo,
  },
};

/** Tether USDT logo (local asset; used by SendMoney and other flows). */
export const USDT_TOKEN_LOGO = usdtLogo;

/** Coins tab order (matches MyWallet portfolio sort source). */
export const WALLET_COINS_TAB_ORDER: WalletCoinSymbol[] = [
  'ERX',
  'E1',
  'QBit',
  'DAI',
  'USDT',
  'POL',
];

/** MyWallet — always listed even when balance is zero. */
export const WALLET_ALWAYS_VISIBLE_SYMBOLS: WalletCoinSymbol[] = [
  'ERX',
  'E1',
  'QBit',
  'DAI',
  'USDT',
  'POL',
];

export function getWalletCoinUsdPrice(
  symbol: string,
  erxLivePrice = 0,
): number {
  if (symbol === 'ERX') return erxLivePrice > 0 ? erxLivePrice : 0;
  if (symbol === 'QBit') return QBIT_USD_PRICE;
  if (symbol === 'DAI') return WALLET_STABLE_PRICES.DAI;
  if (symbol === 'E1') return WALLET_STABLE_PRICES.E1;
  if (symbol === 'POL') return WALLET_STABLE_PRICES.POL;
  if (symbol === 'USDT') return WALLET_STABLE_PRICES.DAI;
  return 1;
}
