import React from 'react';

export interface FinappPilledTab<T extends string = string> {
  id: T;
  label: string;
}

interface FinappPilledTabsProps<T extends string> {
  tabs: FinappPilledTab<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  /** Finapp `tab-content mt-1` spacing below the control */
  contentClassName?: string;
  children?: React.ReactNode;
}

/**
 * Finapp v2 "Pilled" tabs — mirrors component-tabs.html (nav-tabs capsuled).
 */
export function FinappPilledTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  contentClassName = 'tab-content mt-1',
  children,
}: FinappPilledTabsProps<T>) {
  return (
    <div className={`finapp-pilled-tabs ${className}`.trim()}>
      <ul className="nav nav-tabs capsuled" role="tablist">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      {children ? <div className={contentClassName}>{children}</div> : null}
    </div>
  );
}

export default FinappPilledTabs;
