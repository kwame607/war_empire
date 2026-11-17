import type { BusinessType } from '../game/types';

/**
 * Business definitions. Numbers are per game hour (= per real hour).
 * Rebalance here, not in the screens.
 */
export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'farm',
    name: 'Grain Farm',
    description: 'Fields and granaries. Steady coin and the food a growing settlement needs.',
    icon: 'nutrition-outline',
    cost: { gold: 150, wood: 20 },
    buildSeconds: 20,
    incomePerHour: 25,
    expensesPerHour: 8,
    produces: { resource: 'food', perHour: 20 },
    employees: 3,
    maxLevel: 5,
    requiresReputation: 0,
  },
  {
    id: 'timber',
    name: 'Timber Camp',
    description: 'Axes and sawpits in the nearby forest. Wood for every building you will raise.',
    icon: 'git-branch-outline',
    cost: { gold: 120 },
    buildSeconds: 30,
    incomePerHour: 10,
    expensesPerHour: 6,
    produces: { resource: 'wood', perHour: 15 },
    employees: 4,
    maxLevel: 5,
    requiresReputation: 0,
  },
  {
    id: 'quarry',
    name: 'Stone Quarry',
    description: 'Cut stone for walls, roads and eventually fortresses.',
    icon: 'cube-outline',
    cost: { gold: 200, wood: 40 },
    buildSeconds: 45,
    incomePerHour: 15,
    expensesPerHour: 12,
    produces: { resource: 'stone', perHour: 12 },
    employees: 6,
    maxLevel: 5,
    requiresReputation: 2,
  },
  {
    id: 'workshop',
    name: 'Textile Workshop',
    description: 'Looms and dyers turning raw fibre into cloth that merchants pay well for.',
    icon: 'shirt-outline',
    cost: { gold: 300, wood: 60, stone: 20 },
    buildSeconds: 90,
    incomePerHour: 70,
    expensesPerHour: 25,
    employees: 8,
    maxLevel: 5,
    requiresReputation: 4,
  },
  {
    id: 'market',
    name: 'Market Hall',
    description: 'A roofed market where traders from many lands settle accounts. Your best earner so far.',
    icon: 'storefront-outline',
    cost: { gold: 450, wood: 80, stone: 60 },
    buildSeconds: 120,
    incomePerHour: 110,
    expensesPerHour: 40,
    employees: 10,
    maxLevel: 5,
    requiresReputation: 8,
  },
];

export function getBusinessType(id: string): BusinessType {
  const t = BUSINESS_TYPES.find((b) => b.id === id);
  if (!t) throw new Error(`Unknown business type: ${id}`);
  return t;
}
