import {
  BUTTON_INVENTORY,
  COMPONENT_INVENTORY,
  countByStatus,
  PAGE_INVENTORY,
  STATUS_META,
  STYLESHEET_INVENTORY,
  THEME_INVENTORY,
  type InventoryItem,
  type InventoryStatus,
} from './catalogInventory';
import { CATALOG_TABS, type CatalogTabId } from './types';

function StatusBadge({ status }: { status: InventoryStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: InventoryStatus }) {
  const meta = STATUS_META[tone];
  return (
    <div className={`rounded-2xl border p-4 ${meta.className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function InventoryTable({
  title,
  subtitle,
  items,
  onNavigateToTab,
}: {
  title: string;
  subtitle?: string;
  items: InventoryItem[];
  onNavigateToTab?: (tab: CatalogTabId) => void;
}) {
  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-[var(--finapp-line,#dcdce9)] bg-[var(--finapp-content-bg,#ffffff)]">
      <div className="border-b border-[var(--finapp-line,#dcdce9)] px-4 py-3">
        <h2 className="text-base font-bold text-[var(--finapp-heading,#27173e)]">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-[var(--finapp-text-light,#a9abad)]">{subtitle}</p> : null}
      </div>
      <ul className="divide-y divide-[var(--finapp-line,#dcdce9)]">
        {items.map((item) => (
          <li key={item.name} className="flex flex-col gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--finapp-heading,#27173e)]">{item.name}</p>
              {item.detail ? (
                <p className="mt-0.5 text-xs text-[var(--finapp-text,#958d9e)]">{item.detail}</p>
              ) : null}
              {item.source ? (
                <p className="mt-1 font-mono text-[10px] text-[var(--finapp-primary,#6236ff)]">{item.source}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tab && onNavigateToTab ? (
                  <button
                    type="button"
                    onClick={() => onNavigateToTab(item.tab!)}
                    className="rounded-full bg-[var(--finapp-primary,#6236ff)]/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--finapp-primary,#6236ff)] hover:bg-[var(--finapp-primary,#6236ff)]/20"
                  >
                    View in {CATALOG_TABS.find((t) => t.id === item.tab)?.label ?? item.tab}
                  </button>
                ) : null}
                {item.route ? (
                  <a
                    href={`#${item.route}`}
                    className="rounded-full border border-[var(--finapp-line,#dcdce9)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--finapp-heading,#27173e)] hover:bg-[var(--finapp-line,#dcdce9)]/30"
                  >
                    Open {item.route}
                  </a>
                ) : null}
              </div>
            </div>
            <StatusBadge status={item.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewTab({ onNavigateToTab }: { onNavigateToTab: (tab: CatalogTabId) => void }) {
  const allItems = [
    ...THEME_INVENTORY,
    ...STYLESHEET_INVENTORY,
    ...BUTTON_INVENTORY,
    ...COMPONENT_INVENTORY,
    ...PAGE_INVENTORY,
  ];
  const totals = countByStatus(allItems);

  return (
    <div className="ui-test-overview">
      <div className="mb-8 rounded-2xl border border-[var(--finapp-primary,#6236ff)]/25 bg-[var(--finapp-primary,#6236ff)]/5 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--finapp-primary,#6236ff)]">
          Style inventory
        </p>
        <h2 className="mt-1 text-xl font-black text-[var(--finapp-heading,#27173e)]">
          What we have · what is partial · what is missing
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--finapp-text,#958d9e)]">
          Living map of the E.ONE / Finapp design system after removing Landing light &amp; dark canvas themes.
          Switch <strong>Finapp light / dark</strong> above to preview tokens. Use catalog tabs for live specimens.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3">
        <SummaryCard label="Have" value={totals.active} tone="active" />
        <SummaryCard label="Partial" value={totals.partial} tone="partial" />
        <SummaryCard label="Removed" value={totals.removed} tone="removed" />
        <SummaryCard label="Missing" value={totals.missing} tone="missing" />
      </div>

      <InventoryTable
        title="Themes"
        subtitle="Only Finapp light & dark are active in the catalog canvas."
        items={THEME_INVENTORY}
        onNavigateToTab={onNavigateToTab}
      />

      <InventoryTable
        title="Stylesheets (src/styles/)"
        subtitle="Active = documented or global · Partial = used in app, limited catalog preview · Missing = not wired to catalog"
        items={STYLESHEET_INVENTORY}
        onNavigateToTab={onNavigateToTab}
      />

      <InventoryTable
        title="Buttons"
        subtitle="Preserved specimens in Buttons & Colors tab · removed items listed explicitly"
        items={BUTTON_INVENTORY}
        onNavigateToTab={onNavigateToTab}
      />

      <InventoryTable
        title="Components & patterns"
        items={COMPONENT_INVENTORY}
        onNavigateToTab={onNavigateToTab}
      />

      <InventoryTable
        title="App pages"
        subtitle="Route coverage — partial means Finapp-themed but not fully catalogued"
        items={PAGE_INVENTORY}
        onNavigateToTab={onNavigateToTab}
      />

      <section className="rounded-2xl border border-dashed border-[var(--finapp-line,#dcdce9)] p-5">
        <h3 className="text-sm font-bold text-[var(--finapp-heading,#27173e)]">Catalog tabs quick map</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATALOG_TABS.filter((t) => t.id !== 'overview').map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigateToTab(tab.id)}
              className="rounded-full border border-[var(--finapp-line,#dcdce9)] px-3 py-1.5 text-xs font-bold text-[var(--finapp-heading,#27173e)] hover:bg-[var(--finapp-line,#dcdce9)]/30"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--finapp-text-light,#a9abad)]">
          Last updated: Finapp-only themes · preserved Connect Wallet, Learn more, GlassButton secondary/icon/disabled,
          E.ONE bank cards (<code className="font-mono">finapp-bank-cards.css</code>).
        </p>
      </section>
    </div>
  );
}
