import { AppIcon } from '../../components/icons/AppIcon';
import type { ReactNode } from 'react';
import { AvatarPlaceholder } from './CatalogPrimitives';

export const BOTTOM_NAV_INLINE = { position: 'relative' as const, zIndex: 0, paddingBottom: 0 };

export function ClearInputIcon() {
  return (
    <i className="clear-input">
      <AppIcon icon="lucide:x" className="h-5 w-5 opacity-40" aria-hidden />
    </i>
  );
}

export function CatalogTriggerList({ items }: { items: { label: string; onClick: () => void }[] }) {
  return (
    <ul className="listview flush transparent image-listview text">
      {items.map((item) => (
        <li key={item.label}>
          <button
            type="button"
            className="item w-full border-0 bg-transparent text-start"
            onClick={item.onClick}
          >
            <div className="in">
              <div>{item.label}</div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ActionButtonList({
  actions,
  onClose,
  showCancel = true,
}: {
  actions: { label: string; icon?: ReactNode; danger?: boolean }[];
  onClose: () => void;
  showCancel?: boolean;
}) {
  return (
    <ul className="action-button-list">
      {actions.map((action) => (
        <li key={action.label}>
          <button
            type="button"
            className={`btn btn-list w-full text-start${action.danger ? ' text-danger' : ''}`}
            onClick={onClose}
          >
            <span className="inline-flex items-center gap-2">
              {action.icon}
              {action.label}
            </span>
          </button>
        </li>
      ))}
      {showCancel ? (
        <>
          <li className="action-divider" />
          <li>
            <button type="button" className="btn btn-list text-danger w-full" onClick={onClose}>
              <span className="inline-flex items-center gap-2">
                <AppIcon icon="lucide:x" className="h-5 w-5" />
                Cancel
              </span>
            </button>
          </li>
        </>
      ) : null}
    </ul>
  );
}

type BottomNavItem = {
  label?: string;
  icon: string;
  active?: boolean;
  badge?: string;
  badgeClass?: string;
  centerAction?: boolean;
  largeAction?: boolean;
};

export function BottomMenuPreview({
  className = '',
  items,
}: {
  className?: string;
  items: BottomNavItem[];
}) {
  return (
    <div className={`appBottomMenu ${className}`.trim()} style={BOTTOM_NAV_INLINE}>
      {items.map((item, i) => (
        <a
          key={i}
          href="#catalog"
          className={`item${item.active ? ' active' : ''}`}
          onClick={(e) => e.preventDefault()}
        >
          <div className="col">
            {item.centerAction ? (
              <div className={`action-button${item.largeAction ? ' large' : ''}`}>
                <AppIcon icon={item.icon} className="h-6 w-6" strokeWidth={1.75} />
              </div>
            ) : (
              <>
                <AppIcon icon={item.icon} className="mx-auto mb-0.5 h-6 w-6" strokeWidth={1.75} />
                {item.label ? <strong>{item.label}</strong> : null}
                {item.badge ? <span className={`badge ${item.badgeClass ?? 'badge-primary'}`}>{item.badge}</span> : null}
              </>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

export function FinappSidebarBody({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-body p-0">
      <div className="profileBox pt-2 pb-2">
        <div className="image-wrapper">
          <AvatarPlaceholder label="SD" />
        </div>
        <div className="in">
          <strong>Sebastian Doe</strong>
          <div className="text-muted">4029209</div>
        </div>
        <button type="button" className="btn btn-link btn-icon sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <AppIcon icon="lucide:x" className="h-6 w-6" />
        </button>
      </div>

      <div className="sidebar-balance">
        <div className="listview-title">Balance</div>
        <div className="in">
          <h1 className="amount">$ 2,562.50</h1>
        </div>
      </div>

      <div className="action-group">
        {[
          { icon: 'lucide:plus', label: 'Deposit' },
          { icon: 'lucide:arrow-down', label: 'Withdraw' },
          { icon: 'lucide:arrow-right', label: 'Send' },
          { icon: 'lucide:credit-card', label: 'My Cards' },
        ].map(({ icon, label }) => (
          <a key={label} href="#catalog" className="action-button" onClick={(e) => e.preventDefault()}>
            <div className="in">
              <div className="iconbox">
                <AppIcon icon={icon} className="h-5 w-5" />
              </div>
              {label}
            </div>
          </a>
        ))}
      </div>

      <div className="listview-title mt-1">Menu</div>
      <ul className="listview flush transparent no-line image-listview">
        {[
          { icon: 'lucide:chart-pie', label: 'Overview', badge: '10' },
          { icon: 'lucide:file-text', label: 'Pages' },
          { icon: 'lucide:layout-grid', label: 'Components' },
          { icon: 'lucide:credit-card', label: 'My Cards' },
        ].map(({ icon, label, badge }) => (
          <li key={label}>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              <div className="icon-box bg-primary">
                <AppIcon icon={icon} className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <div className="in">
                {label}
                {badge ? <span className="badge badge-primary">{badge}</span> : null}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <div className="listview-title mt-1">Others</div>
      <ul className="listview flush transparent no-line image-listview">
        <li>
          <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
            <div className="icon-box bg-primary">
              <AppIcon icon="lucide:settings" className="h-5 w-5 text-white" />
            </div>
            <div className="in">Settings</div>
          </a>
        </li>
        <li>
          <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
            <div className="icon-box bg-primary">
              <AppIcon icon="lucide:message-circle" className="h-5 w-5 text-white" />
            </div>
            <div className="in">Support</div>
          </a>
        </li>
        <li>
          <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
            <div className="icon-box bg-primary">
              <AppIcon icon="lucide:log-out" className="h-5 w-5 text-white" />
            </div>
            <div className="in">Log out</div>
          </a>
        </li>
      </ul>

      <div className="listview-title mt-1">Send Money</div>
      <ul className="listview image-listview flush transparent no-line">
        {[
          { label: 'Artem Sazonov', tone: 'blue' as const },
          { label: 'Sophie Asveld', tone: 'rose' as const },
          { label: 'Kobus van de Vegte', tone: 'violet' as const },
        ].map((person) => (
          <li key={person.label}>
            <a href="#catalog" className="item" onClick={(e) => e.preventDefault()}>
              <AvatarPlaceholder label={person.label} tone={person.tone} />
              <div className="in">
                <div>{person.label}</div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Deposit form used in action sheets & dialogs */
export function DepositFormFields({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="form-group basic">
        <div className="input-wrapper">
          <label className="label" htmlFor="catalog-deposit-account">
            From
          </label>
          <select className="form-control custom-select" id="catalog-deposit-account" defaultValue="0">
            <option value="0">Savings (*** 5019)</option>
            <option value="1">Investment (*** 6212)</option>
            <option value="2">Mortgage (*** 5021)</option>
          </select>
        </div>
        <div className="input-info">Select a bank account</div>
      </div>
      <div className="form-group basic">
        <label className="label">Enter Amount</label>
        <div className="input-group mb-2">
          <span className="input-group-text">$</span>
          <input type="text" className="form-control" defaultValue="100" placeholder="Enter an amount" />
        </div>
        <div className="input-info">Minimum $50</div>
      </div>
      <div className="form-group basic">
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onSubmit}>
          Deposit
        </button>
      </div>
    </form>
  );
}

export function AlertActionSheetContent({
  tone,
  title,
  message,
  icon,
  onDone,
}: {
  tone: 'primary' | 'success' | 'danger';
  title: string;
  message: string;
  icon: ReactNode;
  onDone: () => void;
}) {
  return (
    <div className="action-sheet-content">
      <div className={`iconbox text-${tone}`}>{icon}</div>
      <div className="text-center p-2">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onDone}>
        Done
      </button>
    </div>
  );
}

export const ACTION_SHEET_MENU_ICONS = {
  send: <AppIcon icon="lucide:arrow-right" className="h-5 w-5" />,
  withdraw: <AppIcon icon="lucide:credit-card" className="h-5 w-5" />,
  exchange: <AppIcon icon="lucide:banknote" className="h-5 w-5" />,
  deposit: <AppIcon icon="lucide:wallet" className="h-5 w-5" />,
  fingerprint: <AppIcon icon="lucide:fingerprint" className="h-5 w-5" />,
  activity: <AppIcon icon="lucide:activity" className="h-5 w-5" />,
};
