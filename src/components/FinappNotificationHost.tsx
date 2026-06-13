import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppIcon } from './icons/AppIcon';
import { useFinappNotifications, type FinappNotificationItem } from '../context/FinappNotificationContext';
import {
  resolveFinappNotificationPlacement,
  resolveFinappNotificationPortal,
} from '../utils/finappNotificationPlacement';

function stackKey(item: FinappNotificationItem): string {
  return `${item.placement}::${item.portalSelector ?? 'default'}`;
}

function FinappNotificationStackItem({
  item,
  onDismiss,
}: {
  item: FinappNotificationItem;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (item.duration <= 0) return undefined;

    const fadeTimer = window.setTimeout(() => {
      setExiting(true);
    }, item.duration);

    const removeTimer = window.setTimeout(() => {
      onDismiss(item.id);
    }, item.duration + 320);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [item.duration, item.id, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    window.setTimeout(() => onDismiss(item.id), 280);
  };

  return (
    <div
      className={`finapp-notification-box show${exiting ? ' finapp-notification-box--exit' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={`finapp-notification-glass finapp-notification-glass--${item.type}`}>
        <button
          type="button"
          className="finapp-notification-close"
          onClick={handleClose}
          aria-label="Dismiss notification"
        >
          <AppIcon icon="lucide:x" width={16} height={16} />
        </button>
        <p className="finapp-notification-message">{item.message}</p>
      </div>
    </div>
  );
}

function FinappNotificationStack({
  items,
  onDismiss,
}: {
  items: FinappNotificationItem[];
  onDismiss: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const placement = items[0]?.placement ?? 'internal';

  return (
    <div
      className={`finapp-notification-stack finapp-notification-stack--${placement}`}
      aria-label="Notifications"
    >
      {items.map((item) => (
        <FinappNotificationStackItem key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function FinappNotificationHost() {
  const { items, dismiss } = useFinappNotifications();

  const groups = useMemo(() => {
    const map = new Map<string, FinappNotificationItem[]>();
    for (const item of items) {
      const key = stackKey(item);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  if (typeof document === 'undefined' || groups.size === 0) return null;

  return (
    <>
      {[...groups.entries()].map(([key, groupItems]) => {
        const sample = groupItems[0];
        const placement = resolveFinappNotificationPlacement(sample.placement);
        const portalSelector = resolveFinappNotificationPortal(placement, sample.portalSelector);
        const portalRoot = document.querySelector(portalSelector);

        const stack = <FinappNotificationStack items={groupItems} onDismiss={dismiss} />;

        if (portalRoot) {
          return createPortal(<div key={key}>{stack}</div>, portalRoot);
        }

        return <div key={key}>{stack}</div>;
      })}
    </>
  );
}
