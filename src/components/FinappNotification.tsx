import { useEffect, useRef } from 'react';
import type { FinappNotificationType } from './FinappNotification.types';
import type { FinappNotificationPlacement } from '../utils/finappNotificationPlacement';
import { useFinappNotifications } from '../context/FinappNotificationContext';

export type { FinappNotificationType } from './FinappNotification.types';

interface FinappNotificationProps {
  isVisible: boolean;
  message: string;
  type?: FinappNotificationType;
  onClose: () => void;
  duration?: number;
  placement?: FinappNotificationPlacement;
  portalSelector?: string;
}

/** Pushes a single notification into the global stack (legacy single-toast API). */
export function FinappNotification({
  isVisible,
  message,
  type = 'info',
  onClose,
  duration = 3500,
  placement,
  portalSelector,
}: FinappNotificationProps) {
  const { push, dismiss } = useFinappNotifications();
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isVisible || !message.trim()) {
      if (activeIdRef.current) {
        dismiss(activeIdRef.current);
        activeIdRef.current = null;
      }
      return;
    }

    const id = push(message, { type, duration, placement, portalSelector, tag: 'legacy-single' });
    activeIdRef.current = id;

    if (duration > 0) {
      const timer = window.setTimeout(() => {
        onClose();
        activeIdRef.current = null;
      }, duration + 320);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [dismiss, duration, isVisible, message, onClose, placement, portalSelector, push, type]);

  useEffect(() => {
    if (!isVisible && activeIdRef.current) {
      dismiss(activeIdRef.current);
      activeIdRef.current = null;
    }
  }, [dismiss, isVisible]);

  return null;
}
