import { delegateBattle } from './military';
import type { GameState } from './types';

/** When an expedition's time is up, the commander fights it out and the report is filed. */
export function resolveExpedition(state: GameState, now: number): GameState {
  const ex = state.expedition;
  if (!ex || ex.endsAt > now) return state;
  const fighting: GameState = { ...state, expedition: null, battle: ex.battle };
  const r = delegateBattle(fighting, now);
  return r.ok ? r.state : { ...state, expedition: null, battle: ex.battle };
}
