import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppIcon } from './icons/AppIcon';
import { useAccount } from 'wagmi';
import { useDisconnectWallet } from '../hooks/useDisconnectWallet';
import { useProfile } from '../context/ProfileContext';
import { useTotalBalance } from '../hooks/useTotalBalance';
import { formatFinancialNumber } from '../utils/formatNumber';
import {
  SIDEBAR_ACCORDION_SECTIONS,
  type SidebarAccordionSection,
  type SidebarNavSubItem,
} from '../config/sidebarNav';
import {
  isActivateNavActive,
  isExactNavPath,
  isNavSectionActive,
  isTransactionsNavActive,
} from '../utils/appNavMatching';
import { useReleaseLocksOnSidebarOpen } from './WalletModalLockRelease';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'default' | 'myPlan';
}

const truncateAddress = (address: string) => {
  if (!address) return null;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

function resolveNavTarget(path: string): { pathname: string; search?: string } {
  const qIndex = path.indexOf('?');
  if (qIndex === -1) return { pathname: path };
  return { pathname: path.slice(0, qIndex), search: path.slice(qIndex) };
}

function isSidebarItemActive(pathname: string, search: string, targetPath: string): boolean {
  const target = resolveNavTarget(targetPath);

  if (isExactNavPath(target.pathname, '/transactions')) {
    if (!isTransactionsNavActive(pathname)) return false;
    const tab = new URLSearchParams(target.search ?? '').get('tab');
    if (!tab) return !search || search === '';
    return new URLSearchParams(search).get('tab') === tab;
  }

  if (isExactNavPath(target.pathname, '/activate') || isExactNavPath(target.pathname, '/Activate')) {
    return isActivateNavActive(pathname);
  }

  if (target.search) {
    return pathname === target.pathname && search === target.search;
  }

  if (isExactNavPath(target.pathname, '/')) {
    return pathname === '/';
  }

  return isNavSectionActive(pathname, target.pathname);
}

function sectionContainsActiveRoute(
  section: SidebarAccordionSection,
  pathname: string,
  search: string,
): boolean {
  return section.subItems.some((item) => isSidebarItemActive(pathname, search, item.path));
}

function buildInitialExpandedState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  SIDEBAR_ACCORDION_SECTIONS.forEach((section) => {
    state[section.title] = false;
  });
  return state;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, variant = 'default' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { disconnectWallet } = useDisconnectWallet();
  const { username } = useProfile();
  const { totalValueFormatted, isConnected } = useTotalBalance();
  const truncatedAddress = truncateAddress(address || '');

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    buildInitialExpandedState,
  );

  useReleaseLocksOnSidebarOpen(isOpen);

  useEffect(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      SIDEBAR_ACCORDION_SECTIONS.forEach((section) => {
        if (sectionContainsActiveRoute(section, location.pathname, location.search)) {
          next[section.title] = true;
        }
      });
      return next;
    });
  }, [location.pathname, location.search]);

  const handleLogout = useCallback(() => {
    onClose();
    void (async () => {
      await disconnectWallet();
      navigate('/login', { replace: true });
    })();
  }, [disconnectWallet, navigate, onClose]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const menuItemClass = (isActive: boolean, extra = '') =>
    `menu-item ${isActive ? 'active' : 'inactive'}${extra ? ` ${extra}` : ''}`;

  const displayBalance = isConnected ? totalValueFormatted : formatFinancialNumber(0);

  const renderSubItem = useCallback(
    (item: SidebarNavSubItem, sectionTitle: string) => {
      const itemKey = `${sectionTitle}-${item.label}`;

      if (item.isLogout) {
        return (
          <button
            key={itemKey}
            type="button"
            className={menuItemClass(false, 'logout w-full border-0 bg-transparent text-start')}
            onClick={handleLogout}
          >
            {item.icon ? (
              <AppIcon icon={item.icon} className="menu-icon menu-icon--lucide" />
            ) : null}
            <span className="menu-text">{item.label}</span>
          </button>
        );
      }

      if (item.path === '#') {
        return (
          <a
            key={itemKey}
            href="#"
            className={menuItemClass(false)}
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            {item.icon ? (
              <AppIcon icon={item.icon} className="menu-icon menu-icon--lucide" />
            ) : null}
            <span className="menu-text">{item.label}</span>
          </a>
        );
      }

      const isActive = isSidebarItemActive(location.pathname, location.search, item.path);
      const target = resolveNavTarget(item.path);

      return (
        <Link
          key={itemKey}
          to={target}
          className={menuItemClass(isActive)}
          onClick={onClose}
        >
          {item.icon ? (
            <AppIcon icon={item.icon} className="menu-icon menu-icon--lucide" />
          ) : null}
          <span className="menu-text">{item.label}</span>
        </Link>
      );
    },
    [handleLogout, location.pathname, location.search, onClose],
  );

  const renderAccordionSection = (section: SidebarAccordionSection) => {
    const isExpanded = expandedSections[section.title] ?? false;
    const sectionActive = sectionContainsActiveRoute(
      section,
      location.pathname,
      location.search,
    );

    return (
      <div
        key={section.title}
        className={`sidebar-nav-section${sectionActive ? ' sidebar-nav-section--active' : ''}${
          isExpanded ? ' sidebar-nav-section--expanded' : ''
        }`}
      >
        <button
          type="button"
          className="sidebar-section-toggle"
          aria-expanded={isExpanded}
          onClick={() => toggleSection(section.title)}
        >
          <span className="sidebar-section-toggle__leading">
            <AppIcon icon={section.icon} className="sidebar-section-toggle__icon" />
            <span className="menu-label sidebar-section-toggle__label">{section.title}</span>
          </span>
          <AppIcon
            icon="lucide:chevron-down"
            className={`sidebar-section-chevron${isExpanded ? ' sidebar-section-chevron--open' : ''}`}
          />
        </button>

        <div
          className={`sidebar-section-items${isExpanded ? ' sidebar-section-items--expanded' : ''}`}
          aria-hidden={!isExpanded}
        >
          <div className="sidebar-section-items__inner">
            {section.subItems.map((item) => renderSubItem(item, section.title))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`sidebar-overlay${isOpen ? ' sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <div className="sidebar-shell" aria-hidden={!isOpen}>
        <div
          className={`sidebar-container${variant === 'myPlan' ? ' my-plan-sidebar' : ''}${
            isOpen ? ' sidebar-container--open' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          role="navigation"
          aria-label="Main menu"
          aria-hidden={!isOpen}
        >
          <div className="sidebar-hero">
            <div className="profile-info">
              <div className="avatar-placeholder">
                <span>{username ? username.charAt(0).toUpperCase() : 'T'}</span>
              </div>
              <div className="user-meta">
                <h3 className="profile-username">{username || 'User'}</h3>
                <div className="wallet-chip">
                  <span>{truncatedAddress || 'Not Connected'}</span>
                  <AppIcon icon="lucide:copy" className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="sidebar-balance-section">
              <p>Total Balance</p>
              <h2>$ {displayBalance}</h2>
            </div>

            <div className="glass-action-group">
              <button type="button" className="glass-action-btn" aria-disabled="true">
                <div className="glass-icon-box">
                  <AppIcon icon="lucide:plus" />
                </div>
                <span>Stats</span>
              </button>
              <Link to="/receive" className="glass-action-btn" onClick={onClose}>
                <div className="glass-icon-box">
                  <AppIcon icon="lucide:arrow-down" />
                </div>
                <span>Receive</span>
              </Link>
              <Link to="/Activate" className="glass-action-btn" onClick={onClose}>
                <div className="glass-icon-box">
                  <AppIcon icon="lucide:rocket" />
                </div>
                <span>Activate</span>
              </Link>
              <button
                type="button"
                className="glass-action-btn"
                data-bs-toggle="modal"
                data-bs-target="#sendActionSheet"
                onClick={onClose}
              >
                <div className="glass-icon-box">
                  <AppIcon icon="lucide:arrow-right" />
                </div>
                <span>Send</span>
              </button>
            </div>
          </div>

          <div className="sidebar-menu-list">
            <div className="sidebar-menu-scroll">
              {SIDEBAR_ACCORDION_SECTIONS.map((section) => renderAccordionSection(section))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
