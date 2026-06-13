import QRCode from 'react-qr-code';

import { AppIcon } from '../icons/AppIcon';
import { CURRENT_NETWORK_INFO, isTestnet } from '../../config/networks';
import { WALLET_COINS, type WalletCoinSymbol } from '../../config/wallet-coins';
import { media } from '../../assets/media';

export function getReceiveNetworkShortLabel(): string {
  return isTestnet() ? 'Amoy' : 'Polygon';
}

export function ReceiveAddressDisplay({ address }: { address: string }) {
  if (!address || address.length < 12) {
    return <p className="receive-address-display mb-0">{address || '—'}</p>;
  }

  const head = address.slice(0, 6);
  const midStart = address.slice(6, Math.ceil(address.length / 2));
  const midEnd = address.slice(Math.ceil(address.length / 2), -6);
  const tail = address.slice(-6);

  return (
    <p className="receive-address-display mb-0" aria-label={`Wallet address ${address}`}>
      <span className="receive-address-highlight">{head}</span>
      <span className="receive-address-body">{midStart}</span>
      <br />
      <span className="receive-address-body">{midEnd}</span>
      <span className="receive-address-highlight">{tail}</span>
    </p>
  );
}

export function ReceivePlainAddress({ address }: { address: string }) {
  return (
    <p className="receive-plain-address mb-0" aria-label={`Wallet address ${address}`}>
      {address}
    </p>
  );
}

export function ReceiveTokenIcon({ symbol }: { symbol: WalletCoinSymbol }) {
  const meta = WALLET_COINS[symbol];
  return (
    <div className="receive-token-icon-wrap">
      <img src={meta.logo} alt={symbol} className="receive-token-icon" />
      <img
        src={media.tokens.polygon}
        alt={CURRENT_NETWORK_INFO.name}
        className="receive-token-chain-badge"
      />
    </div>
  );
}

interface ReceiveQrPanelProps {
  address: string;
  tokenSymbol: WalletCoinSymbol;
  tokenNetworkLabel: string;
  tokenLogo: string;
  paymentUri?: string;
  onTokenClick?: () => void;
}

export function ReceiveQrPanel({
  address,
  tokenSymbol,
  tokenNetworkLabel,
  tokenLogo,
  paymentUri,
  onTokenClick,
}: ReceiveQrPanelProps) {
  const tokenSelector = (
    <>
      <ReceiveTokenIcon symbol={tokenSymbol} />
      <span className="receive-token-selector__label">{tokenNetworkLabel}</span>
      {onTokenClick ? (
        <AppIcon icon="lucide:chevron-down" size={18} className="receive-token-selector__chevron" />
      ) : null}
    </>
  );

  return (
    <div className="receive-qr-card w-full mb-2">
      {onTokenClick ? (
        <button
          type="button"
          className="receive-token-selector"
          onClick={onTokenClick}
          aria-label={`Selected token ${tokenNetworkLabel}. Tap to change.`}
        >
          {tokenSelector}
        </button>
      ) : (
        <div className="receive-token-selector receive-token-selector--static">{tokenSelector}</div>
      )}

      <div className="receive-qr-frame">
        <div className="receive-qr-inner">
          <QRCode
            key={address}
            value={address}
            size={200}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
            className="receive-qr-code"
          />
          <div className="receive-qr-center-badge" aria-hidden>
            <img src={tokenLogo} alt={tokenSymbol} className="receive-qr-center-badge__logo" />
          </div>
        </div>
      </div>

      <ReceiveAddressDisplay address={address} />

      {paymentUri ? <p className="receive-payment-uri mb-0">{paymentUri}</p> : null}
    </div>
  );
}
