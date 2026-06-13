import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppIcon } from './icons/AppIcon';

type DevNavRoute = {
  label: string;
  path: string;
  group?: string;
};

const DEV_NAV_ROUTES: DevNavRoute[] = [
  { label: 'Dashboard', path: '/', group: 'Core' },
  { label: 'My Wallet', path: '/MyWallet', group: 'Core' },
  { label: 'Receive', path: '/receive', group: 'Wallet' },
  { label: 'Send Money', path: '/send-money', group: 'Wallet' },
  { label: 'EDex', path: '/edex', group: 'Wallet' },
  { label: 'Cards', path: '/cards', group: 'Wallet' },
  { label: 'Transactions', path: '/transactions', group: 'Wallet' },
  { label: 'Live Economy', path: '/business/live-economy', group: 'Business' },
  { label: 'Activate', path: '/Activate', group: 'Business' },
  { label: 'Activate Execution', path: '/activate/execution', group: 'Business' },
  { label: 'Genealogy', path: '/genealogy', group: 'Business' },
  { label: 'Ranks & Stars', path: '/business/stars', group: 'Business' },
  { label: 'Reports Stars', path: '/business/checking-credit', group: 'Business' },
  { label: 'Store', path: '/store', group: 'Store' },
  { label: 'Cart', path: '/cart', group: 'Store' },
  { label: 'Checking', path: '/checking', group: 'Store' },
  { label: 'NFT Details', path: '/nft-details', group: 'Store' },
  { label: 'Settings', path: '/settings', group: 'System' },
  { label: 'UI Test', path: '/ui-test', group: 'Dev' },
  { label: 'Login', path: '/login', group: 'Public' },
  { label: 'Register', path: '/register', group: 'Public' },
  { label: 'Public EDex', path: '/public-edex', group: 'Public' },
];

const GROUP_ORDER = ['Core', 'Wallet', 'Business', 'Store', 'System', 'Dev', 'Public'];

function groupRoutes(routes: DevNavRoute[]) {
  const grouped = new Map<string, DevNavRoute[]>();
  routes.forEach((route) => {
    const group = route.group ?? 'Other';
    const items = grouped.get(group) ?? [];
    items.push(route);
    grouped.set(group, items);
  });
  return GROUP_ORDER.filter((group) => grouped.has(group)).map((group) => ({
    group,
    routes: grouped.get(group)!,
  }));
}

export function DevNavigator() {
  if (!import.meta.env.DEV) return null;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const sections = groupRoutes(DEV_NAV_ROUTES);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-4 left-4 z-[9999] font-sans text-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Developer route navigator"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/90 shadow-lg backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
      >
        <AppIcon icon="lucide:compass" className="h-5 w-5" />
      </button>

      {open && (
        <nav
          aria-label="Developer routes"
          className="absolute bottom-14 left-0 max-h-[min(70vh,28rem)] w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#121218]/95 p-2 shadow-2xl backdrop-blur-md"
        >
          <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
            Dev Navigator
          </p>
          {sections.map(({ group, routes }) => (
            <div key={group} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-300/70">
                {group}
              </p>
              <ul className="space-y-0.5">
                {routes.map((route) => {
                  const isActive =
                    location.pathname === route.path ||
                    (route.path !== '/' && location.pathname.startsWith(`${route.path}/`));

                  return (
                    <li key={route.path}>
                      <Link
                        to={route.path}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-2 py-1.5 text-xs transition ${
                          isActive
                            ? 'bg-violet-600/35 font-medium text-white'
                            : 'text-white/75 hover:bg-white/8 hover:text-white'
                        }`}
                      >
                        {route.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}

export default DevNavigator;
