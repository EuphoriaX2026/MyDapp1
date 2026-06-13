import { AppIcon } from '../icons/AppIcon';
import { EdexSwapIcon } from '../icons/EdexSwapIcon';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { EdexTokenMeta } from '../../config/edex-tokens';
import { AmountDisplay } from './AmountDisplay';

// ====================================================================================
// دکتر ساتوشی: رسم میکروسکوپی و پیکسلیِ انحناهای مایع (Fluid Bezier Geometry)
// ====================================================================================

const SVG_PAY_CARD =
  'M 40 12 Q 210 32 380 12 A 40 40 0 0 1 420 52 L 420 140 A 40 40 0 0 1 380 180 L 255 180 Q 210 135 165 180 L 40 180 A 40 40 0 0 1 0 140 L 0 52 A 40 40 0 0 1 40 12 Z';

const SVG_RECEIVE_CARD =
  'M 40 0 L 165 0 Q 210 45 255 0 L 380 0 A 40 40 0 0 1 420 40 L 420 128 A 40 40 0 0 1 380 168 Q 210 148 40 168 A 40 40 0 0 1 0 128 L 0 40 A 40 40 0 0 1 40 0 Z';

const CARD_SHADOW =
  'drop-shadow(0 8px 32px rgba(31, 38, 135, 0.12)) drop-shadow(0 4px 16px rgba(255, 255, 255, 0.35)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06))';

const GLASS_CARD_FILL = 'var(--app-glass-bg, rgba(255, 255, 255, 0.12))';
const GLASS_CARD_STROKE = 'var(--app-glass-border, rgba(255, 255, 255, 0.28))';

export interface SwapCardProps {
  title?: string;
  payBalance: string;
  payAmount: string;
  onPayAmountChange?: (value: string) => void;
  payUsdEstimate?: string;
  payTokenSymbol: string;
  receiveBalance: string;
  receiveAmount: string;
  /** Prefer numeric value for formatted gray display. */
  receiveAmountValue?: number;
  receiveAmountMaxFractionDigits?: number;
  receiveUsdEstimate?: string;
  receiveTokenSymbol: string;
  onSwap?: () => void;
  onSlideComplete?: () => void;
  onMax?: () => void;
  payToken?: EdexTokenMeta;
  receiveToken?: EdexTokenMeta;
  onPayTokenPicker?: () => void;
  onReceiveTokenPicker?: () => void;
  feeText?: string;
  /** Red fee styling when EGuard penalty is active */
  feePenaltyActive?: boolean;
  /** Slippage helper below slide button (Public EDex) */
  showSlippageNote?: boolean;
  rateText?: string;
  slideLabel?: string;
  slideDisabled?: boolean;
  /** When true, direction swap is blocked (e.g. E1 → ERX only). */
  swapDirectionDisabled?: boolean;
  layoutOffsetClass?: string;
  stablePickerOpen?: boolean;
  stablePickerSide?: 'pay' | 'receive' | null;
  stableOptions?: EdexTokenMeta[];
  selectedStableSymbol?: string;
  onSelectStable?: (symbol: string) => void;
  payExceedsBalance?: boolean;
  payBalanceNumeric?: number;
  payBalanceMaxFractionDigits?: number;
  receiveBalanceNumeric?: number;
  receiveBalanceMaxFractionDigits?: number;
  /** Public EDex on dark/video background — white labels, glass token picker */
  appearance?: 'default' | 'public' | 'edex';
}

function TokenBadge({ token }: { token: EdexTokenMeta }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden bg-white">
      <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
    </div>
  );
}

function StablePickerPortal({
  open,
  anchorRef,
  children,
  appearance = 'default',
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  appearance?: 'default' | 'public' | 'edex';
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 168 });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: Math.max(rect.width, 168),
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      data-stable-picker
      className={
        appearance === 'public'
          ? 'rounded-2xl border border-white/20 bg-white/10 p-1.5 flex flex-col gap-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl'
          : 'bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 flex flex-col gap-0.5'
      }
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        minWidth: coords.minWidth,
        zIndex: 99999,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export const SwapCard: React.FC<SwapCardProps> = ({
  title = 'Swap',
  payBalance,
  payAmount,
  onPayAmountChange,
  payUsdEstimate,
  payTokenSymbol,
  receiveBalance,
  receiveAmount,
  receiveAmountValue,
  receiveAmountMaxFractionDigits = 4,
  receiveUsdEstimate,
  receiveTokenSymbol,
  onSwap,
  onSlideComplete,
  onMax,
  payToken,
  receiveToken,
  onPayTokenPicker,
  onReceiveTokenPicker,
  feeText,
  feePenaltyActive = false,
  showSlippageNote = false,
  rateText,
  slideLabel = 'Slide to Swap',
  slideDisabled = false,
  swapDirectionDisabled = false,
  layoutOffsetClass = '',
  stablePickerOpen = false,
  stablePickerSide = null,
  stableOptions = [],
  selectedStableSymbol,
  onSelectStable,
  payExceedsBalance = false,
  payBalanceNumeric,
  payBalanceMaxFractionDigits = 4,
  receiveBalanceNumeric,
  receiveBalanceMaxFractionDigits = 4,
  appearance = 'default',
}) => {
  const isPublic = appearance === 'public';
  const isEdex = appearance === 'edex';
  const cardShadowStyle = isEdex ? undefined : { filter: CARD_SHADOW };
  const labelClass = `text-sm tracking-wide ${
    isEdex ? 'font-normal' : 'font-medium uppercase tracking-wider'
  } ${isPublic ? 'text-white/90' : 'text-gray-500'}`;
  const balanceClass = `text-sm tracking-tight tabular-nums ${
    isEdex ? 'font-normal' : 'font-bold'
  } ${isPublic ? 'text-white' : 'text-gray-500'}`;
  const amountWeightClass = isEdex ? 'font-normal' : 'font-bold';
  const decimalWeightClass = isEdex ? 'font-normal' : 'font-bold';
  const payMeta =
    payToken ?? ({ symbol: payTokenSymbol, logo: '', name: payTokenSymbol, address: '', decimals: 18 });
  const receiveMeta =
    receiveToken ??
    ({ symbol: receiveTokenSymbol, logo: '', name: receiveTokenSymbol, address: '', decimals: 18 });
  // ==========================================================
  // منطق فیزیک و کشیدنِ اسلایدر (Drag Logic)
  // ==========================================================
  const [isDragging, setIsDragging] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const payPickerAnchorRef = useRef<HTMLDivElement>(null);
  const receivePickerAnchorRef = useRef<HTMLDivElement>(null);

  const THUMB_SIZE = 54;
  const PADDING = 5;

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      // حداکثر مقداری که دکمه می‌تواند به راست برود
      const maxOffset = containerRect.width - THUMB_SIZE - (PADDING * 2);
      
      // محاسبه موقعیت جدید دکمه
      let newOffset = e.clientX - containerRect.left - (THUMB_SIZE / 2);
      newOffset = Math.max(0, Math.min(newOffset, maxOffset));
      
      setSlideOffset(newOffset);
    };

    const handlePointerUp = () => {
      if (!isDragging || !containerRef.current) return;
      setIsDragging(false);
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxOffset = containerRect.width - THUMB_SIZE - (PADDING * 2);

      // اگر کاربر بیشتر از 95% مسیر را کشید، عملیات را تایید کن
      if (slideOffset >= maxOffset * 0.95) {
        onSlideComplete?.();
        setTimeout(() => setSlideOffset(0), 400);
      } else {
        // در غیر این صورت، دکمه بدون انجام عملیات به سر جای اولش پرتاب می‌شود
        setSlideOffset(0);
      }
    };

    // اضافه کردن رویدادها به کل پنجره تا اگر کاربر موس را از روی کادر خارج کرد، درگ قطع نشود
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, slideOffset, onSlideComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (slideDisabled) return;
    setIsDragging(true);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full mx-auto font-sans ${isEdex ? 'swap-card--edex' : ''} ${layoutOffsetClass}`}
    >
      {!isPublic && title ? (
        <h2 className="text-xl font-bold text-gray-900 mb-[5px] tracking-wide drop-shadow-sm">
          {title}
        </h2>
      ) : null}

      <div className="relative w-full overflow-visible">
        <div className="flex flex-col gap-1 overflow-visible">
          
          {/* ============================== */}
          {/* TOP CARD (YOU PAY)             */}
          {/* ============================== */}
          <div
            className={`relative w-full h-[180px] overflow-visible ${
              stablePickerOpen && stablePickerSide === 'pay' ? 'z-[50]' : 'z-20'
            }`}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 420 180"
              preserveAspectRatio="none"
              className="absolute inset-0"
              style={cardShadowStyle}
              aria-hidden
            >
              <path
                d={SVG_PAY_CARD}
                fill={GLASS_CARD_FILL}
                stroke={GLASS_CARD_STROKE}
                strokeWidth="1"
              />
            </svg>

            <div className="absolute inset-0 px-6 pt-9 pb-7 flex flex-col justify-between">
              <div className="flex justify-between items-center px-1">
                <span className={`${labelClass}${isEdex ? ' swap-edex-label' : ''}`}>You Pay</span>
                <div className="flex items-center gap-2">
                  <AppIcon icon="lucide:wallet" size={16} className={isPublic ? 'text-white/80' : 'text-gray-400'} />
                  <span className={balanceClass}>
                    {payBalanceNumeric != null ? (
                      <>
                        <AmountDisplay
                          value={payBalanceNumeric}
                          maxFractionDigits={payBalanceMaxFractionDigits}
                          className={isPublic ? 'text-white' : ''}
                          decimalClassName={
                            isPublic
                              ? `text-[0.72em] ${decimalWeightClass} text-white opacity-80`
                              : `text-[0.72em] ${decimalWeightClass} opacity-80`
                          }
                        />{' '}
                        <span className={isPublic ? 'text-white' : 'text-gray-900'}>
                          {payTokenSymbol}
                        </span>
                      </>
                    ) : (
                      payBalance
                    )}
                  </span>
                  {onMax && (
                    <button
                      type="button"
                      onClick={onMax}
                      className={
                        isEdex
                          ? 'swap-edex-max-btn inline-flex items-center justify-center h-6 min-h-[24px] px-2.5 text-[11px] font-normal leading-none rounded-full text-white border-0 shadow-none transition-opacity hover:opacity-90 active:opacity-80'
                          : isPublic
                            ? 'text-[11px] font-bold px-3 py-1.5 rounded-full text-white bg-white/15 backdrop-blur-md shadow-none hover:bg-white/25 active:translate-y-px transition-colors'
                            : 'text-[11px] font-bold px-3 py-1.5 rounded-full text-white bg-gradient-to-b from-neutral-700 to-neutral-950 border border-neutral-600 border-b-[3px] border-b-black shadow-none hover:from-neutral-600 hover:to-neutral-900 active:border-b-[1px] active:translate-y-[2px] transition-[transform,background,border] duration-100'
                      }
                    >
                      Max
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center px-1 pb-1 gap-2 relative">
                <div ref={payPickerAnchorRef} className="relative shrink-0" data-stable-picker>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPayTokenPicker?.();
                    }}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-colors ${
                      isPublic ? 'hover:bg-white/10' : 'hover:bg-gray-50/80'
                    } ${onPayTokenPicker ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <TokenBadge token={payMeta} />
                    <span className="font-bold text-[19px] text-gray-900 tracking-tight">{payMeta.symbol}</span>
                    {onPayTokenPicker && (
                      <AppIcon
                        icon="lucide:chevron-down"
                        width={18}
                        height={18}
                        className={`transition-transform ${
                          isPublic ? 'text-white/70' : 'text-gray-400'
                        } ${stablePickerOpen && stablePickerSide === 'pay' ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>
                </div>

                <div className="text-right flex-1 min-w-0 overflow-hidden pl-2 z-10">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={payAmount}
                    onChange={(e) => onPayAmountChange?.(e.target.value)}
                    placeholder="0"
                    className={`swap-amount-input financial-amount text-[clamp(1.25rem,7vw,2.125rem)] ${amountWeightClass} text-right w-full min-w-0 outline-none bg-transparent tracking-tighter truncate tabular-nums leading-none transition-colors ${
                      isEdex ? `swap-edex-pay-amount${payExceedsBalance ? ' swap-edex-pay-exceeds' : ''}` : ''
                    } ${payExceedsBalance ? 'text-[#F0ABCE]' : 'text-gray-900'}`}
                  />
                  {payUsdEstimate && (
                    <div
                      className={`text-sm mt-0.5 tabular-nums ${
                        isEdex ? 'swap-edex-usd font-normal' : `font-medium ${isPublic ? 'text-white/90' : 'text-gray-400'}`
                      }`}
                    >
                      {payUsdEstimate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================== */}
          {/* BOTTOM CARD (YOU RECEIVE)      */}
          {/* ============================== */}
          <div
            className={`relative w-full h-[180px] overflow-visible ${
              stablePickerOpen && stablePickerSide === 'receive' ? 'z-[50]' : 'z-30'
            }`}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 420 180"
              preserveAspectRatio="none"
              className="absolute inset-0"
              style={cardShadowStyle}
              aria-hidden
            >
              <path
                d={SVG_RECEIVE_CARD}
                fill={GLASS_CARD_FILL}
                stroke={GLASS_CARD_STROKE}
                strokeWidth="1"
              />
            </svg>

            <div className="absolute inset-0 px-6 pt-7 pb-9 flex flex-col justify-between">
              <div className="flex justify-between items-center px-1 pt-1">
                <span className={`${labelClass}${isEdex ? ' swap-edex-label' : ''}`}>You Receive</span>
                <div className="flex items-center gap-2">
                  <AppIcon icon="lucide:wallet" size={16} className={isPublic ? 'text-white/80' : 'text-gray-400'} />
                  <span className={balanceClass}>
                    {receiveBalanceNumeric != null ? (
                      <>
                        <AmountDisplay
                          value={receiveBalanceNumeric}
                          maxFractionDigits={receiveBalanceMaxFractionDigits}
                          className={isPublic ? 'text-white' : ''}
                          decimalClassName={
                            isPublic
                              ? `text-[0.72em] ${decimalWeightClass} text-white opacity-80`
                              : `text-[0.72em] ${decimalWeightClass} opacity-80`
                          }
                        />{' '}
                        <span className={isPublic ? 'text-white' : 'text-gray-900'}>
                          {receiveTokenSymbol}
                        </span>
                      </>
                    ) : (
                      receiveBalance
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center px-1 pb-1 gap-2 relative">
                <div ref={receivePickerAnchorRef} className="relative shrink-0" data-stable-picker>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReceiveTokenPicker?.();
                    }}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-colors ${
                      isPublic ? 'hover:bg-white/10' : 'hover:bg-gray-50/80'
                    } ${onReceiveTokenPicker ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <TokenBadge token={receiveMeta} />
                    <span className="font-bold text-[19px] text-gray-900 tracking-tight">{receiveMeta.symbol}</span>
                    {onReceiveTokenPicker && (
                      <AppIcon
                        icon="lucide:chevron-down"
                        width={18}
                        height={18}
                        className={`transition-transform ${
                          isPublic ? 'text-white/70' : 'text-gray-400'
                        } ${stablePickerOpen && stablePickerSide === 'receive' ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>
                </div>

                <div className="text-right flex-1 min-w-0 overflow-hidden pl-2 z-10">
                  <div
                    className={`swap-amount-display financial-amount text-[clamp(1.25rem,7vw,2.125rem)] ${amountWeightClass} text-right w-full text-gray-900 tracking-tighter truncate tabular-nums leading-none ${
                      isEdex ? 'swap-edex-receive-amount' : ''
                    }`}
                    aria-live="polite"
                  >
                    {receiveAmountValue != null && receiveAmountValue > 0 ? (
                      <AmountDisplay
                        value={receiveAmountValue}
                        maxFractionDigits={receiveAmountMaxFractionDigits}
                        minFractionDigits={isEdex ? 2 : 2}
                        className={isEdex ? 'swap-edex-receive-amount-value' : 'text-gray-900'}
                        decimalClassName={`text-[0.58em] ${decimalWeightClass} ${isEdex ? 'swap-edex-receive-amount-decimal' : 'text-gray-900'} align-baseline opacity-90`}
                      />
                    ) : receiveAmount ? (
                      <span>{receiveAmount}</span>
                    ) : (
                      <span className={isEdex ? 'swap-edex-receive-zero' : isPublic ? 'text-gray-900/40' : 'text-gray-300'}>0</span>
                    )}
                  </div>
                  {receiveUsdEstimate && (
                    <div
                      className={`text-sm mt-0.5 tabular-nums ${
                        isEdex ? 'swap-edex-usd font-normal' : `font-medium ${isPublic ? 'text-white/90' : 'text-gray-400/90'}`
                      }`}
                    >
                      {receiveUsdEstimate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* SWAP BUTTON (EYE CUTOUT)       */}
        {/* ============================== */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
          <button
            type="button"
            onClick={swapDirectionDisabled ? undefined : onSwap}
            disabled={swapDirectionDisabled}
            className={`flex items-center justify-center p-3 transition-transform group ${
              swapDirectionDisabled
                ? 'cursor-not-allowed opacity-40'
                : 'cursor-pointer hover:scale-110 active:scale-90'
            }`}
            aria-label="Swap direction"
            aria-disabled={swapDirectionDisabled}
          >
            {isEdex ? (
              <EdexSwapIcon
                width={28}
                height={28}
                className="text-gray-800 drop-shadow-sm group-hover:rotate-180 transition-transform duration-500"
              />
            ) : (
              <AppIcon
                icon="lucide:arrow-down-up"
                width={28}
                height={28}
                className="text-gray-800 drop-shadow-sm group-hover:rotate-180 transition-transform duration-500"
              />
            )}
          </button>
        </div>
      </div>

      {/* ============================== */}
      {/* INFO FOOTER (FEES & RATE)      */}
      {/* ============================== */}
      {(feeText || rateText) && (
        <div
          className={`flex flex-col items-center gap-2 w-full ${
            isEdex ? 'swap-edex-meta' : 'mt-[5px]'
          }`}
        >
          {feeText && (
            <div className="flex items-center gap-1.5">
              <AppIcon icon="lucide:flame" width={12} height={12} className="text-red-500" />
              <span
                className={`font-normal text-[11px] ${isPublic ? 'text-white/90' : 'text-gray-400'}`}
              >
                Fee:{' '}
                <span
                  className={
                    feePenaltyActive
                      ? 'font-bold text-red-500'
                      : isPublic
                        ? 'font-normal text-white'
                        : 'text-gray-600 font-normal'
                  }
                >
                  {feeText}
                </span>
              </span>
            </div>
          )}

          {rateText && (
            <div className="flex items-center gap-1.5 text-center">
              {!isEdex && (
                <AppIcon
                  icon="lucide:rotate-cw"
                  width={11}
                  height={11}
                  className={`shrink-0 ${isPublic ? 'text-white/80' : 'text-gray-600'}`}
                />
              )}
              <span
                className={`font-normal text-[11px] ${isPublic ? 'text-white/90' : 'text-gray-400'}`}
              >
                {rateText}
              </span>
            </div>
          )}
        </div>
      )}

      {isEdex ? (
        <button
          type="button"
          disabled={slideDisabled}
          onClick={() => {
            if (slideDisabled) return;
            onSlideComplete?.();
          }}
          className="swap-edex-confirm-btn w-full mt-0 min-h-[52px] rounded-2xl border-0 text-[17px] font-semibold tracking-wide text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:opacity-90 enabled:active:opacity-80"
        >
          {slideLabel}
        </button>
      ) : (
        <div
          ref={containerRef}
          className={`w-full mt-5 rounded-full p-[5px] flex items-center relative overflow-hidden ${
            isPublic
              ? 'border-0 bg-white/10 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.12)]'
              : 'bg-[#0B0E14] shadow-xl'
          } ${slideDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ touchAction: 'none' }}
        >
          <div
            className={`absolute left-[5px] top-[5px] bottom-[5px] rounded-full pointer-events-none z-0 ${isDragging ? '' : 'transition-all duration-300 ease-out'} ${
              isPublic ? '' : 'shadow-[0_0_20px_rgba(226,232,240,0.6)]'
            }`}
            style={{
              width: `${slideOffset + 54}px`,
              background: isPublic
                ? 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 70%, rgba(255,255,255,0.45) 100%)'
                : 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(226,232,240,0.5) 70%, rgba(248,250,252,0.9) 100%)',
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/90 font-bold text-[17px] tracking-wide select-none">{slideLabel}</span>
          </div>

          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <AppIcon icon="lucide:chevron-right" size={20} className="text-white/20 animate-pulse" strokeWidth={3} />
            <AppIcon
              icon="lucide:chevron-right"
              width={20}
              height={20}
              className="text-white/50 animate-pulse -ml-2.5"
              style={{ animationDelay: '150ms' }}
            />
            <AppIcon
              icon="lucide:chevron-right"
              width={20}
              height={20}
              className="text-white/90 animate-pulse -ml-2.5"
              style={{ animationDelay: '300ms' }}
            />
          </div>

          <div
            ref={thumbRef}
            onPointerDown={handlePointerDown}
            className={`w-[54px] h-[54px] rounded-full flex items-center justify-center relative z-10 shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)] select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab transition-transform duration-300 ease-out'
            }`}
            style={{
              transform: `translateX(${slideOffset}px)`,
              background: `
                repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px),
                conic-gradient(from 110deg, #f8fafc 0%, #e0f2fe 15%, #f8fafc 30%, #fae8ff 50%, #f8fafc 70%, #e0f2fe 85%, #f8fafc 100%)
              `,
            }}
          >
            <div
              className={`absolute inset-[1px] rounded-full pointer-events-none ${
                isPublic
                  ? 'border-0 bg-white/15'
                  : 'border border-white/80 bg-gradient-to-tr from-white/20 to-transparent'
              }`}
            />
            <AppIcon
              icon="lucide:plane"
              width={24}
              height={24}
              className={`drop-shadow-md relative z-10 pointer-events-none rotate-45 ${
                isPublic ? 'text-white' : 'text-gray-900'
              }`}
            />
          </div>
        </div>
      )}

      {showSlippageNote && (
        <p
          className={`mt-2 text-center text-[10px] leading-snug ${
            isPublic ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          Note: ERX price is dynamic. A 2% slippage tolerance is automatically applied to protect
          your transaction.
        </p>
      )}

      <StablePickerPortal
        open={Boolean(
          stablePickerOpen && stablePickerSide === 'pay' && stableOptions.length > 0,
        )}
        anchorRef={payPickerAnchorRef}
        appearance={appearance}
      >
        {stableOptions.map((opt) => (
          <button
            key={opt.symbol}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStable?.(opt.symbol);
            }}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left w-full transition-colors ${
              isPublic
                ? selectedStableSymbol === opt.symbol
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
                : selectedStableSymbol === opt.symbol
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
            }`}
          >
            <img src={opt.logo} alt={opt.symbol} className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-[15px] text-gray-900">{opt.symbol}</span>
          </button>
        ))}
      </StablePickerPortal>

      <StablePickerPortal
        open={Boolean(
          stablePickerOpen && stablePickerSide === 'receive' && stableOptions.length > 0,
        )}
        anchorRef={receivePickerAnchorRef}
        appearance={appearance}
      >
        {stableOptions.map((opt) => (
          <button
            key={opt.symbol}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStable?.(opt.symbol);
            }}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left w-full transition-colors ${
              isPublic
                ? selectedStableSymbol === opt.symbol
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
                : selectedStableSymbol === opt.symbol
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
            }`}
          >
            <img src={opt.logo} alt={opt.symbol} className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-[15px] text-gray-900">{opt.symbol}</span>
          </button>
        ))}
      </StablePickerPortal>
    </div>
  );
};

export default SwapCard;