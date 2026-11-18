import { WAR_RELATION_ON_DECLARE } from './constants';
import { tick } from './engine';
import { addLog, fail } from './log';
import { getStageIndex, sumUnits } from './selectors';
import { buildWarScenario, peaceTerms } from './warCore';
import type { ActionResult, GameState } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function warBlocker(state: GameState, rivalId: string): string | null {
  if (state.war) return 'You are already at war.';
  const r = state.world.rivals.find((x) => x.id === rivalId);
  if (!r) return 'Unknown kingdom.';
  if (getStageIndex(state) < 2) return 'You are not yet a power that can wage war.';
  if (r.pact !== 'none') return 'Break your pact with them first. Honourable neighbours will remember how you did it.';
  if (state.battle || state.expedition) return 'Your army is busy.';
  if (sumUnits(state.army.units) <= 0) return 'You have no soldiers ready.';
  return null;
}

export function declareWar(input: GameState, rivalId: string, now: number): ActionResult {
  const state = tick(input, now);
  const why = warBlocker(state, rivalId);
  if (why) return fail(why);
  const rival = state.world.rivals.find((x) => x.id === rivalId)!;
  const scenario = buildWarScenario(rival, state.rngSeed + state.world.turn);
  const rivals = state.world.rivals.map((x) => {
    if (x.id === rivalId) return { ...x, relation: clamp(x.relation + WAR_RELATION_ON_DECLARE, -100, 100), traitKnown: true };
    // Others watch how you treat your neighbours.
    if (x.trait === 'honourable') return { ...x, relation: clamp(x.relation - 5, -100, 100) };
    if (x.trait === 'expansionist') return { ...x, relation: clamp(x.relation + 3, -100, 100) };
    return x;
  });
  return {
    ok: true,
    state: {
      ...state,
      war: { rivalId, scenario, wins: 0, losses: 0, startedAt: now },
      world: { ...state.world, rivals },
      log: addLog(state.log, now, `You declared war on ${rival.name}.`),
    },
  };
}

export function makePeace(input: GameState, now: number): ActionResult {
  const state = tick(input, now);
  const war = state.war;
  if (!war) return fail('You are not at war.');
  if (state.battle || state.expedition) return fail('Finish the fighting first.');
  const rival = state.world.rivals.find((x) => x.id === war.rivalId);
  if (!rival) return fail('Unknown kingdom.');
  const t = peaceTerms(war, rival);
  if (t.kind === 'tribute' && state.resources.gold < t.gold) return fail(`You cannot afford the ${t.gold} gold they demand.`);
  const gold = t.kind === 'reparations' ? state.resources.gold + t.gold : t.kind === 'tribute' ? state.resources.gold - t.gold : state.resources.gold;
  const relation = t.kind === 'reparations' ? -10 : t.kind === 'white' ? -20 : -30;
  return {
    ok: true,
    state: {
      ...state,
      war: null,
      resources: { ...state.resources, gold },
      reputation: Math.max(0, state.reputation + (t.kind === 'reparations' ? 2 : t.kind === 'tribute' ? -1 : 0)),
      world: { ...state.world, rivals: state.world.rivals.map((x) => (x.id === rival.id ? { ...x, relation } : x)) },
      log: addLog(state.log, now, `Peace with ${rival.name}. ${t.text}`),
    },
  };
}
