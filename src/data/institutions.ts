import type { InstitutionType } from '../game/types';

/**
 * Institutions create capabilities, not money. Businesses pay for them.
 * Several are gated by knowledge or by other institutions, so wealth alone cannot buy them.
 */
export const INSTITUTION_TYPES: InstitutionType[] = [
  {
    id: 'library',
    name: 'Library',
    description: 'Scrolls, scribes and quiet rooms. Your scholars work faster.',
    icon: 'library-outline',
    cost: { gold: 250, wood: 60, stone: 40 },
    buildSeconds: 60,
    upkeepPerHour: 10,
    maxLevel: 3,
    requiresReputation: 4,
    effects: ['Study takes 12% less time', 'Study takes 24% less time', 'Study takes 36% less time'],
  },
  {
    id: 'barracks',
    name: 'Barracks',
    description: 'Housing and drill grounds. Without it, there is no army, only men with spears.',
    icon: 'home-outline',
    cost: { gold: 350, wood: 100, stone: 80 },
    buildSeconds: 90,
    upkeepPerHour: 18,
    maxLevel: 4,
    requiresReputation: 10,
    effects: [
      'Army of up to 20 soldiers; trains spearmen and archers',
      'Army of up to 40; training 25% faster',
      'Army of up to 60; training 50% faster',
      'Army of up to 80; training 75% faster',
    ],
  },
  {
    id: 'academy',
    name: 'Military Academy',
    description:
      'Where officers learn their craft from the records of old wars. It needs scholars who understand history, not just gold.',
    icon: 'school-outline',
    cost: { gold: 500, wood: 80, stone: 120 },
    buildSeconds: 150,
    upkeepPerHour: 28,
    maxLevel: 3,
    requiresReputation: 10,
    requiresUnderstood: 1,
    effects: ['Employ 1 commander', 'Employ 2 commanders; recruits are better trained', 'Employ 3 commanders; recruits are better trained'],
  },
  {
    id: 'armoury',
    name: 'Armoury',
    description: 'Smiths, saddlers and armourers. Better kit and the means to field horse and heavy foot.',
    icon: 'hammer-outline',
    cost: { gold: 450, wood: 60, stone: 150 },
    buildSeconds: 120,
    upkeepPerHour: 22,
    maxLevel: 3,
    requiresReputation: 10,
    requiresInstitution: { id: 'barracks', level: 1 },
    effects: [
      'Soldiers fight 5% better; unlocks cavalry',
      'Soldiers fight 10% better; unlocks heavy infantry',
      'Soldiers fight 15% better',
    ],
  },
  {
    id: 'bureau',
    name: 'Intelligence Bureau',
    description:
      'Spies, informers and code clerks. Learn what rivals are really doing, and make it harder for them to learn about you. It needs scribes, so a Library comes first.',
    icon: 'eye-outline',
    cost: { gold: 400, wood: 60, stone: 80 },
    buildSeconds: 100,
    upkeepPerHour: 20,
    maxLevel: 3,
    requiresReputation: 10,
    requiresInstitution: { id: 'library', level: 1 },
    effects: [
      'Employ 2 spies; enemy agents are less likely to learn your plans',
      'Employ 3 spies; faster missions, better reports, stronger counter-intelligence',
      'Employ 4 spies; faster missions, better reports, strongest counter-intelligence',
    ],
  },
];

export function getInstitutionType(id: string): InstitutionType {
  const t = INSTITUTION_TYPES.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown institution: ${id}`);
  return t;
}
