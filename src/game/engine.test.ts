import { getBusinessType } from '../data/businesses';
import { GOLD_INCOME_MULT } from './economy';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OFFLINE_CAP_SECONDS } from './constants';
import {
  buyBusiness,
  createNewGame,
  discoverKnowledge,
  fastForward,
  startScouting,
  startStudy,
  tick,
  upgradeBusiness,
} from './engine';
import { getPopulation, getStageIndex } from './selectors';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Kofi', civId: 'sikaman', backgroundId: 'merchant', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}

/** One-time reward for owning a first business (see data/achievements). */
const FIRST_TRADE_BONUS = 40;
const FARM_NET = getBusinessType('farm').incomePerHour * 1.1 * GOLD_INCOME_MULT - 8;

describe('new game', () => {
  it('applies civilisation, background and difficulty', () => {
    const s = createNewGame(cfg, T0);
    assert.equal(s.resources.gold, 650); // 500 + 150 merchant, x1 standard
    assert.equal(s.attributes.negotiation, 5);
    assert.deepEqual(s.explored, ['sikaman-crossing']);
    const harsh = createNewGame({ ...cfg, civId: 'serene', difficultyId: 'harsh' }, T0);
    assert.equal(harsh.resources.gold, Math.round((650 + 100) * 0.7));
  });
});

describe('businesses', () => {
  it('buying takes gold, starts a timer, and produces nothing until built', () => {
    const s0 = createNewGame(cfg, T0);
    const s1 = must(buyBusiness(s0, 'farm', T0)).state;
    assert.equal(s1.resources.gold, 500);
    assert.equal(s1.businesses[0].level, 0);
    const mid = tick(s1, T0 + 10_000);
    assert.equal(mid.resources.gold, 500 + FIRST_TRADE_BONUS);
    assert.equal(mid.businesses[0].level, 0);
  });

  it('finishes on time and pays from completion onward', () => {
    const s1 = must(buyBusiness(createNewGame(cfg, T0), 'farm', T0)).state;
    const done = tick(s1, T0 + 20_000 + 3_600_000); // 20s build + 1h
    assert.equal(done.businesses[0].level, 1);
    // farm: (25*1.10*pace - 8) gold/h for ~1h
    assert.ok(Math.abs(done.resources.gold - (500 + FIRST_TRADE_BONUS + FARM_NET)) < 0.01, String(done.resources.gold));
    assert.ok(Math.abs(done.resources.food - (150 + 20)) < 0.01);
  });

  it('enforces affordability, ownership, reputation and builder slots', () => {
    const s0 = createNewGame(cfg, T0);
    assert.equal(buyBusiness(s0, 'market', T0).ok, false); // reputation
    const a = must(buyBusiness(s0, 'farm', T0)).state;
    assert.equal(buyBusiness(a, 'farm', T0).ok, false); // already owned
    const b = must(buyBusiness(a, 'timber', T0)).state;
    const c = createNewGame(cfg, T0);
    c.reputation = 99;
    c.resources.gold = 99999;
    const x = must(buyBusiness(c, 'farm', T0)).state;
    const y = must(buyBusiness(x, 'timber', T0)).state;
    assert.equal(buyBusiness(y, 'quarry', T0).ok, false); // both builders busy
    assert.equal(b.businesses.length, 2);
    const poor = createNewGame(cfg, T0);
    poor.resources.gold = 10;
    assert.equal(buyBusiness(poor, 'farm', T0).ok, false);
  });

  it('upgrades after construction and raises income', () => {
    const rich = createNewGame(cfg, T0);
    rich.resources.gold = 5000;
    const built = tick(must(buyBusiness(rich, 'farm', T0)).state, T0 + 30_000);
    assert.equal(built.businesses[0].level, 1);
    const up = must(upgradeBusiness(built, 'farm', T0 + 30_000)).state;
    assert.equal(up.businesses[0].pending?.targetLevel, 2);
    const later = tick(up, T0 + 30_000 + 60_000);
    assert.equal(later.businesses[0].level, 2);
    assert.equal(getPopulation(later), 12 + 3 * 2);
  });

  it('reputation rises and stage advances', () => {
    const s = must(buyBusiness(createNewGame(cfg, T0), 'farm', T0)).state;
    const t = must(buyBusiness(s, 'timber', T0)).state;
    assert.equal(t.reputation, 4);
    assert.equal(getStageIndex(t), 1);
  });
});

describe('offline progression', () => {
  it('caps production at 12 hours but not construction', () => {
    const rich = createNewGame(cfg, T0);
    rich.resources.gold = 5000;
    const s1 = must(buyBusiness(rich, 'farm', T0)).state;
    const away = tick(s1, T0 + 100 * 3_600_000); // 100 hours away
    assert.equal(away.businesses[0].level, 1);
    const expected = 5000 - 150 + FIRST_TRADE_BONUS + FARM_NET * (OFFLINE_CAP_SECONDS / 3600);
    assert.ok(Math.abs(away.resources.gold - expected) < 0.01, `${away.resources.gold} vs ${expected}`);
    assert.equal(away.totalSeconds, OFFLINE_CAP_SECONDS);
  });

  it('survives the clock moving backwards', () => {
    const s = createNewGame(cfg, T0);
    const back = tick(s, T0 - 5000);
    assert.equal(back.lastTickAt, T0 - 5000);
    assert.equal(back.resources.gold, s.resources.gold);
  });

  it('fast-forward matches real elapsed time', () => {
    const s1 = must(buyBusiness(createNewGame(cfg, T0), 'farm', T0)).state;
    const ff = fastForward(s1, 3600, T0);
    assert.equal(ff.businesses[0].level, 1);
    assert.ok(ff.resources.gold > s1.resources.gold);
  });
});

describe('knowledge and scouting', () => {
  it('discover, study, and unlock understanding', () => {
    const s0 = createNewGame(cfg, T0);
    assert.equal(startStudy(s0, 'cannae', T0).ok, false); // must examine first
    const s1 = discoverKnowledge(s0, 'cannae', T0);
    assert.equal(s1.knowledge.cannae, 1);
    const s2 = must(startStudy(s1, 'cannae', T0)).state;
    assert.equal(s2.resources.gold, 650 - 80);
    assert.equal(startStudy(s2, 'cannae', T0).ok, false); // one at a time
    const s3 = tick(s2, T0 + 61_000);
    assert.equal(s3.knowledge.cannae, 2);
    assert.equal(s3.reputation, s2.reputation + 1 + 2); // +2: 'A Lesson Learned' achievement
  });

  it('scouting reveals a settlement after its timer', () => {
    const s1 = must(startScouting(createNewGame(cfg, T0), 'dunemark', T0)).state;
    assert.equal(s1.explored.includes('dunemark'), false);
    const s2 = tick(s1, T0 + 46_000);
    assert.equal(s2.explored.includes('dunemark'), true);
    assert.equal(startScouting(s2, 'dunemark', T0 + 46_000).ok, false);
  });
});
