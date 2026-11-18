import { getBusinessType } from '../data/businesses';
import { getCivilisation } from '../data/civilisations';
import { getDifficulty } from '../data/backgrounds';
import type { BusinessInstance, GameState, ResourceKey, Resources } from './types';

export const RESOURCE_KEYS: ResourceKey[] = ['gold', 'food', 'wood', 'stone'];

export function emptyResources(): Resources {
  return { gold: 0, food: 0, wood: 0, stone: 0 };
}

export type BusinessRates = {
  income: number; // gold per hour
  expenses: number; // gold per hour
  produces: { resource: ResourceKey; perHour: number } | null;
};

/** Per-hour numbers for one business at a given level, after civilisation and difficulty modifiers. */
/** Global pacing knob: raises all business gold income (1 = original pace). */
export const GOLD_INCOME_MULT = 2.5;

export function businessRates(state: GameState, typeId: string, level: number): BusinessRates {
  if (level <= 0) return { income: 0, expenses: 0, produces: null };
  const type = getBusinessType(typeId);
  const civ = getCivilisation(state.player.civId);
  const diff = getDifficulty(state.player.difficultyId);
  const growth = 1 + 0.6 * (level - 1);
  const costGrowth = 1 + 0.35 * (level - 1);
  let produces: BusinessRates['produces'] = null;
  if (type.produces) {
    const woodMult = type.produces.resource === 'wood' ? civ.modifiers.woodOutputMult : 1;
    produces = { resource: type.produces.resource, perHour: type.produces.perHour * growth * woodMult };
  }
  return {
    income: type.incomePerHour * growth * civ.modifiers.goldIncomeMult * GOLD_INCOME_MULT,
    expenses: type.expensesPerHour * costGrowth * diff.expenseMult,
    produces,
  };
}

/** Resource cost of upgrading from `level` to `level + 1`. */
export function upgradeCost(type: { cost: Partial<Resources> }, level: number): Partial<Resources> {
  const scale = 0.8 * Math.pow(1.7, level - 1);
  const out: Partial<Resources> = {};
  for (const key of RESOURCE_KEYS) {
    const base = type.cost[key];
    if (base) out[key] = Math.round(base * scale);
  }
  return out;
}

/** Seconds to build level `targetLevel` (1 = first construction). */
export function buildSeconds(state: GameState, type: { buildSeconds: number }, targetLevel: number): number {
  const civ = getCivilisation(state.player.civId);
  const raw = type.buildSeconds * Math.pow(1.5, targetLevel - 1) * civ.modifiers.buildTimeMult;
  return Math.max(5, Math.round(raw));
}

export function employeesOf(inst: BusinessInstance): number {
  if (inst.level <= 0) return 0;
  return getBusinessType(inst.typeId).employees * inst.level;
}

export function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  return RESOURCE_KEYS.every((k) => resources[k] >= (cost[k] ?? 0));
}

export function pay(resources: Resources, cost: Partial<Resources>): Resources {
  const next = { ...resources };
  for (const k of RESOURCE_KEYS) next[k] -= cost[k] ?? 0;
  return next;
}
