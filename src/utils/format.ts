import type { Resources } from '@/game/types';

/** Shortens big numbers for small screens: 1250 -> "1.3K", 2400000 -> "2.4M". */
export function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 10_000) return `${Math.round(n / 1000)}K`;
  if (abs >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.floor(n));
}

/** "150 gold, 20 wood" */
export function costText(cost: Partial<Resources>): string {
  const parts = (['gold', 'food', 'wood', 'stone'] as const)
    .filter((k) => (cost[k] ?? 0) > 0)
    .map((k) => `${cost[k]} ${k}`);
  return parts.length ? parts.join(', ') : 'free';
}

/** Per-hour figure with sign, one decimal: "+19.5" */
export function perHour(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}`;
}
