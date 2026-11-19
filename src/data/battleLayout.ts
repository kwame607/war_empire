import type { Battle, OrderId, UnitCounts } from '@/game/types';

/** A block of soldiers on the field, in field coordinates (sx across, sd front-to-back; player at +sd). */
export type Regiment = { key: string; sprite: string; sx: number; sd: number };
export type Counts = Partial<Record<'spearmen' | 'archers' | 'cavalry' | 'heavy', number>>;

const SLOTS: Record<number, number[]> = { 0: [], 1: [0], 2: [-6, 6], 3: [-10, 0, 10] };

/** How many blocks to draw for a number of soldiers. */
export function blocksFor(count: number, perBlock: number, cap: number): number {
  if (count <= 0) return 0;
  return Math.min(cap, Math.max(1, Math.round(count / perBlock)));
}

/** Where the front line stands: armies start apart and close as rounds pass. */
export function frontLine(round: number, lastOrder: OrderId | null): number {
  const p = Math.min(1, round / 2);
  let f = 3 + 5 * (1 - p);
  if (lastOrder === 'advance') f -= 1;
  if (lastOrder === 'feint') f += 2;
  return Math.max(2.2, f);
}

export function layoutArmy(counts: Counts, perBlock: number, side: 'p' | 'e', front: number, flanking: boolean): Regiment[] {
  const sign = side === 'p' ? 1 : -1;
  const out: Regiment[] = [];
  const heavy = blocksFor(counts.heavy ?? 0, perBlock, 2);
  const spear = Math.min(blocksFor(counts.spearmen ?? 0, perBlock, 3), Math.max(0, 3 - heavy));
  const frontKinds: string[] = [...Array(heavy).fill('heavy'), ...Array(spear).fill('spearmen')];
  const fs = SLOTS[Math.min(3, frontKinds.length)];
  frontKinds.forEach((k, i) => out.push({ key: `${side}-${k}-${i}`, sprite: `u_${k}_${side}`, sx: fs[i], sd: sign * front }));
  const arch = blocksFor(counts.archers ?? 0, perBlock, 3);
  SLOTS[arch].forEach((sx, i) => out.push({ key: `${side}-archers-${i}`, sprite: `u_archers_${side}`, sx, sd: sign * (front + 5.6) }));
  const cav = blocksFor(counts.cavalry ?? 0, perBlock, 2);
  for (let i = 0; i < cav; i++) {
    const sx = i === 0 ? -16.5 : 16.5;
    out.push({ key: `${side}-cavalry-${i}`, sprite: `u_cavalry_${side}`, sx, sd: flanking && side === 'p' ? -(front + 3) : sign * (front + 3) });
  }
  return out;
}

/** What the player can see of the enemy: exact if spied, otherwise an estimate by branch (or all spearmen if only a total is known). */
export function enemyAsSeen(b: Battle, est: { exact: boolean; total: [number, number]; classes: { infantry: [number, number]; ranged: [number, number]; cavalry: [number, number] } | null; units: UnitCounts | null }): { counts: Counts; guessed: boolean } {
  if (est.exact && est.units) return { counts: est.units, guessed: false };
  const mid = (r: [number, number]) => Math.round((r[0] + r[1]) / 2);
  if (est.classes) return { counts: { spearmen: mid(est.classes.infantry), archers: mid(est.classes.ranged), cavalry: mid(est.classes.cavalry) }, guessed: true };
  return { counts: { spearmen: mid(est.total) }, guessed: true };
}

export function isFlanking(order: OrderId | null): boolean {
  return order === 'envelop' || order === 'horns';
}

export const FIELD_KEYS = ['plain', 'forest', 'hills', 'river', 'desert'] as const;
