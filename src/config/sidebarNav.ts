/** 4-Pillar sidebar navigation + Other accordion section. */

export type SidebarNavSubItem = {
  label: string;
  path: string;
  icon?: string;
  isLogout?: boolean;
};

export type SidebarAccordionSection = {
  title: string;
  icon: string;
  subItems: SidebarNavSubItem[];
};

export const SIDEBAR_PILLAR_SECTIONS: SidebarAccordionSection[] = [
  {
    title: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    subItems: [
      { label: 'Overview', path: '/' },
      { label: 'My Cards', path: '/cards' },
      { label: 'Transactions', path: '/transactions' },
    ],
  },
  {
    title: 'My Wallet',
    icon: 'lucide:wallet',
    subItems: [
      { label: 'Assets & Balances', path: '/MyWallet' },
      { label: 'Send Money', path: '/send-money' },
      { label: 'Receive', path: '/receive' },
      { label: 'EDex (Exchange)', path: '/edex' },
    ],
  },
  {
    title: 'Business Hub',
    icon: 'lucide:briefcase',
    subItems: [
      { label: 'Activate Realms', path: '/activate' },
      { label: 'Genealogy', path: '/genealogy' },
      { label: 'Ranks & Stars', path: '/business/stars' },
      { label: 'Reports Stars', path: '/business/checking-credit' },
      { label: 'Live Economy', path: '/business/live-economy' },
      { label: 'Commissions & Withdraw', path: '/business/commissions' },
    ],
  },
  {
    title: 'The Store',
    icon: 'lucide:shopping-bag',
    subItems: [
      { label: 'Buy Packages', path: '/store' },
      { label: 'Turbo Boosters', path: '/turbo' },
      { label: 'My Artifacts', path: '/nft-details' },
    ],
  },
  {
    title: 'Other',
    icon: 'lucide:ellipsis',
    subItems: [
      { label: 'Settings', path: '/settings', icon: 'lucide:settings' },
      { label: 'Support', path: '#', icon: 'lucide:help-circle' },
      { label: 'Log out', path: '#', icon: 'lucide:log-out', isLogout: true },
    ],
  },
];

/** @deprecated Use SIDEBAR_PILLAR_SECTIONS — kept for flat registry compatibility */
export const SIDEBAR_SYSTEM_SECTION = SIDEBAR_PILLAR_SECTIONS.find(
  (section) => section.title === 'Other',
)!.subItems;

export const SIDEBAR_ACCORDION_SECTIONS = SIDEBAR_PILLAR_SECTIONS;

/** Flat routable list for UI catalog / dev registry */
export const SIDEBAR_NAV_FLAT = SIDEBAR_PILLAR_SECTIONS.flatMap((section) =>
  section.subItems.filter((item) => item.path !== '#' && !item.isLogout),
);

export type SidebarPillarSubItem = SidebarNavSubItem;
export type SidebarPillarSection = SidebarAccordionSection;
export type SidebarSystemItem = SidebarNavSubItem;
