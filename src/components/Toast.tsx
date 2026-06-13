import { FinappNotification, type FinappNotificationType } from './FinappNotification';
import type { FinappNotificationPlacement } from '../utils/finappNotificationPlacement';

interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: FinappNotificationType;
  onClose: () => void;
  duration?: number;
  /** internal = below header inside frame; public = same offset on body */
  placement?: FinappNotificationPlacement;
  portalSelector?: string;
}

/** Frame-scoped Finapp glass notification. */
export const Toast = ({
  isVisible,
  message,
  type = 'info',
  onClose,
  duration = 3500,
  placement,
  portalSelector,
}: ToastProps) => (
  <FinappNotification
    isVisible={isVisible}
    message={message}
    type={type}
    onClose={onClose}
    duration={duration}
    placement={placement}
    portalSelector={portalSelector}
  />
);
