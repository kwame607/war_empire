import { SHIP_COST, SHIP_SECONDS } from './constants';
import { tick } from './engine';
import { addLog, fail } from './log';
import { canAfford, pay } from './economy';
import { fleetCapacity, shipyardLevel } from './selectors';
import { availableTactics, resolveNaval } from './navalCore';
import type { ActionResult, GameState, NavalTactic } from './types';

export function shipSeconds(state: GameState): number {
  return Math.max(5, Math.round(SHIP_SECONDS * (1 - 0.2 * (shipyardLevel(state) - 1))));
}

export function pendingShips(state: GameState): number {
  return state.fleet.training.reduce((a, b) => a + b.count, 0);
}

export function buildShips(input: GameState, count: number, now: number): ActionResult {
  const state = tick(input, now);
  if (shipyardLevel(state) < 1) return fail('You need a Shipyard to build warships.');
  if (count < 1) return fail('Choose how many ships.');
  if (state.fleet.ships + pendingShips(state) + count > fleetCapacity(state)) return fail(`Your shipyard supports a fleet of ${fleetCapacity(state)}. Upgrade it for more.`);
  const cost = { gold: SHIP_COST.gold * count, wood: SHIP_COST.wood * count };
  if (!canAfford(state.resources, cost)) return fail('Not enough gold or wood.');
  const last = state.fleet.training.reduce((m, b) => Math.max(m, b.completesAt), now);
  return {
    ok: true,
    state: {
      ...state,
      resources: pay(state.resources, cost),
      fleet: { ...state.fleet, training: [...state.fleet.training, { count, completesAt: last + count * shipSeconds(state) * 1000 }] },
      log: addLog(state.log, now, `${count} warship${count > 1 ? 's' : ''} laid down.`),
    },
  };
}

/** Fights for command of the sea against the kingdom you are at war with. */
export function fightNaval(input: GameState, plan: NavalTactic[], now: number): ActionResult {
  const state = tick(input, now);
  const war = state.war;
  if (!war) return fail('You are not at war.');
  if (war.seaControl) return fail('You already command the sea.');
  if (state.fleet.ships <= 0) return fail('You have no ships.');
  if (plan.length !== 3) return fail('Choose a tactic for each of the three rounds.');
  const allowed = availableTactics(state).map((t) => t.id);
  if (plan.some((t) => !allowed.includes(t))) return fail('You have not studied that tactic.');
  const rival = state.world.rivals.find((r) => r.id === war.rivalId);
  if (!rival) return fail('Unknown kingdom.');
  const { report, shipsLeft, doctrinesProven } = resolveNaval(state, rival, plan, state.rngSeed + now, now);
  return {
    ok: true,
    state: {
      ...state,
      rngSeed: (state.rngSeed * 1103515245 + 12345) >>> 0,
      fleet: { ...state.fleet, ships: shipsLeft, lastEngagement: report },
      war: report.won ? { ...war, seaControl: true } : war,
      knowledge: doctrinesProven.reduce((k, id) => ((k[id] ?? 0) === 2 ? { ...k, [id]: 3 } : k), state.knowledge),
      reputation: state.reputation + (report.won ? 1 : 0),
      log: addLog(state.log, now, report.won ? `Your fleet won command of the sea against ${rival.name}.` : `Your fleet was beaten back by ${rival.name}.`),
    },
  };
}
