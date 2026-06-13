import { useCallback, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { AppIcon } from '../../components/icons/AppIcon';
import { WalletFlowPageShell } from '../../components/wallet/WalletFlowPageShell';
import { FinappOverlayModal } from '../../components/ui/FinappOverlayModal';
import { ReceiveBrandFooter } from '../../components/wallet/ReceiveBrandFooter';
import { ReceiveShareExportCard } from '../../components/wallet/ReceiveShareExportCard';
import {
  ReceiveQrPanel,
  ReceiveTokenIcon,
  getReceiveNetworkShortLabel,
} from '../../components/wallet/ReceiveQrPanel';
import { useProfile } from '../../context/ProfileContext';
import { useFinappNotifications } from '../../context/FinappNotificationContext';
import {
  WALLET_COINS,
  WALLET_COINS_TAB_ORDER,
  type WalletCoinSymbol,
} from '../../config/wallet-coins';
import { writeClipboardText } from '../../utils/clipboard';
import {
  buildReceivePaymentUri,
  captureElementAsPng,
  downloadBlob,
  shareReceiveImageBlob,
} from '../../utils/generateReceiveShareImage';
import '../../styles/send-money-page.css';
import '../../styles/receive-page.css';
import '../../styles/receive-share-export.css';

const RECEIVE_TOKEN_SYMBOLS: WalletCoinSymbol[] = WALLET_COINS_TAB_ORDER.filter(
  (symbol) => symbol !== 'QBit',
);

export default function Receive() {
  const { address, isConnected } = useAccount();
  const { username } = useProfile();
  const { push } = useFinappNotifications();
  const shareExportRef = useRef<HTMLDivElement>(null);

  const [selectedToken, setSelectedToken] = useState<WalletCoinSymbol>('DAI');
  const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const networkShort = getReceiveNetworkShortLabel();
  const tokenMeta = WALLET_COINS[selectedToken];
  const tokenNetworkLabel = `${tokenMeta.symbol} (${networkShort})`;
  const paymentUri = address ? buildReceivePaymentUri(address) : '';

  const shareFilename = `eone-receive-${tokenMeta.symbol.toLowerCase()}-${networkShort.toLowerCase()}.png`;

  const handleCopy = useCallback(async () => {
    if (!address) {
      push('Connect a wallet to copy your address.', { type: 'warning', placement: 'internal' });
      return;
    }
    const ok = await writeClipboardText(address);
    if (ok) {
      push('Address copied to clipboard.', { type: 'success', placement: 'internal' });
    } else {
      push('Could not copy address.', { type: 'error', placement: 'internal' });
    }
  }, [address, push]);

  const handleShare = useCallback(async () => {
    if (!address) {
      push('Connect a wallet to share your address.', { type: 'warning', placement: 'internal' });
      return;
    }

    const shareText = [
      `Send ${tokenNetworkLabel} on Polygon:`,
      address,
      paymentUri,
    ].join('\n');

    setIsSharing(true);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const node = shareExportRef.current;
      if (!node) {
        push('Could not prepare share image.', { type: 'error', placement: 'internal' });
        return;
      }

      const blob = await captureElementAsPng(node, 3);
      const result = await shareReceiveImageBlob(blob, shareText, shareFilename);

      if (result === 'shared' || result === 'aborted') return;

      downloadBlob(blob, shareFilename);
      const copied = await writeClipboardText(shareText);
      push(
        copied
          ? 'Share unavailable — image saved and address copied.'
          : 'Share unavailable — image saved to your device.',
        { type: 'info', placement: 'internal' },
      );
    } catch {
      push('Could not create share image. Please try again.', {
        type: 'error',
        placement: 'internal',
      });
    } finally {
      setIsSharing(false);
    }
  }, [address, paymentUri, push, shareFilename, tokenNetworkLabel]);

  return (
    <WalletFlowPageShell title="Receive" titleMedium variant="flat" backTo="/MyWallet">
      {address ? (
        <div className="receive-share-export-root" aria-hidden>
          <ReceiveShareExportCard
            key={`${address}-${selectedToken}`}
            ref={shareExportRef}
            address={address}
            tokenSymbol={tokenMeta.symbol}
            networkShort={networkShort}
            tokenLogo={tokenMeta.logo}
          />
        </div>
      ) : null}

      <FinappOverlayModal
        isOpen={tokenPickerOpen}
        onClose={() => setTokenPickerOpen(false)}
        title="Select Token"
        ariaLabel="Select token to receive"
      >
        <div className="send-money-token-options">
          {RECEIVE_TOKEN_SYMBOLS.map((symbol) => {
            const meta = WALLET_COINS[symbol];
            const isSelected = selectedToken === symbol;
            return (
              <button
                key={symbol}
                type="button"
                className={`send-money-token-option${isSelected ? ' send-money-token-option--selected' : ''}`}
                onClick={() => {
                  setSelectedToken(symbol);
                  setTokenPickerOpen(false);
                }}
              >
                <div className="send-money-token-logo-cell">
                  <ReceiveTokenIcon symbol={symbol} />
                  <span className="send-money-token-logo-name">{meta.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </FinappOverlayModal>

      <div className="finapp-aligned-block receive-page w-full">
        <div className="card receive-wallet-bar w-full mb-2">
          <div className="card-body">
            <div className="receive-wallet-row">
              <span className="receive-wallet-row__icon" aria-hidden>
                <AppIcon icon="lucide:smartphone" width={16} height={16} />
              </span>
              <span className="receive-wallet-row__name">{username}</span>
            </div>
          </div>
        </div>

        {isConnected && address ? (
          <ReceiveQrPanel
            address={address}
            tokenSymbol={selectedToken}
            tokenNetworkLabel={tokenNetworkLabel}
            tokenLogo={tokenMeta.logo}
            onTokenClick={() => setTokenPickerOpen(true)}
          />
        ) : (
          <div className="receive-qr-card w-full mb-2">
            <div className="receive-qr-placeholder mx-auto">
              <AppIcon icon="lucide:wallet" size={40} className="receive-qr-placeholder__icon" />
              <p className="receive-qr-placeholder__text mb-0">Connect wallet to show QR code</p>
            </div>
          </div>
        )}

        <div className="receive-actions-row w-full mb-2">
          <button
            type="button"
            className="receive-btn receive-btn--outline"
            onClick={handleShare}
            disabled={!address || isSharing}
          >
            {isSharing ? 'Preparing…' : 'Share'}
          </button>
          <button type="button" className="receive-btn receive-btn--primary" onClick={handleCopy}>
            Copy
          </button>
        </div>

        <div className="receive-bottom-stack w-full">
          <div className="receive-warning w-full">
            <span className="receive-warning__icon" aria-hidden>
              <AppIcon icon="lucide:info" width={16} height={16} />
            </span>
            <p className="receive-warning__text mb-0">
              This address can only accept assets on{' '}
              <strong className="receive-warning__emphasis">{tokenNetworkLabel}</strong> on Polygon.
              Sending any other types of tokens to this address will result in permanent loss.
            </p>
          </div>

          <ReceiveBrandFooter />
        </div>
      </div>
    </WalletFlowPageShell>
  );
}
