import { memo, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatFinancialAmountParts,
  getWalletBalanceFractionDigits,
} from '../utils/formatNumber';
import { useAccount } from 'wagmi';
import { EdexSwapIcon } from '../components/icons/EdexSwapIcon';
import { WalletScanIcon } from '../components/icons/WalletScanIcon';

import { SendMoneyQrScanner } from '../components/wallet/SendMoneyQrScanner';
import { AppIcon } from '../components/icons/AppIcon';
import { BalanceVisibilityEyeIcon } from '../components/icons/BalanceVisibilityEyeIcon';
import { DefiIcon } from '../components/icons/DefiIcon';
import { NftNavIcon } from '../components/icons/NftNavIcon';
import { TokenSparkline } from '../components/wallet/TokenSparkline';
import { usePortfolioBalances } from '../hooks/usePortfolioBalances';
import { useWalletTokenMarketData } from '../hooks/useWalletTokenMarketData';
import { useWalletTokenSparklines } from '../hooks/useWalletTokenSparklines';
import {
  WALLET_ALWAYS_VISIBLE_SYMBOLS,
  WALLET_COINS,
  type WalletCoinSymbol,
} from '../config/wallet-coins';

const WALLET_SHOW_BALANCE_KEY = 'mywalletShowBalance';

function readShowBalancePreference(): boolean {
  try {
    return localStorage.getItem(WALLET_SHOW_BALANCE_KEY) !== '0';
  } catch {
    return true;
  }
}

interface TokenHoldingItem {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  price: number;
  change: string;
  isPositive: boolean;
  logo: string;
  chartColor: string;
  chartPrices: number[];
  chartTrend: 'profit' | 'loss';
}

function formatTokenPrice(symbol: string, price: number): string {
  if (symbol === 'E1' || symbol === 'DAI' || symbol === 'USDT') {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  if (symbol === 'POL' || symbol === 'QBit') {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  if (symbol === 'ERX') {
    return '$' + parseFloat(price.toFixed(5)).toString();
  }
  return '$' + price.toFixed(4);
}

function formatErxEquivalent(amount: number): string {
  if (amount >= 1000) {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (amount >= 1) {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  return amount.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function formatPortfolioChangeLabel(changePct: number): string {
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(2)}%`;
}

function WalletBalanceDisplay({
  showBalance,
  isLoading,
  isConnected,
  totalValueRaw,
  erxPriceUsd,
  portfolioChangePct,
  onToggleVisibility,
}: {
  showBalance: boolean;
  isLoading: boolean;
  isConnected: boolean;
  totalValueRaw: number;
  erxPriceUsd: number;
  portfolioChangePct: number;
  onToggleVisibility: () => void;
}) {
  const raw = isConnected ? totalValueRaw : 0;
  const fractionDigits = getWalletBalanceFractionDigits(raw);
  const { integerFormatted, decimal } = formatFinancialAmountParts(raw, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const erxEquivalent = erxPriceUsd > 0 ? raw / erxPriceUsd : 0;
  const isPortfolioProfit = portfolioChangePct >= 0;

  return (
    <div className="mywallet2-balance-toggle flex flex-col items-center text-center w-full">
      <div className="mywallet2-balance-label-row flex w-full items-center justify-center gap-1.5">
        <span className="title profile-balance-label mywallet2-balance-label mb-0">Balance</span>
        <button
          type="button"
          className="mywallet2-balance-visibility-btn border-0 bg-transparent p-0"
          onClick={onToggleVisibility}
          aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          title={showBalance ? 'Hide balance' : 'Show balance'}
        >
          <BalanceVisibilityEyeIcon
            showBalance={showBalance}
            className="mywallet2-balance-eye-icon"
          />
        </button>
      </div>

      {!showBalance ? (
        <div className="mywallet2-balance-hidden-block w-full flex justify-center">
          <span className="mywallet2-balance-hidden-dots" aria-label="Balance hidden">
            <span className="mywallet2-balance-dot" />
            <span className="mywallet2-balance-dot" />
            <span className="mywallet2-balance-dot" />
            <span className="mywallet2-balance-dot" />
          </span>
        </div>
      ) : (
        <>
          <div className="mywallet2-balance-amount-container w-full">
            <h1 className="total profile-card-balance mywallet2-balance-amount m-0 font-sans tabular-nums">
              <div className="mywallet2-balance-amount-inner">
                {isLoading ? (
                  <span className="mywallet2-balance-masked">…</span>
                ) : (
                  <>
                    <span className="mywallet2-balance-currency">$</span>
                    <span className="mywallet2-balance-integer">{integerFormatted}</span>
                    {decimal !== null && fractionDigits > 0 ? (
                      <span className="profile-balance-decimal mywallet2-balance-fraction">.{decimal}</span>
                    ) : null}
                  </>
                )}
              </div>
            </h1>
          </div>

          <div className="mywallet2-balance-pl-row">
            <div
              className={`mywallet2-balance-pl-capsule-shell mywallet2-balance-pl-capsule-shell--${
                isPortfolioProfit ? 'profit' : 'loss'
              }`}
            >
              <div className="mywallet2-balance-pl-capsule" aria-label="Portfolio change">
                {isLoading ? (
                  '…'
                ) : (
                  <>
                    <span>{formatPortfolioChangeLabel(portfolioChangePct)}</span>
                    <span className="mywallet2-balance-pl-usd">USD</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="mywallet2-balance-erx-equiv m-0 font-sans tabular-nums fw-normal">
            {isLoading ? (
              <span>… ERX</span>
            ) : (
              <span>≈ {formatErxEquivalent(erxEquivalent)} ERX</span>
            )}
          </p>
        </>
      )}
    </div>
  );
}

function WalletMoreMenu({
  open,
  onClose,
  onSelectNfts,
  onSelectDefi,
}: {
  open: boolean;
  onClose: () => void;
  onSelectNfts: () => void;
  onSelectDefi: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`mywallet2-more-shell${open ? ' mywallet2-more-shell--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="More"
      aria-hidden={!open}
    >
      <div
        className="mywallet2-more-overlay"
        onClick={onClose}
        role="presentation"
      />
      <div className="mywallet2-more-drawer">
        <div className="modal-header">
          <h5 className="modal-title">More</h5>
          <button type="button" className="btn btn-link p-0" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          <ul className="listview image-listview flush transparent no-line">
            <li>
              <button type="button" className="item" onClick={onSelectNfts}>
                <div className="icon-box mywallet2-more-nft-icon-box">
                  <NftNavIcon className="mywallet2-more-nft-icon" />
                </div>
                <div className="in">
                  <div>NFTs</div>
                  <AppIcon icon="lucide:chevron-right" />
                </div>
              </button>
            </li>
            <li>
              <button type="button" className="item" onClick={onSelectDefi}>
                <div className="icon-box mywallet2-more-defi-icon-box">
                  <DefiIcon className="mywallet2-more-defi-icon" />
                </div>
                <div className="in">
                  <div>DeFi</div>
                  <AppIcon icon="lucide:chevron-right" />
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const TokenHoldingCard = memo(function TokenHoldingCard({ token }: { token: TokenHoldingItem }) {
  const changeClass = token.isPositive
    ? 'mywallet2-token-change--profit'
    : 'mywallet2-token-change--loss';

  return (
    <li>
      <div className="item mywallet2-token-card">
        <div className="mywallet2-token-card-icon image-container">
          <img
            src={token.logo}
            alt={token.symbol}
            className="image"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = `https://placehold.co/100/1a1a2e/FFF?text=${token.symbol}`;
            }}
          />
        </div>
        <div className="mywallet2-token-card-left mywallet2-token-meta">
          <div className="flex items-center gap-2">
            <strong>{token.symbol}</strong>
            <span className={`text-[10px] font-normal ${changeClass}`}>{token.change}</span>
          </div>
          <div className="text-small text-secondary">
            {formatTokenPrice(token.symbol, token.price)}
          </div>
        </div>
        <div
          className={`mywallet2-token-card-chart mywallet2-token-chart-wrap mywallet2-token-chart-wrap--${token.chartTrend}`}
          aria-hidden
        >
          <TokenSparkline
            prices={token.chartPrices}
            color={token.chartColor}
            className="mywallet2-token-area-chart"
          />
        </div>
        <div className="mywallet2-token-card-right text-end mywallet2-token-holdings">
          <strong className={token.amount > 0 ? 'text-[#1a1a2e]' : 'text-[#c1c1cb]'}>
            {token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </strong>
          <div className="text-small text-secondary">
            $ {token.value.toFixed(2)}
          </div>
        </div>
      </div>
    </li>
  );
});

export default function MyWallet() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { balances, isLoading: isBalancesLoading } = usePortfolioBalances();
  const { snapshots, isLoading: isMarketLoading } = useWalletTokenMarketData();
  const { series: sparklineSeries } = useWalletTokenSparklines();

  const [showBalance, setShowBalance] = useState(readShowBalancePreference);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const toggleBalanceVisibility = () => {
    setShowBalance((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(WALLET_SHOW_BALANCE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const coinAmounts: Record<WalletCoinSymbol, number> = {
    ERX: balances.erx.value,
    E1: balances.e1.value,
    QBit: balances.qbit.value,
    DAI: balances.dai.value,
    USDT: balances.usdt.value,
    POL: balances.pol.value,
  };

  const buildCoinItem = (sym: WalletCoinSymbol) => {
    const meta = WALLET_COINS[sym];
    const amount = coinAmounts[sym];
    const market = snapshots[sym];
    const price = market.priceUsd;
    const value = amount * price;
    return {
      symbol: meta.symbol,
      name: meta.name,
      amount,
      value,
      price,
      change: market.changeLabel,
      isPositive: market.isPositive,
      logo: meta.logo,
      chartColor: market.chartColor,
      chartTrend: market.chartTrend,
      chartPrices: sparklineSeries[sym],
    };
  };

  const orderedTokenItems = useMemo(
    () =>
      WALLET_ALWAYS_VISIBLE_SYMBOLS
        .map((sym) => buildCoinItem(sym))
        .sort((a, b) => b.value - a.value),
    [
      balances.erx.value,
      balances.e1.value,
      balances.qbit.value,
      balances.dai.value,
      balances.usdt.value,
      balances.pol.value,
      snapshots,
      sparklineSeries,
    ],
  );

  const totalValueRaw = orderedTokenItems.reduce((sum, item) => sum + item.value, 0);
  const erxPriceUsd = snapshots.ERX.priceUsd;
  const isBalanceLoading = isBalancesLoading || isMarketLoading;

  const portfolioChangePct = useMemo(() => {
    if (totalValueRaw <= 0) return 0;
    return orderedTokenItems.reduce((sum, item) => {
      const market = snapshots[item.symbol as WalletCoinSymbol];
      const weight = item.value / totalValueRaw;
      return sum + weight * (market?.changePct ?? 0);
    }, 0);
  }, [orderedTokenItems, totalValueRaw, snapshots]);

  return (
    <div className="mywallet2-page">
      <div className="appHeader mywallet2-app-header">
        <div className="left">
          <button
            type="button"
            className="headerButton"
            onClick={() => navigate('/')}
            aria-label="Back to dashboard"
          >
            <AppIcon icon="lucide:arrow-left" className="icon" />
          </button>
        </div>
        <div className="pageTitle mywallet2-page-title">My Wallet</div>
        <div className="right">
          <button
            type="button"
            className="headerButton"
            aria-label="Scan QR code"
            onClick={() => setQrScannerOpen(true)}
          >
            <WalletScanIcon className="icon" />
          </button>
        </div>
      </div>

      <div className="section mywallet2-balance-section pt-0 mb-0">
        <div className="mywallet2-balance-card profile-card profile-card--default finapp-frame-padding relative z-10 w-full mt-2">
          <WalletBalanceDisplay
            showBalance={showBalance}
            isLoading={isBalanceLoading}
            isConnected={isConnected}
            totalValueRaw={totalValueRaw}
            erxPriceUsd={erxPriceUsd}
            portfolioChangePct={portfolioChangePct}
            onToggleVisibility={toggleBalanceVisibility}
          />
        </div>
      </div>

      <div className="section mywallet2-actions-section mt-0 mb-0">
        <div className="mywallet2-action-row pb-2">
          <button
            type="button"
            className="mywallet2-mlm-btn flex flex-col cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border-0 bg-transparent p-0"
            onClick={() => navigate('/send-money')}
          >
            <div className="mywallet2-action-circle flex justify-center items-center rounded-full">
              <AppIcon icon="lucide:arrow-up" className="mywallet2-action-icon" />
            </div>
            <span className="mywallet2-action-label font-sans tabular-nums whitespace-nowrap">
              Send
            </span>
          </button>
          <button
            type="button"
            className="mywallet2-mlm-btn flex flex-col cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border-0 bg-transparent p-0"
            onClick={() => navigate('/receive')}
          >
            <div className="mywallet2-action-circle flex justify-center items-center rounded-full">
              <AppIcon icon="lucide:arrow-down" className="mywallet2-action-icon" />
            </div>
            <span className="mywallet2-action-label font-sans tabular-nums whitespace-nowrap">
              Receive
            </span>
          </button>
          <Link
            to="/edex"
            className="mywallet2-mlm-btn flex flex-col cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 no-underline"
          >
            <div className="mywallet2-action-circle flex justify-center items-center rounded-full">
              <EdexSwapIcon className="mywallet2-edex-icon" />
            </div>
            <span className="mywallet2-action-label font-sans tabular-nums whitespace-nowrap">
              EDex
            </span>
          </Link>
          <button
            type="button"
            aria-label="Buy"
            className="mywallet2-mlm-btn flex flex-col cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border-0 bg-transparent p-0"
            onClick={() => navigate('/store')}
          >
            <div className="mywallet2-action-circle flex justify-center items-center rounded-full">
              <AppIcon icon="lucide:credit-card" className="mywallet2-action-icon" />
            </div>
            <span className="mywallet2-action-label font-sans tabular-nums whitespace-nowrap">
              Buy
            </span>
          </button>
          <button
            type="button"
            aria-label="More"
            className="mywallet2-mlm-btn flex flex-col cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border-0 bg-transparent p-0"
            onClick={() => setMoreMenuOpen(true)}
          >
            <div className="mywallet2-action-circle flex justify-center items-center rounded-full">
              <AppIcon icon="lucide:ellipsis-vertical" className="mywallet2-action-icon" />
            </div>
            <span className="mywallet2-action-label font-sans tabular-nums whitespace-nowrap">
              More
            </span>
          </button>
        </div>
      </div>

      <SendMoneyQrScanner
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={(address) => {
          setQrScannerOpen(false);
          navigate('/send-money', { state: { recipient: address } });
        }}
      />

      <WalletMoreMenu
        open={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        onSelectNfts={() => {
          setMoreMenuOpen(false);
          navigate('/nft-details');
        }}
        onSelectDefi={() => {
          setMoreMenuOpen(false);
        }}
      />

      <div className="section mt-0 mywallet2-tabs-section">
        <div className="tab-content mywallet2-tab-content">
          <div className="tab-pane show active">
            <ul className="listview image-listview transparent flush mywallet2-token-transactions mywallet2-coins-token-list">
              {orderedTokenItems.map((token) => (
                <TokenHoldingCard key={token.symbol} token={token} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
