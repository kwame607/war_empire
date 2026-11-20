import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { createNewGame, tick } from './engine';
import { migrateState } from './migrate';
import { getRates } from './selectors';
import { garrisonNeeded, holdingYield, territoryIncome } from './territoryCore';
import { makePeace } from './war';
import { annexable, buildWarScenario } from './warCore';
import type { GameState, War } from './types';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;
const cfg = { name: 'Ama', civId: 'sikaman', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}
function atWar(wins: number, losses = 0, rivalIndex = 0): { s: GameState; war: War } {
  const base = createNewGame(cfg, T0);
  const rival = base.world.rivals[rivalIndex];
  const war: War = { rivalId: rival.id, scenario: buildWarScenario(rival, 1), wins, losses, startedAt: T0 };
  return { s: { ...base, reputation: 30, war }, war };
}

describe('territory', () => {
  it('kingdoms hold their capital and provinces', () => {
    const s = createNewGame(cfg, T0);
    for (const r of s.world.rivals) assert.ok(r.holdings.length >= 1);
    assert.equal(s.territories.length, 0);
  });

  it('provinces can be taken only after enough victories, never the capital', () => {
    const fighters = createNewGame(cfg, T0).world.rivals.findIndex((r) => r.holdings.length >= 3);
    const { s, war } = atWar(1, 0, fighters);
    const rival = s.world.rivals[fighters];
    assert.deepEqual(annexable(war, rival), []);
    const strong = { ...war, wins: 2 };
    const list = annexable(strong, rival);
    assert.ok(list.length >= 1);
    assert.ok(!list.includes(rival.holdings[0]));
  });

  it('annexing ends the war, moves the province and weakens the rival', () => {
    const idx = createNewGame(cfg, T0).world.rivals.findIndex((r) => r.holdings.length >= 3);
    const { s, war } = atWar(2, 0, idx);
    const rival = s.world.rivals[idx];
    const target = annexable(war, rival)[0];
    const done = must(makePeace({ ...s, war }, T0, target)).state;
    assert.equal(done.war, null);
    assert.ok(done.territories.includes(target));
    assert.ok(!done.world.rivals[idx].holdings.includes(target));
    assert.ok(done.world.rivals[idx].power < rival.power);
    assert.equal(makePeace({ ...s, war }, T0, rival.holdings[0]).ok, false); // capital
  });

  it('provinces pay income that shows in the rates and in play', () => {
    const { s } = atWar(0);
    const held = { ...s, war: null, territories: ['veridian', 'ironpeak'] };
    assert.ok(territoryIncome(held).food > 0);
    assert.ok(holdingYield('veridian').food > 0);
    assert.ok(getRates(held).food > getRates({ ...held, territories: [] }).food);
    const later = tick({ ...held, resources: { gold: 100, food: 0, wood: 0, stone: 0 } }, T0 + 2 * HOUR);
    assert.ok(later.resources.food > 0);
  });

  it('a thin garrison loses provinces to revolt; a strong army holds them', () => {
    const { s } = atWar(0);
    const prov = ['veridian', 'ironpeak', 'port-calder'];
    const thin = { ...s, war: null, territories: prov, world: { ...s.world, rivals: s.world.rivals.map((r) => ({ ...r, power: 5 })) } };
    const lost = tick(thin, T0 + 48 * HOUR);
    assert.ok(lost.territories.length < prov.length);
    const strong = { ...thin, army: { ...thin.army, units: { ...emptyUnits(), spearmen: garrisonNeeded(thin) + 10 } } };
    assert.equal(tick(strong, T0 + 48 * HOUR).territories.length, prov.length);
  });

  it('a version 7 save upgrades with holdings', () => {
    const { territories: _t, ...rest } = createNewGame(cfg, T0);
    void _t;
    const old = { ...rest, version: 7, world: { ...rest.world, rivals: rest.world.rivals.map(({ holdings: _h, ...r }) => (void _h, r)) } };
    const m = migrateState(JSON.parse(JSON.stringify(old)))!;
    assert.equal(m.version, 13);
    assert.deepEqual(m.territories, []);
    assert.ok(m.world.rivals.every((r) => r.holdings.length >= 1));
  });
});
