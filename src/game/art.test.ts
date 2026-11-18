import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DIAGRAMS } from '../data/diagrams';
import { ILLUSTRATIONS } from '../data/illustrations';
import { BUSINESS_TYPES } from '../data/businesses';
import { INSTITUTION_TYPES } from '../data/institutions';
import { KNOWLEDGE_ENTRIES as KNOWLEDGE } from '../data/knowledge';
import { diagramShapes, visibleScenes } from '../utils/diagramShapes';
import { shapesToSvg } from '../utils/shapes';

test('every business and institution has an illustration', () => {
  for (const b of BUSINESS_TYPES) assert.ok(ILLUSTRATIONS[b.id], b.id);
  for (const i of INSTITUTION_TYPES) assert.ok(ILLUSTRATIONS[i.id], i.id);
});

test('diagrams are well formed', () => {
  for (const [id, d] of Object.entries(DIAGRAMS)) {
    assert.ok(KNOWLEDGE.some((k) => k.id === id), `${id} has a record`);
    assert.ok(d.scenes.length >= 2);
    assert.equal(d.scenes[0].unlocksAtStage, 1);
    const ids = new Set(d.units.map((u) => u.id));
    d.scenes.forEach((s, i) => {
      for (const k of Object.keys(s.poses)) assert.ok(ids.has(k), `${id} scene ${i}: ${k}`);
      assert.ok(shapesToSvg(diagramShapes(d, Math.max(0, i - 1), i, 0.5), 160, 100).includes('<svg'));
    });
    assert.ok(visibleScenes(d, 1).length >= 1);
    assert.equal(visibleScenes(d, 2).length, d.scenes.length);
  }
});
