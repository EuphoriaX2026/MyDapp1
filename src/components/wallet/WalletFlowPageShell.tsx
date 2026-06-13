import { AppIcon } from '../icons/AppIcon';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/glass';
import '../../styles/wallet-flow-page.css';

interface WalletFlowPageShellProps {
  title: string;
  titleMedium?: boolean;
  backTo?: string;
  onBack?: () => void;
  children: React.ReactNode;
  variant?: 'glass' | 'flat';
  footer?: React.ReactNode;
  /** When true (default), use Settings-matched typography and card width. Set false for Genealogy etc. */
  settingsSurface?: boolean;
  /** Hide centered header title (back button remains). */
  hideTitle?: boolean;
  headerRight?: React.ReactNode;
}

export function WalletFlowPageShell({
  title,
  titleMedium = false,
  backTo = '/MyWallet',
  onBack,
  children,
  variant = 'flat',
  footer,
  settingsSurface = true,
  hideTitle = false,
  headerRight,
}: WalletFlowPageShellProps) {
  const navigate = useNavigate();
  const isFlat = variant === 'flat';

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <div
      className={`wallet-flow-page${settingsSurface ? ' finapp-secondary-page' : ''}${isFlat ? ' wallet-flow-page--flat' : ''}`}
    >
      <div className="appHeader wallet-flow-header">
        <div className="left">
          <button
            type="button"
            className="headerButton"
            onClick={handleBack}
            aria-label="Go back"
          >
            <AppIcon icon="lucide:chevron-left" />
          </button>
        </div>
        <div
          className={`pageTitle${titleMedium ? ' wallet-flow-title--medium' : ''}${hideTitle ? ' wallet-flow-title--hidden' : ''}`}
        >
          {hideTitle ? null : title}
        </div>
        <div className="right">{headerRight ?? null}</div>
      </div>

      <div className="wallet-flow-body">
        {isFlat ? (
          <>
            <div className="wallet-flow-flat-content">{children}</div>
            {footer ? <div className="wallet-flow-flat-footer">{footer}</div> : null}
          </>
        ) : (
          <div className="wallet-flow-glass-wrap">
            <GlassCard className="wallet-flow-glass-card" glowColor="indigo">
              {children}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
