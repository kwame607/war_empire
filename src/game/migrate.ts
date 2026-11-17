import { emptyUnits } from '../data/units';
import { SAVE_VERSION } from './constants';
import { initWorld } from './worldCore';
import type { GameState } from './types';

/**
 * Upgrades an older save to the current format. Returns null if the data is unusable.
 * Add a new step here whenever SAVE_VERSION increases; never delete old steps.
 */
export function migrateState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.version !== 'number' || s.version > SAVE_VERSION) return null;
  if (!s.player || !s.resources || !Array.isArray(s.businesses)) return null;

  const next = { ...s } as Record<string, unknown>;

  // v1 -> v2: institutions, army, commanders, battles
  if (s.version < 2) {
    const player = s.player as { createdAt?: number };
    next.institutions = [];
    next.army = { units: emptyUnits(), training: [], commanderId: null };
    next.commanders = [];
    next.battle = null;
    next.reports = [];
    next.scenarioReadyAt = {};
    next.rngSeed = Math.floor(player.createdAt ?? Date.now()) % 2147483647;
  }

  // v2 -> v3: intelligence
  if (s.version < 3) {
    next.intel = { spies: [], missions: [], reports: [] };
    const battle = next.battle as Record<string, unknown> | null;
    if (battle) next.battle = { ...battle, belief: {}, beliefSources: [], enemyInformed: false };
  }

  // v3 -> v4: living world
  if (s.version < 4) {
    const player = next.player as { civId: string; createdAt?: number };
    const seed = (next.rngSeed as number) ?? 1;
    next.world = initWorld(player.civId, seed, (next.lastTickAt as number) ?? Date.now());
  }

  next.version = SAVE_VERSION;
  return next as unknown as GameState;
}
