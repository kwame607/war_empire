import { getSettlement } from '../data/world';
import type { GameState, Resources, SettlementKind } from './types';

/** Settlements each kingdom starts with. The first one is its capital. */
export const START_HOLDINGS: Record<string, string[]> = {
  sikaman: ['sikaman-crossing', 'dunemark'],
  niani: ['niani-bend', 'sahari-wells'],
  fjordlands: ['fjordhaven', 'ironpeak', 'skaldmoor'],
  aurelia: ['aurelia', 'veridian', 'port-calder'],
  serene: ['serene-harbour'],
};

const YIELD: Record<SettlementKind, Partial<Resources>> = {
  city: { gold: 12 },
  port: { gold: 10, food: 2 },
  farmland: { gold: 2, food: 8 },
  village: { gold: 3, wood: 3 },
  mine: { gold: 2, stone: 5 },
  ruins: { gold: 1 },
};
const UPKEEP_GOLD = 3;

export function holdingYield(id: string): Resources {
  const y = YIELD[getSettlement(id).kind];
  return { gold: (y.gold ?? 0) - UPKEEP_GOLD, food: y.food ?? 0, wood: y.wood ?? 0, stone: y.stone ?? 0 };
}

/** Per-hour income from conquered provinces (gold is net of garrison costs). */
export function territoryIncome(state: GameState): Resources {
  const total: Resources = { gold: 0, food: 0, wood: 0, stone: 0 };
  for (const id of state.territories) {
    const y = holdingYield(id);
    total.gold += y.gold;
    total.food += y.food;
    total.wood += y.wood;
    total.stone += y.stone;
  }
  return total;
}

/** Soldiers needed to keep order across the provinces you hold. */
export function garrisonNeeded(state: GameState): number {
  return state.territories.length * 18;
}

export function capitalOf(rivalId: string): string {
  return START_HOLDINGS[rivalId]?.[0] ?? '';
}
