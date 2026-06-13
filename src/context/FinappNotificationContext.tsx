import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FinappNotificationType } from '../components/FinappNotification.types';
import type { FinappNotificationPlacement } from '../utils/finappNotificationPlacement';

export interface FinappNotificationItem {
  id: string;
  message: string;
  type: FinappNotificationType;
  duration: number;
  placement: FinappNotificationPlacement;
  portalSelector?: string;
  tag?: string;
}

export interface PushFinappNotificationOptions {
  type?: FinappNotificationType;
  duration?: number;
  placement?: FinappNotificationPlacement;
  portalSelector?: string;
  /** Replace an existing notification with the same tag. */
  tag?: string;
}

interface FinappNotificationContextValue {
  items: FinappNotificationItem[];
  push: (message: string, options?: PushFinappNotificationOptions) => string;
  dismiss: (id: string) => void;
  dismissByTag: (tag: string) => void;
  dismissAll: () => void;
}

const FinappNotificationContext = createContext<FinappNotificationContextValue | null>(null);

let notificationSeq = 0;

function nextNotificationId(): string {
  notificationSeq += 1;
  return `finapp-notification-${notificationSeq}`;
}

export function FinappNotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FinappNotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const dismissByTag = useCallback((tag: string) => {
    setItems((prev) => prev.filter((item) => item.tag !== tag));
  }, []);

  const dismissAll = useCallback(() => {
    setItems([]);
  }, []);

  const push = useCallback(
    (message: string, options?: PushFinappNotificationOptions): string => {
      const trimmed = message.trim();
      if (!trimmed) return '';

      const id = nextNotificationId();
      const item: FinappNotificationItem = {
        id,
        message: trimmed,
        type: options?.type ?? 'info',
        duration: options?.duration ?? 3500,
        placement: options?.placement ?? 'internal',
        portalSelector: options?.portalSelector,
        tag: options?.tag,
      };

      setItems((prev) => {
        const withoutTag = item.tag ? prev.filter((entry) => entry.tag !== item.tag) : prev;
        return [...withoutTag, item];
      });

      return id;
    },
    [],
  );

  const value = useMemo(
    () => ({ items, push, dismiss, dismissByTag, dismissAll }),
    [dismiss, dismissAll, dismissByTag, items, push],
  );

  return (
    <FinappNotificationContext.Provider value={value}>{children}</FinappNotificationContext.Provider>
  );
}

export function useFinappNotifications(): FinappNotificationContextValue {
  const ctx = useContext(FinappNotificationContext);
  if (!ctx) {
    throw new Error('useFinappNotifications must be used within FinappNotificationProvider');
  }
  return ctx;
}
