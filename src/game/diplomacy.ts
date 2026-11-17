import { ENVOY_COST_GOLD, ENVOY_SECONDS } from './constants';
import { tick } from './engine';
import { addLog, fail } from './log';
import type { ActionResult, EnvoyKind, GameState } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function envoyBlocker(state: GameState, rivalId: string, kind: EnvoyKind): string | null {
  const r = state.world.rivals.find((x) => x.id === rivalId);
  if (!r) return 'Unknown kingdom.';
  if (state.world.envoys.some((e) => e.rivalId === rivalId)) return 'An envoy is already on the road to them.';
  if (kind === 'trade') {
    if (r.pact !== 'none') return 'You already have a pact.';
    if (r.relation < 15) return 'They do not trust you enough yet (relations 15 needed).';
  }
  if (kind === 'alliance') {
    if (r.pact === 'alliance') return 'You are already allies.';
    if (r.relation < 45) return 'They do not trust you enough yet (relations 45 needed).';
    if (state.reputation < 25) return 'Your name carries too little weight (reputation 25 needed).';
  }
  if (state.resources.gold < ENVOY_COST_GOLD[kind]) return `Not enough gold (${ENVOY_COST_GOLD[kind]}).`;
  return null;
}

export function sendEnvoy(input: GameState, rivalId: string, kind: EnvoyKind, now: number): ActionResult {
  const state = tick(input, now);
  const why = envoyBlocker(state, rivalId, kind);
  if (why) return fail(why);
  const r = state.world.rivals.find((x) => x.id === rivalId)!;
  return {
    ok: true,
    state: {
      ...state,
      resources: { ...state.resources, gold: state.resources.gold - ENVOY_COST_GOLD[kind] },
      world: {
        ...state.world,
        envoys: [...state.world.envoys, { id: `e-${state.world.turn}-${rivalId}-${kind}-${Math.floor(now / 1000)}`, rivalId, kind, completesAt: now + ENVOY_SECONDS * 1000 }],
      },
      log: addLog(state.log, now, `An envoy sets out for ${r.name}.`),
    },
  };
}

export function respondToOffer(input: GameState, offerId: string, accept: boolean, now: number): ActionResult {
  const state = tick(input, now);
  const offer = state.world.offers.find((o) => o.id === offerId);
  if (!offer) return fail('That offer is no longer open.');
  const r = state.world.rivals.find((x) => x.id === offer.rivalId);
  if (!r) return fail('Unknown kingdom.');
  let resources = state.resources;
  let rival = { ...r };
  let log = state.log;
  if (accept) {
    if (offer.kind === 'tribute') {
      if (resources.gold < offer.gold) return fail('You cannot afford the tribute.');
      resources = { ...resources, gold: resources.gold - offer.gold };
      rival.relation = clamp(rival.relation + 3, -100, 100);
      log = addLog(log, now, `You paid ${offer.gold} gold to ${r.name}. They are satisfied, for now.`);
    } else {
      rival.pact = offer.kind;
      rival.relation = clamp(rival.relation + 5, -100, 100);
      log = addLog(log, now, `You accepted ${r.name}'s ${offer.kind === 'trade' ? 'trade pact' : 'alliance'}.`);
    }
  } else {
    rival.relation = clamp(rival.relation - (offer.kind === 'tribute' ? 15 : 2), -100, 100);
    log = addLog(log, now, `You refused ${r.name}'s ${offer.kind === 'tribute' ? 'demand' : 'offer'}.`);
  }
  return {
    ok: true,
    state: {
      ...state,
      resources,
      log,
      world: {
        ...state.world,
        offers: state.world.offers.filter((o) => o.id !== offerId),
        rivals: state.world.rivals.map((x) => (x.id === rival.id ? rival : x)),
      },
    },
  };
}

export function breakPact(input: GameState, rivalId: string, now: number): ActionResult {
  const state = tick(input, now);
  const r = state.world.rivals.find((x) => x.id === rivalId);
  if (!r || r.pact === 'none') return fail('You have no pact with them.');
  const hit = r.pact === 'alliance' ? 35 : 25;
  return {
    ok: true,
    state: {
      ...state,
      reputation: Math.max(0, state.reputation - 1),
      world: { ...state.world, rivals: state.world.rivals.map((x) => (x.id === rivalId ? { ...x, pact: 'none', relation: clamp(x.relation - hit, -100, 100) } : x)) },
      log: addLog(state.log, now, `You broke your pact with ${r.name}. They will remember it.`),
    },
  };
}
