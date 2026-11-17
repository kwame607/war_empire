import { getOrder, ORDERS } from '../data/orders';
import { getUnitType, UNIT_IDS } from '../data/units';
import { armoryBonus, sumUnits } from './selectors';
import type {
  Battle,
  BattleResult,
  CommanderTrait,
  EnemyStance,
  GameState,
  OrderId,
  RoundRecord,
  Terrain,
  UnitClass,
  UnitCounts,
  Weather,
} from './types';

// ---------------------------------------------------------------------------
// Deterministic randomness: a battle replays identically from its seed.
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ---------------------------------------------------------------------------
// Leaders
// ---------------------------------------------------------------------------

export type Leader = {
  id: string | null;
  name: string;
  isPlayer: boolean;
  tactics: number;
  logistics: number;
  leadership: number;
  trait: CommanderTrait | null;
};

/** Hired commanders are usually better than the player at first; the player leads in person otherwise. */
export function getLeader(state: GameState, leaderId: string | null): Leader {
  const c = leaderId ? state.commanders.find((x) => x.id === leaderId) : undefined;
  if (c) {
    const level = Math.floor(c.xp / 3);
    return {
      id: c.id,
      name: c.name,
      isPlayer: false,
      tactics: c.tactics + level,
      logistics: c.logistics,
      leadership: c.leadership,
      trait: c.trait,
    };
  }
  const a = state.attributes;
  return {
    id: null,
    name: state.player.name,
    isPlayer: true,
    tactics: Math.round(a.military * 0.8 + a.intelligence * 0.2),
    logistics: Math.round(a.administration * 0.8),
    leadership: Math.round(a.leadership * 0.8),
    trait: null,
  };
}

// ---------------------------------------------------------------------------
// Army maths
// ---------------------------------------------------------------------------

type Shares = Record<UnitClass, number>;

const TERRAIN_MOD: Record<Terrain, Record<UnitClass, number>> = {
  plain: { infantry: 1, ranged: 1, cavalry: 1.2 },
  forest: { infantry: 1.1, ranged: 0.8, cavalry: 0.6 },
  hills: { infantry: 1.1, ranged: 1.15, cavalry: 0.8 },
  river: { infantry: 0.9, ranged: 0.9, cavalry: 0.7 },
  desert: { infantry: 0.9, ranged: 1, cavalry: 1 },
};

const WEATHER_MOD: Record<Weather, Record<UnitClass, number>> = {
  clear: { infantry: 1, ranged: 1, cavalry: 1 },
  rain: { infantry: 1, ranged: 0.8, cavalry: 0.9 },
  fog: { infantry: 1, ranged: 0.7, cavalry: 0.9 },
  heat: { infantry: 0.95, ranged: 1, cavalry: 0.9 },
};

const STANCE_MOD: Record<EnemyStance, { atk: number; def: number }> = {
  aggressive: { atk: 1.25, def: 0.85 },
  steady: { atk: 1, def: 1 },
  defensive: { atk: 0.6, def: 1.5 },
  reserve: { atk: 0.9, def: 1.1 },
};

/** Total strength per unit class (attack + defence), as a share of the whole. */
export function classShares(u: UnitCounts): Shares {
  const s: Shares = { infantry: 0, ranged: 0, cavalry: 0 };
  for (const id of UNIT_IDS) {
    const t = getUnitType(id);
    s[t.unitClass] += u[id] * (t.attack + t.defence);
  }
  const total = s.infantry + s.ranged + s.cavalry;
  if (total <= 0) return s;
  return { infantry: s.infantry / total, ranged: s.ranged / total, cavalry: s.cavalry / total };
}

function classStrength(u: UnitCounts, cls: UnitClass): number {
  let sum = 0;
  for (const id of UNIT_IDS) {
    const t = getUnitType(id);
    if (t.unitClass === cls) sum += u[id] * (t.attack + t.defence);
  }
  return sum;
}

export function totalStrength(u: UnitCounts): number {
  return classStrength(u, 'infantry') + classStrength(u, 'ranged') + classStrength(u, 'cavalry');
}

function power(u: UnitCounts, stat: 'attack' | 'defence', terrain: Terrain, weather: Weather, bonus: number): number {
  let sum = 0;
  for (const id of UNIT_IDS) {
    const t = getUnitType(id);
    sum += u[id] * t[stat] * TERRAIN_MOD[terrain][t.unitClass] * WEATHER_MOD[weather][t.unitClass] * bonus;
  }
  return sum;
}

function takeLosses(units: UnitCounts, frac: number, rng: () => number): { units: UnitCounts; lost: number } {
  const next = { ...units };
  let lost = 0;
  for (const id of UNIT_IDS) {
    const n = units[id];
    const x = n * frac;
    const whole = Math.floor(x);
    const l = Math.min(n, whole + (rng() < x - whole ? 1 : 0));
    next[id] = n - l;
    lost += l;
  }
  return { units: next, lost };
}

const isOpen = (t: Terrain) => t === 'plain' || t === 'desert';

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export function doctrineStage(state: GameState, orderId: OrderId): number {
  const d = getOrder(orderId).doctrine;
  return d ? (state.knowledge[d] ?? 0) : 99;
}

export function availableOrders(state: GameState): OrderId[] {
  return ORDERS.filter((o) => !o.doctrine || (state.knowledge[o.doctrine] ?? 0) >= 2).map((o) => o.id);
}

type Effect = {
  atk: number;
  def: number;
  enemyDef: number;
  enemyMorale: number;
  playerMorale: number;
  enemySupply: number;
  success: boolean | null;
  setup: Battle['setup'];
  notes: string[];
};

type Ctx = {
  battle: Battle;
  state: GameState;
  stance: EnemyStance;
  leader: Leader;
  pShare: Shares;
  eShare: Shares;
  pCav: number;
  eCav: number;
};

function evaluateOrder(order: OrderId, c: Ctx): Effect {
  const b = c.battle;
  const e: Effect = { atk: 1, def: 1, enemyDef: 1, enemyMorale: 0, playerMorale: 0, enemySupply: 0, success: null, setup: null, notes: [] };
  const trait = c.leader.trait;
  const open = isOpen(b.terrain);
  const committed = c.stance === 'aggressive' || c.stance === 'steady';
  const boost = (doctrine: string) =>
    ((c.state.knowledge[doctrine] ?? 0) >= 3 ? 1.15 : 1) * (trait === 'scholar' ? 1.1 : 1);

  switch (order) {
    case 'hold':
      e.def = 1.25 * (trait === 'cautious' ? 1.1 : 1);
      break;
    case 'advance':
      e.atk = 1.3 * (trait === 'bold' ? 1.1 : 1);
      e.def = 0.85;
      break;
    case 'concentrate':
      e.atk = 1.45 * (trait === 'bold' ? 1.1 : 1);
      e.def = 0.8;
      if (c.stance === 'reserve') {
        e.atk *= 0.75;
        e.notes.push('Enemy reserves struck the exposed concentration.');
      }
      break;
    case 'fortify':
      e.atk = 0.5;
      e.def = 1.7 * (b.terrain === 'hills' || b.terrain === 'forest' ? 1.15 : 1) * (trait === 'cautious' ? 1.1 : 1);
      break;
    case 'envelop': {
      if (b.setup?.kind !== 'envelop') {
        e.atk = 0.7;
        e.def = 0.9;
        e.setup = { kind: 'envelop' };
        e.notes.push('The centre gave ground, drawing the enemy in.');
        break;
      }
      const reasons: string[] = [];
      if (!open) reasons.push('the ground was not open enough for the flanks to close');
      if (c.pShare.cavalry < 1 / 6) reasons.push('you had too little cavalry to close the flanks');
      else if (c.pCav < 0.8 * c.eCav) reasons.push('enemy cavalry outmatched yours');
      if (!committed) reasons.push(`the enemy did not commit to the centre (it held a ${c.stance} stance)`);
      if (reasons.length === 0) {
        e.success = true;
        e.atk = 2.2 * boost('cannae');
        e.enemyDef = 0.6;
        e.enemyMorale = -30;
        e.notes.push('The centre held and both flanks closed. The enemy was surrounded.');
      } else {
        e.success = false;
        e.atk = 0.8;
        e.def = 0.7;
        e.playerMorale = -10;
        e.notes.push(`The envelopment failed: ${reasons.join('; ')}.`);
      }
      break;
    }
    case 'horns': {
      const reasons: string[] = [];
      if (b.enemy.fortified) reasons.push('the enemy was fortified and could not be swept round');
      if (c.stance === 'defensive' || c.stance === 'reserve') reasons.push(`the enemy held a ${c.stance} stance with its flanks guarded`);
      if (c.pShare.infantry < 0.5) reasons.push('too few of your troops were fast infantry');
      if (b.terrain === 'river') reasons.push('the river blocked the horns');
      if (c.eShare.cavalry >= 0.5) reasons.push('enemy horsemen rode round the horns and struck them first');
      if (reasons.length === 0) {
        e.success = true;
        e.atk = 1.9 * boost('buffalo-horns');
        e.def = 0.9;
        e.enemyDef = 0.75;
        e.enemyMorale = -12;
        e.notes.push('The chest pinned the enemy while the horns swept round both sides.');
      } else {
        e.success = false;
        e.atk = 0.9;
        e.def = 0.8;
        e.playerMorale = -6;
        e.notes.push(`The horns failed: ${reasons.join('; ')}.`);
      }
      break;
    }
    case 'feint': {
      if (b.setup?.kind !== 'feint') {
        e.atk = 0.4;
        e.def = 0.9;
        e.setup = { kind: 'feint' };
        e.notes.push('Your line fell back as if beaten.');
        break;
      }
      const reasons: string[] = [];
      const mobile = c.pShare.cavalry + c.pShare.ranged;
      if (mobile < 0.4) reasons.push('too few fast troops to turn and strike');
      if (!(open || b.terrain === 'hills')) reasons.push('the ground favoured the pursuers');
      if (c.stance !== 'aggressive') reasons.push(`the enemy did not give chase (it held a ${c.stance} stance)`);
      if (reasons.length === 0) {
        e.success = true;
        e.atk = 2.0 * boost('feigned-retreat');
        e.enemyDef = 0.7;
        e.enemyMorale = -25;
        e.notes.push('The pursuers were strung out. Your troops turned and fell on them.');
      } else {
        e.success = false;
        e.atk = 0.7;
        e.def = 0.7;
        e.playerMorale = -10;
        e.notes.push(`The feigned retreat failed: ${reasons.join('; ')}.`);
      }
      break;
    }
    case 'scorch':
      e.atk = 0.3;
      e.def = 1.1;
      e.enemySupply = -2;
      e.enemyMorale = -5;
      e.notes.push('You fell back, burning stores and fouling wells.');
      if (b.enemy.supply <= 0) {
        e.enemyMorale -= 6;
        e.notes.push('The starving enemy lost heart.');
      }
      break;
    case 'retreat':
      break;
  }
  return e;
}

// ---------------------------------------------------------------------------
// The enemy commander
// ---------------------------------------------------------------------------

function chooseEnemyStance(b: Battle, leader: Leader, rng: () => number): EnemyStance {
  const trait = b.enemy.trait;
  let s: EnemyStance = trait === 'impetuous' ? 'aggressive' : 'steady';
  if (b.enemy.basePosture) s = b.enemy.basePosture;
  // An enemy who learned of your army beforehand always reads your manoeuvres.
  const detect = rng() < Math.max(0.1, 0.5 - 0.04 * leader.tactics) || (b.enemyInformed && trait !== 'impetuous');

  if (b.setup?.kind === 'feint') {
    s = trait === 'impetuous' ? 'aggressive' : trait === 'cautious' ? 'steady' : detect ? 'reserve' : 'aggressive';
    if (b.enemy.basePosture === 'defensive') s = 'defensive';
  } else if (b.setup?.kind === 'envelop') {
    s = trait === 'cautious' ? 'steady' : trait === 'cunning' && detect ? 'reserve' : 'aggressive';
    if (b.enemy.basePosture === 'defensive') s = 'defensive';
  }
  if (b.enemy.morale < 35 && s === 'aggressive') s = 'steady';
  if (b.enemy.morale < 20) s = 'defensive';
  // A commander who sees the same thing three times in a row adapts.
  if (b.repeatCount >= 2 && trait !== 'impetuous') s = 'reserve';
  return s;
}

// ---------------------------------------------------------------------------
// Resolving a round
// ---------------------------------------------------------------------------

export type RoundOutcome = { battle: Battle; result: BattleResult | null };

export function resolveRound(state: GameState, battle: Battle, order: OrderId): RoundOutcome {
  const rng = mulberry32(battle.seed + battle.round * 7919 + 13);
  const leader = getLeader(state, battle.player.leaderId);
  const p = battle.player;
  const en = battle.enemy;
  const roundNo = battle.round + 1;

  // Retreat: break off, losing the rear guard.
  if (order === 'retreat') {
    const eCav = classShares(en.units).cavalry;
    const frac = 0.08 + 0.25 * eCav;
    const { units, lost } = takeLosses(p.units, frac, rng);
    const record: RoundRecord = {
      round: roundNo,
      order,
      stance: en.lastStance ?? 'steady',
      playerLoss: lost,
      enemyLoss: 0,
      playerMorale: p.morale,
      enemyMorale: en.morale,
      success: null,
      notes: [
        eCav > 0.25
          ? 'Enemy horse harried the withdrawal and cut down stragglers.'
          : 'The army broke off in good order, leaving a rear guard.',
      ],
    };
    return {
      battle: { ...battle, round: roundNo, player: { ...p, units }, rounds: [...battle.rounds, record], lastOrder: order },
      result: 'withdrawn',
    };
  }

  const stance = chooseEnemyStance(battle, leader, rng);
  const pShare = classShares(p.units);
  const eShare = classShares(en.units);
  const ctx: Ctx = {
    battle,
    state,
    stance,
    leader,
    pShare,
    eShare,
    pCav: classStrength(p.units, 'cavalry'),
    eCav: classStrength(en.units, 'cavalry'),
  };
  const eff = evaluateOrder(order, ctx);

  const bonus = armoryBonus(state);
  const pMoraleMult = 0.6 + 0.4 * (p.morale / 100);
  const eMoraleMult = 0.6 + 0.4 * (en.morale / 100);
  const pSupplyMult = p.supply > 0 ? 1 : 0.75;
  const eSupplyMult = en.supply > 0 ? 1 : 0.75;
  const tacticsMult = 1 + 0.025 * (leader.tactics - 3);
  const st = STANCE_MOD[stance];
  // A fortified garrison that has run out of supplies can no longer hold its works.
  const fort = en.fortified && stance !== 'aggressive' && en.supply > 0 ? 1.6 : 1;

  const pAtk = power(p.units, 'attack', battle.terrain, battle.weather, bonus) * eff.atk * pMoraleMult * pSupplyMult * tacticsMult;
  const pDef = power(p.units, 'defence', battle.terrain, battle.weather, bonus) * eff.def * pMoraleMult * pSupplyMult;
  const eAtk = power(en.units, 'attack', battle.terrain, battle.weather, 1) * st.atk * eMoraleMult * eSupplyMult;
  const eDef = power(en.units, 'defence', battle.terrain, battle.weather, 1) * st.def * fort * eff.enemyDef * eMoraleMult;

  const K = 0.38;
  const fEnemy = clamp((K * pAtk) / Math.max(1e-9, pAtk + eDef), 0.02, 0.4) * (0.92 + rng() * 0.16);
  const fPlayer = clamp((K * eAtk) / Math.max(1e-9, eAtk + pDef), 0.02, 0.4) * (0.92 + rng() * 0.16);

  const totalP = Math.max(1, sumUnits(p.units));
  const totalE = Math.max(1, sumUnits(en.units));
  const pRes = takeLosses(p.units, fPlayer, rng);
  const eRes = takeLosses(en.units, fEnemy, rng);

  const pMorale = clamp(
    p.morale - (pRes.lost / totalP) * 70 + (eRes.lost / totalE) * 20 + eff.playerMorale + (p.supply <= 0 ? -6 : 0) + 2,
    0,
    100,
  );
  const eMorale = clamp(
    en.morale - (eRes.lost / totalE) * 70 + (pRes.lost / totalP) * 15 + eff.enemyMorale + (en.supply <= 0 ? -7 : 0) + 1,
    0,
    100,
  );

  const notes = [...eff.notes];
  if (p.supply <= 0) notes.push('Your army is out of supplies: attack reduced and morale sinking.');
  if (en.supply <= 0) notes.push('The enemy is short of supplies.');
  notes.push(
    stance === 'aggressive'
      ? 'The enemy pressed forward aggressively.'
      : stance === 'defensive'
        ? 'The enemy stayed behind its defences.'
        : stance === 'reserve'
          ? 'The enemy held back reserves and guarded its flanks.'
          : 'The enemy held a steady line.',
  );

  const record: RoundRecord = {
    round: roundNo,
    order,
    stance,
    playerLoss: pRes.lost,
    enemyLoss: eRes.lost,
    playerMorale: Math.round(pMorale),
    enemyMorale: Math.round(eMorale),
    success: eff.success,
    notes,
  };

  const next: Battle = {
    ...battle,
    round: roundNo,
    player: { ...p, units: pRes.units, morale: pMorale, supply: p.supply - 1 },
    enemy: {
      ...en,
      units: eRes.units,
      morale: eMorale,
      supply: en.supply - 1 + eff.enemySupply,
      lastStance: stance,
    },
    setup: eff.setup,
    repeatCount: order === battle.lastOrder ? battle.repeatCount + 1 : 0,
    lastOrder: order,
    rounds: [...battle.rounds, record],
  };

  return { battle: next, result: decide(next) };
}

function decide(b: Battle): BattleResult | null {
  const pFrac = sumUnits(b.player.units) / Math.max(1, sumUnits(b.player.initial));
  const eFrac = sumUnits(b.enemy.units) / Math.max(1, sumUnits(b.enemy.initial));
  const pBroken = b.player.morale <= 0 || pFrac <= 0.15;
  const eBroken = b.enemy.morale <= 0 || eFrac <= 0.15;
  if (pBroken && eBroken) return pFrac * b.player.morale >= eFrac * b.enemy.morale ? 'victory' : 'defeat';
  if (eBroken) return 'victory';
  if (pBroken) return 'defeat';
  if (b.round >= b.maxRounds) {
    const ps = pFrac * (0.5 + b.player.morale / 200);
    const es = eFrac * (0.5 + b.enemy.morale / 200);
    if (ps - es > 0.1) return 'victory';
    if (es - ps > 0.1) return 'defeat';
    return 'stalemate';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Delegation: the commander chooses ordinary orders, and sometimes errs.
// ---------------------------------------------------------------------------

export function autoOrder(state: GameState, battle: Battle): OrderId {
  const rng = mulberry32(battle.seed + battle.round * 104729 + 7);
  const leader = getLeader(state, battle.player.leaderId);
  const basic: OrderId[] = ['hold', 'advance', 'concentrate', 'fortify'];
  const mistake = rng() < Math.max(0.08, 0.35 - 0.03 * leader.tactics);
  if (mistake) return basic[Math.floor(rng() * basic.length)];

  const ratio = totalStrength(battle.player.units) / Math.max(1, totalStrength(battle.enemy.units));
  if (battle.player.morale < 20 && ratio < 0.6) return 'retreat';
  if (leader.trait === 'cautious' && ratio < 1.3) return ratio < 0.9 ? 'fortify' : 'hold';
  if (ratio > 1.25) return leader.trait === 'bold' ? 'concentrate' : 'advance';
  if (ratio > 0.85) return 'hold';
  return 'fortify';
}

// ---------------------------------------------------------------------------
// What the player is allowed to know (Fog of Knowledge)
// ---------------------------------------------------------------------------

export type EnemyEstimate = {
  exact: boolean;
  total: [number, number];
  classes: Record<UnitClass, [number, number]> | null;
  units: UnitCounts | null;
  source: 'rumour' | 'scouts' | 'spy' | 'report';
};

function rangeOf(n: number, spread: number): [number, number] {
  return [Math.max(0, Math.floor(n * (1 - spread))), Math.ceil(n * (1 + spread))];
}

export function estimateEnemy(b: Battle): EnemyEstimate {
  const u = b.enemy.units;
  const byClass: Record<UnitClass, number> = { infantry: 0, ranged: 0, cavalry: 0 };
  for (const id of UNIT_IDS) byClass[getUnitType(id).unitClass] += u[id];
  const total = sumUnits(u);
  if (b.intel >= 2) return { exact: true, total: [total, total], classes: null, units: u, source: 'spy' };
  if (b.intel === 0 && b.belief.size) {
    return { exact: false, total: b.belief.size.total, classes: b.belief.size.classes ?? null, units: null, source: 'report' };
  }
  const spread = b.intel === 1 ? 0.15 : 0.4;
  return {
    exact: false,
    total: rangeOf(total, spread),
    classes:
      b.intel === 1
        ? {
            infantry: rangeOf(byClass.infantry, spread),
            ranged: rangeOf(byClass.ranged, spread),
            cavalry: rangeOf(byClass.cavalry, spread),
          }
        : null,
    units: null,
    source: b.intel === 1 ? 'scouts' : 'rumour',
  };
}

/** What the player believes about the enemy's class shares, for the order checklist. */
function believedShares(b: Battle): Shares | null {
  if (b.intel >= 1) return classShares(b.enemy.units);
  const c = b.belief.size?.classes;
  if (!c) return null;
  const mid = (r: [number, number]) => (r[0] + r[1]) / 2;
  const i = mid(c.infantry), r = mid(c.ranged), v = mid(c.cavalry);
  const t = Math.max(1, i + r + v);
  return { infantry: i / t, ranged: r / t, cavalry: v / t } as Shares;
}

export type Check = { label: string; status: 'ok' | 'bad' | 'unknown' };

/** A checklist for the command window, using only what the player can know. */
export function orderChecks(state: GameState, battle: Battle, order: OrderId): Check[] {
  const pShare = classShares(battle.player.units);
  const open = isOpen(battle.terrain);
  const seen = battle.enemy.lastStance;
  const believed = believedShares(battle);
  const knowsEnemy = believed !== null;
  const eShare = believed ?? classShares(battle.enemy.units);
  const knownFort: boolean | null = battle.intel >= 1 ? battle.enemy.fortified : (battle.belief.fortified ?? null);
  const knownSupply: number | null = battle.intel >= 2 ? battle.enemy.supply : (battle.belief.supply ?? null);
  void state;

  const yn = (ok: boolean): 'ok' | 'bad' => (ok ? 'ok' : 'bad');
  switch (order) {
    case 'envelop': {
      const pCav = classStrength(battle.player.units, 'cavalry');
      const eCav = classStrength(battle.enemy.units, 'cavalry');
      return [
        { label: 'Open ground', status: yn(open) },
        { label: 'Cavalry at least a sixth of your strength', status: yn(pShare.cavalry >= 1 / 6) },
        { label: 'Enemy cavalry not stronger than yours', status: !knowsEnemy ? 'unknown' : battle.intel >= 1 ? yn(pCav >= 0.8 * eCav) : yn(pShare.cavalry >= 0.8 * eShare.cavalry) },
        {
          label: 'Enemy commits to the centre',
          status: seen === null ? 'unknown' : yn(seen === 'aggressive' || seen === 'steady'),
        },
      ];
    }
    case 'horns':
      return [
        { label: 'Mostly infantry', status: yn(pShare.infantry >= 0.5) },
        { label: 'Not a river crossing', status: yn(battle.terrain !== 'river') },
        { label: 'Enemy not fortified', status: knownFort === null ? 'unknown' : yn(!knownFort) },
        { label: 'Enemy not mostly horsemen', status: knowsEnemy ? yn(eShare.cavalry < 0.5) : 'unknown' },
        {
          label: 'Enemy not holding reserves or defences',
          status: seen === null ? 'unknown' : yn(seen !== 'defensive' && seen !== 'reserve'),
        },
      ];
    case 'feint':
      return [
        { label: 'Cavalry and archers at least 40%', status: yn(pShare.cavalry + pShare.ranged >= 0.4) },
        { label: 'Open or high ground', status: yn(open || battle.terrain === 'hills') },
        {
          label: 'Enemy gives chase',
          status: seen === null ? 'unknown' : yn(seen === 'aggressive'),
        },
      ];
    case 'scorch':
      return [
        { label: 'Enemy supplies running low', status: knownSupply === null ? 'unknown' : yn(knownSupply <= 3) },
        { label: 'You can survive several rounds', status: yn(totalStrength(battle.player.units) >= 0.6 * totalStrength(battle.enemy.units) || battle.intel < 1) },
      ];
    case 'concentrate':
      return [{ label: 'Enemy is not holding reserves', status: seen === null ? 'unknown' : yn(seen !== 'reserve') }];
    case 'fortify':
      return [{ label: 'Hills or forest give extra cover', status: yn(battle.terrain === 'hills' || battle.terrain === 'forest') }];
    default:
      return [];
  }
}
