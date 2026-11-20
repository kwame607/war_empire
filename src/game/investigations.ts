import { getInvestigation } from '../data/investigations';
import { addLog, fail } from './log';
import type { ActionResult, GameState } from './types';

/** 3 stars: quick, accurate and little help. Fewer stars for slower or sloppier searches. */
export function starsFor(seconds: number, misses: number, hints: number): 1 | 2 | 3 {
  if (seconds <= 150 && misses <= 4 && hints === 0) return 3;
  if (seconds <= 300 && misses <= 10 && hints <= 2) return 2;
  return 1;
}

/** Records a finished search. The first clear pays the full reward; later ones pay only for extra stars. */
export function finishInvestigation(state: GameState, id: string, stars: number, now: number): ActionResult & { gold?: number; rep?: number } {
  const inv = getInvestigation(id);
  if (!inv) return fail('That case file does not exist.');
  if (!Number.isInteger(stars) || stars < 1 || stars > 3) return fail('Invalid result.');
  const best = state.investigations[id]?.stars ?? 0;
  if (stars <= best) return { ok: true, state, gold: 0, rep: 0 };
  const first = best === 0;
  const gold = first ? inv.gold + (stars - 1) * 50 : (stars - best) * 50;
  const rep = first ? inv.rep : 0;
  return {
    ok: true,
    gold,
    rep,
    state: {
      ...state,
      investigations: { ...state.investigations, [id]: { stars, at: now } },
      resources: { ...state.resources, gold: state.resources.gold + gold },
      reputation: state.reputation + rep,
      log: addLog(state.log, now, `Investigation: ${inv.title} cleared with ${stars} star${stars > 1 ? 's' : ''} (+${gold} gold).`),
    },
  };
}
