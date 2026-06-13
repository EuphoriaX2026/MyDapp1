import './eguard-penalty-banner.css';

const PENALTY_MESSAGE =
  '⚠️ Account Penalized: Due to high transaction frequency, a temporary 20% network tax applies to this transaction.';

export interface EGuardPenaltyBannerProps {
  isVisible: boolean;
}

export function EGuardPenaltyBanner({ isVisible }: EGuardPenaltyBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="eguard-penalty-banner" role="alert">
      {PENALTY_MESSAGE}
    </div>
  );
}
