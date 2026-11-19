export const CIVS_WITH_PORTRAITS = ["sikaman","niani","fjordlands","aurelia","serene"] as const;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Stable portrait key for a person: same name always gets the same face. */
export function portraitKey(civId: string, name: string): string {
  const civ = (CIVS_WITH_PORTRAITS as readonly string[]).includes(civId) ? civId : CIVS_WITH_PORTRAITS[hash(civId) % CIVS_WITH_PORTRAITS.length];
  return `${civ}_${(hash(name) % 6) + 1}`;
}

