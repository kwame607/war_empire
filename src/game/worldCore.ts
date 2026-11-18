import { CIVILISATIONS } from '../data/civilisations';
import { mulberry32 } from './battle';
import {
  ALLIANCE_GOLD_PER_HOUR,
  OFFER_LIFETIME_TURNS,
  TRADE_PACT_GOLD_PER_HOUR,
  WORLD_MAX_CATCHUP_TURNS,
  WORLD_TURN_SECONDS,
} from './constants';
import { addLog } from './log';
import { bureauLevel, sumUnits } from './selectors';
import type { Envoy, GameState, Rival, RivalTrait, WorldState } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const TRAITS: RivalTrait[] = ['expansionist', 'mercantile', 'honourable', 'treacherous'];

export const TRAIT_LABEL: Record<RivalTrait, string> = {
  expansionist: 'Expansionist',
  mercantile: 'Mercantile',
  honourable: 'Honourable',
  treacherous: 'Treacherous',
};
export const TRAIT_HELP: Record<RivalTrait, string> = {
  expansionist: 'Grows fast and bullies weaker neighbours.',
  mercantile: 'Loves trade and is quick to offer pacts.',
  honourable: 'Keeps its word and values long friendships.',
  treacherous: 'Smiles while it plans to break its pacts.',
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The other kingdoms of the world. Their temperaments are shuffled per game, not tied to a culture. */
export function initWorld(playerCivId: string, seed: number, now: number): WorldState {
  const rng = mulberry32((seed + 77) >>> 0);
  const traits = [...TRAITS];
  for (let i = traits.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [traits[i], traits[j]] = [traits[j], traits[i]];
  }
  const rivals: Rival[] = CIVILISATIONS.filter((c) => c.id !== playerCivId).map((c, i) => ({
    id: c.id,
    name: c.name,
    trait: traits[i % traits.length],
    traitKnown: false,
    power: Math.round(28 + rng() * 40),
    relation: Math.round(rng() * 20 - 5),
    pact: 'none',
    lastRaidTurn: -99,
  }));
  return { turn: 0, nextTurnAt: now + WORLD_TURN_SECONDS * 1000, rivals, envoys: [], offers: [] };
}

export function playerPower(state: GameState): number {
  const training = state.army.training.reduce((a, t) => a + t.count, 0);
  return sumUnits(state.army.units) + training + (state.battle ? sumUnits(state.battle.player.units) : 0);
}

/** Gold per hour from pacts. */
export function pactIncome(state: GameState): number {
  let g = 0;
  for (const r of state.world.rivals) {
    if (r.pact === 'trade') g += TRADE_PACT_GOLD_PER_HOUR;
    if (r.pact === 'alliance') g += ALLIANCE_GOLD_PER_HOUR;
  }
  return g;
}

export function allyCount(state: GameState): number {
  return state.world.rivals.filter((r) => r.pact === 'alliance').length;
}

/** What the player can honestly know about a rival's strength. */
export function powerEstimate(state: GameState, rival: Rival): string {
  const mine = Math.max(1, playerPower(state));
  const ratio = rival.power / mine;
  const word = ratio < 0.7 ? 'weaker than you' : ratio < 1.3 ? 'a match for you' : ratio < 2.5 ? 'stronger than you' : 'far stronger than you';
  if (bureauLevel(state) >= 1) {
    const lo = Math.round((rival.power * 0.8) / 5) * 5;
    const hi = Math.round((rival.power * 1.2) / 5) * 5;
    return `About ${lo}–${hi} soldiers (${word})`;
  }
  return `Rumoured to be ${word}`;
}

export function relationLabel(r: number): string {
  if (r >= 60) return 'Devoted';
  if (r >= 30) return 'Friendly';
  if (r >= 8) return 'Warm';
  if (r > -8) return 'Neutral';
  if (r > -35) return 'Cold';
  if (r > -60) return 'Hostile';
  return 'At the brink of war';
}

// ---------------------------------------------------------------------------
// Envoys
// ---------------------------------------------------------------------------

export function envoySuccessChance(state: GameState, rival: Rival, kind: Envoy['kind']): number {
  const neg = state.attributes.negotiation;
  let p = 0.35 + 0.02 * rival.relation + 0.03 * neg;
  if (kind === 'trade' && rival.trait === 'mercantile') p += 0.15;
  if (kind === 'alliance' && rival.trait === 'honourable') p += 0.1;
  if (kind === 'alliance' && rival.trait === 'treacherous') p -= 0.1;
  if (kind === 'goodwill') p = 0.8 + 0.01 * neg;
  return clamp(p, 0.1, 0.95);
}

function resolveEnvoys(state: GameState, now: number): GameState {
  const due = state.world.envoys.filter((e) => e.completesAt <= now).sort((a, b) => a.completesAt - b.completesAt);
  if (due.length === 0) return state;
  let rivals = state.world.rivals;
  let log = state.log;
  let reputation = state.reputation;
  const gain = Math.floor(state.attributes.negotiation / 3);
  for (const e of due) {
    const rival = rivals.find((r) => r.id === e.rivalId);
    if (!rival) continue;
    const rng = mulberry32((hashString(e.id) + state.rngSeed) >>> 0);
    const ok = rng() < envoySuccessChance({ ...state, world: { ...state.world, rivals } }, rival, e.kind);
    let next: Rival = { ...rival, traitKnown: true };
    if (e.kind === 'goodwill') {
      const bump = 8 + gain + Math.floor(rng() * 6);
      next = { ...next, relation: clamp(rival.relation + bump, -100, 100) };
      log = addLog(log, e.completesAt, `Your envoy to ${rival.name} was received warmly. Relations improve.`);
    } else if (ok) {
      next = { ...next, pact: e.kind === 'trade' ? 'trade' : 'alliance', relation: clamp(rival.relation + 6, -100, 100) };
      if (e.kind === 'alliance') reputation += 2;
      log = addLog(log, e.completesAt, `${rival.name} agrees to a ${e.kind === 'trade' ? 'trade pact' : 'alliance'}.`);
    } else {
      next = { ...next, relation: clamp(rival.relation - 3, -100, 100) };
      log = addLog(log, e.completesAt, `${rival.name} declined your ${e.kind === 'trade' ? 'trade' : 'alliance'} proposal.`);
    }
    rivals = rivals.map((r) => (r.id === rival.id ? next : r));
  }
  return {
    ...state,
    reputation,
    log,
    world: { ...state.world, rivals, envoys: state.world.envoys.filter((e) => e.completesAt > now) },
  };
}

// ---------------------------------------------------------------------------
// The world turns on its own, whether or not the app is open.
// ---------------------------------------------------------------------------

function runTurn(state: GameState, at: number): GameState {
  const w = state.world;
  const turn = w.turn + 1;
  const rng = mulberry32((state.rngSeed + turn * 7919) >>> 0);
  let rivals = w.rivals.map((r) => ({ ...r }));
  let offers = w.offers.filter((o) => o.expiresAt > turn);
  let log = state.log;
  let gold = state.resources.gold;
  const mine = Math.max(1, playerPower(state));
  let allyLeft = false;
  void allyLeft;

  // Expired tribute demands count as refusals.
  for (const o of w.offers) {
    if (o.expiresAt <= turn && o.kind === 'tribute') {
      const r = rivals.find((x) => x.id === o.rivalId);
      if (r) r.relation = clamp(r.relation - 10, -100, 100);
      log = addLog(log, at, `You ignored ${r?.name ?? 'a rival'}'s demand for tribute. Relations worsen.`);
    }
  }

  for (const r of rivals) {
    const growth = r.trait === 'expansionist' ? 0.008 : r.trait === 'mercantile' ? 0.004 : 0.006;
    r.power = Math.round(r.power * (1 + growth * (0.5 + rng())) * 10) / 10;
    // Memory fades slowly, and allies drift closer.
    if (r.relation > 0 && r.pact === 'none') r.relation -= 0.5;
    if (r.relation < 0) r.relation += 0.5;
    if (r.pact !== 'none' && r.relation < 60) r.relation += 0.5;

    const roll = rng();
    const pending = (k: string) => offers.some((o) => o.rivalId === r.id && o.kind === k);
    const mk = (kind: 'trade' | 'alliance' | 'tribute', text: string, gold = 0) =>
      offers.push({ id: `o-${turn}-${r.id}-${kind}`, rivalId: r.id, kind, gold, text, expiresAt: turn + OFFER_LIFETIME_TURNS });

    if (r.pact === 'none' && roll < 0.1 && r.trait === 'mercantile' && r.relation >= 0 && !pending('trade')) {
      mk('trade', `${r.name} proposes a trade pact: caravans and customs in both directions.`);
    } else if (r.pact !== 'alliance' && roll < 0.08 && r.trait === 'honourable' && r.relation >= 40 && !pending('alliance')) {
      mk('alliance', `${r.name}, trusting your word, proposes an alliance.`);
    } else if (r.pact === 'none' && roll < 0.1 && r.trait === 'expansionist' && r.power > mine * 1.2 && r.relation < 25 && !pending('tribute')) {
      const demand = Math.max(60, Math.round(Math.min(gold * 0.1, 400)));
      mk('tribute', `${r.name} demands ${demand} gold in tribute, hinting at what their armies might do otherwise.`, demand);
    } else if (r.trait === 'treacherous' && r.pact !== 'none' && roll < 0.06) {
      r.pact = 'none';
      r.relation = clamp(r.relation - 40, -100, 100);
      log = addLog(log, at, `${r.name} broke its pact with you without warning. You should have been warier.`);
      r.traitKnown = true;
    } else if (roll > 0.97 && r.relation > -20) {
      r.relation = clamp(r.relation + 4, -100, 100);
      log = addLog(log, at, `A gift of fine goods arrives from ${r.name}.`);
    } else if (
      r.pact === 'none' &&
      turn - r.lastRaidTurn >= (state.war?.rivalId === r.id ? 3 : 6) &&
      ((state.war?.rivalId === r.id && r.power > mine * 0.5 && rng() < 0.4) ||
        (r.relation <= -40 && r.power > mine * 0.8 && rng() < 0.35))
    ) {
      const loot = Math.round(Math.min(gold * 0.15, 300));
      gold -= loot;
      r.lastRaidTurn = turn;
      log = addLog(log, at, `Raiders from ${r.name} struck your lands and carried off ${loot} gold. A larger army would deter them.`);
    }
  }

  return {
    ...state,
    resources: { ...state.resources, gold },
    log,
    world: { ...w, turn, nextTurnAt: w.nextTurnAt + WORLD_TURN_SECONDS * 1000, rivals, offers },
  };
}

export function advanceWorld(state: GameState, now: number): GameState {
  let s = resolveEnvoys(state, now);
  let guard = 0;
  // If the player was away a long time, only the most recent turns are played.
  const behind = Math.floor((now - s.world.nextTurnAt) / (WORLD_TURN_SECONDS * 1000)) + 1;
  if (behind > WORLD_MAX_CATCHUP_TURNS) {
    s = { ...s, world: { ...s.world, nextTurnAt: s.world.nextTurnAt + (behind - WORLD_MAX_CATCHUP_TURNS) * WORLD_TURN_SECONDS * 1000 } };
  }
  while (s.world.nextTurnAt <= now && guard++ < WORLD_MAX_CATCHUP_TURNS + 2) {
    s = runTurn(s, s.world.nextTurnAt);
  }
  return s;
}
