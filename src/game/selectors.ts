import { PROGRESSION_STAGES } from '../data/progression';
import { DAYS_PER_SEASON, SECONDS_PER_GAME_DAY, SEASONS } from './constants';
import { businessRates, employeesOf } from './economy';
import type { GameState } from './types';

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

export type Rates = { income: number; expenses: number; net: number; food: number; wood: number; stone: number };

/** Hourly totals across all producing businesses. */
export function getRates(state: GameState): Rates {
  const r: Rates = { income: 0, expenses: 0, net: 0, food: 0, wood: 0, stone: 0 };
  for (const b of state.businesses) {
    const br = businessRates(state, b.typeId, b.level);
    r.income += br.income;
    r.expenses += br.expenses;
    if (br.produces && br.produces.resource !== 'gold') r[br.produces.resource] += br.produces.perHour;
  }
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

export function pendingCount(state: GameState): number {
  return state.businesses.filter((b) => b.pending).length;
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
