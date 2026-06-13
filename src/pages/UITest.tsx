import { useState } from 'react';
import '../styles/finapp-app-theme.css';
import '../styles/app-typography.css';
import '../styles/finapp-bank-cards.css';
import '../styles/edex-page.css';
import '../styles/activate-page.css';
import '../styles/eone-sidebar.css';
import {
  OverviewTab,
  TypographyTab,
  BadgesListsTab,
  ButtonsColorsTab,
  CATALOG_TABS,
  canvasClasses,
  canvasStyle,
  FinappCardsTab,
  FinappChartsTab,
  FinappFormsModalsTab,
  FinalizedProposalTab,
  FinappMenusTab,
  type CanvasMode,
  type CatalogTabId,
} from './ui-catalog';

const CANVAS_OPTIONS: { mode: CanvasMode; label: string }[] = [
  { mode: 'finapp-light', label: 'Finapp light' },
  { mode: 'finapp-dark', label: 'Finapp dark' },
];

function TabPanel({
  tab,
  canvasMode,
  onNavigateToTab,
}: {
  tab: CatalogTabId;
  canvasMode: CanvasMode;
  onNavigateToTab: (tab: CatalogTabId) => void;
}) {
  switch (tab) {
    case 'overview':
      return <OverviewTab onNavigateToTab={onNavigateToTab} />;
    case 'typography':
      return <TypographyTab />;
    case 'buttons':
      return <ButtonsColorsTab canvasMode={canvasMode} />;
    case 'badges':
      return <BadgesListsTab />;
    case 'cards':
      return <FinappCardsTab />;
    case 'charts':
      return <FinappChartsTab />;
    case 'menus':
      return <FinappMenusTab />;
    case 'forms':
      return <FinappFormsModalsTab />;
    case 'finalized':
      return <FinalizedProposalTab />;
    default:
      return null;
  }
}

/**
 * Design System Storybook — temporary catalog at #/ui-test.
 * Finapp HTML sources: ThemeForest Finapp v2-2-2/HTML (component-*.html, app-*.html, index.html).
 */
export default function UITest() {
  const [activeTab, setActiveTab] = useState<CatalogTabId>('overview');
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('finapp-light');

  return (
    <div
      className={`min-h-[100dvh] transition-colors duration-300 ${canvasClasses(canvasMode)}`}
      style={canvasStyle(canvasMode)}
    >
      <header className="sticky top-0 z-[100] border-b border-[var(--finapp-line,#dcdce9)] bg-[var(--finapp-content-bg,#ffffff)]/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--finapp-primary,#6236ff)]">
                Design System
              </p>
              <h1 className="text-xl font-black tracking-tight text-[var(--finapp-heading,#27173e)]">
                UI Component Catalog
              </h1>
              <p className="text-xs text-[var(--finapp-text-light,#a9abad)]">Finapp v2 template + E.ONE · #/ui-test</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-full text-[10px] font-medium text-[var(--finapp-text-light,#a9abad)]">
                Canvas:
              </span>
              {CANVAS_OPTIONS.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCanvasMode(mode)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    canvasMode === mode
                      ? 'bg-[var(--finapp-primary,#6236ff)] text-white'
                      : 'bg-[var(--finapp-line,#dcdce9)]/40 text-[var(--finapp-heading,#27173e)] hover:bg-[var(--finapp-line,#dcdce9)]/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <nav
            className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Catalog sections"
          >
            {CATALOG_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--finapp-heading,#27173e)] text-[var(--finapp-content-bg,#ffffff)]'
                    : 'bg-[var(--finapp-line,#dcdce9)]/40 text-[var(--finapp-text,#958d9e)] hover:bg-[var(--finapp-line,#dcdce9)]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28">
        <TabPanel tab={activeTab} canvasMode={canvasMode} onNavigateToTab={setActiveTab} />
        <p className="mt-8 text-center text-[10px] opacity-40">
          Sources: Finapp v2 HTML kit + project components. Remove route before production.
        </p>
      </main>
    </div>
  );
}
