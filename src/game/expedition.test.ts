import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { createNewGame, fastForward, tick } from './engine';
import { migrateState } from './migrate';
import { startBattle, startExpedition } from './military';
import type { GameState } from './types';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Ama', civId: 'aurelia', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}
function ready(): GameState {
  const s = createNewGame(cfg, T0);
  return { ...s, reputation: 30, resources: { gold: 5000, food: 2000, wood: 500, stone: 500 }, army: { ...s.army, units: { ...emptyUnits(), spearmen: 40, archers: 20 } } };
}

describe('expeditions', () => {
  it('commit the army, food and nothing else, and block other battles', () => {
    const s = must(startExpedition(ready(), 'raiders', { intel: 0, provisions: 'standard' }, T0)).state;
    assert.ok(s.expedition);
    assert.equal(s.battle, null);
    assert.equal(s.army.units.spearmen, 0);
    assert.ok(s.resources.food < 2000);
    assert.equal(startBattle(s, 'warband', { intel: 0, provisions: 'standard' }, T0).ok, false);
    assert.equal(startExpedition(s, 'warband', { intel: 0, provisions: 'standard' }, T0).ok, false);
  });

  it('are still out before the time is up', () => {
    const s = must(startExpedition(ready(), 'raiders', { intel: 0, provisions: 'standard' }, T0)).state;
    const early = tick(s, T0 + 60_000);
    assert.ok(early.expedition);
    assert.equal(early.reports.length, 0);
  });

  it('resolve while the player is away: report filed, survivors home, cooldown set', () => {
    const s = must(startExpedition(ready(), 'raiders', { intel: 0, provisions: 'standard' }, T0)).state;
    const back = tick(s, T0 + 3 * 3_600_000);
    assert.equal(back.expedition, null);
    assert.equal(back.battle, null);
    assert.equal(back.reports.length, 1);
    assert.equal(back.reports[0].delegated, true);
    assert.ok(back.army.units.spearmen + back.army.units.archers > 0);
    assert.ok(back.scenarioReadyAt['raiders'] > T0);
  });

  it('testing time travel also brings the army home', () => {
    const s = must(startExpedition(ready(), 'raiders', { intel: 0, provisions: 'standard' }, T0)).state;
    const back = fastForward(s, 8 * 3600, T0 + 1000);
    assert.equal(back.expedition, null);
    assert.equal(back.reports.length, 1);
  });

  it('a version 4 save upgrades with no expedition', () => {
    const { expedition: _e, ...rest } = createNewGame(cfg, T0);
    void _e;
    const m = migrateState(JSON.parse(JSON.stringify({ ...rest, version: 4 })));
    assert.ok(m);
    assert.equal(m.version, 11);
    assert.equal(m.expedition, null);
  });
});
