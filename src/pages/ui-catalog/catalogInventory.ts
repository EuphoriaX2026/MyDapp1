import type { CatalogTabId } from './types';

export type InventoryStatus = 'active' | 'partial' | 'removed' | 'missing';

export type InventoryItem = {
  name: string;
  detail?: string;
  source?: string;
  status: InventoryStatus;
  tab?: CatalogTabId;
  route?: string;
};

export const STATUS_META: Record<
  InventoryStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Have',
    className:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  },
  partial: {
    label: 'Partial',
    className: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/25',
  },
  removed: {
    label: 'Removed',
    className: 'bg-rose-500/15 text-rose-700 dark:text-rose-200 border-rose-500/25',
  },
  missing: {
    label: 'Missing',
    className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-300 border-zinc-500/25',
  },
};

export const THEME_INVENTORY: InventoryItem[] = [
  {
    name: 'Finapp light',
    detail: 'Body #ededf5 · content #ffffff · heading #27173e',
    source: 'finapp-app-theme.css',
    status: 'active',
    tab: 'buttons',
  },
  {
    name: 'Finapp dark',
    detail: 'Body #030108 · content #161129 · dark-mode class',
    source: 'finapp-app-theme.css · Settings toggle',
    status: 'active',
    tab: 'buttons',
  },
  {
    name: 'Landing light',
    detail: 'Canvas theme #F8F9FE — removed from catalog',
    status: 'removed',
  },
  {
    name: 'Landing dark',
    detail: 'Canvas theme #02071A — removed from catalog',
    status: 'removed',
  },
];

export const STYLESHEET_INVENTORY: InventoryItem[] = [
  { name: 'finapp-app-theme.css', detail: 'Global shell, CSS variables, dark mode', status: 'active', tab: 'buttons' },
  { name: 'app-typography.css', detail: 'Inter weights, profile card, RainbowKit', status: 'active', tab: 'typography' },
  { name: 'fonts.css', detail: 'Inter @font-face (6 weights)', status: 'active', tab: 'typography' },
  { name: 'tailwind.css', detail: 'glass-button, dapp-page, frosted-background', status: 'active' },
  { name: 'finapp-bank-cards.css', detail: 'E.ONE card-block, card-buy-btn', status: 'active', tab: 'cards' },
  { name: 'dashboard-page.css', detail: 'Scrollable transparent appHeader', status: 'partial', route: '/MyWallet' },
  { name: 'mywallet2-page.css', detail: 'MyWallet layout, balance, token rows', status: 'partial', route: '/MyWallet' },
  { name: 'send-money-page.css', detail: 'Send Money flow', status: 'partial', route: '/send-money' },
  { name: 'edex-page.css', detail: 'E-Dex DeFi header, swap UI', status: 'partial', route: '/EDex' },
  { name: 'settings-page.css', detail: 'Settings lists, profile section', status: 'partial', route: '/settings' },
  { name: 'activate-page.css', detail: 'Activate / checkout flow', status: 'partial', route: '/activate' },
  { name: 'wallet-flow-page.css', detail: 'Wallet flow shell headers', status: 'partial' },
  { name: 'eone-sidebar.css', detail: 'Sidebar menu, glass items', status: 'partial', tab: 'menus' },
  { name: 'cards.css', detail: 'Dashboard wallet-card overrides', status: 'partial', tab: 'cards' },
  { name: 'charts.css', detail: 'Apex chart containers', status: 'partial', tab: 'charts' },
  { name: 'my-plan.css', detail: 'MyPlan glass layout', status: 'partial', route: '/MyPlan' },
  { name: 'mobile-modals.css', detail: 'Mobile modal overrides', status: 'partial', tab: 'forms' },
  { name: 'mobile-wallet.css', detail: 'Legacy mobile wallet shell', status: 'missing' },
  { name: 'particles.css', detail: 'Particle animation overlay', status: 'missing' },
  { name: 'address-validation.css', detail: 'Address validation UI', status: 'missing' },
  { name: 'invisible-mobile-frame.css', detail: 'Desktop 28rem column clip', status: 'active' },
];

export const BUTTON_INVENTORY: InventoryItem[] = [
  { name: 'Connect Wallet', detail: 'Login / public landing CTA', status: 'active', tab: 'buttons' },
  { name: 'Learn more', detail: 'Login secondary CTA + arrow', status: 'active', tab: 'buttons' },
  { name: 'GlassButton variant="secondary"', status: 'active', tab: 'buttons' },
  { name: 'GlassButton variant="icon"', status: 'active', tab: 'buttons' },
  { name: 'GlassButton disabled', status: 'active', tab: 'buttons' },
  { name: 'GlassButton variant="primary"', detail: 'In code · not shown in catalog', status: 'partial' },
  { name: 'GlassButton variant="liquid-blue"', detail: 'In code · not shown in catalog', status: 'partial' },
  { name: 'Finapp .btn solid / outline / text', detail: 'Template kit · removed from catalog tab', status: 'removed' },
  { name: 'EDex defi header buttons', detail: 'Removed from catalog · live on EDex page', status: 'partial', route: '/EDex' },
  { name: 'MyWallet view-btn-glass / soft', detail: 'Removed from catalog · live on MyWallet', status: 'partial', route: '/MyWallet' },
  { name: 'Finapp .btn social (facebook, twitter…)', status: 'missing' },
  { name: 'RainbowKit Connect modal typography', detail: 'Inter 700/500/400 overrides', status: 'active', tab: 'typography' },
];

export const COMPONENT_INVENTORY: InventoryItem[] = [
  { name: 'Typography (Inter 6 weights)', status: 'active', tab: 'typography' },
  { name: 'Finapp badges & listviews', status: 'active', tab: 'badges' },
  { name: 'Wallet card + stat boxes', status: 'active', tab: 'cards' },
  { name: 'Bank card blocks (Finapp template)', status: 'active', tab: 'cards' },
  { name: 'E.ONE bank cards (.finapp-bank-cards)', status: 'active', tab: 'cards' },
  { name: 'Bootstrap cards', status: 'active', tab: 'cards' },
  { name: 'ApexCharts placeholders', status: 'partial', tab: 'charts' },
  { name: 'Sidebar + bottom menu + action sheets', status: 'active', tab: 'menus' },
  { name: 'Forms, dialogs, modals', status: 'active', tab: 'forms' },
  { name: 'Finalized proposal (Finapp dark atoms)', status: 'active', tab: 'finalized' },
  { name: 'ProfileCard (Dashboard)', detail: 'Frameless, read-only', status: 'partial', route: '/MyWallet' },
  { name: 'SendActionSheet', status: 'missing' },
  { name: 'RainbowKit wallet modal', status: 'partial' },
  { name: 'Store glass UI (Cart, Store)', status: 'missing', route: '/store' },
];

export const PAGE_INVENTORY: InventoryItem[] = [
  { name: 'MyWallet', route: '/MyWallet', status: 'partial', detail: 'Wallets · balance, actions, coins/NFTs tabs' },
  { name: 'Send Money', route: '/send-money', status: 'partial' },
  { name: 'E-Dex', route: '/EDex', status: 'partial' },
  { name: 'Settings', route: '/settings', status: 'active', detail: 'Avatar + username edit' },
  { name: 'Activate', route: '/activate', status: 'partial' },
  { name: 'Login / Register', route: '/login', status: 'partial', detail: 'Public shell · legacy landing colors on Login bg' },
  { name: 'MyPlan', route: '/MyPlan', status: 'partial' },
  { name: 'Store', route: '/store', status: 'missing' },
  { name: 'UI Test (this page)', route: '/ui-test', status: 'active' },
];

export function countByStatus(items: InventoryItem[]): Record<InventoryStatus, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { active: 0, partial: 0, removed: 0, missing: 0 } as Record<InventoryStatus, number>,
  );
}
