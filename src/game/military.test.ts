import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { estimateEnemy } from './battle';
import { createNewGame, fastForward, tick } from './engine';
import { migrateState } from './migrate';
import {
  buyInstitution,
  delegateBattle,
  hireCommander,
  issueOrder,
  recruitUnits,
  scenarioReadyIn,
  startBattle,
  upgradeInstitution,
} from './military';
import { getArmyCapacity, getManpowerCap, institutionBlocker, studyTimeMult, sumUnits } from './selectors';
import type { GameState, OrderId, UnitCounts } from './types';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Ama', civId: 'aurelia', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}

/** A game with money and reputation, and institutions already built. */
function richGame(): GameState {
  const s = createNewGame(cfg, T0);
  return { ...s, reputation: 30, resources: { gold: 20000, food: 5000, wood: 2000, stone: 2000 } };
}

function withInstitutions(s: GameState, levels: Record<string, number>): GameState {
  return {
    ...s,
    institutions: Object.entries(levels).map(([typeId, level]) => ({ typeId, level, pending: null })),
  };
}

function armyOf(s: GameState, units: Partial<UnitCounts>, know: Record<string, number> = {}): GameState {
  return { ...s, knowledge: know, army: { ...s.army, units: { ...emptyUnits(), ...units } } };
}

const ALL_DOCTRINES = { cannae: 2, 'buffalo-horns': 2, 'feigned-retreat': 2, 'russia-1812': 2 };

describe('save migration', () => {
  it('upgrades a version 1 save without losing progress', () => {
    const v2 = createNewGame(cfg, T0);
    const {
      institutions: _i,
      army: _a,
      commanders: _c,
      battle: _b,
      reports: _r,
      scenarioReadyAt: _s,
      rngSeed: _g,
      ...rest
    } = v2;
    void [_i, _a, _c, _b, _r, _s, _g];
    const v1 = { ...rest, version: 1, reputation: 7 };
    const migrated = migrateState(JSON.parse(JSON.stringify(v1)));
    assert.ok(migrated);
    assert.equal(migrated.version, 13);
    assert.equal(migrated.reputation, 7);
    assert.deepEqual(migrated.institutions, []);
    assert.equal(migrated.army.units.spearmen, 0);
    assert.equal(migrated.battle, null);
  });

  it('rejects saves from the future and garbage', () => {
    assert.equal(migrateState({ version: 99 }), null);
    assert.equal(migrateState(null), null);
    assert.equal(migrateState('nope'), null);
  });
});

describe('institutions', () => {
  it('are gated by reputation, knowledge and other institutions', () => {
    const s = createNewGame(cfg, T0);
    assert.match(institutionBlocker(s, 'barracks') ?? '', /reputation/);
    const rep = { ...s, reputation: 20 };
    assert.match(institutionBlocker(rep, 'academy') ?? '', /Understanding/);
    assert.match(institutionBlocker(rep, 'armoury') ?? '', /Barracks/);
    const learned = { ...rep, knowledge: { cannae: 2 } };
    assert.equal(institutionBlocker(learned, 'academy'), null);
  });

  it('wealth alone cannot buy an academy', () => {
    const r = buyInstitution(richGame(), 'academy', T0);
    assert.equal(r.ok, false);
  });

  it('build, finish, charge upkeep and take builder slots', () => {
    const s0 = richGame();
    const s1 = must(buyInstitution(s0, 'library', T0)).state;
    assert.equal(s1.institutions[0].level, 0);
    const s2 = tick(s1, T0 + 61_000);
    assert.equal(s2.institutions[0].level, 1);
    assert.equal(studyTimeMult(s2), 0.88);
    // upkeep: 10 gold/hour for one hour
    const before = s2.resources.gold;
    const s3 = tick(s2, s2.lastTickAt + 3_600_000);
    assert.ok(Math.abs(before - s3.resources.gold - 10) < 0.01, String(before - s3.resources.gold));
    const up = must(upgradeInstitution(s3, 'library', s3.lastTickAt)).state;
    assert.equal(up.institutions[0].pending?.targetLevel, 2);
  });

  it('library makes study faster', () => {
    const s = withInstitutions(richGame(), { library: 3 });
    assert.ok(Math.abs(studyTimeMult(s) - 0.64) < 1e-9);
  });
});

describe('army', () => {
  it('needs a barracks, respects capacity and manpower, trains over time and costs upkeep', () => {
    const s0 = richGame();
    assert.equal(recruitUnits(s0, 'spearmen', 5, T0).ok, false); // no barracks
    const s1 = withInstitutions(s0, { barracks: 1 });
    assert.equal(getArmyCapacity(s1), 20);
    assert.equal(recruitUnits(s1, 'cavalry', 2, T0).ok, false); // needs armoury
    assert.equal(recruitUnits(s1, 'spearmen', 21, T0).ok, false); // over capacity
    const r = must(recruitUnits(s1, 'spearmen', 10, T0)).state;
    assert.equal(r.army.units.spearmen, 0);
    assert.equal(r.army.training.length, 1);
    assert.equal(r.resources.gold, 20000 - 250);
    const done = tick(r, T0 + 120_000);
    assert.equal(done.army.units.spearmen, 10);
    assert.equal(done.army.training.length, 0);
    // upkeep: 10 spearmen x 0.4 gold + barracks 18 per hour
    const later = tick(done, done.lastTickAt + 3_600_000);
    assert.ok(Math.abs(done.resources.gold - later.resources.gold - (4 + 18)) < 0.01);
    assert.ok(Math.abs(done.resources.food - later.resources.food - 3) < 0.01);
  });

  it('manpower limits how many men your lands can spare', () => {
    const s = withInstitutions(richGame(), { barracks: 4 });
    const cap = getManpowerCap(s);
    assert.ok(cap < 80);
    assert.equal(recruitUnits(s, 'spearmen', cap + 1, T0).ok, false);
    assert.equal(recruitUnits(s, 'spearmen', cap, T0).ok, true);
  });

  it('hires commanders only with an academy, up to its level', () => {
    const s0 = richGame();
    assert.equal(hireCommander(s0, T0).ok, false);
    const s1 = withInstitutions(s0, { academy: 1 });
    const h = must(hireCommander(s1, T0)).state;
    assert.equal(h.commanders.length, 1);
    assert.equal(h.army.commanderId, h.commanders[0].id);
    assert.equal(hireCommander(h, T0).ok, false); // cap 1
  });
});

describe('battles', () => {
  const foot: Partial<UnitCounts> = { spearmen: 12, archers: 8 };

  it('deploys the army, pays provisions and scouts, and refuses without soldiers', () => {
    const s0 = richGame();
    assert.equal(startBattle(s0, 'raiders', { intel: 0, provisions: 'standard' }, T0).ok, false); // no army
    const s1 = armyOf(s0, foot);
    const r = must(startBattle(s1, 'raiders', { intel: 1, provisions: 'standard' }, T0)).state;
    assert.equal(sumUnits(r.army.units), 0);
    assert.equal(sumUnits(r.battle!.player.units), 20);
    assert.equal(r.resources.gold, 20000 - 60);
    assert.equal(r.resources.food, 5000 - 50); // 20 men x 0.5 x 5 rounds
    assert.equal(startBattle(r, 'warband', { intel: 0, provisions: 'standard' }, T0).ok, false); // one at a time
  });

  it('requires reputation and honours the cooldown', () => {
    const low = { ...armyOf(richGame(), foot), reputation: 3 };
    assert.equal(startBattle(low, 'raiders', { intel: 0, provisions: 'light' }, T0).ok, false);
    let s = must(startBattle(armyOf(richGame(), foot), 'raiders', { intel: 0, provisions: 'standard' }, T0)).state;
    s = must(delegateBattle(s, T0)).state;
    assert.equal(s.battle, null);
    assert.ok(scenarioReadyIn(s, 'raiders', T0) > 0);
    assert.equal(startBattle(s, 'raiders', { intel: 0, provisions: 'light' }, T0).ok, false);
    const later = fastForward(s, 700, T0);
    assert.equal(scenarioReadyIn(later, 'raiders', T0), 0);
  });

  it('is deterministic: the same orders from the same seed give the same result', () => {
    const play = () => {
      let s = must(startBattle(armyOf(richGame(), foot), 'warband', { intel: 0, provisions: 'standard' }, T0)).state;
      for (const o of ['advance', 'hold', 'advance'] as OrderId[]) s = must(issueOrder(s, o, T0)).state;
      return JSON.stringify(s.battle ?? s.reports[0]);
    };
    assert.equal(play(), play());
  });

  it('locks doctrine orders until the record is understood', () => {
    const s = must(startBattle(armyOf(richGame(), foot), 'warband', { intel: 0, provisions: 'standard' }, T0)).state;
    assert.equal(issueOrder(s, 'envelop', T0).ok, false);
    const learned = must(startBattle(armyOf(richGame(), foot, { cannae: 2 }), 'warband', { intel: 0, provisions: 'standard' }, T0)).state;
    assert.equal(issueOrder(learned, 'envelop', T0).ok, true);
  });

  it('retreat ends the battle, saves most of the army and gives no reward', () => {
    let s = must(startBattle(armyOf(richGame(), foot), 'warband', { intel: 0, provisions: 'standard' }, T0)).state;
    const gold = s.resources.gold;
    s = must(issueOrder(s, 'retreat', T0)).state;
    assert.equal(s.battle, null);
    assert.equal(s.reports[0].result, 'withdrawn');
    assert.ok(sumUnits(s.army.units) >= 15);
    assert.equal(s.resources.gold, gold);
  });

  it('produces a full report and pays the winner', () => {
    let s = must(startBattle(armyOf(richGame(), { spearmen: 12, archers: 8, cavalry: 8 }), 'raiders', { intel: 2, provisions: 'standard' }, T0)).state;
    const gold = s.resources.gold;
    const rep = s.reputation;
    s = must(delegateBattle(s, T0)).state;
    const r = s.reports[0];
    assert.equal(r.result, 'victory');
    assert.equal(r.delegated, true);
    assert.ok(r.rounds.length >= 1);
    for (const key of ['decisions', 'enemyStrengths', 'exploited', 'lessons'] as const) assert.ok(r[key].length > 0, key);
    assert.ok(r.terrainWeather.length > 10 && r.logistics.length > 10);
    assert.equal(s.resources.gold, gold + 120);
    assert.equal(s.reputation, rep + 2);
    assert.ok(sumUnits(s.army.units) > 0);
    assert.ok(s.attributes.military > 3);
  });

  it('losing is not the end: units survive, reputation dips, the game continues', () => {
    let s = must(startBattle(armyOf(richGame(), { spearmen: 4, archers: 2 }), 'hillfort', { intel: 0, provisions: 'standard' }, T0)).state;
    for (let i = 0; i < 8 && s.battle; i++) s = must(issueOrder(s, 'advance', T0)).state;
    assert.equal(s.reports[0].result, 'defeat');
    assert.ok(s.reputation >= 0);
    assert.equal(s.battle, null);
    assert.equal(s.reports[0].rewards.gold, 0);
  });

  it('fog of knowledge: scouting narrows the estimate and the truth is never shown below intel 2', () => {
    const mk = (intel: 0 | 1 | 2) =>
      must(startBattle(armyOf(richGame(), foot), 'warband', { intel, provisions: 'standard' }, T0)).state.battle!;
    const truth = 24;
    const e0 = estimateEnemy(mk(0));
    const e1 = estimateEnemy(mk(1));
    const e2 = estimateEnemy(mk(2));
    assert.ok(e0.total[0] <= truth && e0.total[1] >= truth && !e0.exact && e0.classes === null);
    assert.ok(e1.total[0] <= truth && e1.total[1] >= truth && e1.classes !== null);
    assert.ok(e1.total[1] - e1.total[0] < e0.total[1] - e0.total[0]);
    assert.ok(e2.exact && e2.units !== null);
  });

  it('the enemy commander adapts when you repeat yourself', () => {
    let s = must(startBattle(armyOf(richGame(), { spearmen: 20, heavy: 6 }), 'hillfort', { intel: 0, provisions: 'ample' }, T0)).state;
    s = { ...s, battle: { ...s.battle!, enemy: { ...s.battle!.enemy, basePosture: null, fortified: false } } };
    for (let i = 0; i < 4 && s.battle; i++) s = must(issueOrder(s, 'hold', T0)).state;
    const rounds = s.battle ? s.battle.rounds : s.reports[0].rounds;
    assert.ok(rounds.length >= 4, 'battle should last four rounds');
    assert.notEqual(rounds[2].stance, 'reserve'); // seen twice: not yet
    assert.equal(rounds[3].stance, 'reserve'); // seen three times: a cautious enemy has read the pattern
  });

  it('doctrine success earns practical experience and strengthens the doctrine', () => {
    // Find a seed where the envelopment works, then check the knowledge stage.
    let worked = false;
    for (let seed = 1; seed < 60 && !worked; seed++) {
      let s = armyOf(richGame(), { spearmen: 8, archers: 4, cavalry: 8 }, { cannae: 2 });
      s = { ...s, rngSeed: seed * 97 };
      s = must(startBattle(s, 'warband', { intel: 1, provisions: 'standard' }, T0)).state;
      s = must(issueOrder(s, 'envelop', T0)).state;
      s = must(issueOrder(s, 'envelop', T0)).state;
      const done = s.battle ? must(delegateBattle(s, T0)).state : s;
      const rep = done.reports[0];
      if (rep.doctrinesPracticed.includes('Double envelopment')) {
        worked = true;
        assert.equal(done.knowledge.cannae, 3);
        assert.ok(rep.exploited.some((x) => x.includes('Double envelopment')));
      }
    }
    assert.ok(worked, 'envelopment should succeed for some seeds');
  });
});

describe('balance guard-rails', () => {
  function winRate(scenario: string, units: Partial<UnitCounts>, know: Record<string, number>, orders: (round: number) => OrderId, n = 24) {
    let wins = 0;
    for (let i = 0; i < n; i++) {
      let s = armyOf(richGame(), units, know);
      s = { ...s, rngSeed: 1000 + i * 37 };
      s = must(startBattle(s, scenario, { intel: 1, provisions: 'standard' }, T0)).state;
      for (let k = 0; k < 12 && s.battle; k++) s = must(issueOrder(s, orders(s.battle.round), T0)).state;
      if (s.reports[0].result === 'victory') wins++;
    }
    return wins / n;
  }

  it('against the warband, envelopment with cavalry far outperforms plain orders', () => {
    const army = { spearmen: 8, archers: 4, cavalry: 8 };
    const plain = winRate('warband', army, ALL_DOCTRINES, () => 'hold');
    const doctrine = winRate('warband', army, ALL_DOCTRINES, (r) => (r < 2 ? 'envelop' : 'advance'));
    assert.ok(doctrine - plain >= 0.4, `doctrine ${doctrine} vs plain ${plain}`);
  });

  it('against the hill camp, starving the garrison beats assaulting it', () => {
    const army = { spearmen: 12, archers: 8, cavalry: 6, heavy: 6 };
    const assault = winRate('hillfort', army, ALL_DOCTRINES, () => 'advance');
    const starve = winRate('hillfort', army, ALL_DOCTRINES, (r) => (r < 2 ? 'scorch' : 'advance'));
    assert.ok(starve - assault >= 0.3, `starve ${starve} vs assault ${assault}`);
  });

  it('a bigger army usually wins the easy fight even without doctrine', () => {
    const w = winRate('raiders', { spearmen: 12, archers: 8 }, {}, () => 'advance', 12);
    assert.ok(w >= 0.9, String(w));
  });
});
