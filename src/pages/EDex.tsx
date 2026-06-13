import { AppIcon } from '../components/icons/AppIcon';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import { formatAddressForDisplay } from '../utils/addressValidation';
import { POLYGON_NETWORK_LOGO } from '../config/edex-tokens';
import { SwapCard } from '../components/ui/SwapCard';
import { EGuardPenaltyBanner } from '../components/ui/EGuardPenaltyBanner';
import { FinappPilledTabs } from '../components/ui/FinappPilledTabs';
import { FinappBankCards } from '../components/FinappBankCards';
import '../styles/finapp-bank-cards.css';
import '../styles/edex-page.css';
import { formatEdexUsdEstimate } from '../utils/edexSwapHelpers';
import { Toast } from '../components/Toast';
import { EdexSwapReviewSheet } from '../components/edex/EdexSwapReviewSheet';
import { useEdexSwapFlow } from '../hooks/useEdexSwapFlow';
import { getTransactionHistoryPath } from '../config/transactionHistoryTabs';

export default function EDex() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const connectedAddress = isConnected ? address : undefined;

  const flow = useEdexSwapFlow({ variant: 'app', returnTo: '/edex' });
  const {
    activeAddress,
    routeNotice,
    setRouteNotice,
    reviewOpen,
    setReviewOpen,
    reviewKind,
    approveSuccessHash,
    setApproveSuccessHash,
    stableOptionsList,
    stableTradable,
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
    swapDirectionDisabled,
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

  const [activeTab, setActiveTab] = useState<'swap' | 'card' | 'pools'>('swap');

  const walletAddressCompact = connectedAddress
    ? formatAddressForDisplay(connectedAddress, 4, 4)
    : '';

  const payUsdEstimate =
    payUsdValue > 0 ? formatEdexUsdEstimate(payUsdValue) : undefined;
  const receiveUsdEstimate =
    receiveUsdValue > 0 ? formatEdexUsdEstimate(receiveUsdValue) : undefined;

  const slideLabel = buildSlideLabel({
    connect: 'Connect Wallet',
    confirm: 'Confirm',
    approve: (stable) => `Approve ${stable}`,
  });

  const edexTabs = [
    { id: 'swap' as const, label: 'Swap' },
    { id: 'card' as const, label: 'Credit Card' },
    { id: 'pools' as const, label: 'Liquidity Pools' },
  ];

  return (
    <>
      <div className="edex-page">
        <header className="edex-page-header">
          <button
            type="button"
            className="edex-page-header-back"
            onClick={() => navigate('/')}
            aria-label="Back to dashboard"
          >
            <AppIcon icon="lucide:arrow-left" size={22} strokeWidth={2} />
          </button>
          <h1 className="edex-page-header-title">EDex</h1>
          <button
            type="button"
            className="edex-page-header-back"
            onClick={() => navigate(getTransactionHistoryPath('edex'))}
            aria-label="Transaction history"
          >
            <AppIcon icon="lucide:clock" style={{ fontSize: 22 }} />
          </button>
        </header>

        <div className="edex-page-content section mt-1">
          <FinappPilledTabs
            tabs={edexTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="edex-tabs-wrap mb-4"
            contentClassName="tab-content mt-1 min-h-[480px] min-h-[55vh]"
          >
            {activeTab === 'swap' && (
              <div className="edex-swap-tab-panel">
                <div className="edex-wallet-slot">
                  {connectedAddress ? (
                    <div className="edex-wallet-row-btn edex-wallet-row-btn--static">
                      <div className="edex-wallet-row-icon">
                        <img
                          src={POLYGON_NETWORK_LOGO}
                          alt="Polygon"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="edex-wallet-row-name">Polygon</span>
                      <span className="edex-wallet-row-addr">{walletAddressCompact}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openConnectModal?.()}
                      className="edex-wallet-row-btn"
                    >
                      <div className="edex-wallet-row-icon">
                        <img
                          src={POLYGON_NETWORK_LOGO}
                          alt="Polygon"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="edex-wallet-row-connect">Connect wallet</span>
                      <AppIcon
                        icon="lucide:chevron-down"
                        size={16}
                        className="shrink-0 opacity-70"
                        strokeWidth={2}
                      />
                    </button>
                  )}
                </div>
                <form ref={formRef} onSubmit={handleFormSubmit}>
                  <EGuardPenaltyBanner isVisible={isPenaltyActive} />
                  <div className="edex-swap-wrap">
                    <SwapCard
                      appearance="edex"
                      title=""
                      payBalance={payBalance}
                      payBalanceNumeric={payBalanceNum}
                      payBalanceMaxFractionDigits={2}
                      payExceedsBalance={payExceedsBalance}
                      payAmount={payAmountDisplay}
                      onPayAmountChange={handleAmountChange}
                      payUsdEstimate={payUsdEstimate}
                      payTokenSymbol={payMeta.symbol}
                      payToken={payMeta}
                      receiveBalance={receiveBalance}
                      receiveBalanceNumeric={receiveBalanceNum}
                      receiveBalanceMaxFractionDigits={2}
                      receiveAmount=""
                      receiveAmountValue={outputAmount > 0 ? outputAmount : undefined}
                      receiveAmountMaxFractionDigits={2}
                      receiveUsdEstimate={receiveUsdEstimate}
                      receiveTokenSymbol={receiveMeta.symbol}
                      receiveToken={receiveMeta}
                      onSwap={handleSwapMode}
                      swapDirectionDisabled={swapDirectionDisabled}
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
                      rateText={rateText}
                      slideLabel={slideLabel}
                      slideDisabled={slideDisabled || (mode === 'BUY' && !stableTradable)}
                    />
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'card' && (
              <div className="edex-bank-cards-wrap">
                <FinappBankCards appearance="edex" />
              </div>
            )}

            {activeTab === 'pools' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <p className="edex-coming-soon" aria-label="Coming soon">
                  COMING SOON
                </p>
              </div>
            )}
          </FinappPilledTabs>
        </div>
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
        isVisible={!!routeNotice}
        message={routeNotice ?? ''}
        type="info"
        onClose={() => setRouteNotice(null)}
        duration={4000}
      />
    </>
  );
}
