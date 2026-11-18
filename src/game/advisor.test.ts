import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyUnits } from '../data/units';
import { adviceFor } from './advisor';
import { createNewGame } from './engine';
import type { GameState } from './types';

const T0 = 1_700_000_000_000;
const cfg = { name: 'Ama', civId: 'sikaman', backgroundId: 'ordinary', difficultyId: 'standard' };
const fresh = (): GameState => createNewGame(cfg, T0);

describe('advisor', () => {
  it('starts a new player with the economy', () => {
    const a = adviceFor(fresh());
    assert.ok(a[0].text.includes('Farm'));
    assert.ok(a.length <= 3);
  });

  it('points to the next military step as the player progresses', () => {
    const base = { ...fresh(), reputation: 20, businesses: [{ typeId: 'farm', level: 1, pending: null }] };
    assert.ok(adviceFor(base).some((a) => a.text.includes('Barracks')));
    const barracks = { ...base, institutions: [{ typeId: 'barracks', level: 1, pending: null }] };
    assert.ok(adviceFor(barracks).some((a) => a.text.includes('Train your first soldiers')));
    const army = { ...barracks, army: { ...barracks.army, units: { ...emptyUnits(), spearmen: 10 } } };
    assert.ok(adviceFor(army).some((a) => a.text.includes('first operation')));
  });

  it('flags pending diplomacy and a thin garrison', () => {
    const s = fresh();
    const offer = { id: 'o', rivalId: s.world.rivals[0].id, kind: 'trade' as const, gold: 0, text: 't', expiresAt: 9 };
    assert.ok(adviceFor({ ...s, world: { ...s.world, offers: [offer] } }).some((a) => a.text.includes('reply')));
    const t = adviceFor({ ...s, territories: ['veridian'], businesses: [{ typeId: 'farm', level: 1, pending: null }], knowledge: { cannae: 2, 'buffalo-horns': 2, 'feigned-retreat': 2, 'russia-1812': 2, salamis: 2, lepanto: 2 } });
    assert.ok(t.some((a) => a.text.includes('garrison')));
  });
});
