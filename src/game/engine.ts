import { registerScenario } from '../data/scenarios';
import { territoryIncome } from './territoryCore';
import { resolveExpedition } from './expedition';
import { resolveMissions } from './intelCore';
import { advanceWorld, initWorld, pactIncome } from './worldCore';
import { getBackground, getDifficulty } from '../data/backgrounds';
import { getBusinessType } from '../data/businesses';
import { getCivilisation } from '../data/civilisations';
import { getInstitutionType } from '../data/institutions';
import { getKnowledgeEntry } from '../data/knowledge';
import { emptyUnits, getUnitType } from '../data/units';
import { getSettlement } from '../data/world';
import {
  BUILD_SLOTS,
  OFFLINE_CAP_SECONDS,
  SAVE_VERSION,
  SCOUT_COST_GOLD,
  SCOUT_SECONDS,
} from './constants';
import { buildSeconds, businessRates, canAfford, emptyResources, pay, RESOURCE_KEYS, upgradeCost } from './economy';
import { addLog, fail } from './log';
import { getArmyUpkeep, pendingCount, studyTimeMult } from './selectors';
import type {
  ActionResult,
  Attributes,
  BusinessInstance,
  GameState,
  InstitutionInstance,
  NewGameConfig,
  OfflineSummary,
  Resources,
} from './types';



// ---------------------------------------------------------------------------
// New game
// ---------------------------------------------------------------------------

export function createNewGame(config: NewGameConfig, now: number): GameState {
  const civ = getCivilisation(config.civId);
  const bg = getBackground(config.backgroundId);
  const diff = getDifficulty(config.difficultyId);

  const base: Resources = { gold: 500, food: 150, wood: 120, stone: 40 };
  const resources: Resources = { ...base };
  for (const k of RESOURCE_KEYS) resources[k] += bg.startResources[k] ?? 0;
  resources.gold = Math.round((resources.gold + civ.modifiers.startGoldBonus) * diff.startGoldMult);

  const attributes: Attributes = { intelligence: 3, leadership: 3, negotiation: 3, military: 3, administration: 3 };
  for (const [k, v] of Object.entries(bg.attributeBonus)) attributes[k as keyof Attributes] += v ?? 0;

  const start = getSettlement(civ.startSettlementId);

  return {
    version: SAVE_VERSION,
    player: {
      name: config.name.trim(),
      civId: civ.id,
      backgroundId: bg.id,
      difficultyId: diff.id,
      startSettlementId: start.id,
      createdAt: now,
    },
    resources,
    attributes,
    reputation: bg.startReputation,
    businesses: [],
    knowledge: {},
    study: null,
    scouting: null,
    explored: [start.id],
    lastTickAt: now,
    totalSeconds: 0,
    log: [{ at: now, text: `${config.name.trim()} begins a new life in ${start.name}.` }],
    institutions: [],
    army: { units: emptyUnits(), training: [], commanderId: null },
    commanders: [],
    battle: null,
    reports: [],
    scenarioReadyAt: {},
    rngSeed: Math.floor(now) % 2147483647,
    intel: { spies: [], missions: [], reports: [] },
    world: initWorld(civ.id, Math.floor(now) % 2147483647, now),
    expedition: null,
    mastery: {},
    simulation: null,
    war: null,
    territories: [],
  };
}

// ---------------------------------------------------------------------------
// Time: production, construction, study, scouting
// ---------------------------------------------------------------------------

/**
 * Advances the game to `now`.
 * - Construction, study and scouting always finish on time, even if the player was away.
 * - Production only counts the most recent OFFLINE_CAP_SECONDS, so nobody is punished for
 *   sleeping and nobody can bank weeks of income by never opening the app.
 */
export function tick(state: GameState, now: number): GameState {
  if (state.war) registerScenario(state.war.scenario);
  if (now < state.lastTickAt) return { ...state, lastTickAt: now }; // clock moved backwards
  if (now === state.lastTickAt) return state;

  const windowStart = Math.max(state.lastTickAt, now - OFFLINE_CAP_SECONDS * 1000);
  const countedSeconds = (now - windowStart) / 1000;

  let resources = { ...state.resources };
  let log = state.log;
  let reputation = state.reputation;
  const attributes = { ...state.attributes };
  const knowledge = { ...state.knowledge };
  let explored = state.explored;

  const businesses: BusinessInstance[] = state.businesses.map((inst) => {
    // Split the window around a completion so each part is paid at the right level.
    const segments: { level: number; seconds: number }[] = [];
    const pend = inst.pending;
    if (pend && pend.completesAt <= now) {
      const split = Math.max(windowStart, Math.min(pend.completesAt, now));
      segments.push({ level: inst.level, seconds: (split - windowStart) / 1000 });
      segments.push({ level: pend.targetLevel, seconds: (now - split) / 1000 });
    } else {
      segments.push({ level: inst.level, seconds: countedSeconds });
    }

    for (const seg of segments) {
      if (seg.level <= 0 || seg.seconds <= 0) continue;
      const rates = businessRates(state, inst.typeId, seg.level);
      const hours = seg.seconds / 3600;
      resources.gold += (rates.income - rates.expenses) * hours;
      if (rates.produces) resources[rates.produces.resource] += rates.produces.perHour * hours;
    }

    if (pend && pend.completesAt <= now) {
      const name = getBusinessType(inst.typeId).name;
      log = addLog(
        log,
        pend.completesAt,
        pend.targetLevel === 1 ? `${name} construction is complete.` : `${name} upgraded to level ${pend.targetLevel}.`,
      );
      return { ...inst, level: pend.targetLevel, pending: null };
    }
    return inst;
  });

  // Institutions: upkeep only (their value is capability, not income).
  const institutions: InstitutionInstance[] = state.institutions.map((inst) => {
    const pend = inst.pending;
    const type = getInstitutionType(inst.typeId);
    const done = pend && pend.completesAt <= now ? pend : null;
    const split = done ? Math.max(windowStart, Math.min(done.completesAt, now)) : now;
    const beforeSeconds = done ? (split - windowStart) / 1000 : countedSeconds;
    const afterSeconds = done ? (now - split) / 1000 : 0;
    if (inst.level > 0) resources.gold -= (type.upkeepPerHour * beforeSeconds) / 3600;
    if (done) {
      resources.gold -= (type.upkeepPerHour * afterSeconds) / 3600;
      log = addLog(
        log,
        done.completesAt,
        done.targetLevel === 1 ? `${type.name} is complete.` : `${type.name} upgraded to level ${done.targetLevel}.`,
      );
      return { ...inst, level: done.targetLevel, pending: null };
    }
    return inst;
  });

  // Army upkeep for the soldiers that exist at the start of the window.
  const upkeep = getArmyUpkeep(state);
  resources.gold -= (upkeep.gold * countedSeconds) / 3600;
  resources.food -= (upkeep.food * countedSeconds) / 3600;

  // Finished training batches join the army.
  const armyUnits = { ...state.army.units };
  const training = [];
  for (const batch of state.army.training) {
    if (batch.completesAt <= now) {
      armyUnits[batch.unitId] += batch.count;
      log = addLog(log, batch.completesAt, `${batch.count} ${getUnitType(batch.unitId).name} have finished training.`);
    } else {
      training.push(batch);
    }
  }

  resources.gold += pactIncome(state) * (countedSeconds / 3600);
  const land = territoryIncome(state);
  for (const k of RESOURCE_KEYS) resources[k] += land[k] * (countedSeconds / 3600);
  resources.gold = Math.max(0, resources.gold);
  resources.food = Math.max(0, resources.food);

  let study = state.study;
  if (study && study.completesAt <= now) {
    const entry = getKnowledgeEntry(study.entryId);
    knowledge[study.entryId] = Math.max(knowledge[study.entryId] ?? 0, 2);
    reputation += 1;
    attributes.intelligence += 0.5;
    if (study.entryId === 'cannae' || study.entryId === 'buffalo-horns') attributes.military += 0.5;
    log = addLog(log, study.completesAt, `Study complete: ${entry?.title ?? 'a historical record'}.`);
    study = null;
  }

  let scouting = state.scouting;
  if (scouting && scouting.completesAt <= now) {
    const s = getSettlement(scouting.settlementId);
    if (!explored.includes(s.id)) explored = [...explored, s.id];
    log = addLog(log, scouting.completesAt, `Scouts have returned from ${s.name}.`);
    scouting = null;
  }

  return resolveExpedition(
    advanceWorld(
    resolveMissions(
    {
      ...state,
      resources,
      reputation,
      attributes,
      knowledge,
      businesses,
      institutions,
      army: { ...state.army, units: armyUnits, training },
      study,
      scouting,
      explored,
      log,
      lastTickAt: now,
      totalSeconds: state.totalSeconds + countedSeconds,
    },
    now,
    ),
    now,
    ),
    now,
  );
}

/** Compares a state before and after a tick, for the "welcome back" report. */
export function buildOfflineSummary(before: GameState, after: GameState, now: number): OfflineSummary {
  const gained = emptyResources();
  for (const k of RESOURCE_KEYS) gained[k] = after.resources[k] - before.resources[k];
  const secondsAway = Math.max(0, (now - before.lastTickAt) / 1000);
  return {
    secondsAway,
    secondsCounted: Math.min(secondsAway, OFFLINE_CAP_SECONDS),
    gained,
    events: after.log.filter((e) => e.at > before.lastTickAt).map((e) => e.text),
  };
}

// ---------------------------------------------------------------------------
// Actions. Each returns a new state, or a human-readable reason it was refused.
// ---------------------------------------------------------------------------

export function buyBusiness(input: GameState, typeId: string, now: number): ActionResult {
  const state = tick(input, now);
  const type = getBusinessType(typeId);
  if (state.businesses.some((b) => b.typeId === typeId)) return fail(`You already own a ${type.name}.`);
  if (state.reputation < type.requiresReputation) return fail(`Requires reputation ${type.requiresReputation}.`);
  if (pendingCount(state) >= BUILD_SLOTS) return fail('All builders are busy. Wait for a construction to finish.');
  if (!canAfford(state.resources, type.cost)) return fail('Not enough resources.');

  const seconds = buildSeconds(state, type, 1);
  const instance: BusinessInstance = {
    typeId,
    level: 0,
    pending: { completesAt: now + seconds * 1000, targetLevel: 1 },
  };
  return {
    ok: true,
    state: {
      ...state,
      resources: pay(state.resources, type.cost),
      businesses: [...state.businesses, instance],
      reputation: state.reputation + 2,
      attributes: { ...state.attributes, administration: state.attributes.administration + 0.25 },
      log: addLog(state.log, now, `Construction of ${type.name} has begun.`),
    },
  };
}

export function upgradeBusiness(input: GameState, typeId: string, now: number): ActionResult {
  const state = tick(input, now);
  const type = getBusinessType(typeId);
  const inst = state.businesses.find((b) => b.typeId === typeId);
  if (!inst) return fail('You do not own this business.');
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
      businesses: state.businesses.map((b) =>
        b.typeId === typeId ? { ...b, pending: { completesAt: now + seconds * 1000, targetLevel: target } } : b,
      ),
      reputation: state.reputation + 1,
      attributes: {
        ...state.attributes,
        administration: state.attributes.administration + 0.25,
        negotiation: typeId === 'market' ? state.attributes.negotiation + 0.25 : state.attributes.negotiation,
      },
      log: addLog(state.log, now, `Upgrading ${type.name} to level ${target}.`),
    },
  };
}

/** Opening a record for the first time reveals its historical account (Discovery, free). */
export function discoverKnowledge(input: GameState, entryId: string, now: number): GameState {
  const state = tick(input, now);
  if ((state.knowledge[entryId] ?? 0) >= 1) return state;
  const entry = getKnowledgeEntry(entryId);
  if (!entry) return state;
  return {
    ...state,
    knowledge: { ...state.knowledge, [entryId]: 1 },
    log: addLog(state.log, now, `Discovered: ${entry.title}.`),
  };
}

export function studyCost(state: GameState, entryId: string): number {
  const entry = getKnowledgeEntry(entryId);
  if (!entry) return 0;
  return Math.round(entry.studyCost * getCivilisation(state.player.civId).modifiers.studyCostMult);
}

export function startStudy(input: GameState, entryId: string, now: number): ActionResult {
  const state = tick(input, now);
  const entry = getKnowledgeEntry(entryId);
  if (!entry) return fail('Unknown record.');
  const stage = state.knowledge[entryId] ?? 0;
  if (stage < 1) return fail('Examine the record first.');
  if (stage >= 2) return fail('You already understand this record.');
  if (state.study) return fail('Your scholars are already studying another record.');
  const cost = studyCost(state, entryId);
  if (state.resources.gold < cost) return fail('Not enough gold.');
  const seconds = Math.max(10, Math.round(entry.studySeconds * studyTimeMult(state)));
  return {
    ok: true,
    state: {
      ...state,
      resources: { ...state.resources, gold: state.resources.gold - cost },
      study: { entryId, completesAt: now + seconds * 1000, totalSeconds: seconds },
      log: addLog(state.log, now, `Scholars begin studying: ${entry.title}.`),
    },
  };
}

export function startScouting(input: GameState, settlementId: string, now: number): ActionResult {
  const state = tick(input, now);
  const s = getSettlement(settlementId);
  if (state.explored.includes(settlementId)) return fail('Already explored.');
  if (state.scouting) return fail('Scouts are already on a mission.');
  if (state.resources.gold < SCOUT_COST_GOLD) return fail('Not enough gold.');
  return {
    ok: true,
    state: {
      ...state,
      resources: { ...state.resources, gold: state.resources.gold - SCOUT_COST_GOLD },
      scouting: { settlementId, completesAt: now + SCOUT_SECONDS * 1000 },
      log: addLog(state.log, now, `Scouts set out toward ${s.name}.`),
    },
  };
}

/**
 * Developer/testing tool: pretend `seconds` have passed by moving every timestamp
 * back, then running the normal tick. Offline cap rules still apply.
 */
export function fastForward(state: GameState, seconds: number, now: number): GameState {
  const ms = seconds * 1000;
  const shifted: GameState = {
    ...state,
    lastTickAt: state.lastTickAt - ms,
    businesses: state.businesses.map((b) =>
      b.pending ? { ...b, pending: { ...b.pending, completesAt: b.pending.completesAt - ms } } : b,
    ),
    study: state.study ? { ...state.study, completesAt: state.study.completesAt - ms } : null,
    scouting: state.scouting ? { ...state.scouting, completesAt: state.scouting.completesAt - ms } : null,
    institutions: state.institutions.map((i) =>
      i.pending ? { ...i, pending: { ...i.pending, completesAt: i.pending.completesAt - ms } } : i,
    ),
    army: {
      ...state.army,
      training: state.army.training.map((b) => ({ ...b, completesAt: b.completesAt - ms })),
    },
    scenarioReadyAt: Object.fromEntries(Object.entries(state.scenarioReadyAt).map(([k, v]) => [k, v - ms])),
    intel: { ...state.intel, missions: state.intel.missions.map((m) => ({ ...m, completesAt: m.completesAt - ms })) },
    expedition: state.expedition ? { ...state.expedition, endsAt: state.expedition.endsAt - ms } : null,
    world: {
      ...state.world,
      nextTurnAt: state.world.nextTurnAt - ms,
      envoys: state.world.envoys.map((e) => ({ ...e, completesAt: e.completesAt - ms })),
    },
  };
  return tick(shifted, now);
}
