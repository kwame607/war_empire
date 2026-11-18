import { ORDERS } from '../data/orders';
import { MASTERY_REQUIRES } from './constants';
import type { GameState, MasteryRecord, OrderId } from './types';

export const EMPTY: MasteryRecord = { battles: 0, sims: 0, terrains: [] };

export function masteryOf(state: GameState, doctrine: string): MasteryRecord {
  return state.mastery[doctrine] ?? EMPTY;
}

export function masteryProgress(state: GameState, doctrine: string) {
  const m = masteryOf(state, doctrine);
  const need = MASTERY_REQUIRES;
  const parts = [
    { label: NAVAL_DOCTRINES.includes(doctrine) ? 'Successful uses in real sea battles' : 'Successful uses in real battle', have: m.battles, need: need.battles },
    { label: 'Successful practice runs in the war room', have: m.sims, need: need.sims },
    { label: NAVAL_DOCTRINES.includes(doctrine) ? 'Different kingdoms defeated at sea' : 'Different terrains mastered', have: m.terrains.length, need: need.terrains },
  ];
  return { parts, complete: parts.every((p) => p.have >= p.need) };
}

/** The doctrines the player can practise: understood, with an order to match. */
export function practisableOrders(state: GameState): OrderId[] {
  return ORDERS.filter((o) => o.doctrine && (state.knowledge[o.doctrine] ?? 0) >= 2).map((o) => o.id);
}

export const NAVAL_DOCTRINES = ['salamis', 'lepanto'];

export function recordRealSuccess(mastery: Record<string, MasteryRecord>, doctrine: string, terrain: string): Record<string, MasteryRecord> {
  const m = mastery[doctrine] ?? EMPTY;
  return {
    ...mastery,
    [doctrine]: { ...m, battles: m.battles + 1, terrains: m.terrains.includes(terrain) ? m.terrains : [...m.terrains, terrain] },
  };
}

