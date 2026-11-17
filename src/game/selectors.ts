import { getInstitutionType } from '../data/institutions';
import { PROGRESSION_STAGES } from '../data/progression';
import { getUnitType, UNIT_IDS } from '../data/units';
import { getSettlement } from '../data/world';
import { ARMY_CAPACITY_PER_BARRACKS_LEVEL, DAYS_PER_SEASON, SECONDS_PER_GAME_DAY, SEASONS } from './constants';
import { businessRates, employeesOf } from './economy';
import type { GameState, UnitCounts } from './types';

export const BASE_POPULATION = 12;

export function getPopulation(state: GameState): number {
  return BASE_POPULATION + state.businesses.reduce((sum, b) => sum + employeesOf(b), 0);
}

export function getStageIndex(state: GameState): number {
  let idx = 0;
  PROGRESSION_STAGES.forEach((s, i) => {
    if (state.reputation >= s.reputation) idx = i;
  });
  return idx;
}

// --- Institutions ---------------------------------------------------------

/** Level that is currently active (0 if not built, or still under first construction). */
export function institutionLevel(state: GameState, id: string): number {
  return state.institutions.find((i) => i.typeId === id)?.level ?? 0;
}

export function understoodCount(state: GameState): number {
  return Object.values(state.knowledge).filter((stage) => stage >= 2).length;
}

/** Why an institution cannot be built yet, or null if it can. */
export function institutionBlocker(state: GameState, id: string): string | null {
  const t = getInstitutionType(id);
  if (state.reputation < t.requiresReputation) return `Requires reputation ${t.requiresReputation}`;
  if (t.requiresUnderstood && understoodCount(state) < t.requiresUnderstood) {
    return 'Requires a historical record studied to Understanding';
  }
  if (t.requiresInstitution) {
    const need = t.requiresInstitution;
    if (institutionLevel(state, need.id) < need.level) {
      return `Requires ${getInstitutionType(need.id).name} level ${need.level}`;
    }
  }
  return null;
}

/** Library effect: multiplier on study time. */
export function studyTimeMult(state: GameState): number {
  return 1 - 0.12 * institutionLevel(state, 'library');
}

// --- Army -----------------------------------------------------------------

export function sumUnits(u: UnitCounts): number {
  return UNIT_IDS.reduce((s, id) => s + u[id], 0);
}

export function queuedCount(state: GameState): number {
  return state.army.training.reduce((s, b) => s + b.count, 0);
}

/** Every soldier the player owns: at home, in training, or deployed in a battle. */
export function getArmySize(state: GameState): number {
  return sumUnits(state.army.units) + queuedCount(state) + (state.battle ? sumUnits(state.battle.player.units) : 0);
}

export function getArmyCapacity(state: GameState): number {
  return ARMY_CAPACITY_PER_BARRACKS_LEVEL * institutionLevel(state, 'barracks');
}

/** How many men your lands can spare for an army. Grows with population. */
export function getManpowerCap(state: GameState): number {
  const home = getSettlement(state.player.startSettlementId).population;
  return Math.floor((getPopulation(state) + home) * 0.6);
}

export function bureauLevel(state: GameState): number {
  return institutionLevel(state, 'bureau');
}

export function spyCap(state: GameState): number {
  const l = bureauLevel(state);
  return l === 0 ? 0 : l + 1;
}

export function trainingSpeed(state: GameState): number {
  return 1 + 0.25 * Math.max(0, institutionLevel(state, 'barracks') - 1);
}

export function commanderCap(state: GameState): number {
  return institutionLevel(state, 'academy');
}

export function getArmyUpkeep(state: GameState): { gold: number; food: number } {
  let gold = 0;
  let food = 0;
  for (const id of UNIT_IDS) {
    const n = state.army.units[id] + (state.battle ? state.battle.player.units[id] : 0);
    const t = getUnitType(id);
    gold += n * t.upkeepGold;
    food += n * t.upkeepFood;
  }
  return { gold, food };
}

export function getInstitutionUpkeep(state: GameState): number {
  return state.institutions.reduce((sum, i) => (i.level > 0 ? sum + getInstitutionType(i.typeId).upkeepPerHour : sum), 0);
}

export function armoryBonus(state: GameState): number {
  return 1 + 0.05 * institutionLevel(state, 'armoury');
}

// --- Rates ----------------------------------------------------------------

export type Rates = { income: number; expenses: number; net: number; food: number; wood: number; stone: number };

/** Hourly totals across all producing businesses, institutions and the army. */
export function getRates(state: GameState): Rates {
  const r: Rates = { income: 0, expenses: 0, net: 0, food: 0, wood: 0, stone: 0 };
  for (const b of state.businesses) {
    const br = businessRates(state, b.typeId, b.level);
    r.income += br.income;
    r.expenses += br.expenses;
    if (br.produces && br.produces.resource !== 'gold') r[br.produces.resource] += br.produces.perHour;
  }
  const army = getArmyUpkeep(state);
  r.expenses += getInstitutionUpkeep(state) + army.gold;
  r.food -= army.food;
  r.net = r.income - r.expenses;
  return r;
}

export function getGameDate(state: GameState): { label: string; dayNumber: number } {
  const totalDays = Math.floor(state.totalSeconds / SECONDS_PER_GAME_DAY);
  const daysPerYear = DAYS_PER_SEASON * SEASONS.length;
  const year = Math.floor(totalDays / daysPerYear) + 1;
  const dayOfYear = totalDays % daysPerYear;
  const season = SEASONS[Math.floor(dayOfYear / DAYS_PER_SEASON)];
  const dayInSeason = (dayOfYear % DAYS_PER_SEASON) + 1;
  return { label: `Year ${year} · ${season}, day ${dayInSeason}`, dayNumber: totalDays + 1 };
}

/** Builds and upgrades in progress (businesses and institutions share the same builders). */
export function pendingCount(state: GameState): number {
  return state.businesses.filter((b) => b.pending).length + state.institutions.filter((i) => i.pending).length;
}

/** "1h 05m", "3m 20s", "45s" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`;
  return `${sec}s`;
}
