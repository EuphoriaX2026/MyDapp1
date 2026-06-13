import { AppIcon } from './icons/AppIcon';
import { BalanceVisibilityEyeIcon } from './icons/BalanceVisibilityEyeIcon';
import React from 'react';
import { formatFinancialAmountParts } from '../utils/formatNumber';
import { BUSINESS_STARS_PATH } from '../config/businessHubRoutes';

interface ProfileCardProps {
  avatar: string;
  username: string;
  userId: string;
  showBalance: boolean;
  isConnected: boolean;
  totalValue: string | number;
  statusLabel: string;
  planLabel: string;
  ratingDisplay: string | number;
  earnedFormatted: string | number;
  expDays: string | number;
  activeTab: string;
  pendingPoints: number | string;
  setShowBalance: (show: boolean) => void;
  navigate: (path: string) => void;
  className?: string;
  variant?: 'default' | 'glass';
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatar,
  username,
  userId,
  showBalance,
  isConnected,
  totalValue,
  statusLabel,
  planLabel,
  ratingDisplay,
  earnedFormatted,
  expDays,
  activeTab,
  pendingPoints,
  setShowBalance,
  navigate,
  className = '',
  variant = 'default',
}) => {
  const isGlass = variant === 'glass';

  const renderBalanceAmount = () => {
    if (!showBalance) return '••••••';

    const raw = isConnected ? totalValue : 0;
    const { integerFormatted, decimal } = formatFinancialAmountParts(raw);

    return (
      <>
        {integerFormatted}
        {decimal ? <span className="profile-balance-decimal">.{decimal}</span> : null}
      </>
    );
  };

  return (
    <div
      className={`profile-card finapp-frame-padding relative z-10 w-full mt-2 overflow-hidden ${
        isGlass ? 'profile-card--glass' : 'profile-card--default'
      } ${className}`}
    >
      <div className="relative z-10 mb-4 text-start">
        <div className="flex items-center gap-3 mb-4">
          <div className="profile-card-avatar-ring">
            <div className="profile-card-avatar">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80'}
                alt={username}
                className="profile-card-avatar__img"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-[24px] profile-username text-[#1a1a2e] tracking-tight leading-tight truncate mb-1">
              {username}
            </h2>

            <div className="flex items-center gap-2">
              <AppIcon icon="lucide:shield-check" size={15} className="text-[#8E8E93]" />
              <p className="profile-user-id font-sans tabular-nums text-[#8E8E93] text-[14px]">ID: {userId}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col mb-1 select-none group">
          <div className="profile-balance-label-row flex items-center gap-1.5 mb-1">
            <span className="profile-balance-label text-[#8E8E93] text-[14px] mb-0">
              Total Balance
            </span>
            <button
              type="button"
              className="profile-balance-visibility-btn border-0 bg-transparent p-0"
              onClick={() => setShowBalance(!showBalance)}
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              <BalanceVisibilityEyeIcon
                showBalance={showBalance}
                className="profile-balance-eye-icon"
              />
            </button>
          </div>
          <h1
            className="total profile-card-balance flex items-baseline font-sans tabular-nums text-[#1C1C1E] text-[32px] m-0 cursor-pointer"
            onClick={() => setShowBalance(!showBalance)}
            title="Click to hide/show balance"
          >
            <span className="mr-2 font-sans tabular-nums text-[#8E8E93] font-bold transition-opacity duration-300 self-center">$</span>
            {renderBalanceAmount()}
          </h1>
        </div>

        <div className="flex gap-1.5">
          <span className="profile-status-chip">{statusLabel}</span>
          <span className="profile-status-chip">{planLabel}</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between mb-2 px-1">
        <div className="flex flex-1 flex-col items-center text-center">
          <div className="profile-stat-value flex items-center justify-center gap-1 font-sans tabular-nums text-[#1a1a2e] text-[18px]">
            <AppIcon icon="lucide:star" size={16} fill="currentColor" /> {ratingDisplay}
          </div>
          <span className="profile-stat-label text-[#8E8E93] text-[13px] mt-1">Rating</span>
        </div>

        <div className="w-px h-8 bg-[#1a1a2e]/10 rounded-full shrink-0" />

        <div className="flex flex-1 flex-col items-center text-center">
          <div className="profile-stat-value font-sans tabular-nums text-[#1a1a2e] text-[18px]">{earnedFormatted}</div>
          <span className="profile-stat-label text-[#8E8E93] text-[13px] mt-1">Earned</span>
        </div>

        <div className="w-px h-8 bg-[#1a1a2e]/10 rounded-full shrink-0" />

        <div className="flex flex-1 flex-col items-center text-center">
          <div className="profile-stat-value font-sans tabular-nums text-[#1a1a2e] text-[18px]">{expDays}</div>
          <span className="profile-stat-label text-[#8E8E93] text-[13px] mt-1">Expir</span>
        </div>
      </div>

      <div className="relative z-10 flex gap-3">
        {activeTab === 'profile' && (
          <>
            <button
              type="button"
              className="profile-claim-btn flex-1 h-[52px] shrink-0 bg-white hover:bg-white/95 border border-gray-200 rounded-[20px] text-[#1a1a2e] font-sans tabular-nums transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 flex items-center justify-center gap-2"
              onClick={() => navigate(BUSINESS_STARS_PATH)}
            >
              Claim Stars
            </button>
            <button
              type="button"
              className="w-[52px] h-[52px] shrink-0 bg-white hover:bg-white/95 border border-gray-200 rounded-[20px] flex items-center justify-center text-[#1a1a2e] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 relative group"
              title="Notifications"
            >
              <AppIcon icon="lucide:bell" className="w-5 h-5 text-[#1a1a2e]" />
              {pendingPoints !== 0 && pendingPoints !== '0' && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] flex items-center justify-center bg-[#CD2E3A] rounded-full border-[2px] border-white text-white font-sans tabular-nums text-[11px] font-bold px-1 shadow-sm transition-transform group-hover:scale-110">
                  {pendingPoints}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
