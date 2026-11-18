import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DIAGRAMS } from '../data/diagrams';
import { diagramShapes, visibleScenes } from '../utils/diagramShapes';
import { settlementScene } from '../data/settlement';
import { shapesToSvg } from '../utils/shapes';
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


test('the settlement picture grows as the player builds', () => {
  const empty = settlementScene({ levels: {}, ships: 0, stage: 0, soldiers: 0 });
  const full = settlementScene({ levels: { farm: 2, timber: 1, quarry: 1, workshop: 1, market: 1, library: 1, barracks: 1, academy: 1, armoury: 1, bureau: 1, shipyard: 1 }, ships: 4, stage: 6, soldiers: 50 });
  assert.ok(full.length > empty.length);
  assert.ok(shapesToSvg(full, 160, 100).includes('<svg'));
});
