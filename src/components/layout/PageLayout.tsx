import { AppIcon } from '../icons/AppIcon';
import React from 'react';
import { useNavigate } from 'react-router-dom';


interface PageLayoutProps {
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'max-w-md' | 'max-w-xl' | 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-7xl';
  debugMode?: boolean;
  showBackButton?: boolean;

  showDeFiHeader?: boolean;
  userAvatar?: string;
  walletAddress?: string;
  onAvatarClick?: () => void;
  onHistoryClick?: () => void;
  onWalletClick?: () => void;
  networkLogoUrl?: string;
  historyDisabled?: boolean;
  deFiHeaderOffsetClass?: string;
  contentPullUpClass?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  children,
  maxWidth = 'max-w-md',
  debugMode = false,
  showBackButton = true,
  showDeFiHeader = false,
  userAvatar,
  walletAddress = '0xfK07...8336',
  onAvatarClick,
  onHistoryClick,
  onWalletClick,
  networkLogoUrl,
  historyDisabled = false,
  deFiHeaderOffsetClass = '-mt-[100px]',
  contentPullUpClass = '',
}) => {
  const navigate = useNavigate();
  const avatarSrc =
    userAvatar ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80';

  return (
    <div
      className={`relative mx-auto flex w-full min-h-[100dvh] max-w-md flex-col items-center !bg-transparent px-3 pb-28 pt-[max(0.5rem,env(safe-area-inset-top))] ${debugMode ? 'ring-2 ring-red-500/50 bg-red-500/5' : ''}`}
    >
      <div
        className={`w-full ${maxWidth} flex flex-col gap-6 relative z-10 ${debugMode ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : ''} ${contentPullUpClass}`}
      >
        {showDeFiHeader ? (
          <div
            className={`w-full flex items-center justify-between mb-2 ${deFiHeaderOffsetClass}`}
          >
            <button
              type="button"
              onClick={onAvatarClick}
              className="relative shrink-0 hover:opacity-90 transition-opacity active:scale-95"
              aria-label="Go to Dashboard"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-[#bae6fd] to-[#99f6e4] p-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white/50">
                  <img src={avatarSrc} alt="User Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onWalletClick}
              className="flex items-center gap-2 hover:bg-white/40 px-3 py-1.5 rounded-full transition-colors cursor-pointer min-w-0 mx-1"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm shrink-0 bg-white">
                {networkLogoUrl ? (
                  <img
                    src={networkLogoUrl}
                    alt="Polygon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#8247E5] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden>
                      <path d="M12.012 2L2 7.771v8.45l10.012 5.77 10.012-5.77v-8.45z" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-gray-900 font-bold text-[15px] tracking-tight truncate max-w-[140px]">
                {walletAddress}
              </span>
              <AppIcon icon="lucide:chevron-down" size={18} className="text-gray-900 shrink-0" strokeWidth={2.5} />
            </button>

            <button
              type="button"
              disabled={historyDisabled}
              onClick={historyDisabled ? undefined : onHistoryClick}
              className={`w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.06)] shrink-0 ${
                historyDisabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95 transition-transform'
              }`}
              aria-label="Transaction History"
            >
              <AppIcon icon="lucide:history" width={20} height={20} className="text-gray-900" />
            </button>
          </div>
        ) : (
          (title || showBackButton) && (
            <div className="w-full flex items-center justify-between mb-2">
              {showBackButton ? (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
                >
                  <AppIcon icon="lucide:chevron-left" className="w-5 h-5" strokeWidth={2.5} />
                </button>
              ) : (
                <div className="w-10 h-10" />
              )}

              {title && (
                <h1 className="text-xl font-black text-gray-900 tracking-tight drop-shadow-sm">
                  {title}
                </h1>
              )}

              <div className="w-10 h-10" />
            </div>
          )
        )}

        {children}
      </div>
    </div>
  );
};
