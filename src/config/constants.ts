// src/config/constants.ts

import { defaultRecipientAvatar, media } from '../assets/media';

export const DEFAULT_AVATAR_PATH = media.avatars.default;
export const DEFAULT_RECIPIENT_AVATAR_PATH = defaultRecipientAvatar;

// ================================================
// ERX Phase 2 - Fee Structure
// ================================================

/**
 * Buy Fee: 5% (4% Treasury + 1% Update Fund)
 * Formula: User Receive = Input Amount * 0.95
 */
export const BUY_FEE_PERCENT = 5;

/**
 * Sell Fee: 5%
 * Formula: User Receive USD = (ERX Amount * Price) * 0.95
 */
export const SELL_FEE_PERCENT = 5;

/**
 * Transfer Fee: 7%
 * Note: 7% deducted if user transfers token to another wallet
 */
export const TRANSFER_FEE_PERCENT = 7;

// ================================================
// Decimal Precision - Dr. Satoshi's instruction
// ================================================

/**
 * Token decimals for precise calculations
 */
export const TOKEN_DECIMALS = {
  ERX: 18,        // ERX Token
  USDT: 6,        // Mock USDT (Testnet) / Real USDT (Mainnet)
  DAI: 18,        // Mock DAI (Testnet) / Real DAI (Mainnet)
  USDC: 6,        // USDC (Mainnet only)
  PRICE: 18,      // Output of getCurrentPrice from EDex
} as const;

/**
 * Utility: Calculate amount received after buy fee
 */
export const calculateAmountAfterBuyFee = (amount: number): number => {
  return amount * (1 - BUY_FEE_PERCENT / 100);
};

/**
 * Utility: Calculate amount received after sell fee
 */
export const calculateAmountAfterSellFee = (amount: number): number => {
  return amount * (1 - SELL_FEE_PERCENT / 100);
};

/**
 * Utility: Calculate amount received after transfer fee
 */
export const calculateAmountAfterTransferFee = (amount: number): number => {
  return amount * (1 - TRANSFER_FEE_PERCENT / 100);
};

// ================================================
// Addresses
// ================================================

/**
 * Zero address - for undeployed contracts
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;