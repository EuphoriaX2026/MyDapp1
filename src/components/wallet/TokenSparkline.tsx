import { useId, useMemo } from 'react';

/** Live SVG sparkline — centered on the card's middle axis. */
export function TokenSparkline({
  prices,
  color,
  className = '',
}: {
  prices: number[];
  color: string;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, '');

  const { linePath, areaPath } = useMemo(() => {
    const values = prices.filter((v) => Number.isFinite(v) && v > 0).slice(-168);
    if (values.length < 2) return { linePath: '', areaPath: '' };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const mid = (min + max) / 2;
    const halfRange = Math.max((max - min) / 2, mid * 0.0005, 0.0001);

    const w = 120;
    const h = 44;
    const padY = 4;
    const plotH = h - padY * 2;
    const step = w / (values.length - 1);

    const points = values.map((y, i) => {
      const x = i * step;
      const normalized = (y - mid) / halfRange;
      const py = h / 2 - normalized * (plotH / 2);
      return { x, y: py };
    });

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');

    const area = `${line} L${w.toFixed(1)},${h.toFixed(1)} L0,${h.toFixed(1)} Z`;

    return { linePath: line, areaPath: area };
  }, [prices]);

  if (!linePath) return null;

  return (
    <svg viewBox="0 0 120 44" className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
