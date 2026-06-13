export type CanvasMode = 'finapp-light' | 'finapp-dark';

export const CATALOG_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons & Colors' },
  { id: 'badges', label: 'Badges & Lists' },
  { id: 'cards', label: 'Cards' },
  { id: 'charts', label: 'Charts' },
  { id: 'menus', label: 'Menus & Sidebars' },
  { id: 'forms', label: 'Forms & Modals' },
  { id: 'finalized', label: 'Finalized Proposal' },
] as const;

export type CatalogTabId = (typeof CATALOG_TABS)[number]['id'];
