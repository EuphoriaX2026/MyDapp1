import { AppIcon } from '../components/icons/AppIcon';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';

import { Sidebar } from '../components/Sidebar';
import { useProfile } from '../context/ProfileContext';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import PanelABI from '../abis/Panel-titan.json';
import RegisterABI from '../abis/Register-titan.json';
import Game from '../components/Game';
import ProfileCard from '../components/ProfileCard';
import BannerSlider from '../components/BannerSlider';
import { DashboardPlanWidgets } from '../components/dashboard/DashboardPlanWidgets';

import { useTotalBalance } from '../hooks/useTotalBalance';
import { useTeamReport } from '../hooks/useTeamReport';
import { useTitanOneDaySeconds } from '../hooks/useTitanOneDaySeconds';
import { chainSecondsToDisplayDays } from '../utils/titanTimeScale';
import { useDashboardProfileStats } from '../hooks/useDashboardProfileStats';

import '../styles/eone-sidebar.css';
import '../styles/cards.css';
import '../styles/dashboard-page.css';
import '../assets/css/carousel-fixes.css';
import '../styles/mobile-modals.css';
import '../styles/address-validation.css';
import '../styles/charts.css';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [activeTab] = useState<'profile'>('profile');

  const { username, avatar } = useProfile();

  const [openAccountMenuId, setOpenAccountMenuId] = useState<number | null>(null);

  const [showBalance, setShowBalance] = useState(true);
  const { totalPendingPoints } = useTeamReport();
  const pendingPointsBadge =
    totalPendingPoints > 0n ? totalPendingPoints.toString() : 0;

  const [wallets] = useState([
    { id: 1, name: 'Wallet01-ABC', balance: '$0', address: '0x1234...5678', active: false },
    { id: 2, name: 'Wallet02-XYZ', balance: '$0', address: '0xabcd...efgh', active: false },
    { id: 3, name: 'Wallet03-BJ3', balance: '$0', address: '0x9876...4321', active: true },
  ]);

  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { totalValueFormatted: totalValue } = useTotalBalance();

  const { data: userBasicDetails } = useReadContract({
    address: TITAN_CONTRACTS.Register as `0x${string}`,
    abi: RegisterABI.abi,
    functionName: 'getUserBasicDetails',
    args: [address],
    query: { enabled: !!address },
  });
  const userId = userBasicDetails ? (userBasicDetails as any[])[0].toString() : 'Loading...';

  const { data: userStatus } = useReadContract({
    address: TITAN_CONTRACTS.Register as `0x${string}`,
    abi: RegisterABI.abi,
    functionName: 'getUserStatus',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: group1Timestamps } = useReadContract({
    address: TITAN_CONTRACTS.Panel as `0x${string}`,
    abi: PanelABI.abi,
    functionName: 'getUserGroupTimestamps',
    args: [address, 1],
    query: { enabled: !!address },
  });

  const statusNum = userStatus !== undefined ? Number(userStatus) : 0;
  const { ratingDisplay, earnedFormatted } = useDashboardProfileStats(statusNum);
  const statusLabels: Record<number, string> = {
    0: 'Free',
    1: 'Active',
    2: 'Inactive',
    3: 'Blocked',
    4: 'Active',
    5: 'Active',
  };
  const statusLabel = statusLabels[statusNum] ?? 'Unknown';
  const planLabel = statusNum === 4 || statusNum === 5 ? 'VIP' : 'Normal';
  const oneDaySeconds = useTitanOneDaySeconds();

  let expDays = '0';
  if (group1Timestamps) {
    const expiryTimestamp = Number((group1Timestamps as any[])[1]);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (expiryTimestamp > currentTimestamp) {
      const daysLeft = chainSecondsToDisplayDays(
        expiryTimestamp - currentTimestamp,
        oneDaySeconds,
      );
      expDays = daysLeft > 1000 ? '1K+' : daysLeft.toString();
    }
  }

  const figmaStyles = `
    .wallet-card-section:before { display: none !important; }
    .wallet-card {
      background: var(--finapp-content-bg) !important;
      border-radius: 24px !important;
      border: none !important;
      box-shadow: 0px 12px 24px -6px rgba(0, 0, 0, 0.35) !important;
      padding: 24px !important;
      margin-top: 10px !important;
    }
    .wallet-card .balance .title { color: var(--finapp-text) !important; font-size: 14px !important; font-weight: 500 !important; margin-bottom: 4px !important; }
    .wallet-card .balance .total { color: var(--finapp-heading) !important; font-family: var(--app-font-family) !important; font-feature-settings: 'tnum' 1; font-variant-numeric: tabular-nums; font-size: 32px !important; font-weight: 700 !important; letter-spacing: -0.03em !important; margin: 0 !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .segmented-control-container {
      background: rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid var(--finapp-line) !important;
      border-radius: 50px !important;
      padding: 6px !important;
      display: flex !important;
      margin: 10px 0 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    .segmented-control-tab {
      flex: 1 !important; text-align: center !important; padding: 10px 0 !important; border-radius: 40px !important; font-family: var(--app-font-family) !important; font-feature-settings: 'tnum' 1; font-variant-numeric: tabular-nums; font-size: 14px !important; font-weight: 500 !important; color: var(--finapp-text) !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer !important; background: transparent !important; border: none !important;
    }
    .segmented-control-tab.active { background: var(--finapp-content-bg) !important; color: var(--finapp-heading) !important; font-weight: 700 !important; box-shadow: 0px 4px 12px rgba(0,0,0,0.2) !important; }
    .wallet-card .wallet-footer { border: none !important; padding: 0 !important; margin-top: 24px !important; display: flex !important; justify-content: space-between !important; }
    .wallet-card .wallet-footer .item { flex: 1 !important; text-align: center !important; }
    .wallet-card .wallet-footer .item .icon-wrapper { width: 56px !important; height: 56px !important; border-radius: 18px !important; display: flex !important; justify-content: center !important; align-items: center !important; margin: 0 auto 8px auto !important; font-size: 24px !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; color: #FFFFFF !important; }
    .wallet-card .wallet-footer .item a:hover .icon-wrapper, .wallet-card .wallet-footer .item .icon-wrapper:hover { transform: translateY(-4px) !important; }
    .wallet-card .wallet-footer .item strong { color: var(--finapp-text-light) !important; font-family: var(--app-font-family) !important; font-feature-settings: 'tnum' 1; font-variant-numeric: tabular-nums; font-size: 12px !important; font-weight: 700 !important; display: block !important; }
    .secondary-card { border-radius: 24px !important; padding: 20px !important; height: 100% !important; display: flex !important; flex-column !important; justify-content: space-between !important; position: relative !important; overflow: hidden !important; }
  `;

  return (
    <div
      className="dapp-page dashboard-page relative pb-0 font-sans selection:bg-brand-blue selection:text-white min-h-[100dvh] bg-[var(--finapp-body-bg)]"
      dir="ltr"
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="appHeader dashboard-app-header">
        <div className="left">
          <button
            type="button"
            className="headerButton"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <AppIcon icon="lucide:menu" className="icon" />
          </button>
        </div>
        <div className="pageTitle">Dashboard</div>
        <div className="right">
          <Link to="/settings" className="headerButton" aria-label="Settings">
            <AppIcon icon="lucide:settings" className="icon" />
          </Link>
        </div>
      </div>

      <div id="appCapsule" className="dashboard-capsule relative z-10 flex w-full flex-col">
        <div className="flex w-full flex-col mx-auto">
          <style>{figmaStyles}</style>

          {isWalletSelectorOpen && (
            <div
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-start justify-center pt-[60px]"
              onClick={() => {
                setIsWalletSelectorOpen(false);
                setOpenAccountMenuId(null);
              }}
            >
              <div
                className="w-[calc(100%-32px)] bg-[var(--finapp-content-bg)] rounded-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto relative border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-bold text-[var(--finapp-heading)]">Accounts</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWalletSelectorOpen(false);
                      setOpenAccountMenuId(null);
                    }}
                    className="p-1 bg-white/10 rounded-full active:scale-95"
                  >
                    <AppIcon icon="lucide:x" size={20} className="text-[var(--finapp-text)]" />
                  </button>
                </div>

                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className={`relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${wallet.active ? 'bg-[var(--finapp-primary)]/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <AppIcon icon="lucide:wallet" size={20} className="text-[var(--finapp-primary)]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[var(--finapp-heading)]">{wallet.name}</p>
                          <p className="text-[12px] text-[var(--finapp-text)] font-medium">{wallet.balance}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {wallet.active && (
                          <div className="w-6 h-6 bg-[#34C759] rounded-full flex items-center justify-center shadow-sm">
                            <AppIcon icon="lucide:check" size={14} className="text-white" strokeWidth={3} />
                          </div>
                        )}

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenAccountMenuId(openAccountMenuId === wallet.id ? null : wallet.id);
                            }}
                            className="p-1.5 text-[var(--finapp-text)] hover:bg-white/10 rounded-full transition-colors"
                          >
                            <AppIcon icon="lucide:ellipsis-vertical" size={18} />
                          </button>

                          {openAccountMenuId === wallet.id && (
                            <div className="absolute right-0 top-8 mt-1 w-32 bg-[var(--finapp-content-bg)] border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-[var(--finapp-heading)] hover:bg-white/5 transition-colors"
                              >
                                <AppIcon icon="lucide:pencil" width={14} height={14} className="text-[var(--finapp-text)]" /> Edit Name
                              </button>
                              <div className="h-[1px] bg-white/10 w-full" />
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-[#FF3B30] hover:bg-red-500/10 transition-colors"
                              >
                                <AppIcon icon="lucide:trash-2" width={14} height={14} className="text-[#FF3B30]" /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="w-full mt-2 py-3.5 bg-[var(--finapp-primary)] text-white rounded-xl font-bold text-[15px] active:scale-95 transition-transform shadow-lg shadow-primary/30"
                  onClick={() => setIsWalletSelectorOpen(false)}
                >
                  Add Account
                </button>
              </div>
            </div>
          )}

          <div className="mx-auto flex w-full max-w-full flex-col !bg-transparent">
            <div
              className="section wallet-card-section pt-0 mb-0"
              style={{ position: 'relative', zIndex: 10 }}
            >
              <ProfileCard
                avatar={avatar}
                username={username}
                userId={userId}
                showBalance={showBalance}
                isConnected={isConnected}
                totalValue={totalValue}
                statusLabel={statusLabel}
                planLabel={planLabel}
                ratingDisplay={ratingDisplay}
                earnedFormatted={earnedFormatted}
                expDays={expDays}
                activeTab={activeTab}
                pendingPoints={pendingPointsBadge}
                setShowBalance={setShowBalance}
                navigate={navigate}
              />
            </div>

            <div className="section mt-0 relative z-10 finapp-aligned-block">
              <div className="card bg-transparent shadow-none border-none">
                <div className="card-body pt-0 p-0">
                  <div className="tab-content mt-0">
                    <div className="tab-pane show active">
                      <div className="w-full mb-6">
                        <BannerSlider />
                      </div>
                      <div className="w-full mb-6">
                        <Game />
                      </div>
                      <DashboardPlanWidgets
                        totalValue={totalValue}
                        username={username}
                        walletAddress={address}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
