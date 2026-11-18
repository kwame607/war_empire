import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getScenario } from '../data/scenarios';
import { emptyUnits } from '../data/units';
import { createNewGame, tick } from './engine';
import { migrateState } from './migrate';
import { delegateBattle, startBattle } from './military';
import { declareWar, makePeace, warBlocker } from './war';
import { buildWarScenario, peaceTerms } from './warCore';
import type { GameState, War } from './types';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Ama', civId: 'sikaman', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}
function ready(): GameState {
  const s = createNewGame(cfg, T0);
  return {
    ...s,
    reputation: 30,
    resources: { gold: 5000, food: 3000, wood: 500, stone: 500 },
    army: { ...s.army, units: { ...emptyUnits(), spearmen: 120, archers: 60, cavalry: 40 } },
  };
}

describe('war', () => {
  it('can only be declared by a power with an army, on a kingdom you have no pact with', () => {
    const s = ready();
    const id = s.world.rivals[0].id;
    assert.equal(warBlocker(s, id), null);
    assert.ok(warBlocker({ ...s, reputation: 0 }, id));
    assert.ok(warBlocker({ ...s, army: { ...s.army, units: emptyUnits() } }, id));
    const pact = { ...s, world: { ...s.world, rivals: s.world.rivals.map((r, i) => (i === 0 ? { ...r, pact: 'trade' as const } : r)) } };
    assert.ok(warBlocker(pact, id));
  });

  it('creates a campaign scaled to the rival and sours relations', () => {
    const s = ready();
    const rival = s.world.rivals[0];
    const w = must(declareWar(s, rival.id, T0)).state;
    assert.equal(w.war!.rivalId, rival.id);
    assert.ok(w.world.rivals[0].relation < rival.relation);
    const bigger = buildWarScenario({ ...rival, power: 200 }, 1);
    const smaller = buildWarScenario({ ...rival, power: 30 }, 1);
    assert.ok(bigger.recommendedArmy > smaller.recommendedArmy);
    assert.equal(declareWar(w, w.world.rivals[1].id, T0).ok, false); // one war at a time
  });

  it('the campaign can be fought like any operation and survives a reload', () => {
    const w = must(declareWar(ready(), ready().world.rivals[0].id, T0)).state;
    const reloaded = migrateState(JSON.parse(JSON.stringify(w)))!;
    tick(reloaded, T0 + 1000); // re-registers the campaign
    assert.equal(getScenario(w.war!.scenario.id).id, w.war!.scenario.id);
    const fought = must(startBattle(reloaded, w.war!.scenario.id, { intel: 1, provisions: 'ample' }, T0 + 1000)).state;
    assert.ok(fought.battle);
  });

  it('battles move the war score and change the rival\'s strength', () => {
    const w = must(declareWar(ready(), ready().world.rivals[0].id, T0)).state;
    const before = w.world.rivals[0].power;
    const b = must(startBattle(w, w.war!.scenario.id, { intel: 1, provisions: 'ample' }, T0)).state;
    const done = must(delegateBattle(b, T0)).state;
    assert.equal(done.war!.wins + done.war!.losses, done.reports[0].result === 'victory' || done.reports[0].result === 'defeat' ? 1 : 0);
    if (done.war!.wins === 1) assert.ok(done.world.rivals[0].power < before);
    if (done.war!.losses === 1) assert.ok(done.world.rivals[0].power > before);
  });

  it('peace terms follow the war score', () => {
    const s = ready();
    const rival = s.world.rivals[0];
    const base: War = { rivalId: rival.id, scenario: buildWarScenario(rival, 1), wins: 0, losses: 0, startedAt: T0 };
    assert.equal(peaceTerms({ ...base, wins: 1 }, rival).kind, 'reparations');
    assert.equal(peaceTerms(base, rival).kind, 'white');
    assert.equal(peaceTerms({ ...base, losses: 1 }, rival).kind, 'tribute');
    const won = must(makePeace({ ...s, war: { ...base, wins: 2 } }, T0)).state;
    assert.equal(won.war, null);
    assert.ok(won.resources.gold > s.resources.gold);
    const lost = must(makePeace({ ...s, war: { ...base, losses: 1 } }, T0)).state;
    assert.ok(lost.resources.gold < s.resources.gold);
    assert.equal(makePeace(s, T0).ok, false);
  });

  it('a war brings raids on your lands', () => {
    const s = must(declareWar(ready(), ready().world.rivals[0].id, T0)).state;
    const rich = { ...s, resources: { ...s.resources, gold: 3000 }, world: { ...s.world, rivals: s.world.rivals.map((r, i) => (i === 0 ? { ...r, power: 400 } : r)) } };
    const later = tick(rich, T0 + 20 * 3_600_000);
    assert.ok(later.log.some((l) => l.text.includes('Raiders')));
  });

  it('a version 6 save upgrades with no war', () => {
    const { war: _w, ...rest } = createNewGame(cfg, T0);
    void _w;
    const m = migrateState(JSON.parse(JSON.stringify({ ...rest, version: 6 })))!;
    assert.equal(m.version, 7);
    assert.equal(m.war, null);
  });
});
