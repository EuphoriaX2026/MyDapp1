import { Section, SpecimenLabel } from './CatalogPrimitives';

const INTER_WEIGHTS = [
  { className: 'font-thin', label: 'Thin', weight: '100', file: 'Inter-Thin-BETA.woff', role: 'Banners & hero marketing' },
  { className: 'font-normal', label: 'Regular / Normal', weight: '400', file: 'Inter-Regular.woff', role: 'Body copy' },
  { className: 'font-medium', label: 'Medium', weight: '500', file: 'Inter-Medium.woff', role: 'Labels, tabs, table headers' },
  { className: 'font-bold', label: 'Bold', weight: '700', file: 'Inter-Bold.woff', role: 'Card titles, action buttons' },
  { className: 'font-extrabold', label: 'Extra Bold', weight: '800', file: 'Inter-ExtraBold.woff', role: 'Wallet balances' },
  { className: 'font-black', label: 'Black', weight: '900', file: 'Inter-Black.woff', role: 'Swap amounts, h1.total' },
] as const;

const INTER_SAMPLE = 'Inter — single-font architecture';
const MONO_SAMPLE = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const NUM_SAMPLE = '$12,345.6789';

function WeightRow({
  weightClass,
  label,
  weight,
  file,
  role,
  sample,
}: {
  weightClass: string;
  label: string;
  weight: string;
  file: string;
  role: string;
  sample: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-black/5 py-4 last:border-0 dark:border-white/10">
      <SpecimenLabel label={label} detail={`weight ${weight} · ${file} · ${role}`} />
      <p className={`font-sans ${weightClass} text-base leading-snug `}>{sample}</p>
    </div>
  );
}

function TokenPill({ name, value }: { name: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/8 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <p className="font-mono text-[10px] uppercase tracking-wider opacity-50">{name}</p>
      <p className="mt-0.5 font-mono text-xs break-all">{value}</p>
    </div>
  );
}

export function TypographyTab() {
  return (
    <div className="ui-test-typography w-full max-w-none">
      <Section
        title="Typography architecture"
        subtitle="Strict single-font: Inter only (6 upright weights). No Satoshi. System mono for hashes."
        source="fonts.css · app-typography.css · tailwind.config.js"
      >
        <div className="grid gap-2">
          <TokenPill name="--app-font-family" value="Inter + system fallbacks" />
          <TokenPill name="--app-font-mono" value="ui-monospace stack" />
        </div>
        <div className="mt-4 grid gap-2">
          <TokenPill name="Tailwind font-sans" value="font-sans → Inter" />
          <TokenPill name="Tailwind font-mono" value="font-mono → system mono" />
          <TokenPill name="Global nums" value='font-feature-settings: "tnum"' />
          <TokenPill name="Weights on disk" value="100 · 400 · 500 · 700 · 800 · 900" />
        </div>
      </Section>

      <Section
        title="Inter — 6 weights (upright)"
        subtitle="Single-font architecture · Tailwind: font-sans"
        source="src/assets/fonts/inter/*.woff"
      >
        <div className="overflow-hidden rounded-2xl border border-black/8 bg-white px-4 dark:border-white/10 dark:bg-[#161129]/60">
          {INTER_WEIGHTS.map((row) => (
            <WeightRow
              key={row.weight}
              weightClass={row.className}
              label={row.label}
              weight={row.weight}
              file={row.file}
              role={row.role}
              sample={`${INTER_SAMPLE} — ${row.label}`}
            />
          ))}
        </div>
      </Section>

      <Section
        title="System monospace — crypto data"
        subtitle="Hashes & addresses — no local font files"
        source="font-mono · --app-font-mono"
      >
        <div className="space-y-4 rounded-2xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#161129]/60">
          <div>
            <SpecimenLabel label="font-mono regular" detail="wallet address" />
            <p className="font-mono text-sm break-all">{MONO_SAMPLE}</p>
          </div>
          <div>
            <SpecimenLabel label="font-mono font-medium" detail="tx hash" />
            <p className="font-mono text-sm font-medium break-all">
              0x9f2e8b1c4d7a6e3f0b5c8d2e1a4f7b9c0d3e6a8f1b4c7d0e3a6f9b2c5d8e1a
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Tabular numerals (financial alignment)"
        subtitle="Global tnum on body — Swap, Store, wallet balances"
        source="app-typography.css · tailwind.css @layer base"
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#161129]/60">
            <SpecimenLabel label="font-sans tabular-nums" detail="Inter + tnum" />
            <p className="font-sans text-2xl font-bold tabular-nums">{NUM_SAMPLE}</p>
            <p className="font-sans text-2xl font-bold tabular-nums">{NUM_SAMPLE.replace('12', '88')}</p>
            <p className="font-sans text-2xl font-bold tabular-nums">{NUM_SAMPLE.replace('12', '1')}</p>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#161129]/60">
            <SpecimenLabel label="without tabular-nums" detail="proportional (misaligned)" />
            <p className="font-sans text-2xl font-bold [font-variant-numeric:proportional-nums]">{NUM_SAMPLE}</p>
            <p className="font-sans text-2xl font-bold [font-variant-numeric:proportional-nums]">
              {NUM_SAMPLE.replace('12', '88')}
            </p>
            <p className="font-sans text-2xl font-bold [font-variant-numeric:proportional-nums]">
              {NUM_SAMPLE.replace('12', '1')}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Semantic HTML & Finapp classes"
        subtitle="All headings route to Inter via --app-font-family"
        source="app-typography.css h1–h6 · .pageTitle · .section-title"
      >
        <div className="space-y-4 rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-[#161129]/60">
          <div>
            <SpecimenLabel label="h1" detail="Inter Bold 700" />
            <h1 className="m-0 text-3xl font-bold">E.ONE Wallet Dashboard</h1>
          </div>
          <div>
            <SpecimenLabel label="h2" detail="Inter Bold 700" />
            <h2 className="m-0 text-2xl font-bold">Activate Package</h2>
          </div>
          <div>
            <SpecimenLabel label="h3" detail="Inter Medium 500" />
            <h3 className="m-0 text-xl font-medium">The 7 Realms</h3>
          </div>
          <div>
            <SpecimenLabel label=".pageTitle" detail="Finapp header — Inter" />
            <div className="pageTitle text-lg font-medium">Settings</div>
          </div>
          <div>
            <SpecimenLabel label=".section-title" detail="Finapp section — Inter" />
            <div className="section-title">Theme</div>
          </div>
          <div>
            <SpecimenLabel label=".listview-title" detail="Finapp list — Inter" />
            <div className="listview-title">Appearance</div>
          </div>
          <div>
            <SpecimenLabel label="body / p" detail="Inter Regular 400" />
            <p className="font-sans text-sm leading-relaxed opacity-80">
              Primary body copy uses Inter at 400 weight. Buttons, tabs, and list rows inherit Inter via Finapp
              shell overrides.
            </p>
          </div>
          <div>
            <SpecimenLabel label="h1.total (900 hero rule)" detail="Swap · massive amounts" />
            <h1 className="total m-0 text-[32px]">{NUM_SAMPLE}</h1>
          </div>
          <div>
            <SpecimenLabel label=".wallet-card .balance .total (800 rule)" detail="Standard wallet balance" />
            <div className="wallet-card rounded-2xl border border-black/10 p-4">
              <div className="balance">
                <span className="title text-sm font-medium uppercase tracking-wider text-gray-500">Balance</span>
                <p className="total m-0 text-[32px]">{NUM_SAMPLE}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Tailwind utility combinations"
        subtitle="Common patterns used across the DApp"
        source="components · pages"
      >
        <div className="space-y-3 rounded-2xl border border-black/8 bg-white p-4 dark:border-white/10 dark:bg-[#161129]/60">
          {[
            { cls: 'font-sans text-sm font-normal', label: 'font-sans · sm · normal', text: 'Body copy · descriptions' },
            { cls: 'font-sans text-xs font-medium uppercase tracking-wider text-gray-500', label: 'label / tab', text: 'Network · Claim · Coins tab' },
            { cls: 'font-sans text-sm font-bold', label: 'font-sans · sm · bold', text: 'Action button label' },
            { cls: 'font-sans text-6xl font-thin tracking-tighter uppercase', label: 'banner · thin · 100', text: 'Store hero title' },
            { cls: 'font-sans text-[32px] font-extrabold tabular-nums tracking-tight', label: 'wallet balance · 800', text: NUM_SAMPLE },
            { cls: 'font-sans text-[32px] font-black tabular-nums leading-none', label: 'swap amount · 900', text: NUM_SAMPLE },
            { cls: 'font-mono text-xs tracking-[0.2em]', label: 'font-mono · card digits', text: '**** **** **** 4F2A' },
          ].map((row) => (
            <div key={row.label} className="border-b border-black/5 py-3 last:border-0 dark:border-white/10">
              <SpecimenLabel label={row.label} detail={row.cls} />
              <p className={row.cls}>{row.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Italic policy" subtitle="Architecture rule — upright only">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-sans font-medium">
            No italic{' '}
            <span className="line-through opacity-50">@font-face</span> files are loaded.{' '}
            <code className="font-mono text-xs">font-synthesis: none</code> prevents browser faux-oblique. Use{' '}
            <strong className="font-bold">font-bold</strong> or{' '}
            <strong className="font-black">font-black</strong> for emphasis instead of{' '}
            <span className="opacity-60">italic</span>.
          </p>
        </div>
      </Section>
    </div>
  );
}
