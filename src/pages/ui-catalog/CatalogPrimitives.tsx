import type { ReactNode } from 'react';

export function Section({
  title,
  subtitle,
  source,
  children,
}: {
  title: string;
  subtitle?: string;
  source?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-bold tracking-tight">{title}</h2>
      {subtitle ? <p className="mb-1 text-sm opacity-70">{subtitle}</p> : null}
      {source ? (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-brand-pink/80">{source}</p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </section>
  );
}

export function SpecimenLabel({ label, detail }: { label: string; detail?: string }) {
  return (
    <div className="mb-2 min-w-0">
      <p className="font-mono text-xs font-medium uppercase tracking-wider">{label}</p>
      {detail ? <p className="text-[10px] opacity-60">{detail}</p> : null}
    </div>
  );
}

/** Finapp pages render inside #appCapsule for correct spacing & listview styles. */
export function FinappCapsule({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div id="appCapsule" className={className}>
      {children}
    </div>
  );
}

export function AvatarPlaceholder({ label, tone = 'violet' }: { label: string; tone?: string }) {
  const tones: Record<string, string> = {
    violet: 'from-violet-400 to-purple-600',
    blue: 'from-sky-300 to-teal-400',
    rose: 'from-rose-400 to-pink-500',
  };
  return (
    <div
      className={`image imaged w36 flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${tones[tone] ?? tones.violet}`}
      aria-hidden
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function CatalogModal({
  open,
  onClose,
  modalClassName,
  children,
}: {
  open: boolean;
  onClose: () => void;
  modalClassName: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 2990 }}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      />
      <div
        className={`modal fade show ${modalClassName}`}
        style={{ display: 'block', zIndex: 3000 }}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
}

export function ChartPlaceholder({
  type,
  height = 150,
}: {
  type: 'line' | 'pie' | 'donut' | 'bar' | 'candlestick';
  height?: number;
}) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <div
      className="flex w-full items-center justify-center rounded-xl border border-dashed border-black/15 bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.04]"
      style={{ minHeight: height }}
      aria-label={`${label} chart placeholder`}
    >
      <svg viewBox="0 0 200 80" className="h-20 w-full max-w-xs opacity-50" aria-hidden>
        {type === 'line' && (
          <polyline
            fill="none"
            stroke="#6236FF"
            strokeWidth="2"
            points="0,60 30,45 60,50 90,25 120,35 150,15 180,30 200,10"
          />
        )}
        {type === 'bar' &&
          [20, 45, 30, 55, 25, 50, 35].map((h, i) => (
            <rect key={i} x={10 + i * 26} y={80 - h} width="18" height={h} fill="#6236FF" opacity={0.7} />
          ))}
        {(type === 'pie' || type === 'donut') && (
          <>
            <circle cx="100" cy="40" r="32" fill="#6236FF" opacity="0.35" />
            <circle cx="100" cy="40" r="32" fill="none" stroke="#1DCC70" strokeWidth="24" strokeDasharray="60 140" />
            {type === 'donut' && <circle cx="100" cy="40" r="14" fill="currentColor" className="text-[#ededf5]" />}
          </>
        )}
        {type === 'candlestick' &&
          [0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line x1={30 + i * 35} y1="15" x2={30 + i * 35} y2="65" stroke="#8494A8" strokeWidth="1" />
              <rect x={24 + i * 35} y={25 + (i % 2) * 10} width="12" height="25" fill={i % 2 ? '#FF396F' : '#1DCC70'} />
            </g>
          ))}
      </svg>
      <span className="sr-only">{label} chart — Apex placeholder</span>
    </div>
  );
}
