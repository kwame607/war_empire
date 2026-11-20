import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { createNewGame, fastForward, tick } from './engine';
import { migrateState } from './migrate';
import { startBattle } from './military';
import { buildShips, fightNaval } from './naval';
import { availableTactics, enemyFleetSize, habitOf, resolveNaval, seaControlBlocker } from './navalCore';
import { fleetCapacity, getRates } from './selectors';
import { buildWarScenario } from './warCore';
import type { GameState, NavalTactic, War } from './types';

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;
const cfg = { name: 'Ama', civId: 'aurelia', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}
function yard(level = 1, ships = 0): GameState {
  const s = createNewGame(cfg, T0);
  return {
    ...s,
    reputation: 40,
    resources: { gold: 9000, food: 3000, wood: 3000, stone: 500 },
    institutions: [{ typeId: 'shipyard', level, pending: null }],
    fleet: { ...s.fleet, ships },
    army: { ...s.army, units: { ...emptyUnits(), spearmen: 80, archers: 40 } },
  };
}
function warWith(s: GameState, rivalId: string): { s: GameState; war: War } {
  const rival = s.world.rivals.find((r) => r.id === rivalId)!;
  const war: War = { rivalId, scenario: buildWarScenario(rival, 1), wins: 0, losses: 0, startedAt: T0 };
  return { s: { ...s, war }, war };
}

describe('navy', () => {
  it('ships need a shipyard, cost resources, take time and are capped by its level', () => {
    assert.equal(buildShips({ ...yard(), institutions: [] }, 1, T0).ok, false);
    let s = must(buildShips(yard(), 2, T0)).state;
    assert.ok(s.resources.gold < 9000);
    assert.equal(s.fleet.ships, 0);
    s = tick(s, T0 + HOUR);
    assert.equal(s.fleet.ships, 2);
    assert.equal(buildShips(s, 3, T0 + HOUR).ok, false); // capacity 4
    assert.equal(fleetCapacity(yard(2)), 12);
  });

  it('ships cost upkeep', () => {
    assert.ok(getRates(yard(1, 4)).expenses > getRates(yard(1, 0)).expenses);
  });

  it('testing time-travel completes shipbuilding', () => {
    const s = must(buildShips(yard(), 2, T0)).state;
    assert.equal(fastForward(s, 3600, T0 + 1000).fleet.ships, 2);
  });
});

describe('naval doctrines', () => {
  const setup = (mine: number, theirsPower: number, know: Record<string, number>) => {
    const base = { ...yard(3, mine), knowledge: know };
    const { s } = warWith(base, 'serene');
    const rival = { ...s.world.rivals.find((r) => r.id === 'serene')!, power: theirsPower };
    return { s, rival };
  };
  const avgLoss = (s: GameState, rival: ReturnType<typeof setup>['rival'], t: NavalTactic) => {
    let enemyLost = 0;
    let myLost = 0;
    for (let i = 0; i < 40; i++) {
      const r = resolveNaval(s, rival, [t, t, t], i * 131, T0).report;
      enemyLost += r.enemyLost;
      myLost += r.shipsLost;
    }
    return { enemyLost, myLost };
  };

  it('only studied doctrines are available', () => {
    assert.deepEqual(availableTactics(yard()).map((t) => t.id).sort(), ['board', 'line', 'screen']);
    assert.ok(availableTactics({ ...yard(), knowledge: { salamis: 2 } }).some((t) => t.id === 'narrows'));
    const { s } = warWith({ ...yard(1, 3), knowledge: {} }, 'serene');
    assert.equal(fightNaval(s, ['narrows', 'narrows', 'narrows'], T0).ok, false);
  });

  it('the narrows help against a much larger fleet and do nothing against a smaller one', () => {
    const big = setup(12, 150, { salamis: 2 }); // they outnumber us
    const plain = avgLoss(big.s, big.rival, 'screen');
    const narrows = avgLoss(big.s, big.rival, 'narrows');
    assert.ok(narrows.myLost < plain.myLost, 'cramped enemy should hurt us less');
    const even = setup(14, 100, { salamis: 2 }); // roughly equal fleets: the lure achieves nothing
    const wasted = avgLoss(even.s, even.rival, 'narrows').enemyLost;
    const basic = (['line', 'board', 'screen'] as NavalTactic[]).reduce((a, t) => a + avgLoss(even.s, even.rival, t).enemyLost, 0) / 3;
    assert.ok(wasted < basic);
  });

  it('galleass guns hurt most against a matched fleet, and experience makes them stronger', () => {
    const matched = setup(10, 70, { lepanto: 2 });
    const guns = avgLoss(matched.s, matched.rival, 'galleass');
    const line = avgLoss(matched.s, matched.rival, 'line');
    assert.ok(guns.enemyLost >= line.enemyLost * 0.95);
    const exp = setup(10, 70, { lepanto: 3 });
    assert.ok(avgLoss(exp.s, exp.rival, 'galleass').enemyLost > guns.enemyLost);
  });

  it('proving a doctrine in a won engagement earns Practical Experience', () => {
    let proven = false;
    for (let i = 0; i < 20 && !proven; i++) {
      const { s } = warWith({ ...yard(3, 20), knowledge: { lepanto: 2 }, rngSeed: i * 17 + 3 }, 'serene');
      const r = fightNaval(s, ['galleass', 'line', 'line'], T0 + i);
      if (r.ok && r.state.knowledge.lepanto === 3) proven = true;
    }
    assert.ok(proven);
  });
});

describe('command of the sea', () => {
  it('a larger fleet and the right tactics win; a tiny one loses', () => {
    const base = yard(3, 20);
    const { s } = warWith(base, 'serene');
    const rival = s.world.rivals.find((r) => r.id === 'serene')!;
    const counter: Partial<Record<NavalTactic, NavalTactic>> = { board: 'line', line: 'screen', screen: 'board' };
    const best = Array(3).fill(counter[habitOf(rival)] ?? 'line') as NavalTactic[];
    let wins = 0;
    for (let i = 0; i < 20; i++) if (resolveNaval(s, rival, best, i * 977, T0).report.won) wins++;
    assert.ok(wins >= 18, `big fleet should nearly always win, won ${wins}`);
    const weak = { ...s, fleet: { ...s.fleet, ships: 1 } };
    let weakWins = 0;
    for (let i = 0; i < 20; i++) if (resolveNaval(weak, rival, best, i * 977, T0).report.won) weakWins++;
    assert.ok(weakWins <= 4);
    assert.ok(enemyFleetSize(rival) >= 3);
  });

  it('the island kingdom cannot be fought on land until the sea is won', () => {
    const { s, war } = warWith(yard(3, 20), 'serene');
    assert.ok(seaControlBlocker(s, war.scenario.id));
    assert.equal(startBattle(s, war.scenario.id, { intel: 0, provisions: 'standard' }, T0).ok, false);
    let won: GameState | null = null;
    for (let i = 0; i < 12 && !won; i++) {
      const r = fightNaval({ ...s, rngSeed: s.rngSeed + i * 13 }, ['line', 'board', 'screen'], T0 + i);
      if (r.ok && r.state.war?.seaControl) won = r.state;
    }
    assert.ok(won, 'a 20-ship fleet should win command of the sea');
    assert.equal(seaControlBlocker(won!, war.scenario.id), null);
    assert.equal(startBattle(won!, war.scenario.id, { intel: 0, provisions: 'standard' }, T0 + 1000).ok, true);
  });

  it('other kingdoms are not blocked, and a lost sea battle costs ships', () => {
    const other = createNewGame(cfg, T0).world.rivals.find((r) => r.id !== 'serene')!;
    const { s, war } = warWith(yard(1, 2), other.id);
    assert.equal(seaControlBlocker(s, war.scenario.id), null);
    const { s: s2 } = warWith(yard(1, 2), 'serene');
    const r = must(fightNaval(s2, ['line', 'line', 'line'], T0)).state;
    assert.ok(r.fleet.lastEngagement);
    assert.ok(r.fleet.ships <= 2);
    assert.equal(fightNaval(yard(1, 0), ['line', 'line', 'line'], T0).ok, false);
  });

  it('a fleet deters raiders', () => {
    const { s } = warWith(yard(3, 0), 'serene');
    const strong = { ...s, world: { ...s.world, rivals: s.world.rivals.map((r) => (r.id === 'serene' ? { ...r, power: 500 } : r)) }, resources: { ...s.resources, gold: 5000 } };
    const raids = (st: GameState) => tick(st, T0 + 40 * HOUR).log.filter((l) => l.text.includes('Raiders')).length;
    const without = raids(strong);
    const withFleet = raids({ ...strong, fleet: { ...strong.fleet, ships: 6 } });
    assert.ok(withFleet <= without);
  });

  it('a version 8 save upgrades with an empty fleet', () => {
    const { fleet: _f, ...rest } = createNewGame(cfg, T0);
    void _f;
    const m = migrateState(JSON.parse(JSON.stringify({ ...rest, version: 8 })))!;
    assert.equal(m.version, 12);
    assert.equal(m.fleet.ships, 0);
  });
});
