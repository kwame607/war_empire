export type Investigation = { id: string; title: string; blurb: string; gold: number; rep: number; /** Case file that must be cleared first. */ requires?: string };

/** Case files. The pictures and item positions live in the generated investigationAssets.ts. */
export const INVESTIGATIONS: Investigation[] = [
  { id: 'tent', title: 'The Commander’s Tent', blurb: 'A courier slipped out before dawn and the war council left in a hurry. Search the tent for what they left behind.', gold: 100, rep: 3 },
  { id: 'camp', title: 'Dawn After the Battle', blurb: 'The armies have gone and the fires still smoulder. Soldiers dropped more than they meant to. Search the camp before the scavengers arrive.', gold: 150, rep: 4, requires: 'tent' },
  { id: 'study', title: 'The Spymaster’s Study', blurb: 'The spymaster vanished overnight, and the books on the shelves are not the only things worth reading. Find what was left behind.', gold: 200, rep: 5, requires: 'camp' },
];

export const getInvestigation = (id: string) => INVESTIGATIONS.find((i) => i.id === id);
