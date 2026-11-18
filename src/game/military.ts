import { getInstitutionType } from '../data/institutions';
import { getKnowledgeEntry } from '../data/knowledge';
import { namePool } from '../data/names';
import { getOrder } from '../data/orders';
import { findScenario, getScenario } from '../data/scenarios';
import { emptyUnits, getUnitType, UNIT_IDS } from '../data/units';
import { autoOrder, availableOrders, getLeader, mulberry32, resolveRound } from './battle';
import { recordRealSuccess } from './masteryCore';
import { seaControlBlocker } from './navalCore';
import { allyCount } from './worldCore';
import { assessIntelligence, beliefFromReports, verifyReports } from './intelCore';
import {
  BATTLE_ROUNDS,
  BUILD_SLOTS,
  EXPEDITION_SECONDS,
  COMMANDER_BASE_COST_GOLD,
  FOOD_PER_MAN_PER_ROUND,
  INTEL_COST_GOLD,
  MAX_REPORTS,
  MAX_TRAINING_BATCHES,
  PROVISION_ROUNDS,
  SCENARIO_COOLDOWN_SECONDS,
} from './constants';
import { buildSeconds, canAfford, pay, upgradeCost } from './economy';
import { tick } from './engine';
import { addLog, fail } from './log';
import { buildReport } from './report';
import {
  bureauLevel,
  commanderCap,
  getArmyCapacity,
  getArmySize,
  getManpowerCap,
  institutionBlocker,
  institutionLevel,
  pendingCount,
  sumUnits,
  trainingSpeed,
} from './selectors';
import type {
  ActionResult,
  Battle,
  BattleResult,
  Commander,
  CommanderTrait,
  GameState,
  InstitutionInstance,
  OrderId,
  Provisions,
  Resources,
  UnitId,
} from './types';

function nextSeed(seed: number): number {
  return (Math.imul(seed, 1103515245) + 12345) % 2147483647 >>> 0;
}

// ---------------------------------------------------------------------------
// Institutions
// ---------------------------------------------------------------------------

export function buyInstitution(input: GameState, typeId: string, now: number): ActionResult {
  const state = tick(input, now);
  const type = getInstitutionType(typeId);
  if (state.institutions.some((i) => i.typeId === typeId)) return fail(`You already own a ${type.name}.`);
  const blocker = institutionBlocker(state, typeId);
  if (blocker) return fail(blocker + '.');
  if (pendingCount(state) >= BUILD_SLOTS) return fail('All builders are busy. Wait for a construction to finish.');
  if (!canAfford(state.resources, type.cost)) return fail('Not enough resources.');

  const seconds = buildSeconds(state, type, 1);
  const inst: InstitutionInstance = { typeId, level: 0, pending: { completesAt: now + seconds * 1000, targetLevel: 1 } };
  return {
    ok: true,
    state: {
      ...state,
      resources: pay(state.resources, type.cost),
      institutions: [...state.institutions, inst],
      reputation: state.reputation + 2,
      log: addLog(state.log, now, `Construction of the ${type.name} has begun.`),
    },
  };
}

export function upgradeInstitution(input: GameState, typeId: string, now: number): ActionResult {
  const state = tick(input, now);
  const type = getInstitutionType(typeId);
  const inst = state.institutions.find((i) => i.typeId === typeId);
  if (!inst) return fail('You do not own this institution.');
  if (inst.pending) return fail('Already under construction.');
  if (inst.level >= type.maxLevel) return fail('Already at maximum level.');
  if (pendingCount(state) >= BUILD_SLOTS) return fail('All builders are busy. Wait for a construction to finish.');
  const cost = upgradeCost(type, inst.level);
  if (!canAfford(state.resources, cost)) return fail('Not enough resources.');
  const target = inst.level + 1;
  const seconds = buildSeconds(state, type, target);
  return {
    ok: true,
    state: {
      ...state,
      resources: pay(state.resources, cost),
      institutions: state.institutions.map((i) =>
        i.typeId === typeId ? { ...i, pending: { completesAt: now + seconds * 1000, targetLevel: target } } : i,
      ),
      reputation: state.reputation + 1,
      log: addLog(state.log, now, `Upgrading the ${type.name} to level ${target}.`),
    },
  };
}

// ---------------------------------------------------------------------------
// Army and commanders
// ---------------------------------------------------------------------------

export function recruitCost(unitId: UnitId, count: number): Partial<Resources> {
  const cost = getUnitType(unitId).cost;
  const out: Partial<Resources> = {};
  for (const [k, v] of Object.entries(cost)) out[k as keyof Resources] = (v ?? 0) * count;
  return out;
}

export function recruitSeconds(state: GameState, unitId: UnitId, count: number): number {
  return Math.max(8, Math.round((count * getUnitType(unitId).trainSecondsEach) / trainingSpeed(state)));
}

export function recruitUnits(input: GameState, unitId: UnitId, count: number, now: number): ActionResult {
  const state = tick(input, now);
  const unit = getUnitType(unitId);
  if (!Number.isInteger(count) || count <= 0) return fail('Choose a number of soldiers.');
  if (institutionLevel(state, unit.requires.institution) < unit.requires.level) {
    return fail(`Requires ${getInstitutionType(unit.requires.institution).name} level ${unit.requires.level}.`);
  }
  if (state.battle) return fail('Your army is in the field.');
  if (state.army.training.length >= MAX_TRAINING_BATCHES) return fail('Your barracks are already training as many batches as they can.');
  const size = getArmySize(state);
  if (size + count > getArmyCapacity(state)) return fail(`Your barracks can hold at most ${getArmyCapacity(state)} soldiers. Upgrade them for more room.`);
  if (size + count > getManpowerCap(state)) return fail(`Your lands can spare at most ${getManpowerCap(state)} men. Grow your population by building businesses.`);
  const cost = recruitCost(unitId, count);
  if (!canAfford(state.resources, cost)) return fail('Not enough resources.');

  const seconds = recruitSeconds(state, unitId, count);
  return {
    ok: true,
    state: {
      ...state,
      resources: pay(state.resources, cost),
      army: { ...state.army, training: [...state.army.training, { unitId, count, completesAt: now + seconds * 1000 }] },
      log: addLog(state.log, now, `Training ${count} ${unit.name.toLowerCase()}.`),
    },
  };
}

export function commanderHireCost(state: GameState): number {
  return COMMANDER_BASE_COST_GOLD + 25 * state.commanders.length;
}

export function hireCommander(input: GameState, now: number): ActionResult {
  const state = tick(input, now);
  const level = institutionLevel(state, 'academy');
  if (level < 1) return fail('You need a Military Academy to train officers.');
  if (state.commanders.length >= commanderCap(state)) return fail('Your academy has no room for another commander. Upgrade it.');
  const cost = commanderHireCost(state);
  if (state.resources.gold < cost) return fail('Not enough gold.');

  let seed = nextSeed(state.rngSeed);
  const roll = (n: number) => {
    seed = nextSeed(seed);
    return seed % n;
  };
  const pool = namePool(state.player.civId).filter((n) => !state.commanders.some((c) => c.name === n));
  const name = (pool.length ? pool : namePool(state.player.civId))[roll(pool.length || 1)];
  const traits: CommanderTrait[] = ['bold', 'cautious', 'quartermaster', 'scholar'];
  const commander: Commander = {
    id: `cmd-${state.commanders.length + 1}-${seed % 1000}`,
    name,
    tactics: 3 + roll(3) + (level - 1),
    logistics: 3 + roll(3) + (level - 1),
    leadership: 3 + roll(3) + (level - 1),
    trait: traits[roll(traits.length)],
    xp: 0,
    battles: 0,
    victories: 0,
  };
  return {
    ok: true,
    state: {
      ...state,
      rngSeed: seed,
      resources: { ...state.resources, gold: state.resources.gold - cost },
      commanders: [...state.commanders, commander],
      army: { ...state.army, commanderId: state.army.commanderId ?? commander.id },
      log: addLog(state.log, now, `${commander.name} has taken a commission as your commander.`),
    },
  };
}

export function setCommander(input: GameState, commanderId: string | null, now: number): ActionResult {
  const state = tick(input, now);
  if (state.battle) return fail('You cannot change commanders during a battle.');
  if (commanderId && !state.commanders.some((c) => c.id === commanderId)) return fail('Unknown commander.');
  return { ok: true, state: { ...state, army: { ...state.army, commanderId } } };
}

// ---------------------------------------------------------------------------
// Battles
// ---------------------------------------------------------------------------

export function intelCost(level: 0 | 1 | 2): number {
  return level === 0 ? 0 : INTEL_COST_GOLD[level - 1];
}

export function provisionsFood(units: number, provisions: Provisions): number {
  return Math.ceil(units * FOOD_PER_MAN_PER_ROUND * PROVISION_ROUNDS[provisions]);
}

export function scenarioReadyIn(state: GameState, scenarioId: string, now: number): number {
  return Math.max(0, ((state.scenarioReadyAt[scenarioId] ?? 0) - now) / 1000);
}

export function startBattle(
  input: GameState,
  scenarioId: string,
  opts: { intel: 0 | 1 | 2; provisions: Provisions; reportIds?: string[] },
  now: number,
): ActionResult {
  const state = tick(input, now);
  const scenario = findScenario(scenarioId);
  if (!scenario) return fail('That enemy is no longer there.');
  if (state.battle || state.expedition) return fail(state.expedition ? 'Your army is away on an expedition.' : 'A battle is already under way.');
  if (state.reputation < scenario.requiresReputation) return fail(`Requires reputation ${scenario.requiresReputation}.`);
  if (scenarioReadyIn(state, scenarioId, now) > 0) return fail('The enemy has withdrawn for now. Try again later.');
  const seaBlock = seaControlBlocker(state, scenarioId);
  if (seaBlock) return fail(seaBlock);
  const men = sumUnits(state.army.units);
  if (men <= 0) return fail('You have no soldiers ready. Recruit some first.');

  const gold = intelCost(opts.intel);
  const food = provisionsFood(men, opts.provisions);
  if (state.resources.gold < gold) return fail('Not enough gold to send scouts.');
  if (state.resources.food < food) return fail('Not enough food for those provisions. Choose lighter provisions.');

  const leader = getLeader(state, state.army.commanderId);
  const supply =
    PROVISION_ROUNDS[opts.provisions] + (leader.trait === 'quartermaster' ? 1 : 0) + (leader.logistics >= 7 ? 1 : 0);
  const seed = nextSeed(state.rngSeed);
  const e = scenario.enemy;
  const chosen = state.intel.reports.filter((r) => (opts.reportIds ?? []).includes(r.id) && r.factionId === scenarioId);
  const { belief, sources } = beliefFromReports(chosen);
  const enemyInformed = mulberry32((seed + 424242) >>> 0)() < Math.max(0, 0.45 - 0.15 * bureauLevel(state));

  const battle: Battle = {
    id: `b-${now}-${seed % 1000}`,
    scenarioId,
    round: 0,
    maxRounds: BATTLE_ROUNDS,
    terrain: scenario.terrain,
    weather: scenario.weather,
    player: {
      units: { ...state.army.units },
      initial: { ...state.army.units },
      morale: Math.min(95, Math.max(40, 55 + leader.leadership * 4 + 3 * allyCount(state))),
      supply,
      leaderId: state.army.commanderId,
      provisions: opts.provisions,
    },
    enemy: {
      name: e.name,
      commander: e.commander,
      trait: e.trait,
      units: { ...e.units },
      initial: { ...e.units },
      morale: e.morale,
      supply: e.supply,
      fortified: e.fortified,
      basePosture: e.basePosture,
      lastStance: null,
    },
    intel: opts.intel,
    setup: null,
    lastOrder: null,
    repeatCount: 0,
    rounds: [],
    seed,
    delegated: false,
    belief,
    beliefSources: sources,
    enemyInformed,
  };

  return {
    ok: true,
    state: {
      ...state,
      rngSeed: seed,
      resources: { ...state.resources, gold: state.resources.gold - gold, food: state.resources.food - food },
      army: { ...state.army, units: emptyUnits() },
      battle,
      log: addLog(state.log, now, `${leader.name} leads ${men} soldiers against the ${e.name}.`),
    },
  };
}

/** Sends the army under its commander on a timed operation. It is resolved automatically when time is up, even while the app is closed. */
export function startExpedition(
  input: GameState,
  scenarioId: string,
  opts: { intel: 0 | 1 | 2; provisions: Provisions; reportIds?: string[] },
  now: number,
): ActionResult {
  const started = startBattle(input, scenarioId, opts, now);
  if (!started.ok) return started;
  const battle = { ...started.state.battle!, delegated: true };
  const seconds = EXPEDITION_SECONDS[getScenario(scenarioId).difficulty];
  const leader = getLeader(started.state, battle.player.leaderId);
  return {
    ok: true,
    state: {
      ...started.state,
      battle: null,
      expedition: { battle, startedAt: now, endsAt: now + seconds * 1000 },
      log: addLog(started.state.log, now, `${leader.name} marches on the ${battle.enemy.name}. Expected back in ${Math.round(seconds / 60)} minutes.`),
    },
  };
}

/** Ends the battle: returns survivors, pays rewards, trains the commander, files the report. */
export function concludeBattle(state: GameState, b: Battle, result: BattleResult, now: number): GameState {
  const scenario = getScenario(b.scenarioId);
  const report = buildReport(state, b, result, now);

  const rewards = { gold: 0, food: 0, wood: 0, stone: 0, reputation: 0 };
  if (result === 'victory') Object.assign(rewards, scenario.rewards);
  else if (result === 'stalemate') {
    rewards.gold = Math.round(scenario.rewards.gold / 2);
    rewards.food = Math.round(scenario.rewards.food / 2);
    rewards.wood = Math.round(scenario.rewards.wood / 2);
    rewards.stone = Math.round(scenario.rewards.stone / 2);
  } else if (result === 'defeat') rewards.reputation = -1;
  report.rewards = rewards;
  const assessment = assessIntelligence(state, b);
  report.intelligence = assessment.lines;
  report.lessons = [...report.lessons, ...assessment.lessons].slice(0, 6);

  const units = { ...state.army.units };
  for (const id of UNIT_IDS) units[id] += b.player.units[id];

  const win = result === 'victory';
  let war = state.war;
  let world = state.world;
  if (war && b.scenarioId === war.scenario.id && (result === 'victory' || result === 'defeat')) {
    war = { ...war, wins: war.wins + (win ? 1 : 0), losses: war.losses + (win ? 0 : 1) };
    world = {
      ...world,
      rivals: world.rivals.map((r) =>
        r.id === war!.rivalId ? { ...r, power: Math.round(r.power * (win ? 0.85 : 1.05) * 10) / 10 } : r,
      ),
    };
  }
  const attributes = {
    ...state.attributes,
    military: state.attributes.military + (win ? 0.5 : 0.25),
    leadership: state.attributes.leadership + (win ? 0.25 : 0),
  };

  const knowledge = { ...state.knowledge };
  let mastery = state.mastery;
  const counted = new Set<string>();
  let log = state.log;
  for (const r of b.rounds) {
    const doctrine = getOrder(r.order).doctrine;
    if (r.success === true && doctrine && !counted.has(doctrine)) {
      counted.add(doctrine);
      mastery = recordRealSuccess(mastery, doctrine, b.terrain);
    }
    if (r.success === true && doctrine && (knowledge[doctrine] ?? 0) < 3) {
      knowledge[doctrine] = 3;
      log = addLog(log, now, `Practical experience gained: ${getKnowledgeEntry(doctrine)?.title ?? doctrine}.`);
    }
  }

  const commanders = state.commanders.map((c) =>
    c.id === b.player.leaderId
      ? { ...c, xp: c.xp + (win ? 2 : 1), battles: c.battles + 1, victories: c.victories + (win ? 1 : 0) }
      : c,
  );

  const label = { victory: 'won', defeat: 'lost', withdrawn: 'withdrew from', stalemate: 'fought to a stalemate against' }[result];
  log = addLog(log, now, `You ${label} the ${scenario.name}.`);

  return {
    ...verifyReports(state, b.scenarioId),
    resources: {
      gold: state.resources.gold + rewards.gold,
      food: state.resources.food + rewards.food,
      wood: state.resources.wood + rewards.wood,
      stone: state.resources.stone + rewards.stone,
    },
    reputation: Math.max(0, state.reputation + rewards.reputation),
    attributes,
    knowledge,
    mastery,
    war,
    world,
    commanders,
    army: { ...state.army, units },
    battle: null,
    reports: [report, ...state.reports].slice(0, MAX_REPORTS),
    scenarioReadyAt: { ...state.scenarioReadyAt, [b.scenarioId]: now + SCENARIO_COOLDOWN_SECONDS * 1000 },
    log,
  };
}

export function issueOrder(input: GameState, order: OrderId, now: number): ActionResult {
  const state = tick(input, now);
  const b = state.battle;
  if (!b) return fail('There is no battle to command.');
  if (order !== 'retreat' && !availableOrders(state).includes(order)) return fail('You have not studied that doctrine yet.');
  const { battle, result } = resolveRound(state, b, order);
  if (result) return { ok: true, state: concludeBattle(state, battle, result, now) };
  return { ok: true, state: { ...state, battle } };
}

/** Hands the rest of the battle to the commander, who picks ordinary orders and sometimes errs. */
export function delegateBattle(input: GameState, now: number): ActionResult {
  let state = tick(input, now);
  if (!state.battle) return fail('There is no battle to delegate.');
  state = { ...state, battle: { ...state.battle, delegated: true } };
  for (let guard = 0; guard < 20 && state.battle; guard++) {
    const order = autoOrder(state, state.battle);
    const { battle, result } = resolveRound(state, state.battle, order);
    state = result ? concludeBattle(state, battle, result, now) : { ...state, battle };
  }
  return { ok: true, state };
}

/** Testing aid: some gold, materials and reputation so military features can be tried quickly. */
export function grantTestBoost(input: GameState, now: number): GameState {
  const state = tick(input, now);
  return {
    ...state,
    resources: {
      gold: state.resources.gold + 1500,
      food: state.resources.food + 400,
      wood: state.resources.wood + 300,
      stone: state.resources.stone + 300,
    },
    reputation: state.reputation + 20,
    log: addLog(state.log, now, 'Testing boost applied.'),
  };
}
