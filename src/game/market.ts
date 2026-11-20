import { SECONDS_PER_GAME_DAY } from './constants';
import { addLog, fail } from './log';
import { tick } from './engine';
import type { ActionResult, GameState } from './types';

export type GoodId = 'food' | 'wood' | 'stone';
export const GOODS: { id: GoodId; name: string; base: number; stall: string; blurb: string }[] = [
  { id: 'food', name: 'Grain & Provisions', base: 2, stall: 'Granary stall', blurb: 'Sacks of grain, dried fish and salted meat.' },
  { id: 'wood', name: 'Timber', base: 3, stall: 'Timber yard', blurb: 'Cut planks, beams and charcoal.' },
  { id: 'stone', name: 'Stone', base: 5, stall: 'Mason’s stall', blurb: 'Dressed blocks and rubble for walls.' },
];
/** Merchants pay this share of the buying price when you sell to them. */
export const SELL_SHARE = 0.6;

const SEASON_DAYS = 90;
const hash = (a: number, b: number, c: number) => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export type MarketEvent = { id: string; title: string; text: string; good: GoodId; mult: number };
const EVENTS: MarketEvent[] = [
  { id: 'famine', title: 'Famine in the next province', text: 'Hungry buyers are bidding up every sack of grain.', good: 'food', mult: 1.6 },
  { id: 'bumper', title: 'Bumper harvest', text: 'Barns overflow and grain sells for almost nothing.', good: 'food', mult: 0.6 },
  { id: 'fire', title: 'Fire in the lower town', text: 'Everyone is rebuilding, and timber is scarce.', good: 'wood', mult: 1.5 },
  { id: 'felling', title: 'Great felling', text: 'Loggers flood the yards with timber.', good: 'wood', mult: 0.65 },
  { id: 'wall', title: 'A lord builds a wall', text: 'His masons are buying every block of stone.', good: 'stone', mult: 1.5 },
  { id: 'quarry', title: 'New quarry opened', text: 'Stone is plentiful and cheap this week.', good: 'stone', mult: 0.65 },
];

/** The market-wide event in force today, if any. It lasts four days and is the same on every reload. */
export function marketEvent(state: GameState): MarketEvent | null {
  const window = Math.floor(marketDay(state) / 4);
  const r = hash(window, 77, state.rngSeed);
  if (r > 0.45) return null;
  return EVENTS[Math.floor((r / 0.45) * EVENTS.length) % EVENTS.length];
}

export type Quote = { id: GoodId; buy: number; sell: number; base: number; trend: 'up' | 'down' | 'steady'; note: string };

export function marketDay(state: GameState): number {
  return Math.floor(state.totalSeconds / SECONDS_PER_GAME_DAY);
}

/** Seconds of play until the market changes its prices. */
export function marketRefreshIn(state: GameState): number {
  return SECONDS_PER_GAME_DAY - (state.totalSeconds % SECONDS_PER_GAME_DAY);
}

/** Haggling skill from administration: up to 15% off buying and the same extra when selling. */
export function haggle(state: GameState): number {
  return Math.min(0.15, Math.max(0, state.attributes.administration) * 0.01);
}

/** Prices for today. Deterministic from the day and the save, so they never change by reloading. */
export function marketQuotes(state: GameState): Quote[] {
  const day = marketDay(state);
  const season = Math.floor((day % (SEASON_DAYS * 4)) / SEASON_DAYS); // 0 spring 1 summer 2 autumn 3 winter
  const h = haggle(state);
  const ev = marketEvent(state);
  return GOODS.map((g, i) => {
    let mult = 0.8 + hash(day, i + 1, state.rngSeed) * 0.5;
    let note = '';
    if (g.id === 'food' && season === 2) { mult *= 0.8; note = 'Harvest glut: grain is cheap.'; }
    if (g.id === 'food' && season === 3) { mult *= 1.2; note = 'Winter: grain is dear.'; }
    if (g.id === 'wood' && season === 3) { mult *= 1.15; note = 'Winter fires burn timber.'; }
    if (g.id === 'stone' && season === 1) { mult *= 0.9; note = 'Dry roads: quarries ship freely.'; }
    const caravan = hash(Math.floor(day / 3), 9, state.rngSeed);
    if (caravan > 0.82 && i === Math.floor(caravan * 100) % 3) { mult *= 0.7; note = 'A caravan has arrived. Prices fall.'; }
    if (ev && ev.good === g.id) { mult *= ev.mult; note = ev.title + '.'; }
    const buy = Math.max(1, Math.round(g.base * mult * (1 - h) * 10) / 10);
    const sell = Math.max(0.5, Math.round(g.base * mult * SELL_SHARE * (1 + h) * 10) / 10);
    const ratio = (g.base * mult) / g.base;
    return { id: g.id, buy, sell, base: g.base, trend: ratio > 1.1 ? 'up' : ratio < 0.9 ? 'down' : 'steady', note };
  });
}

export function quoteFor(state: GameState, id: GoodId): Quote {
  return marketQuotes(state).find((q) => q.id === id)!;
}

/** Buys or sells goods at today's prices. */
export function tradeGood(input: GameState, id: GoodId, amount: number, mode: 'buy' | 'sell', now: number): ActionResult {
  const state = tick(input, now);
  const n = Math.floor(amount);
  if (!(n > 0)) return fail('Choose how much to trade.');
  const q = quoteFor(state, id);
  const name = GOODS.find((g) => g.id === id)!.name.toLowerCase();
  if (mode === 'buy') {
    const cost = Math.ceil(n * q.buy);
    if (state.resources.gold < cost) return fail(`${n} ${name} costs ${cost} gold. You have ${Math.floor(state.resources.gold)}.`);
    return { ok: true, state: { ...state, resources: { ...state.resources, gold: state.resources.gold - cost, [id]: state.resources[id] + n }, log: addLog(state.log, now, `Bought ${n} ${name} for ${cost} gold.`) } };
  }
  if (state.resources[id] < n) return fail(`You only have ${Math.floor(state.resources[id])} ${name} to sell.`);
  const gain = Math.floor(n * q.sell);
  return { ok: true, state: { ...state, resources: { ...state.resources, gold: state.resources.gold + gain, [id]: state.resources[id] - n }, log: addLog(state.log, now, `Sold ${n} ${name} for ${gain} gold.`) } };
}
