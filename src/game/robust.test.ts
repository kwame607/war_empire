import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DIAGRAMS } from '../data/diagrams';
import { diagramShapes, visibleScenes } from '../utils/diagramShapes';
import { TOWN_SLOTS, keepSpriteForStage } from '../data/townLayout';
import { blocksFor, frontLine, layoutArmy } from '../data/battleLayout';
import { createNewGame } from './engine';
import { startBattle } from './military';
import { sendSpy } from './intel';
import { runSimulation } from './mastery';

const base = () => createNewGame({ name: 'T', civId: 'sikaman', backgroundId: 'military', difficultyId: 'standard' }, 1_000_000);

test('actions against an enemy that no longer exists fail cleanly instead of throwing', () => {
  const s = base();
  assert.equal(startBattle(s, 'war-gone', { intel: 0, provisions: 'light' }, s.lastTickAt).ok, false);
  assert.equal(sendSpy(s, 'x', 'war-gone', 'strength', s.lastTickAt).ok, false);
  assert.equal(runSimulation(s, 'war-gone', 'hold', s.lastTickAt).ok, false);
});


test('diagrams tolerate stage 0 and out-of-range steps', () => {
  for (const d of Object.values(DIAGRAMS)) {
    assert.deepEqual(visibleScenes(d, 0), []);
    assert.ok(diagramShapes(d, 9, 9, 0.5).length > 0);
    assert.ok(diagramShapes(d, -3, 0, 0.5).length > 0);
  }
});


test('every town slot has artwork and the keep changes with rank', () => {
  const base = { farm: 1, timber: 1, quarry: 1, workshop: 1, market: 1, library: 1, barracks: 1, academy: 1, armoury: 1, bureau: 1, shipyard: 1 };
  for (const id of Object.keys(base)) assert.ok(TOWN_SLOTS[id], id);
  for (const slot of Object.values(TOWN_SLOTS)) assert.ok(typeof slot.sprite === 'string');
  assert.notEqual(keepSpriteForStage(0), keepSpriteForStage(6));
  assert.equal(keepSpriteForStage(2), 'keep1');
});


test('battle layout stays within the field and closes over rounds', () => {
  const army = layoutArmy({ spearmen: 300, heavy: 200, archers: 150, cavalry: 120 }, 20, 'p', 5, false);
  assert.ok(army.length <= 10);
  assert.ok(army.every((r) => Math.abs(r.sx) <= 16.5 && r.sd > 0));
  const foe = layoutArmy({ spearmen: 100 }, 20, 'e', 5, false);
  assert.ok(foe.every((r) => r.sd < 0 && r.sprite.endsWith('_e')));
  assert.ok(frontLine(0, null) > frontLine(3, null));
  assert.equal(blocksFor(0, 10, 3), 0);
  assert.equal(blocksFor(1, 10, 3), 1);
  assert.equal(blocksFor(999, 10, 3), 3);
  assert.equal(layoutArmy({ cavalry: 50 }, 10, 'p', 5, true)[0].sd < 0, true);
});

test('portraits are stable per name and always resolve', async () => {
  const { portraitKey } = await import('../data/portraitKeys');
  assert.equal(portraitKey('sikaman', 'Kofi'), portraitKey('sikaman', 'Kofi'));
  assert.match(portraitKey('unknown-civ', 'X'), /^[a-z]+_[1-6]$/);
});

test('tutorial starts at the farm and advances with play', async () => {
  const { tutorialProgress } = await import('./tutorial');
  const s = base();
  const p0 = tutorialProgress(s);
  assert.equal(p0.current?.id, 'farm');
  assert.equal(p0.done, 0);
});

test('events spawn after the timer and resolve cleanly', async () => {
  const { maybeSpawnEvent, resolveEvent } = await import('./events');
  const { EVENTS } = await import('../data/events');
  const s0 = base();
  const early = maybeSpawnEvent({ ...s0, businesses: [{ typeId: 'farm', level: 1, pending: null }], nextEventAt: 1000 }, 500);
  assert.equal(early.event, null);
  const s1 = maybeSpawnEvent({ ...s0, businesses: [{ typeId: 'farm', level: 1, pending: null }], nextEventAt: 1000 }, 2000);
  assert.ok(s1.event);
  assert.ok(s1.nextEventAt > 2000);
  // every choice of every event resolves, keeps resources non-negative, and clears the event
  for (const def of EVENTS) {
    for (let i = 0; i < def.choices.length; i++) {
      const rich = { ...s1, event: { id: def.id, at: 0 }, resources: { gold: 999, food: 999, wood: 999, stone: 999 } };
      const r = resolveEvent(rich, i, 5000);
      assert.ok(r.ok, `${def.id}/${i}`);
      if (r.ok) {
        assert.equal(r.state.event, null);
        for (const v of Object.values(r.state.resources)) assert.ok(v >= 0);
      }
    }
  }
  const none = resolveEvent({ ...s1, event: null }, 0, 5000);
  assert.equal(none.ok, false);
});

test('chronicle always tells a short story', async () => {
  const { chronicleFor } = await import('./chronicle');
  const s = base();
  for (const gold of [-50, 0, 10, 100, 900]) {
    const p = chronicleFor(s, { secondsAway: 7200, secondsCounted: 7200, gained: { gold, food: 10, wood: 0, stone: 0 }, events: ['Farm construction is complete.'] });
    assert.ok(p.length >= 2);
    assert.ok(p.every((x) => x.length > 10));
  }
});

test('achievements unlock once and pay once', async () => {
  const { unlockAchievements } = await import('./achievements');
  const s0 = { ...base(), businesses: [{ typeId: 'farm', level: 1, pending: null }] };
  const s1 = unlockAchievements(s0, 1000);
  assert.ok(s1.achievements['first-trade']);
  assert.ok(s1.resources.gold > s0.resources.gold);
  const s2 = unlockAchievements(s1, 2000);
  assert.equal(s2.resources.gold, s1.resources.gold);
  assert.equal(s2.achievements['first-trade'], 1000);
});

test('quiz: wrong answers cost nothing, right answers pay once, data is sound', async () => {
  const { answerQuiz, openQuestions } = await import('./quiz');
  const { QUIZ } = await import('../data/quiz');
  const { KNOWLEDGE_ENTRIES } = await import('../data/knowledge');
  for (const q of QUIZ) {
    assert.ok(KNOWLEDGE_ENTRIES.some((e) => e.id === q.entryId), q.id);
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
    assert.equal(new Set(q.options).size, q.options.length, q.id);
  }
  const s0 = { ...base(), knowledge: { cannae: 1 } };
  assert.equal(openQuestions(s0).length, 3);
  assert.equal(answerQuiz(s0, 'horns-1', 2, 1).ok, false); // not discovered
  const wrong = answerQuiz(s0, 'cannae-1', 0, 1);
  assert.ok(wrong.ok && wrong.correct === false && wrong.state === s0);
  const right = answerQuiz(s0, 'cannae-1', 1, 1);
  assert.ok(right.ok && right.correct);
  if (right.ok) {
    assert.ok(right.state.resources.gold > s0.resources.gold);
    assert.equal(answerQuiz(right.state, 'cannae-1', 1, 2).ok, false);
    assert.equal(openQuestions(right.state).length, 2);
  }
});

test('campaigns: every civilisation has four acts and they advance one at a time', async () => {
  const { CAMPAIGNS } = await import('../data/campaigns');
  const { advanceCampaign, currentAct } = await import('./campaign');
  for (const civ of ['sikaman', 'niani', 'fjordlands', 'aurelia', 'serene']) assert.equal(CAMPAIGNS[civ].acts.length, 4);
  const s0 = base();
  const cur0 = currentAct(s0);
  assert.equal(cur0?.index, 0);
  const rich = { ...s0, businesses: Array.from({ length: 5 }, () => ({ typeId: 'farm', level: 1, pending: null })), reputation: 500 };
  const s1 = advanceCampaign(rich, 10);
  assert.equal(currentAct(s1)?.index, 1);
  assert.ok(s1.resources.gold > rich.resources.gold);
  assert.equal(advanceCampaign(s1, 11).achievements[`camp:${CAMPAIGNS[s0.player.civId].acts[2].id}`], undefined);
});

test('investigations: stars, one-time rewards, bad input', async () => {
  const { starsFor, finishInvestigation } = await import('./investigations');
  assert.equal(starsFor(100, 0, 0), 3);
  assert.equal(starsFor(100, 0, 1), 2);
  assert.equal(starsFor(280, 8, 2), 2);
  assert.equal(starsFor(999, 99, 3), 1);
  const s0 = base();
  assert.equal(finishInvestigation(s0, 'nope', 2, 1).ok, false);
  assert.equal(finishInvestigation(s0, 'tent', 7, 1).ok, false);
  const a = finishInvestigation(s0, 'tent', 1, 1);
  assert.ok(a.ok && a.gold === 100 && a.state.investigations.tent.stars === 1);
  if (a.ok) {
    const worse = finishInvestigation(a.state, 'tent', 1, 2);
    assert.ok(worse.ok && worse.gold === 0 && worse.state === a.state);
    const better = finishInvestigation(a.state, 'tent', 3, 3);
    assert.ok(better.ok && better.gold === 100); // two extra stars at 50 each
    if (better.ok) assert.equal(better.state.reputation, a.state.reputation); // reputation only once
  }
});

test('every case file has art and a full set of hidden objects', async () => {
  const fs = await import('node:fs');
  const { INVESTIGATIONS } = await import('../data/investigations');
  const txt = fs.readFileSync(new URL('../data/investigationAssets.ts', import.meta.url), 'utf8');
  for (const inv of INVESTIGATIONS) {
    const start = txt.indexOf(`  ${inv.id}: {`);
    assert.ok(start >= 0, `${inv.id} art`);
    const nextScene = INVESTIGATIONS.map((i) => txt.indexOf(`  ${i.id}: {`)).filter((i) => i > start).sort((a, b) => a - b)[0] ?? txt.length;
    assert.equal((txt.slice(start, nextScene).match(/\{ id: '/g) ?? []).length, 10, inv.id);
    if (inv.requires) assert.ok(INVESTIGATIONS.some((i) => i.id === inv.requires));
  }
});
