import { Link, useLocation } from 'react-router-dom';
import { AppIcon } from './icons/AppIcon';
import { EdexSwapIcon } from './icons/EdexSwapIcon';
import { HomeNavIcon } from './icons/HomeNavIcon';
import { NetworkNavIcon } from './icons/NetworkNavIcon';
import { StoreNavIcon } from './icons/StoreNavIcon';
import { BUSINESS_GENEALOGY_PATH } from '../config/businessHubRoutes';
import { normalizePathname, shouldShowMobileBottomNav } from '../utils/appRoutes';
import '../styles/bottom-menu.css';

type NavItem = {
  path: string;
  label: string;
  icon: string;
  activeIcon?: string;
  isActive: (path: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    path: '/store',
    label: 'Store',
    icon: 'lucide:shopping-bag',
    isActive: (path) =>
      path === '/store' ||
      path.startsWith('/store/') ||
      path === '/cart' ||
      path.startsWith('/product'),
  },
  {
    path: '/edex',
    label: 'EDex',
    icon: 'lucide:arrow-down-up',
    isActive: (path) => path === '/edex' || path.startsWith('/edex/'),
  },
  {
    path: '/',
    label: 'Home',
    icon: 'lucide:home',
    isActive: (path) => path === '/' || path === '/dashboard',
  },
  {
    path: BUSINESS_GENEALOGY_PATH,
    label: 'Network',
    icon: 'lucide:git-branch',
    isActive: (path) =>
      path === BUSINESS_GENEALOGY_PATH || path.startsWith(`${BUSINESS_GENEALOGY_PATH}/`),
  },
  {
    path: '/MyWallet',
    label: 'Wallet',
    icon: 'si:wallet-detailed-line',
    activeIcon: 'si:wallet-detailed-fill',
    isActive: (path) => path === '/mywallet' || path === '/wallet',
  },
];

export const BottomMenu = () => {
  const location = useLocation();
  const path = normalizePathname(location.pathname);

  if (!shouldShowMobileBottomNav(location.pathname)) {
    return null;
  }

  return (
    <nav className="appBottomMenu eone-app-bottom-menu" aria-label="Main navigation">
      {NAV_ITEMS.map(({ path: to, label, icon, activeIcon, isActive }) => {
        const active = isActive(path);
        const resolvedIcon = active && activeIcon ? activeIcon : icon;
        return (
          <Link
            key={to}
            to={to}
            className={`item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <div className="col">
              <span className="eone-bottom-nav-icon-slot" aria-hidden>
                {to === '/store' ? (
                  <StoreNavIcon className="eone-bottom-nav-icon" active={active} />
                ) : to === '/edex' ? (
                  <EdexSwapIcon className="eone-bottom-nav-icon" />
                ) : to === '/' ? (
                  <HomeNavIcon className="eone-bottom-nav-icon" active={active} />
                ) : to === BUSINESS_GENEALOGY_PATH ? (
                  <NetworkNavIcon className="eone-bottom-nav-icon" active={active} />
                ) : (
                  <AppIcon icon={resolvedIcon} className="eone-bottom-nav-icon" />
                )}
              </span>
              <strong>{label}</strong>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomMenu;
