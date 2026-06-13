import React from 'react';
import { AppIcon } from '../icons/AppIcon';
import { SmartWallet } from '../ui/SmartWallet';
import { formatFinancialNumber } from '../../utils/formatNumber';
import '../../styles/my-plan.css';

function StatIceCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="stat-ice-tile">
      <div className={`stat-ice-tile-inner ${className}`}>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#8E8E93] leading-tight">
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

const WALLET_LAYERS = [
  { id: 'purple', label: 'Blocked', amount: '$0.00', gradient: 'wallet-tab--purple' },
  { id: 'pink', label: 'Blocked', amount: '$0.00', gradient: 'wallet-tab--pink' },
  { id: 'blue', label: 'Blocked', amount: '$0.00', gradient: 'wallet-tab--blue' },
] as const;

function TotalBalanceWalletCard({ balance }: { balance: string }) {
  return (
    <div className="stat-ice-tile">
      <div className="stat-balance-wallet-inner">
        <div className="wallet-stack" aria-hidden={false}>
          {WALLET_LAYERS.map((layer) => (
            <div key={layer.id} className={`wallet-tab ${layer.gradient}`}>
              <AppIcon icon="lucide:lock" width={9} height={9} className="text-[#9CA3AF] shrink-0" />
              <span className="wallet-tab-label">{layer.label}</span>
              <span className="wallet-tab-value">{layer.amount}</span>
            </div>
          ))}
        </div>

        <div className="wallet-main-face">
          <div className="wallet-handle" aria-hidden />
          <button type="button" className="wallet-edit-btn" aria-label="Edit balance">
            <AppIcon icon="lucide:pencil" width={11} height={11} className="text-[#6B7280]" />
          </button>

          <div className="flex items-center gap-1 mt-1">
            <AppIcon icon="lucide:snowflake" width={11} height={11} className="text-[#9CA3AF] shrink-0" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-[#9CA3AF]">
              Frozen assets
            </span>
          </div>

          <p className="wallet-main-amount financial-amount">${balance}</p>
          <p className="wallet-main-caption">Total Balance</p>
        </div>
      </div>
    </div>
  );
}

export interface DashboardPlanWidgetsProps {
  totalValue: string;
  username: string;
  walletAddress?: string;
}

/** Stat tiles + SmartWallet carousel (formerly on My Plan). */
export function DashboardPlanWidgets({
  totalValue,
  username,
  walletAddress,
}: DashboardPlanWidgetsProps) {
  const balanceDisplay = totalValue || formatFinancialNumber(0);

  return (
    <div className="dashboard-plan-widgets w-full flex flex-col gap-4 mt-2 mb-6">
      <div className="grid grid-cols-2 gap-4 w-full">
        <TotalBalanceWalletCard balance={balanceDisplay} />

        <StatIceCard title="Monthly Spend">
          <p className="text-lg font-bold text-[#1C1C1E] mt-1 leading-tight">$1,942.30</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">↑ 8.1% MoM</p>
        </StatIceCard>

        <StatIceCard title="Rewards Points">
          <p className="text-lg font-bold text-[#1C1C1E] mt-1 leading-tight">
            3,420 <span className="text-sm font-bold">pts</span>
          </p>
        </StatIceCard>

        <StatIceCard title="Active Alerts">
          <p className="text-xl font-bold text-red-500 mt-1 leading-tight">2</p>
        </StatIceCard>
      </div>

      <div className="flex items-start justify-center overflow-visible min-h-[200px] w-full">
        <SmartWallet
          className="p-0 origin-top scale-[0.85] sm:scale-100 w-full"
          username={username}
          address={walletAddress}
        />
      </div>
    </div>
  );
}
