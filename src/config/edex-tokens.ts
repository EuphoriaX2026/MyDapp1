import { ERX_CONTRACTS, TOKENS, ZERO_ADDRESS, isContractDeployed } from './erx-contracts';
import { TITAN_CONTRACTS } from './my-titan-contracts';
import { TOKEN_DECIMALS_MAP } from './wagmi';
import { WALLET_COINS } from './wallet-coins';

export type StableSymbol = 'DAI' | 'E1' | 'QBit';

const QBIT_ADDRESS =
  (import.meta.env.VITE_QBIT_TOKEN_ADDRESS as string | undefined) ?? ZERO_ADDRESS;

export interface EdexTokenMeta {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}

export const EDEX_TOKEN_META: Record<'ERX' | StableSymbol, EdexTokenMeta> = {
  ERX: {
    symbol: WALLET_COINS.ERX.symbol,
    name: WALLET_COINS.ERX.name,
    address: ERX_CONTRACTS.ERX,
    decimals: 18,
    logo: WALLET_COINS.ERX.logo,
  },
  DAI: {
    symbol: WALLET_COINS.DAI.symbol,
    name: WALLET_COINS.DAI.name,
    address: TOKENS.DAI,
    decimals: 18,
    logo: WALLET_COINS.DAI.logo,
  },
  E1: {
    symbol: WALLET_COINS.E1.symbol,
    name: WALLET_COINS.E1.name,
    address: TITAN_CONTRACTS.E1,
    decimals: TOKEN_DECIMALS_MAP[TITAN_CONTRACTS.E1] ?? 18,
    logo: WALLET_COINS.E1.logo,
  },
  QBit: {
    symbol: WALLET_COINS.QBit.symbol,
    name: WALLET_COINS.QBit.name,
    address: QBIT_ADDRESS,
    decimals: 18,
    logo: WALLET_COINS.QBit.logo,
  },
};

export const STABLE_OPTIONS: StableSymbol[] = ['DAI', 'E1', 'QBit'];

export function isStableTradable(symbol: StableSymbol): boolean {
  const addr = EDEX_TOKEN_META[symbol].address;
  return isContractDeployed(addr);
}

/** Polygon network logo — same source as MyWallet portfolio (POL). */
export const POLYGON_NETWORK_LOGO = WALLET_COINS.POL.logo;
