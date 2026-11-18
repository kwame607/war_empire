import assert from 'node:assert/strict';
import { test } from 'node:test';

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
