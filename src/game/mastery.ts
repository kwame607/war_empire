import { getKnowledgeEntry } from '../data/knowledge';
import { getOrder } from '../data/orders';
import { getScenario } from '../data/scenarios';
import { autoOrder, resolveRound } from './battle';
import { SIM_COST_GOLD } from './constants';
import { tick } from './engine';
import { addLog, fail } from './log';
import { startBattle } from './military';
import { EMPTY, masteryProgress } from './masteryCore';
import { institutionLevel, sumUnits } from './selectors';
import { NAVAL_TACTICS, resolveNaval } from './navalCore';
import type { ActionResult, GameState, NavalTactic, OrderId, SimulationResult } from './types';

/**
 * A war-room exercise: fight the chosen operation on the table with your current army.
 * It costs a little gold, loses no soldiers, and builds toward Mastery if the doctrine works.
 */
export function runSimulation(input: GameState, scenarioId: string, orderId: OrderId, now: number): ActionResult {
  const state = tick(input, now);
  const order = getOrder(orderId);
  if (!order.doctrine) return fail('Only doctrines can be practised in the war room.');
  if ((state.knowledge[order.doctrine] ?? 0) < 2) return fail('Study this doctrine first.');
  if (institutionLevel(state, 'academy') < 1) return fail('You need a Military Academy for a war room.');
  if (state.battle || state.expedition) return fail('Your army is busy.');
  if (sumUnits(state.army.units) <= 0) return fail('You need soldiers ready to practise with.');
  if (state.resources.gold < SIM_COST_GOLD) return fail(`Not enough gold (${SIM_COST_GOLD}).`);
  const scenario = getScenario(scenarioId);
  if (state.reputation < scenario.requiresReputation) return fail('You do not know enough of that enemy to simulate them.');

  // A sandbox copy: unlimited supplies, no cooldowns, a fresh seed each time.
  const sandbox: GameState = {
    ...state,
    rngSeed: (state.rngSeed + now + Object.values(state.mastery).reduce((a, m) => a + m.sims, 0) * 131) >>> 0,
    resources: { gold: 1e9, food: 1e9, wood: 1e9, stone: 1e9 },
    scenarioReadyAt: {},
  };
  const started = startBattle(sandbox, scenarioId, { intel: 2, provisions: 'ample' }, now);
  if (!started.ok) return fail(started.reason);
  const ctx = started.state;
  let battle = ctx.battle!;
  const lines: string[] = [];
  let success = false;
  let outcome: SimulationResult['outcome'] = 'stalemate';
  for (let i = 0; i < battle.maxRounds + 2; i++) {
    const o: OrderId = i < 2 ? orderId : autoOrder(ctx, battle);
    const { battle: next, result } = resolveRound(ctx, battle, o);
    const rec = next.rounds[next.rounds.length - 1];
    if (o === orderId && rec.success === true) success = true;
    lines.push(`Round ${rec.round}: ${getOrder(o).name}${rec.success === true ? ' (succeeded)' : rec.success === false ? ' (failed)' : ''}. Enemy stance: ${rec.stance}.`);
    battle = next;
    if (result) {
      outcome = result;
      break;
    }
  }
  const failNote = battle.rounds.find((r) => r.order === orderId && r.success === false)?.notes[0];
  const lesson = success
    ? `${order.name} worked on ${scenario.terrain} ground against the ${scenario.enemy.name}.`
    : failNote
      ? `It failed. ${failNote}`
      : `${order.name} never found its moment here. Check the conditions: ${order.needs ?? 'see the order'}.`;

  const sim: SimulationResult = { at: now, scenarioId, orderId, success, outcome, terrain: scenario.terrain, lines, lesson };
  let mastery = state.mastery;
  if (success) {
    const m = mastery[order.doctrine] ?? EMPTY;
    mastery = {
      ...mastery,
      [order.doctrine]: { ...m, sims: m.sims + 1, terrains: m.terrains.includes(scenario.terrain) ? m.terrains : [...m.terrains, scenario.terrain] },
    };
  }
  return {
    ok: true,
    state: {
      ...state,
      rngSeed: state.rngSeed,
      resources: { ...state.resources, gold: state.resources.gold - SIM_COST_GOLD },
      mastery,
      simulation: sim,
      log: addLog(state.log, now, `War room: ${order.name} on the ${scenario.name} ${success ? 'succeeded' : 'failed'}.`),
    },
  };
}

export function claimMastery(input: GameState, doctrine: string, now: number): ActionResult {
  const state = tick(input, now);
  const entry = getKnowledgeEntry(doctrine);
  if (!entry) return fail('Unknown record.');
  if ((state.knowledge[doctrine] ?? 0) < 3) return fail('You need Practical Experience first.');
  if ((state.knowledge[doctrine] ?? 0) >= 4) return fail('Already mastered.');
  if (!masteryProgress(state, doctrine).complete) return fail('The requirements are not yet met.');
  return {
    ok: true,
    state: {
      ...state,
      knowledge: { ...state.knowledge, [doctrine]: 4 },
      reputation: state.reputation + 3,
      attributes: { ...state.attributes, military: state.attributes.military + 1, intelligence: state.attributes.intelligence + 0.5 },
      log: addLog(state.log, now, `Mastery achieved: ${entry.title}.`),
    },
  };
}

/** A naval exercise in the war room: no ships are lost; a won exercise in which the doctrine worked counts toward Mastery. */
export function runNavalSimulation(input: GameState, rivalId: string, tactic: NavalTactic, now: number): ActionResult {
  const state = tick(input, now);
  const t = NAVAL_TACTICS.find((x) => x.id === tactic);
  if (!t?.doctrine) return fail('Only naval doctrines can be rehearsed.');
  if ((state.knowledge[t.doctrine] ?? 0) < 2) return fail('Study this doctrine first.');
  if (institutionLevel(state, 'academy') < 1) return fail('You need a Military Academy for a war room.');
  if (state.fleet.ships < 2) return fail('You need at least 2 warships to rehearse with.');
  if (state.resources.gold < SIM_COST_GOLD) return fail(`Not enough gold (${SIM_COST_GOLD}).`);
  const rival = state.world.rivals.find((r) => r.id === rivalId);
  if (!rival) return fail('Unknown kingdom.');
  const runs = Object.values(state.mastery).reduce((a, m) => a + m.sims, 0);
  const { report, doctrinesProven } = resolveNaval(state, rival, [tactic, tactic, 'line'], (state.rngSeed + now + runs * 131) >>> 0, now);
  const success = doctrinesProven.includes(t.doctrine);
  let mastery = state.mastery;
  if (success) {
    const m = mastery[t.doctrine] ?? EMPTY;
    mastery = { ...mastery, [t.doctrine]: { ...m, sims: m.sims + 1, terrains: m.terrains.includes(rivalId) ? m.terrains : [...m.terrains, rivalId] } };
  }
  return {
    ok: true,
    state: {
      ...state,
      resources: { ...state.resources, gold: state.resources.gold - SIM_COST_GOLD },
      mastery,
      fleet: { ...state.fleet, practice: { doctrine: t.doctrine, success, report } },
      log: addLog(state.log, now, `War room: ${t.name} against the ${rival.name} fleet ${success ? 'worked' : 'did not work'}.`),
    },
  };
}
