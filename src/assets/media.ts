/**
 * Central media registry — import assets from here instead of /public paths.
 *
 * Logos (src/assets/img/logos)
 * - logo.png / logo-e1.png — same white E mark (e1 token / project); only logo.png is imported
 * - my-logo.png — colored brand E mark (purple-blue)
 * - logo-mini.png — black E mark
 * - e-one.png — colored brand typography wordmark
 * - logo-main-2.png — black typography wordmark
 * - logo-erx.png — white ERX token mark, no background
 * - coins.png — coins illustration
 *
 * Icons (src/assets/img/icons)
 * - favicon.png — same as my-logo.png (colored E mark)
 * - loading uses my-logo.png (loading-icon.png is obsolete)
 * - pwa.png — icon when user adds web app to home screen / desktop
 *
 * Tokens (src/assets/img/tokens) — see wallet-coins.ts for runtime usage
 * - erx-logo.png ≡ erx.png (ERX coin)
 * - QBit.png ≡ qbit-logo.png (QBit coin)
 * - E1.png, polygon-matic-logo.png (white bg), pol.svg (purple bg), DAI, USDC, USDT, etc.
 *
 * Avatars — avatar1.jpg ≡ b4437cfab070df39291140342aedb4ea.jpg
 */

import brandMarkWhite from './img/logos/logo.png';
import logoMain2 from './img/logos/logo-main-2.png';
import brandMarkColored from './img/logos/my-logo.png';
import logoMini from './img/logos/logo-mini.png';
import eOneLogo from './img/logos/e-one.png';
import logoErxMark from './img/logos/logo-erx.png';
import coinsIllustration from './img/logos/coins.png';

import pwaIcon from './img/icons/pwa.png';

import erxLogo from './img/tokens/erx-logo.png';
import e1Token from './img/tokens/E1.png';
import qbitToken from './img/tokens/QBit.png';
import daiTokenLogo from './img/tokens/multi-collateral-dai-dai-logo.png';
import polTokenLogo from './img/tokens/pol.svg';
import usdtTokenLogo from './img/tokens/tether-usdt-logo.png';

import product1 from './img/products/product-1.jpg';
import product2 from './img/products/product-2.jpg';
import product3 from './img/products/product-3.jpg';
import product4 from './img/products/product-4.jpg';
import product5 from './img/products/product-5.jpg';
import product6 from './img/products/product-6.jpg';
import product7 from './img/products/product-7.jpg';

import bannerHomeKitchen from './img/banners/20260413_0010315.jpg';
import bannerDigital from './img/banners/banner-finanncing-digital.webp';
import bannerGoldAccessories from './img/banners/banner-finanncing-gold-accessreios.webp';
import bannerFinancingKitchen from './img/banners/banner-finanncing-home-kitchen.webp';
import myPlanBackground from './img/backgrounds/2804547f9262ad29dfe4bb12cdcfc9d8.jpg';
import roadmapBanner from './img/banners/roadmap-banner.jpg';

import gameCasino from './img/game/game-casino.png';
import gameMarket from './img/game/game-market.png';
import gamePoints from './img/game/game-points.png';
import gameSports from './img/game/game-sports.png';
import gameMagicBags from './img/game/game-magic-bags.png';
import gameTurbo from './img/game/game-turbo.png';

import flashGold from './img/ranks/flash-gold.png';
import diamondRed from './img/ranks/diamond-red.png';
import diamondBlue from './img/ranks/diamond-blue.png';
import diamondGold from './img/ranks/diamond-gold.png';

import defaultAvatar from './img/sample/avatar/avatar1.jpg';
import cosmicHorizonBg from './img/Backgrounds/e19695e957d9b3186b055a36b21840b6.jpg';

/** @deprecated Use brandMarkWhite — logo-e1.png is a duplicate file on disk */
const logoE1 = brandMarkWhite;
/** @deprecated Use eOneLogo — app-logo.png is obsolete */
const appHeaderLogo = eOneLogo;
/** @deprecated Use brandMarkColored — loading-icon.png is obsolete */
const loadingIcon = brandMarkColored;
const favicon = brandMarkColored;
const appLogo = brandMarkWhite;
const myLogo = brandMarkColored;
const logoErx = logoErxMark;
const defaultRecipientAvatar = defaultAvatar;

export const media = {
  logos: {
    /** White E mark (logo.png) */
    app: brandMarkWhite,
    /** Same file as app — white E mark */
    e1: brandMarkWhite,
    /** Black typography wordmark */
    main2: logoMain2,
    /** White ERX token mark */
    erx: logoErxMark,
    /** Black E mark */
    mini: logoMini,
    /** Colored brand E mark */
    my: brandMarkColored,
    coins: coinsIllustration,
    /** Colored brand typography wordmark */
    eOne: eOneLogo,
    /** Header / app title — colored typography (was app-logo.png) */
    header: eOneLogo,
  },
  icons: {
    /** Colored brand E mark (was loading-icon.png) */
    loading: brandMarkColored,
    /** Same as my-logo.png */
    favicon: brandMarkColored,
    /** Add-to-home-screen / PWA install icon */
    pwa: pwaIcon,
  },
  tokens: {
    erx: erxLogo,
    e1: e1Token,
    qbit: qbitToken,
    dai: daiTokenLogo,
    pol: polTokenLogo,
    usdt: usdtTokenLogo,
    /** @deprecated Use pol — polygon-matic-logo.png is white-bg variant */
    polygon: polTokenLogo,
  },
  products: {
    1: product1,
    2: product2,
    3: product3,
    4: product4,
    5: product5,
    6: product6,
    7: product7,
  },
  banners: {
    homeKitchen: bannerHomeKitchen,
    digital: bannerDigital,
    goldAccessories: bannerGoldAccessories,
    financingKitchen: bannerFinancingKitchen,
    myPlan: myPlanBackground,
    roadmap: roadmapBanner,
  },
  game: {
    casino: gameCasino,
    market: gameMarket,
    points: gamePoints,
    sports: gameSports,
    magicBags: gameMagicBags,
    turbo: gameTurbo,
  },
  ranks: {
    flashGold,
    diamondRed,
    diamondBlue,
    diamondGold,
    bannerLevel1: gameCasino,
  },
  avatars: {
    default: defaultAvatar,
    /** Same image as default (b4437cfab… duplicate on disk) */
    recipient: defaultAvatar,
  },
  backgrounds: {
    cosmicHorizon: cosmicHorizonBg,
  },
} as const;

export const PRODUCT_IMAGES: Record<number, string> = {
  1: media.products[1],
  2: media.products[2],
  3: media.products[3],
  4: media.products[4],
  5: media.products[5],
  6: media.products[6],
  7: media.products[7],
};

export {
  appLogo,
  logoMain2,
  logoE1,
  logoErx,
  logoMini,
  myLogo,
  coinsIllustration,
  eOneLogo,
  appHeaderLogo,
  loadingIcon,
  favicon,
  pwaIcon,
  erxLogo,
  e1Token,
  qbitToken,
  daiTokenLogo,
  polTokenLogo,
  usdtTokenLogo,
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
  product7,
  defaultAvatar,
  defaultRecipientAvatar,
  cosmicHorizonBg,
  myPlanBackground,
  roadmapBanner,
};
