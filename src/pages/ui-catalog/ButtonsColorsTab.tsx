import { AppIcon } from '../../components/icons/AppIcon';
import { GlassButton } from '../../components/ui/glass';
import { FINAPP_DARK_VARS, FINAPP_LIGHT_VARS, GLASS_VARIANTS } from './catalogConstants';
import { Section, SpecimenLabel } from './CatalogPrimitives';
import type { CanvasMode } from './types';

export function ButtonsColorsTab({ canvasMode }: { canvasMode: CanvasMode }) {
  const finappVars = canvasMode === 'finapp-dark' ? FINAPP_DARK_VARS : FINAPP_LIGHT_VARS;

  return (
    <div className="ui-test-page">
      <Section
        title="Finapp CSS variables"
        source="finapp-app-theme.css"
        subtitle="Active canvas theme tokens."
      >
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(finappVars).map(([name, value]) => (
            <div key={name} className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
              <div className="h-10" style={{ background: value }} />
              <p className="p-2 font-mono text-[10px]">
                {name}
                <br />
                {value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="GlassButton" source="src/components/ui/glass/GlassButton.tsx">
        <div className="grid gap-6">
          {GLASS_VARIANTS.map((variant) => (
            <div
              key={variant}
              className="rounded-2xl border border-black/10 bg-white/40 p-4 dark:border-white/15 dark:bg-white/5"
            >
              <SpecimenLabel label={`variant="${variant}"`} />
              <GlassButton variant={variant}>
                {variant === 'icon' ? <AppIcon icon="lucide:wallet" className="h-5 w-5" /> : variant}
              </GlassButton>
            </div>
          ))}
          <div className="rounded-2xl border border-black/10 p-4 dark:border-white/15 dark:bg-white/5">
            <SpecimenLabel label="disabled" />
            <GlassButton variant="primary" disabled>
              Disabled
            </GlassButton>
          </div>
        </div>
      </Section>

      <Section title="App buttons" source="Login · project">
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="rounded-full border border-white/80 bg-white px-7 py-2.5 text-sm text-[#1a1a2e] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          >
            Connect Wallet
          </button>
          <button
            type="button"
            className="group flex items-center gap-2 rounded-full border border-[#d1d5db] bg-white/70 px-4 py-1.5 text-[13px] text-[#1a1a2e]"
          >
            Learn more
            <AppIcon icon="lucide:arrow-right" className="h-5 w-5 text-[#4E87FF]" />
          </button>
        </div>
      </Section>
    </div>
  );
}
