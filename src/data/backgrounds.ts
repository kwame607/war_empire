import type { Background, Difficulty } from '../game/types';

/** Backgrounds shape your start only. They never lock you out of any career path. */
export const BACKGROUNDS: Background[] = [
  {
    id: 'merchant',
    name: 'Merchant family',
    summary: 'You grew up among ledgers and caravans. Extra gold and a head for bargaining.',
    startResources: { gold: 150 },
    startReputation: 0,
    attributeBonus: { negotiation: 2 },
  },
  {
    id: 'military',
    name: 'Military family',
    summary: 'Your family served in armies for generations. You know drills, discipline and stone fortifications.',
    startResources: { stone: 40 },
    startReputation: 0,
    attributeBonus: { military: 2, leadership: 1 },
  },
  {
    id: 'scholar',
    name: "Scholar's family",
    summary: 'Books and teachers filled your childhood. You learn faster and think further ahead.',
    startResources: {},
    startReputation: 1,
    attributeBonus: { intelligence: 2, administration: 1 },
  },
  {
    id: 'craftsman',
    name: "Craftsman's family",
    summary: 'You can build and repair almost anything. Extra timber and stone to start with.',
    startResources: { wood: 60, stone: 30 },
    startReputation: 0,
    attributeBonus: { administration: 2 },
  },
  {
    id: 'noble',
    name: 'Noble family',
    summary: 'Your name opens doors, but a title is not a kingdom. Extra gold and standing.',
    startResources: { gold: 100 },
    startReputation: 2,
    attributeBonus: { leadership: 2 },
  },
  {
    id: 'ordinary',
    name: 'Ordinary family',
    summary: 'You start with little, but a plain start also means no expectations. A balanced beginning.',
    startResources: { food: 60, wood: 20 },
    startReputation: 0,
    attributeBonus: { intelligence: 1, leadership: 1, negotiation: 1 },
  },
];

export const DIFFICULTIES: Difficulty[] = [
  { id: 'gentle', name: 'Gentle', summary: '+50% starting gold, 20% lower running costs. Good for learning.', startGoldMult: 1.5, expenseMult: 0.8 },
  { id: 'standard', name: 'Standard', summary: 'The intended balance.', startGoldMult: 1, expenseMult: 1 },
  { id: 'harsh', name: 'Harsh', summary: '30% less starting gold, 25% higher running costs.', startGoldMult: 0.7, expenseMult: 1.25 },
];

export function getBackground(id: string): Background {
  const b = BACKGROUNDS.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown background: ${id}`);
  return b;
}

export function getDifficulty(id: string): Difficulty {
  const d = DIFFICULTIES.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown difficulty: ${id}`);
  return d;
}
