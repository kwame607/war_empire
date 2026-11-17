import { namePool } from '../data/names';
import { getScenario } from '../data/scenarios';
import { SPY_HIRE_COST_GOLD, SPY_MISSION_COST_GOLD, SPY_MISSION_SECONDS } from './constants';
import { tick } from './engine';
import { addLog, fail } from './log';
import { bureauLevel, spyCap } from './selectors';
import type { ActionResult, GameState, IntelTopic, Spy } from './types';

function nextSeed(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

export function spyHireCost(state: GameState): number {
  return SPY_HIRE_COST_GOLD + 30 * state.intel.spies.length;
}

export function spyBusy(state: GameState, spyId: string): boolean {
  return state.intel.missions.some((m) => m.spyId === spyId);
}

export function hireSpy(input: GameState, now: number): ActionResult {
  const state = tick(input, now);
  const level = bureauLevel(state);
  if (level < 1) return fail('You need an Intelligence Bureau to recruit agents.');
  if (state.intel.spies.length >= spyCap(state)) return fail('Your bureau cannot run more agents. Upgrade it.');
  const cost = spyHireCost(state);
  if (state.resources.gold < cost) return fail('Not enough gold.');

  let seed = nextSeed(state.rngSeed);
  const roll = (n: number) => {
    seed = nextSeed(seed);
    return seed % n;
  };
  const taken = new Set(state.intel.spies.map((s) => s.name));
  const pool = namePool(state.player.civId).filter((n) => !taken.has(n));
  const name = (pool.length ? pool : namePool(state.player.civId))[roll(pool.length || namePool(state.player.civId).length)];
  const spy: Spy = {
    id: `spy-${state.intel.spies.length + 1}-${seed % 1000}`,
    name,
    skill: Math.min(10, 2 + roll(3) + (level - 1)),
    missions: 0,
    sound: 0,
    unsound: 0,
  };
  return {
    ok: true,
    state: {
      ...state,
      rngSeed: seed,
      resources: { ...state.resources, gold: state.resources.gold - cost },
      intel: { ...state.intel, spies: [...state.intel.spies, spy] },
      log: addLog(state.log, now, `${name} joins your intelligence bureau.`),
    },
  };
}

export function sendSpy(input: GameState, spyId: string, factionId: string, topic: IntelTopic, now: number): ActionResult {
  const state = tick(input, now);
  const spy = state.intel.spies.find((s) => s.id === spyId);
  if (!spy) return fail('That agent is not available.');
  if (spyBusy(state, spyId)) return fail(`${spy.name} is already on a mission.`);
  const scenario = getScenario(factionId);
  if (state.reputation < scenario.requiresReputation) return fail('You do not yet know enough of that rival to watch them.');
  if (state.battle) return fail('Your agents cannot be spared during a battle.');
  if (state.resources.gold < SPY_MISSION_COST_GOLD) return fail('Not enough gold for the mission.');
  const id = `m-${state.rngSeed}-${spy.id}-${state.intel.missions.length}-${Math.floor(now / 1000)}`;
  return {
    ok: true,
    state: {
      ...state,
      resources: { ...state.resources, gold: state.resources.gold - SPY_MISSION_COST_GOLD },
      intel: {
        ...state.intel,
        missions: [...state.intel.missions, { id, spyId, factionId, topic, completesAt: now + SPY_MISSION_SECONDS * 1000 }],
      },
      log: addLog(state.log, now, `${spy.name} sets out to watch the ${scenario.enemy.name}.`),
    },
  };
}
