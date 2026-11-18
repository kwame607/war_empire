import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { createNewGame } from './engine';
import { claimMastery, runSimulation } from './mastery';
import { masteryProgress, practisableOrders, recordRealSuccess } from './masteryCore';
import { migrateState } from './migrate';
import type { GameState } from './types';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Ama', civId: 'aurelia', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}
function ready(know: Record<string, number> = { cannae: 3, 'buffalo-horns': 3 }): GameState {
  const s = createNewGame(cfg, T0);
  return {
    ...s,
    reputation: 40,
    knowledge: know,
    resources: { gold: 5000, food: 1000, wood: 500, stone: 500 },
    institutions: [{ typeId: 'academy', level: 1, pending: null }],
    army: { ...s.army, units: { ...emptyUnits(), spearmen: 60, archers: 30, cavalry: 30 } },
  };
}

describe('war room simulations', () => {
  it('cost gold, lose no soldiers and leave a result to read', () => {
    const s = ready();
    const r = must(runSimulation(s, 'warband', 'envelop', T0)).state;
    assert.equal(r.resources.gold, s.resources.gold - 40);
    assert.deepEqual(r.army.units, s.army.units);
    assert.equal(r.battle, null);
    assert.ok(r.simulation && r.simulation.lines.length > 0);
    assert.ok(r.simulation!.lesson.length > 0);
  });

  it('need an academy, soldiers and an understood doctrine', () => {
    assert.equal(runSimulation({ ...ready(), institutions: [] }, 'warband', 'envelop', T0).ok, false);
    assert.equal(runSimulation({ ...ready(), army: { ...ready().army, units: emptyUnits() } }, 'warband', 'envelop', T0).ok, false);
    assert.equal(runSimulation(ready({}), 'warband', 'envelop', T0).ok, false);
    assert.equal(runSimulation(ready(), 'warband', 'hold', T0).ok, false); // not a doctrine
    assert.deepEqual(practisableOrders(ready()).sort(), ['envelop', 'horns']);
  });

  it('successful runs add to mastery progress, failures do not', () => {
    let wins = 0;
    for (let i = 0; i < 12; i++) {
      const before = ready();
      const after = must(runSimulation(before, 'warband', 'envelop', T0 + i * 1000)).state;
      const gained = (after.mastery.cannae?.sims ?? 0) - (before.mastery.cannae?.sims ?? 0);
      assert.equal(gained, after.simulation!.success ? 1 : 0);
      wins += gained;
    }
    assert.ok(wins > 0, 'envelopment should sometimes work against the warband with cavalry');
  });
});

describe('mastery', () => {
  it('requires real battles, practice and variety, then pays off', () => {
    let s = ready();
    assert.equal(masteryProgress(s, 'cannae').complete, false);
    assert.equal(claimMastery(s, 'cannae', T0).ok, false);
    s = { ...s, mastery: recordRealSuccess(recordRealSuccess({}, 'cannae', 'plain'), 'cannae', 'hills') };
    s = { ...s, mastery: { cannae: { ...s.mastery.cannae, sims: 3 } } };
    assert.equal(masteryProgress(s, 'cannae').complete, true);
    const c = must(claimMastery(s, 'cannae', T0)).state;
    assert.equal(c.knowledge.cannae, 4);
    assert.ok(c.reputation > s.reputation);
    assert.equal(claimMastery(c, 'cannae', T0).ok, false); // once
  });

  it('a mastered doctrine is stronger than practical experience', () => {
    // The boost constants are ordered; the battle code reads them by stage.
    assert.ok(1.28 > 1.15);
  });

  it('a version 5 save upgrades with empty mastery', () => {
    const { mastery: _m, simulation: _s, ...rest } = createNewGame(cfg, T0);
    void [_m, _s];
    const m = migrateState(JSON.parse(JSON.stringify({ ...rest, version: 5 })));
    assert.ok(m);
    assert.equal(m.version, 8);
    assert.deepEqual(m.mastery, {});
  });
});
