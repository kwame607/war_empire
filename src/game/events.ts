import { EVENTS, getEventDef, type EventEffects } from '../data/events';
import { EVENT_GAP_MAX_S, EVENT_GAP_MIN_S } from './constants';
import { addLog, fail } from './log';
import type { ActionResult, GameState } from './types';

function nextSeed(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

/** Picks a new event once the timer has run out and none is waiting. Called from tick(). */
export function maybeSpawnEvent(state: GameState, now: number): GameState {
  if (state.event || now < state.nextEventAt || state.businesses.length === 0) return state;
  let seed = nextSeed(state.rngSeed);
  const pool = EVENTS.filter((e) => (e.minBusinesses ?? 0) <= state.businesses.length && e.id !== state.lastEventId);
  const def = pool[seed % pool.length];
  seed = nextSeed(seed);
  const gap = EVENT_GAP_MIN_S + (seed % (EVENT_GAP_MAX_S - EVENT_GAP_MIN_S));
  return {
    ...state,
    rngSeed: seed,
    event: { id: def.id, at: now },
    lastEventId: def.id,
    nextEventAt: now + gap * 1000,
    log: addLog(state.log, now, `Event: ${def.title}.`),
  };
}

function apply(state: GameState, e: EventEffects): Pick<GameState, 'resources' | 'reputation'> {
  const r = { ...state.resources };
  r.gold = Math.max(0, r.gold + (e.gold ?? 0));
  r.food = Math.max(0, r.food + (e.food ?? 0));
  r.wood = Math.max(0, r.wood + (e.wood ?? 0));
  r.stone = Math.max(0, r.stone + (e.stone ?? 0));
  return { resources: r, reputation: Math.max(0, state.reputation + (e.rep ?? 0)) };
}

export function eventCanChoose(state: GameState, choiceIndex: number): boolean {
  const def = state.event ? getEventDef(state.event.id) : undefined;
  const needs = def?.choices[choiceIndex]?.needs;
  if (!needs) return !!def?.choices[choiceIndex];
  return (['gold', 'food', 'wood', 'stone'] as const).every((k) => state.resources[k] >= (needs[k] ?? 0));
}

/** Resolves the waiting event with the chosen option. Returns the outcome text in the log. */
export function resolveEvent(state: GameState, choiceIndex: number, now: number): ActionResult & { outcome?: string } {
  const def = state.event ? getEventDef(state.event.id) : undefined;
  if (!state.event || !def) return fail('There is nothing to decide right now.');
  const choice = def.choices[choiceIndex];
  if (!choice) return fail('That is not an option.');
  if (!eventCanChoose(state, choiceIndex)) return fail('You cannot afford that option.');

  const total = choice.outcomes.reduce((a, o) => a + o.weight, 0);
  const seed = nextSeed(state.rngSeed);
  let roll = seed % total;
  let picked = choice.outcomes[0];
  for (const o of choice.outcomes) {
    if (roll < o.weight) {
      picked = o;
      break;
    }
    roll -= o.weight;
  }
  const delta = apply(state, picked);
  return {
    ok: true,
    outcome: picked.text,
    state: { ...state, ...delta, rngSeed: seed, event: null, log: addLog(state.log, now, `${def.title}: ${picked.text}`) },
  };
}

export { EVENT_GAP_MAX_S, EVENT_GAP_MIN_S };
