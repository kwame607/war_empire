import type { UnitCounts, UnitId, UnitType } from '../game/types';

export const UNIT_IDS: UnitId[] = ['spearmen', 'archers', 'cavalry', 'heavy'];

export function emptyUnits(): UnitCounts {
  return { spearmen: 0, archers: 0, cavalry: 0, heavy: 0 };
}

export const UNIT_TYPES: UnitType[] = [
  {
    id: 'spearmen',
    name: 'Spearmen',
    description: 'Levy infantry with spears and shields. Cheap and sturdy, the backbone of any army.',
    unitClass: 'infantry',
    attack: 4,
    defence: 6,
    cost: { gold: 25, food: 15 },
    trainSecondsEach: 6,
    upkeepGold: 0.4,
    upkeepFood: 0.3,
    requires: { institution: 'barracks', level: 1 },
  },
  {
    id: 'archers',
    name: 'Archers',
    description: 'Skirmishers who strike from range. Strong on high ground, weak in fog and rain.',
    unitClass: 'ranged',
    attack: 6,
    defence: 2,
    cost: { gold: 35, food: 10, wood: 10 },
    trainSecondsEach: 8,
    upkeepGold: 0.5,
    upkeepFood: 0.3,
    requires: { institution: 'barracks', level: 1 },
  },
  {
    id: 'cavalry',
    name: 'Cavalry',
    description: 'Fast riders who win battles on open ground and run down broken enemies. Useless in forest.',
    unitClass: 'cavalry',
    attack: 9,
    defence: 4,
    cost: { gold: 80, food: 40 },
    trainSecondsEach: 14,
    upkeepGold: 1.2,
    upkeepFood: 0.8,
    requires: { institution: 'armoury', level: 1 },
  },
  {
    id: 'heavy',
    name: 'Heavy Infantry',
    description: 'Armoured veterans who hold the line against almost anything. Slow and expensive.',
    unitClass: 'infantry',
    attack: 8,
    defence: 9,
    cost: { gold: 90, food: 20, stone: 10 },
    trainSecondsEach: 16,
    upkeepGold: 1.0,
    upkeepFood: 0.5,
    requires: { institution: 'armoury', level: 2 },
  },
];

export function getUnitType(id: UnitId): UnitType {
  const u = UNIT_TYPES.find((x) => x.id === id);
  if (!u) throw new Error(`Unknown unit: ${id}`);
  return u;
}
