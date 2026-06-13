import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import { SwapCard } from '../../components/ui/SwapCard';
import { EGuardPenaltyBanner } from '../../components/ui/EGuardPenaltyBanner';
import { FinappPilledTabs } from '../../components/ui/FinappPilledTabs';
import { FinappBankCards } from '../../components/FinappBankCards';
import { GlassCard } from '../../components/ui/glass';
import { Navbar } from './Login';
import { LegalDisclaimerModal } from '../../components/ui/LegalDisclaimerModal';
import { PublicCosmicBackground } from '../../components/ui/PublicCosmicBackground';
import { useDisclaimer } from '../../hooks/useDisclaimer';
import { formatLocaleNumber } from '../../utils/formatLocaleNumber';
import { Toast } from '../../components/Toast';
import { EdexSwapReviewSheet } from '../../components/edex/EdexSwapReviewSheet';
import { useEdexSwapFlow } from '../../hooks/useEdexSwapFlow';
import '../../styles/finapp-bank-cards.css';
import '../../styles/edex-page.css';

const FOG_MASK = 'linear-gradient(to bottom, transparent 0%, black 35%)';

export const PublicEDex = () => {
  const { showDisclaimer, acceptDisclaimer } = useDisclaimer();
  const formRef = useRef<HTMLFormElement>(null);
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'swap' | 'card' | 'pools'>('swap');

  const flow = useEdexSwapFlow({ variant: 'public', returnTo: '/public-edex' });
  const {
    routeNotice,
    setRouteNotice,
    reviewOpen,
    setReviewOpen,
    reviewKind,
    approveSuccessHash,
    setApproveSuccessHash,
    stableOptionsList,
    stableTradable,
    stableMeta,
    payMeta,
    receiveMeta,
    payBalance,
    receiveBalance,
    payBalanceNum,
    receiveBalanceNum,
    payExceedsBalance,
    payUsdValue,
    receiveUsdValue,
    outputAmount,
    displayFee,
    feeSymbol,
    rateText,
    isPenaltyActive,
    isPending,
    isTxBusy,
    slideDisabled,
    mode,
    selectedStable,
    stablePickerOpen,
    stablePickerSide,
    reviewPayAmount,
    reviewReceiveAmount,
    spenderLabel,
    payAmountDisplay,
    handleFormSubmit,
    handleSwapMode,
    toggleStablePicker,
    handleSelectStable,
    handleAmountChange,
    handleMax,
    triggerSubmit,
    handleApproveContinue,
    confirmReview,
    buildSlideLabel,
  } = flow;

  const payUsdEstimate =
    payUsdValue > 0
      ? `≈ ${formatLocaleNumber(payUsdValue, { maxFractionDigits: 2 })} USD`
      : undefined;

  const receiveUsdEstimate =
    receiveUsdValue > 0
      ? `≈ ${formatLocaleNumber(receiveUsdValue, { maxFractionDigits: 2 })} USD`
      : undefined;

  const slideLabel = buildSlideLabel({
    connect: 'Connect Wallet',
    confirm: 'Slide to Swap',
    approve: (stable) => `Approve ${stable}`,
    publicSwap: 'Slide to Swap',
  });

  const edexTabs = [
    { id: 'swap' as const, label: 'Swap' },
    { id: 'card' as const, label: 'Credit Card' },
    { id: 'pools' as const, label: 'Liquidity Pools' },
  ];

  useEffect(() => {
    if (!walletMenuOpen) return;
    const close = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-wallet-menu]')) return;
      setWalletMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [walletMenuOpen]);

  const handleConnect = useCallback(() => {
    if (!isConnected) {
      setWalletMenuOpen(false);
      openConnectModal?.();
      return;
    }
    setWalletMenuOpen((open) => !open);
  }, [isConnected, openConnectModal]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setWalletMenuOpen(false);
  }, [disconnect]);

  return (
    <>
      <LegalDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={acceptDisclaimer}
        onDecline={() => {
          window.location.href = 'https://google.com';
        }}
      />

      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#02071A]">
        <PublicCosmicBackground />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[60%] border-t border-white/20 bg-white/10 backdrop-blur-3xl"
          aria-hidden
          style={{
            maskImage: FOG_MASK,
            WebkitMaskImage: FOG_MASK,
          }}
        />

        <Navbar
          variant="glass"
          onConnect={handleConnect}
          isConnected={isConnected}
          address={address}
          connectLabel="Connect Wallet"
          walletMenuVariant="disconnect"
          walletMenuOpen={walletMenuOpen}
          onDisconnect={handleDisconnect}
        />

        <main className="relative z-20 flex flex-col items-center justify-center px-6 pt-32 pb-16 min-h-screen">
          <GlassCard glowColor="pink" className="w-full max-w-xl mx-auto">
            <div className="p-4 sm:p-6">
              <FinappPilledTabs
                tabs={edexTabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="mb-4"
                contentClassName="tab-content mt-1 min-h-[480px] min-h-[55vh]"
              >
                {activeTab === 'swap' && (
                  <form ref={formRef} onSubmit={handleFormSubmit}>
                    <EGuardPenaltyBanner isVisible={isPenaltyActive} />
                    <SwapCard
                      appearance="public"
                      title="Swap"
                      payBalance={payBalance}
                      payBalanceNumeric={payBalanceNum}
                      payBalanceMaxFractionDigits={
                        mode === 'BUY' ? (stableMeta.decimals === 6 ? 2 : 4) : 4
                      }
                      payExceedsBalance={payExceedsBalance}
                      payAmount={payAmountDisplay}
                      onPayAmountChange={handleAmountChange}
                      payUsdEstimate={payUsdEstimate}
                      payTokenSymbol={payMeta.symbol}
                      payToken={payMeta}
                      receiveBalance={receiveBalance}
                      receiveBalanceNumeric={receiveBalanceNum}
                      receiveBalanceMaxFractionDigits={
                        mode === 'BUY' ? 4 : stableMeta.decimals === 6 ? 2 : 4
                      }
                      receiveAmount=""
                      receiveAmountValue={outputAmount > 0 ? outputAmount : undefined}
                      receiveAmountMaxFractionDigits={2}
                      receiveUsdEstimate={receiveUsdEstimate}
                      receiveTokenSymbol={receiveMeta.symbol}
                      receiveToken={receiveMeta}
                      onSwap={handleSwapMode}
                      onSlideComplete={triggerSubmit}
                      onMax={handleMax}
                      stablePickerOpen={stablePickerOpen}
                      stablePickerSide={stablePickerSide}
                      stableOptions={stableOptionsList}
                      selectedStableSymbol={selectedStable}
                      onSelectStable={handleSelectStable}
                      onPayTokenPicker={mode === 'BUY' ? () => toggleStablePicker('pay') : undefined}
                      onReceiveTokenPicker={
                        mode === 'SELL' ? () => toggleStablePicker('receive') : undefined
                      }
                      feeText={`${displayFee}${isPenaltyActive ? '' : ` ${feeSymbol}`}`}
                      feePenaltyActive={isPenaltyActive}
                      showSlippageNote
                      rateText={rateText}
                      slideLabel={slideLabel}
                      slideDisabled={slideDisabled || (mode === 'BUY' && !stableTradable)}
                    />
                  </form>
                )}

                {activeTab === 'card' && (
                  <div className="edex-page edex-bank-cards-wrap">
                    <FinappBankCards appearance="edex" />
                  </div>
                )}

                {activeTab === 'pools' && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <p
                      className="text-center text-sm font-medium text-gray-600"
                      aria-label="Coming soon"
                    >
                      COMING SOON
                    </p>
                  </div>
                )}
              </FinappPilledTabs>
            </div>
          </GlassCard>
        </main>
      </div>

      <EdexSwapReviewSheet
        open={reviewOpen}
        kind={reviewKind}
        payToken={payMeta}
        receiveToken={reviewKind === 'approve' ? payMeta : receiveMeta}
        payAmount={reviewPayAmount}
        receiveAmount={reviewReceiveAmount}
        feeText={
          reviewKind === 'swap'
            ? `${displayFee}${isPenaltyActive ? '' : ` ${feeSymbol}`}`
            : undefined
        }
        rateText={reviewKind === 'swap' ? rateText : undefined}
        spenderLabel={spenderLabel}
        onConfirm={confirmReview}
        onClose={() => {
          if (!isPending && !isTxBusy) {
            setReviewOpen(false);
            setApproveSuccessHash(undefined);
          }
        }}
        isBusy={isPending || isTxBusy}
        approveSuccessHash={approveSuccessHash}
        sectionLabel="EDex"
        onApproveContinue={handleApproveContinue}
      />

      <Toast
        placement="public"
        isVisible={!!routeNotice}
        message={routeNotice ?? ''}
        type="info"
        onClose={() => setRouteNotice(null)}
        duration={4000}
      />
    </>
  );
};

export default PublicEDex;
