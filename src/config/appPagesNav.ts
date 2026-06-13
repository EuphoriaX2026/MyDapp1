/** @deprecated Use `sidebarNav.ts` — kept for UI catalog page registry only. */
export type AppPageNavItem = {
  path: string;
  label: string;
};

export { SIDEBAR_NAV_FLAT as APP_PAGES_MENU } from './sidebarNav';
export type { SidebarPillarSubItem as AppPageNavItemLegacy } from './sidebarNav';
