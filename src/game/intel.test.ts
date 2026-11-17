import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { createNewGame, tick } from './engine';
import { hireSpy, sendSpy } from './intel';
import { accurateChance, assessIntelligence, compareReports, corroboration, factionTruth, generateReport, rollQuality } from './intelCore';
import { estimateEnemy, mulberry32, orderChecks } from './battle';
import { startBattle } from './military';
import type { GameState, IntelQuality, Spy } from './types';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Ama', civId: 'aurelia', backgroundId: 'military', difficultyId: 'standard' };

function must<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as Extract<T, { ok: true }>;
}

function bureauGame(level = 2): GameState {
  const s = createNewGame(cfg, T0);
  return {
    ...s,
    reputation: 30,
    resources: { gold: 20000, food: 5000, wood: 2000, stone: 2000 },
    institutions: [{ typeId: 'bureau', level, pending: null }],
    army: { ...s.army, units: { ...emptyUnits(), spearmen: 40, archers: 20 } },
  };
}

describe('spies', () => {
  it('need a bureau, cost gold and are capped by bureau level', () => {
    const none = { ...bureauGame(), institutions: [] };
    assert.equal(hireSpy(none, T0).ok, false);
    let s = bureauGame(1);
    s = must(hireSpy(s, T0)).state;
    s = must(hireSpy(s, T0)).state;
    assert.equal(s.intel.spies.length, 2);
    assert.equal(hireSpy(s, T0).ok, false); // level 1 -> cap 2
  });

  it('missions cost gold, take time, and finish while away', () => {
    let s = must(hireSpy(bureauGame(), T0)).state;
    const spy = s.intel.spies[0];
    const gold = s.resources.gold;
    s = must(sendSpy(s, spy.id, 'raiders', 'strength', T0)).state;
    assert.ok(s.resources.gold < gold);
    assert.equal(sendSpy(s, spy.id, 'raiders', 'plans', T0).ok, false); // busy
    s = tick(s, T0 + 60 * 1000);
    assert.equal(s.intel.missions.length, 1);
    s = tick(s, T0 + 3600 * 1000);
    assert.equal(s.intel.missions.length, 0);
    assert.ok(s.intel.reports.length === 1 || s.intel.spies.length === 0); // report, or the spy was caught
  });
});

describe('report quality', () => {
  it('better spies and bureaus raise the chance of an accurate report', () => {
    assert.ok(accurateChance(6, 3) > accurateChance(2, 1));
    const count = (skill: number, bureau: number) => {
      const rng = mulberry32(7);
      let n = 0;
      for (let i = 0; i < 2000; i++) if (rollQuality(skill, bureau, rng) === 'accurate') n++;
      return n;
    };
    assert.ok(count(6, 3) > count(2, 1));
  });

  const spy: Spy = { id: 's', name: 'Kofi', skill: 3, missions: 0, sound: 0, unsound: 0 };
  const mk = (topic: 'strength' | 'commander' | 'plans' | 'defences', q: IntelQuality, id = 'm1') =>
    generateReport(bureauGame(), spy, { id, spyId: 's', factionId: 'warband', topic, completesAt: T0 }, q, mulberry32(3), T0);

  it('accurate reports match the truth; misleading ones do not', () => {
    const t = factionTruth('warband');
    const good = mk('strength', 'accurate');
    assert.ok(good.claims.size!.total[0] <= t.total && good.claims.size!.total[1] >= t.total);
    const bad = mk('strength', 'misleading');
    const inRange = bad.claims.size!.total[0] <= t.total && bad.claims.size!.total[1] >= t.total;
    assert.equal(inRange, false);
    assert.deepEqual(mk('commander', 'accurate').claims.traits, [t.trait]);
    assert.notDeepEqual(mk('commander', 'misleading').claims.traits, [t.trait]);
    assert.equal(mk('defences', 'accurate').claims.fortified, t.fortified);
    assert.equal(mk('defences', 'misleading').claims.fortified, !t.fortified);
  });

  it('hidden quality is not leaked, but outdated reports are visibly dated', () => {
    assert.ok(mk('strength', 'outdated').ageLabel);
    assert.equal(mk('strength', 'misleading').ageLabel, null);
  });

  it('independent reports can corroborate or contradict each other', () => {
    const a = mk('strength', 'accurate', 'a');
    const b = { ...mk('strength', 'accurate', 'b'), spyId: 'other' };
    const c = { ...mk('strength', 'fabricated', 'c'), spyId: 'third', claims: { size: { total: [1, 3] as [number, number] } } };
    assert.equal(compareReports(a, b), 'agree');
    assert.equal(compareReports(a, c), 'conflict');
    const s = { ...bureauGame(), intel: { spies: [], missions: [], reports: [a, b, c] } };
    const k = corroboration(s, a);
    assert.equal(k.agree, 1);
    assert.equal(k.conflict, 1);
  });
});

describe('intelligence in battle', () => {
  it('reports shape what you believe, even when false', () => {
    const spy: Spy = { id: 's', name: 'Kofi', skill: 3, missions: 0, sound: 0, unsound: 0 };
    const fake = generateReport(bureauGame(), spy, { id: 'x', spyId: 's', factionId: 'warband', topic: 'strength', completesAt: T0 }, 'fabricated', mulberry32(1), T0);
    const base = bureauGame();
    const s0 = { ...base, intel: { ...base.intel, reports: [fake] } };
    const s = must(startBattle(s0, 'warband', { intel: 0, provisions: 'standard', reportIds: [fake.id] }, T0)).state;
    const est = estimateEnemy(s.battle!);
    assert.equal(est.source, 'report');
    assert.deepEqual(est.total, fake.claims.size!.total);
    const none = must(startBattle(s0, 'warband', { intel: 0, provisions: 'standard' }, T0)).state;
    assert.equal(estimateEnemy(none.battle!).source, 'rumour');
    // reports for a different rival are ignored
    const wrong = must(startBattle(s0, 'raiders', { intel: 0, provisions: 'standard', reportIds: [fake.id] }, T0)).state;
    assert.equal(wrong.battle!.beliefSources.length, 0);
  });

  it('checklist uses beliefs when nothing else is known', () => {
    const base = bureauGame();
    const spy: Spy = { id: 's', name: 'Kofi', skill: 3, missions: 0, sound: 0, unsound: 0 };
    const rep = generateReport(base, spy, { id: 'd', spyId: 's', factionId: 'hillfort', topic: 'defences', completesAt: T0 }, 'accurate', mulberry32(2), T0);
    const s0 = { ...base, intel: { ...base.intel, reports: [rep] } };
    const blind = must(startBattle(s0, 'hillfort', { intel: 0, provisions: 'standard' }, T0)).state;
    const seen = must(startBattle(s0, 'hillfort', { intel: 0, provisions: 'standard', reportIds: [rep.id] }, T0)).state;
    const fort = (st: GameState) => orderChecks(st, st.battle!, 'horns').find((c) => c.label === 'Enemy not fortified')!.status;
    assert.equal(fort(blind), 'unknown');
    assert.notEqual(fort(seen), 'unknown');
  });

  it('a stronger bureau makes it less likely the enemy learns of your plans', () => {
    const rate = (level: number) => {
      let n = 0;
      for (let i = 0; i < 300; i++) {
        const base = { ...bureauGame(level), rngSeed: i * 7919 + 1 };
        if (must(startBattle(base, 'raiders', { intel: 0, provisions: 'standard' }, T0)).state.battle!.enemyInformed) n++;
      }
      return n;
    };
    assert.ok(rate(3) < rate(1));
    assert.equal(rate(3), 0);
  });

  it('after the battle reports are verified and the assessment is honest', () => {
    const spy: Spy = { id: 's', name: 'Kofi', skill: 3, missions: 0, sound: 0, unsound: 0 };
    const fake = generateReport(bureauGame(), spy, { id: 'x', spyId: 's', factionId: 'raiders', topic: 'strength', completesAt: T0 }, 'misleading', mulberry32(5), T0);
    const base = bureauGame();
    const s0 = { ...base, intel: { spies: [spy], missions: [], reports: [fake] } };
    const s = must(startBattle(s0, 'raiders', { intel: 0, provisions: 'standard', reportIds: [fake.id] }, T0)).state;
    const a = assessIntelligence(s, s.battle!);
    assert.ok(a.lines.some((l) => l.includes('misleading')));
    assert.ok(a.lessons.some((l) => l.includes('false')));
  });
});
