export type Investigation = { id: string; title: string; blurb: string; gold: number; rep: number };

/** Case files. The pictures and item positions live in the generated investigationAssets.ts. */
export const INVESTIGATIONS: Investigation[] = [
  { id: 'tent', title: 'The Commander’s Tent', blurb: 'A courier slipped out before dawn and the war council left in a hurry. Search the tent for what they left behind.', gold: 100, rep: 3 },
];

export const getInvestigation = (id: string) => INVESTIGATIONS.find((i) => i.id === id);
