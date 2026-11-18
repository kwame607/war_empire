import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { createNewGame, fastForward, tick } from './engine';
import { migrateState } from './migrate';
import { startBattle } from './military';
import { buildShips, fightNaval } from './naval';
import { enemyFleetSize, habitOf, resolveNaval, seaControlBlocker } from './navalCore';
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

describe('command of the sea', () => {
  it('a larger fleet and the right tactics win; a tiny one loses', () => {
    const base = yard(3, 20);
    const { s } = warWith(base, 'serene');
    const rival = s.world.rivals.find((r) => r.id === 'serene')!;
    const counter: Record<NavalTactic, NavalTactic> = { board: 'line', line: 'screen', screen: 'board' };
    const best = Array(3).fill(counter[habitOf(rival)]) as NavalTactic[];
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
    assert.equal(m.version, 9);
    assert.equal(m.fleet.ships, 0);
  });
});
