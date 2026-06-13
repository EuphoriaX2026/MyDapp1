import { AppIcon } from '../../components/icons/AppIcon';
import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, type Address } from 'viem';

import { WalletFlowPageShell } from '../../components/wallet/WalletFlowPageShell';
import { SendMoneyQrScanner } from '../../components/wallet/SendMoneyQrScanner';
import { FinappOverlayModal } from '../../components/ui/FinappOverlayModal';
import { EGuardPenaltyBanner } from '../../components/ui/EGuardPenaltyBanner';
import { useEuphoriaExchange } from '../../hooks/useEuphoriaExchange';
import { usePortfolioBalances } from '../../hooks/usePortfolioBalances';
import { useGasEstimation } from '../../hooks/useGasEstimation';
import { useTransferFeeQuote } from '../../hooks/useTransferFeeQuote';
import { useProfile } from '../../context/ProfileContext';
import { DEFAULT_RECIPIENT_AVATAR_PATH } from '../../config/constants';
import { CURRENT_NETWORK_INFO } from '../../config/networks';
import { ERX_CONTRACTS, TOKENS } from '../../config/erx-contracts';
import { WALLET_COINS } from '../../config/wallet-coins';
import {
  formatAddressForDisplay,
  parsePastedWalletAddress,
  sanitizeWalletAddressInput,
  validateWalletAddress,
} from '../../utils/addressValidation';
import { pasteFromClipboard } from '../../utils/clipboard';
import ERXTokenABI from '../../abis/erx-token.json';
import { FinappTransactionReport } from '../../components/FinappTransactionReport';
import { buildSendMoneyTransactionReport, reportTitle } from '../../utils/buildTransactionReportRecord';
import { saveTransactionReport } from '../../utils/transactionReportStore';
import '../../styles/send-money-page.css';

import { media } from '../../assets/media';
const NETWORK_LABEL = 'Polygon';

const TOKEN_SETTINGS: Record<
  string,
  {
    symbol: string;
    address: string;
    feePercent: number | 'dynamic';
    price: number | 'dynamic';
    decimals: number;
    iconBg: string;
  }
> = {
  ERX: {
    symbol: 'ERX',
    address: ERX_CONTRACTS.ERX,
    feePercent: 'dynamic',
    price: 'dynamic',
    decimals: 18,
    iconBg: 'var(--finapp-primary, #6236ff)',
  },
  E1: {
    symbol: 'E1',
    address: TOKENS.USDT,
    feePercent: 2.5,
    price: 1.0,
    decimals: 6,
    iconBg: '#2ecc71',
  },
  DAI: {
    symbol: 'DAI',
    address: TOKENS.DAI,
    feePercent: 1.0,
    price: 1.0,
    decimals: 18,
    iconBg: '#f5ac37',
  },
};

function formatNumber(num: number) {
  if (num === 0) return '0';
  return parseFloat(num.toFixed(4)).toString();
}

function formatPreciseAmount(num: number, maxDecimals = 12) {
  if (num === 0) return '0';
  const str = num.toFixed(maxDecimals);
  return str.replace(/\.?0+$/, '') || '0';
}

function formatPolAmount(num: number) {
  if (num === 0) return '0';
  return parseFloat(num.toFixed(3)).toString();
}

function getCompactAddressDisplay(address?: string) {
  if (!address) return '—';
  return formatAddressForDisplay(address, 4, 4);
}

function VerifyPartyAvatar({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="send-money-verify-avatar-ring">
      <div className="send-money-verify-avatar-inner">
        {src ? (
          <img src={src} alt={alt} className="send-money-verify-avatar__img" />
        ) : (
          <div className="send-money-verify-avatar__img send-money-verify-avatar__img--empty" aria-hidden />
        )}
      </div>
    </div>
  );
}

function TokenIcon({
  symbol,
  iconBg,
  logo,
  size = 44,
  showNetworkBadge = true,
}: {
  symbol: string;
  iconBg: string;
  logo?: string;
  size?: number;
  showNetworkBadge?: boolean;
}) {
  const style = { width: size, height: size };
  return (
    <div className="send-money-token-icon-wrap">
      {logo ? (
        <img src={logo} alt={symbol} className="send-money-token-icon" style={style} />
      ) : (
        <div className="send-money-token-icon-fallback" style={{ ...style, background: iconBg }}>
          {symbol.charAt(0)}
        </div>
      )}
      {showNetworkBadge ? (
        <img
          src={media.tokens.polygon}
          alt={NETWORK_LABEL}
          className="send-money-token-chain-badge"
        />
      ) : null}
    </div>
  );
}

function BurnFeeValue({ amount, symbol }: { amount: string; symbol: string }) {
  return (
    <span className="send-money-burn-value">
      <AppIcon icon="lucide:flame" width={12} height={12} className="send-money-burn-value__icon" />
      {amount} {symbol}
    </span>
  );
}

type SendMoneyLocationState = {
  recipient?: string;
};

export default function SendMoney() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useAccount();
  const { balances } = usePortfolioBalances();
  const { currentPrice: currentERXPrice } = useEuphoriaExchange();
  const { avatar } = useProfile();

  const [sendToAddress, setSendToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [fiatAmount, setFiatAmount] = useState('');
  const [amountSource, setAmountSource] = useState<'crypto' | 'fiat'>('crypto');
  const [selectedToken, setSelectedToken] = useState('DAI');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [step, setStep] = useState<'INPUT' | 'VERIFY' | 'RESULT'>('INPUT');
  const [txResultStatus, setTxResultStatus] = useState<'success' | 'failed'>('success');
  const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const pasteCaptureRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const recipient = (location.state as SendMoneyLocationState | null)?.recipient;
    if (!recipient) return;
    const parsed = parsePastedWalletAddress(recipient);
    if (parsed) {
      setSendToAddress(parsed);
      setAddressError(null);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const { isPending, writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const {
    isLoading: isConfirming,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    data: txReceipt,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const config = TOKEN_SETTINGS[selectedToken];
  const activeTokenPrice = config.price === 'dynamic' ? currentERXPrice : config.price;

  const {
    feePercentage,
    feeAmount: feeValue,
    netAmount: receiveValue,
    isPenalized,
    isLoading: feeQuoteLoading,
  } = useTransferFeeQuote({
    tokenSymbol: config.symbol,
    amount: sendAmount,
    senderAddress: address,
  });

  const availableBalance = useMemo(() => {
    const map: Record<string, number> = {
      ERX: balances.erx.value,
      DAI: balances.dai.value,
      E1: balances.e1.value,
    };
    return map[selectedToken] ?? 0;
  }, [balances, selectedToken]);

  const amountNum = parseFloat(sendAmount) || 0;

  const isVerifyStep = step === 'VERIFY';
  const isResultStep = step === 'RESULT';

  const transferArgs = useMemo(() => {
    if (!isVerifyStep || !sendToAddress || !sendAmount) return undefined;
    try {
      return [sendToAddress as `0x${string}`, parseUnits(sendAmount, config.decimals)] as const;
    } catch {
      return undefined;
    }
  }, [isVerifyStep, sendToAddress, sendAmount, config.decimals]);

  const gasEstimate = useGasEstimation(
    transferArgs ? (config.address as Address) : undefined,
    transferArgs ? 'transfer' : undefined,
    transferArgs ? [...transferArgs] : undefined,
  );

  const networkFeePol = parseFloat(gasEstimate.estimatedCostInEth) || 0;
  const polBalance = balances.pol.value;
  const hasEnoughPol = polBalance >= networkFeePol;
  const tokenLogo = WALLET_COINS[config.symbol as keyof typeof WALLET_COINS]?.logo;

  const applyPastedAddress = useCallback((text: string) => {
    const parsed = parsePastedWalletAddress(text);
    if (parsed) {
      setSendToAddress(parsed);
      setAddressError(null);
      return true;
    }
    if (text.trim()) {
      setAddressError('Address must start with 0x and contain 40 hexadecimal characters.');
    }
    return false;
  }, []);

  const syncFiatFromCrypto = useCallback(
    (crypto: string) => {
      const num = parseFloat(crypto);
      if (!crypto || Number.isNaN(num)) {
        setFiatAmount('');
        return;
      }
      if (activeTokenPrice > 0) {
        setFiatAmount(parseFloat((num * activeTokenPrice).toFixed(2)).toString());
      }
    },
    [activeTokenPrice],
  );

  const syncCryptoFromFiat = useCallback(
    (fiat: string) => {
      const num = parseFloat(fiat);
      if (!fiat || Number.isNaN(num)) {
        setSendAmount('');
        return;
      }
      if (activeTokenPrice > 0) {
        setSendAmount(parseFloat((num / activeTokenPrice).toFixed(6)).toString());
      }
    },
    [activeTokenPrice],
  );

  const handleCryptoChange = (value: string) => {
    setAmountSource('crypto');
    setSendAmount(value);
    syncFiatFromCrypto(value);
  };

  const handleFiatChange = (value: string) => {
    setAmountSource('fiat');
    setFiatAmount(value);
    syncCryptoFromFiat(value);
  };

  const handleMax = () => {
    const maxStr = formatNumber(availableBalance);
    setAmountSource('crypto');
    setSendAmount(maxStr);
    syncFiatFromCrypto(maxStr);
  };

  const handleAddressChange = (value: string) => {
    setSendToAddress(sanitizeWalletAddressInput(value));
    setAddressError(null);
  };

  const handleAddressPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    const parsed = parsePastedWalletAddress(text);
    if (parsed) {
      event.preventDefault();
      setSendToAddress(parsed);
      setAddressError(null);
    }
  };

  const applyClipboardText = useCallback(
    (text: string) => {
      if (!text.trim()) {
        setAddressError('Clipboard is empty.');
        return;
      }
      if (applyPastedAddress(text)) {
        addressInputRef.current?.focus();
        return;
      }
      setSendToAddress(sanitizeWalletAddressInput(text));
      setAddressError(null);
      addressInputRef.current?.focus();
    },
    [applyPastedAddress],
  );

  const handlePaste = useCallback(() => {
    void pasteFromClipboard(applyClipboardText).then((result) => {
      if (result.ok) return;
      pasteCaptureRef.current?.focus();
      addressInputRef.current?.focus();
      if (result.error) setAddressError(result.error);
    });
  }, [applyClipboardText]);

  const handleQrScan = useCallback(
    (scannedAddress: string) => {
      setSendToAddress(scannedAddress);
      setAddressError(null);
      setQrScannerOpen(false);
    },
    [],
  );

  const handleConfirmSend = async () => {
    if (!sendToAddress || !sendAmount) return;
    setErrorMessage(null);

    try {
      const hash = await writeContractAsync({
        address: config.address as `0x${string}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abi: (ERXTokenABI as any).abi || ERXTokenABI,
        functionName: 'transfer',
        args: [sendToAddress as `0x${string}`, parseUnits(sendAmount, config.decimals)],
        chainId: CURRENT_NETWORK_INFO.chainId,
      });

      setTxHash(hash);
    } catch (e: unknown) {
      console.error('Transfer failed', e);
      const message =
        e instanceof Error ? e.message : 'Transaction failed. Please check your balance and try again.';
      setErrorMessage(message);
      setTxResultStatus('failed');
      setStep('RESULT');
    }
  };

  useEffect(() => {
    if (!txHash || step !== 'VERIFY' || isConfirming) return;

    if (isReceiptSuccess && txReceipt?.status === 'success') {
      setTxResultStatus('success');
      setStep('RESULT');
      return;
    }

    if (isReceiptError || txReceipt?.status === 'reverted') {
      setTxResultStatus('failed');
      setStep('RESULT');
    }
  }, [txHash, step, isConfirming, isReceiptSuccess, isReceiptError, txReceipt]);

  const handleNext = () => {
    const validation = validateWalletAddress(sendToAddress);
    if (!validation.isValid) {
      setAddressError(validation.error ?? 'Invalid wallet address.');
      return;
    }
    if (!sendAmount || amountNum <= 0) return;
    setErrorMessage(null);
    setAddressError(null);
    setTxHash(undefined);
    setTxResultStatus('success');
    setStep('VERIFY');
  };

  const goBackToInput = () => {
    if (isPending || isConfirming) return;
    setStep('INPUT');
    setErrorMessage(null);
    setTxHash(undefined);
  };

  const recipientDisplayName = getCompactAddressDisplay(sendToAddress);
  const senderAddressSuffix = getCompactAddressDisplay(address);
  const recipientAddressSuffix = getCompactAddressDisplay(sendToAddress);
  const verifyAmountLabel = `${formatPreciseAmount(amountNum)} ${config.symbol}`;
  const walletFlowActive = isPending || isConfirming;

  const pageTitle =
    step === 'VERIFY' ? 'Transaction Verification' : step === 'RESULT' ? 'Transaction Detail' : 'Send';

  const senderAvatarSrc = avatar || null;
  const verifyFiatLabel =
    fiatAmount.trim().length > 0
      ? `$ ${parseFloat(fiatAmount).toFixed(2)}`
      : activeTokenPrice > 0
        ? `$ ${(amountNum * activeTokenPrice).toFixed(2)}`
        : `$ 0.00`;
  const resultReport = useMemo(() => {
    if (!txHash || !address || step !== 'RESULT') return null;
    return buildSendMoneyTransactionReport({
      hash: txHash,
      status: txResultStatus,
      walletAddress: address,
      toLabel: recipientDisplayName,
      amount: sendAmount,
      tokenSymbol: config.symbol,
      fiatLabel:
        fiatAmount.trim().length > 0 || activeTokenPrice > 0 ? verifyFiatLabel : undefined,
      blockNumber: txReceipt ? Number(txReceipt.blockNumber) : undefined,
      returnTo: '/send-money',
    });
  }, [
    txHash,
    address,
    step,
    txResultStatus,
    recipientDisplayName,
    sendAmount,
    config.symbol,
    fiatAmount,
    activeTokenPrice,
    verifyFiatLabel,
    txReceipt,
  ]);

  useEffect(() => {
    if (!resultReport) return;
    saveTransactionReport(resultReport);
  }, [resultReport]);

  const isAddressValid = validateWalletAddress(sendToAddress).isValid;
  const toCardFilled = isAddressValid;
  const tokenAmountFilled = sendAmount.trim().length > 0 && amountNum > 0;
  const usdAmountFilled = fiatAmount.trim().length > 0;
  const showPenaltyBanner = isPenalized && amountNum > 0;

  const footer = isResultStep ? (
    <div className="finapp-aligned-block send-money-footer-actions w-full">
      <button
        type="button"
        className="btn btn-primary btn-block btn-lg w-full"
        onClick={() => navigate('/MyWallet')}
      >
        Done
      </button>
    </div>
  ) : isVerifyStep ? (
    <div
      className={`finapp-aligned-block send-money-confirm-actions send-money-confirm-actions--stacked w-full${walletFlowActive ? ' send-money-confirm-actions--single' : ''}`}
    >
      {!hasEnoughPol && !gasEstimate.isLoading && !walletFlowActive ? (
        <p className="send-money-pol-warning send-money-text-regular mb-0" role="alert">
          Insufficient POL balance to cover the network fee.
        </p>
      ) : null}
      <button
        type="button"
        className="btn btn-primary btn-block btn-lg w-full"
        onClick={handleConfirmSend}
        disabled={walletFlowActive || gasEstimate.isLoading || !hasEnoughPol}
      >
        {walletFlowActive ? 'Check your wallet...' : 'Confirm'}
      </button>
      {!walletFlowActive ? (
        <button
          type="button"
          className="btn btn-outline-secondary btn-block btn-lg w-full"
          onClick={goBackToInput}
        >
          Cancel
        </button>
      ) : null}
    </div>
  ) : (
    <div className="finapp-aligned-block send-money-footer-actions w-full">
      <button
        type="button"
        className="btn btn-primary btn-block btn-lg w-full"
        onClick={handleNext}
        disabled={!isAddressValid || !sendAmount || amountNum <= 0}
      >
        Next
      </button>
    </div>
  );

  return (
    <WalletFlowPageShell
      title={pageTitle}
      titleMedium={step === 'VERIFY'}
      variant="flat"
      footer={footer}
      backTo={step === 'INPUT' ? '/MyWallet' : undefined}
      onBack={
        step === 'VERIFY'
          ? walletFlowActive
            ? undefined
            : goBackToInput
          : step === 'RESULT'
            ? () => navigate('/MyWallet')
            : undefined
      }
    >
      <SendMoneyQrScanner
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={handleQrScan}
      />

      <FinappOverlayModal
        isOpen={tokenPickerOpen}
        onClose={() => setTokenPickerOpen(false)}
        title="Select Token"
        ariaLabel="Select token"
      >
        <div className="send-money-token-options">
          {Object.keys(TOKEN_SETTINGS).map((key) => {
            const token = TOKEN_SETTINGS[key];
            const logo = WALLET_COINS[token.symbol as keyof typeof WALLET_COINS]?.logo;
            const isSelected = selectedToken === key;

            return (
              <button
                key={key}
                type="button"
                className={`send-money-token-option${isSelected ? ' send-money-token-option--selected' : ''}`}
                onClick={() => {
                  setSelectedToken(key);
                  setSendAmount('');
                  setFiatAmount('');
                  setTokenPickerOpen(false);
                }}
              >
                <div className="send-money-token-logo-cell">
                  <TokenIcon symbol={token.symbol} iconBg={token.iconBg} logo={logo} />
                  <span className="send-money-token-logo-name">{token.symbol}</span>
                </div>
              </button>
            );
          })}
        </div>
      </FinappOverlayModal>

      <div className="finapp-aligned-block send-money-page w-full">
      {isResultStep && resultReport ? (
          <FinappTransactionReport
            embedded
            title={reportTitle(txResultStatus, 'send')}
            status={txResultStatus}
            fields={resultReport.fields}
            hash={txHash}
            errorMessage={errorMessage ?? undefined}
          />
      ) : isVerifyStep ? (
          <>
          <div className="transfer-verification send-money-verify-top w-full">
            <div className="transfer-amount send-money-verify-amount">
              <span className="caption send-money-text-medium">Amount</span>
              <h2 className="send-money-text-bold send-money-verify-amount-primary mb-0">
                {verifyAmountLabel}
              </h2>
              <p className="send-money-verify-fiat-amount send-money-text-regular mb-0">
                {verifyFiatLabel}
              </p>
            </div>
            <div className="from-to-block send-money-from-to mb-4">
              <div className="item send-money-from-to__party send-money-from-to__sender">
                <VerifyPartyAvatar src={senderAvatarSrc} alt="You" />
                <span className="send-money-from-to__role send-money-text-medium">You</span>
                <span className="send-money-from-to__suffix font-mono send-money-text-regular">
                  {senderAddressSuffix}
                </span>
              </div>
              <div className="item send-money-from-to__party send-money-from-to__recipient">
                <VerifyPartyAvatar src={DEFAULT_RECIPIENT_AVATAR_PATH} alt="Receiver" />
                <span className="send-money-from-to__role send-money-text-medium">Receiver</span>
                <span className="send-money-from-to__suffix font-mono send-money-text-regular">
                  {recipientAddressSuffix}
                </span>
              </div>
              <div className="arrow" aria-hidden />
            </div>
          </div>

          <div className="card w-full mb-2">
            <div className="card-body">
              <div className="send-money-confirm-detail">
                <span className="send-money-confirm-detail__label">From</span>
                <span className="send-money-confirm-detail__value">
                  {address ? formatAddressForDisplay(address, 5, 5) : '—'}
                </span>
              </div>
              <div className="send-money-confirm-detail">
                <span className="send-money-confirm-detail__label">To</span>
                <span className="send-money-confirm-detail__value send-money-confirm-detail__value--to">
                  <span>{formatAddressForDisplay(sendToAddress, 5, 5)}</span>
                </span>
              </div>
              {feeValue > 0 ? (
                <div className="send-money-confirm-detail">
                  <span className="send-money-confirm-detail__label">
                    Transfer Fee ({feePercentage}%)
                  </span>
                  <span className="send-money-confirm-detail__value">
                    <BurnFeeValue amount={formatPreciseAmount(feeValue)} symbol={config.symbol} />
                  </span>
                </div>
              ) : null}
              <div className="send-money-confirm-detail">
                <span className="send-money-confirm-detail__label">Recipient receives</span>
                <span className="send-money-confirm-detail__value send-money-receive-value">
                  {formatPreciseAmount(receiveValue)} {config.symbol}
                </span>
              </div>
            </div>
          </div>

          <div className="card w-full mb-2">
            <div className="card-body">
              <div className="send-money-confirm-detail">
                <span className="send-money-confirm-detail__label">Network Fee</span>
                <span className="send-money-confirm-detail__value">
                  {gasEstimate.isLoading ? 'Estimating...' : `${formatPolAmount(networkFeePol)} POL`}
                </span>
              </div>
              <div className="send-money-confirm-paywith">
                <span className="send-money-confirm-detail__label">Pay with</span>
                <span className="send-money-confirm-detail__value">{NETWORK_LABEL}</span>
              </div>
            </div>
          </div>

          <p className="send-money-confirm-pol-balance send-money-text-regular mb-3">
            POL Balance: {formatPolAmount(polBalance)}
          </p>

          <EGuardPenaltyBanner isVisible={showPenaltyBanner} />

          <div className="send-money-verify-copy w-full mb-2">
            <h2 className="send-money-text-medium mb-2">Verify the Transaction</h2>
            <p className="send-money-text-regular mb-0">
              You are sending {verifyAmountLabel} to {recipientDisplayName}.
              <br />
              Are you sure?
            </p>
          </div>

          {errorMessage ? (
            <div className="alert alert-danger w-full mb-0" role="alert">
              {errorMessage}
            </div>
          ) : null}
          </>
      ) : (
          <>
          <div className="card w-full mb-2">
            <div className="card-body">
              <div className="send-money-wallet-row">
                <div className="send-money-wallet-name">
                  <span className="send-money-wallet-name__icon">
                    <AppIcon icon="lucide:smartphone" width={16} height={16} />
                  </span>
                  <span className="send-money-wallet-name__label">My Wallet</span>
                </div>
                {address ? (
                  <div className="send-money-wallet-address">
                    {formatAddressForDisplay(address, 4, 4)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="send-money-card-btn w-full mb-2"
            onClick={() => setTokenPickerOpen(true)}
          >
            <div className="card w-full mb-0">
              <div className="card-body">
                <div className="send-money-token-row">
                  <div className="send-money-token-logo-cell">
                    <TokenIcon symbol={config.symbol} iconBg={config.iconBg} logo={tokenLogo} />
                    <span className="send-money-token-logo-name">{config.symbol}</span>
                  </div>
                  <AppIcon icon="lucide:chevron-right" size={20} className="send-money-token-chevron" />
                </div>
              </div>
            </div>
          </button>

          <textarea
            ref={pasteCaptureRef}
            className="send-money-paste-capture"
            aria-hidden
            tabIndex={-1}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text/plain');
              if (text) applyClipboardText(text);
              e.preventDefault();
            }}
          />

          <div className="send-money-section-header w-full mb-1">
            <h5 className="send-money-section-title send-money-text-medium">To</h5>
            <div className="send-money-section-actions">
              <button
                type="button"
                className="send-money-section-action-btn"
                aria-label="Scan QR code"
                onClick={() => setQrScannerOpen(true)}
              >
                <AppIcon icon="lucide:qr-code" size={18} strokeWidth={2} className="send-money-section-action-icon" />
              </button>
            </div>
          </div>

          <div className={`card w-full mb-2 send-money-ghost-card${toCardFilled ? ' send-money-field--filled' : ''}`}>
            <div className="card-body">
              <div className="form-group boxed mb-0">
                <div className="input-wrapper send-money-boxed-input-row send-money-boxed-input-row--plain">
                  <input
                    ref={addressInputRef}
                    id="send-to-address"
                    type="text"
                    className="form-control"
                    placeholder="0x..."
                    value={sendToAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onPaste={handleAddressPaste}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Wallet address"
                  />
                  <button
                    type="button"
                    className="send-money-paste-btn"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handlePaste();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handlePaste();
                    }}
                  >
                    Paste
                  </button>
                </div>
              </div>
              {addressError ? (
                <p className="send-money-field-error mb-0" role="alert">
                  {addressError}
                </p>
              ) : null}
            </div>
          </div>

          {sendToAddress.trim().length > 0 ? (
            <p className="send-money-network-notice send-money-text-regular w-full mb-3" role="note">
              Please ensure that the receiving address supports the {NETWORK_LABEL} network.
            </p>
          ) : null}

          <div className="send-money-section-header w-full mb-1">
            <h5 className="send-money-section-title send-money-text-medium">Amount</h5>
          </div>

          <div className="send-money-amount-stack w-full mb-2">
            <div className={`card w-full send-money-ghost-card${tokenAmountFilled ? ' send-money-field--filled' : ''}`}>
              <div className="card-body">
                <div className="form-group boxed mb-0">
                  <div className="input-wrapper send-money-boxed-amount-row send-money-boxed-amount-row--plain">
                    <input
                      id="send-token-amount"
                      type="text"
                      inputMode="decimal"
                      className="form-control"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => handleCryptoChange(e.target.value)}
                      aria-label="Token amount"
                    />
                    <div className="send-money-amount-trailing">
                      <button type="button" className="send-money-max-btn" onClick={handleMax}>
                        MAX
                      </button>
                      <span className="send-money-amount-suffix">{config.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`card w-full send-money-ghost-card${usdAmountFilled ? ' send-money-field--filled' : ''}`}>
              <div className="card-body">
                <div className="form-group boxed mb-0">
                  <div className="input-wrapper send-money-boxed-amount-row send-money-boxed-amount-row--plain">
                    <input
                      id="send-usd-amount"
                      type="text"
                      inputMode="decimal"
                      className="form-control"
                      placeholder="0.00"
                      value={fiatAmount}
                      onChange={(e) => handleFiatChange(e.target.value)}
                      aria-label="USD amount"
                    />
                    <span className="send-money-amount-suffix send-money-amount-suffix--boxed">USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="send-money-balance-line send-money-text-regular w-full mb-2">
            Available balance:{' '}
            <strong className="send-money-text-bold">{`${formatNumber(availableBalance)} ${config.symbol}`}</strong>
          </p>

          <EGuardPenaltyBanner isVisible={showPenaltyBanner} />

          {amountNum > 0 ? (
            <div className="send-money-fee-breakdown w-full">
              <div className="send-money-fee-breakdown__row">
                <span className="send-money-fee-breakdown__label">Gross Amount</span>
                <span className="send-money-fee-breakdown__value">
                  {feeQuoteLoading ? '…' : `${formatPreciseAmount(amountNum)} ${config.symbol}`}
                </span>
              </div>
              {feeValue > 0 ? (
                <div className="send-money-fee-breakdown__row">
                  <span className="send-money-fee-breakdown__label">
                    Transfer Fee ({feeQuoteLoading ? '…' : `${feePercentage}%`})
                  </span>
                  <span className="send-money-fee-breakdown__value">
                    {feeQuoteLoading ? (
                      '…'
                    ) : (
                      <BurnFeeValue
                        amount={formatPreciseAmount(feeValue)}
                        symbol={config.symbol}
                      />
                    )}
                  </span>
                </div>
              ) : null}
              <div className="send-money-fee-breakdown__row send-money-fee-breakdown__row--net">
                <span className="send-money-fee-breakdown__label">Recipient Receives</span>
                <span className="send-money-fee-breakdown__value send-money-receive-value">
                  {feeQuoteLoading ? '…' : `${formatPreciseAmount(receiveValue)} ${config.symbol}`}
                </span>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="alert alert-danger w-full mb-0 mt-2" role="alert">
              {errorMessage}
            </div>
          ) : null}
          </>
      )}
      </div>
    </WalletFlowPageShell>
  );
}
