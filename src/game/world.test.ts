import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { breakPact, envoyBlocker, respondToOffer, sendEnvoy } from './diplomacy';
import { createNewGame, tick } from './engine';
import { migrateState } from './migrate';
import { getRates } from './selectors';
import { advanceWorld, envoySuccessChance, pactIncome, powerEstimate, relationLabel } from './worldCore';
import type { GameState } from './types';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;
const cfg = { name: 'Ama', civId: 'sikaman', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}
function rich(): GameState {
  const s = createNewGame(cfg, T0);
  return { ...s, reputation: 40, resources: { gold: 5000, food: 500, wood: 500, stone: 500 } };
}
function withRival(s: GameState, patch: Partial<GameState['world']['rivals'][number]>): GameState {
  const [first, ...rest] = s.world.rivals;
  return { ...s, world: { ...s.world, rivals: [{ ...first, ...patch }, ...rest] } };
}

describe('living world', () => {
  it('has four rival kingdoms, never the player\'s own', () => {
    const s = createNewGame(cfg, T0);
    assert.equal(s.world.rivals.length, 4);
    assert.ok(!s.world.rivals.some((r) => r.id === 'sikaman'));
    assert.equal(new Set(s.world.rivals.map((r) => r.trait)).size, 4);
  });

  it('turns on its own while away, and the catch-up is capped', () => {
    const s = createNewGame(cfg, T0);
    const later = tick(s, T0 + 3 * HOUR);
    assert.ok(later.world.turn >= 5);
    const long = tick(s, T0 + 500 * HOUR);
    assert.ok(long.world.turn <= 30);
    assert.ok(long.world.nextTurnAt > T0 + 500 * HOUR);
  });

  it('is deterministic for the same state', () => {
    const s = createNewGame(cfg, T0);
    assert.deepEqual(advanceWorld(s, T0 + 5 * HOUR).world, advanceWorld(s, T0 + 5 * HOUR).world);
  });

  it('rival power grows over time', () => {
    const s = createNewGame(cfg, T0);
    const later = tick(s, T0 + 10 * HOUR);
    assert.ok(later.world.rivals[0].power > s.world.rivals[0].power);
  });
});

describe('envoys and pacts', () => {
  it('gate proposals by trust and reputation', () => {
    const s = withRival(rich(), { relation: 0, pact: 'none' });
    const id = s.world.rivals[0].id;
    assert.ok(envoyBlocker(s, id, 'trade'));
    assert.ok(envoyBlocker(s, id, 'alliance'));
    assert.equal(envoyBlocker(s, id, 'goodwill'), null);
    const ok = withRival(rich(), { relation: 50 });
    assert.equal(envoyBlocker(ok, id, 'alliance'), null);
  });

  it('a goodwill envoy costs gold, arrives later and improves relations', () => {
    const s = withRival(rich(), { relation: 0 });
    const id = s.world.rivals[0].id;
    const sent = must(sendEnvoy(s, id, 'goodwill', T0)).state;
    assert.ok(sent.resources.gold < s.resources.gold);
    assert.ok(envoyBlocker(sent, id, 'goodwill')); // one envoy at a time
    const done = tick(sent, T0 + 600_000);
    assert.ok(done.world.rivals[0].relation > 0);
    assert.equal(done.world.envoys.length, 0);
    assert.equal(done.world.rivals[0].traitKnown, true);
  });

  it('a trade pact pays gold every hour and shows in the rates', () => {
    const s = withRival(rich(), { pact: 'trade', relation: 30 });
    assert.ok(pactIncome(s) > 0);
    assert.ok(getRates(s).income >= pactIncome(s));
  });

  it('breaking a pact costs relations and reputation', () => {
    const s = withRival(rich(), { pact: 'alliance', relation: 60 });
    const b = must(breakPact(s, s.world.rivals[0].id, T0)).state;
    assert.equal(b.world.rivals[0].pact, 'none');
    assert.ok(b.world.rivals[0].relation < 60);
    assert.equal(b.reputation, s.reputation - 1);
  });

  it('negotiation skill and temperament shape the odds', () => {
    const s = withRival(rich(), { trait: 'mercantile', relation: -20 });
    const r = s.world.rivals[0];
    const hi = { ...s, attributes: { ...s.attributes, negotiation: 9 } };
    assert.ok(envoySuccessChance(hi, r, 'trade') > envoySuccessChance(s, r, 'trade'));
    assert.ok(envoySuccessChance(s, r, 'trade') > envoySuccessChance(s, { ...r, trait: 'treacherous' }, 'trade'));
  });
});

describe('offers', () => {
  const offerState = (kind: 'trade' | 'tribute') => {
    const s = withRival(rich(), { relation: 10 });
    return {
      ...s,
      world: {
        ...s.world,
        offers: [{ id: 'o1', rivalId: s.world.rivals[0].id, kind, gold: 100, text: 't', expiresAt: 99 }],
      },
    };
  };
  it('accepting a trade offer creates a pact', () => {
    const r = must(respondToOffer(offerState('trade'), 'o1', true, T0)).state;
    assert.equal(r.world.rivals[0].pact, 'trade');
    assert.equal(r.world.offers.length, 0);
  });
  it('paying tribute costs gold; refusing it sours relations', () => {
    const paid = must(respondToOffer(offerState('tribute'), 'o1', true, T0)).state;
    assert.equal(paid.resources.gold, 5000 - 100);
    const refused = must(respondToOffer(offerState('tribute'), 'o1', false, T0)).state;
    assert.ok(refused.world.rivals[0].relation < 10);
  });
  it('unknown offers are refused politely', () => {
    assert.equal(respondToOffer(rich(), 'nope', true, T0).ok, false);
  });
});

describe('fog and saves', () => {
  it('shows only a rumour of rival strength without a bureau', () => {
    const s = rich();
    assert.ok(powerEstimate(s, s.world.rivals[0]).startsWith('Rumoured'));
    const b = { ...s, institutions: [{ typeId: 'bureau', level: 1, pending: null }] };
    assert.ok(powerEstimate(b, s.world.rivals[0]).startsWith('About'));
    assert.equal(relationLabel(0), 'Neutral');
  });
  it('a version 3 save upgrades with a world', () => {
    const { world: _w, ...rest } = createNewGame(cfg, T0);
    void _w;
    const m = migrateState(JSON.parse(JSON.stringify({ ...rest, version: 3 })));
    assert.ok(m);
    assert.equal(m.version, 11);
    assert.equal(m.world.rivals.length, 4);
  });
});
