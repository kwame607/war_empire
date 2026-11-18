import type { EnemyStance, EnemyTrait, Terrain, UnitCounts, Weather } from '../game/types';

export type Scenario = {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  blurb: string;
  /** What rumour tells you before you scout. */
  rumour: string;
  terrain: Terrain;
  weather: Weather;
  enemy: {
    name: string;
    commander: string;
    trait: EnemyTrait;
    units: UnitCounts;
    morale: number;
    supply: number;
    fortified: boolean;
    basePosture: EnemyStance | null;
  };
  rewards: { gold: number; food: number; wood: number; stone: number; reputation: number };
  requiresReputation: number;
  /** Veterans' advice on army size, shown to the player. */
  recommendedArmy: number;
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'raiders',
    name: 'Roadside Raiders',
    difficulty: 'Easy',
    blurb: 'A raiding band preys on caravans passing through the forest road. Reckless, but they know the trees.',
    rumour: 'A few dozen bandits, mostly on foot.',
    terrain: 'forest',
    weather: 'clear',
    enemy: {
      name: 'Raider band',
      commander: 'Captain Dro',
      trait: 'impetuous',
      units: { spearmen: 8, archers: 3, cavalry: 0, heavy: 0 },
      morale: 60,
      supply: 4,
      fortified: false,
      basePosture: null,
    },
    rewards: { gold: 120, food: 30, wood: 25, stone: 0, reputation: 2 },
    requiresReputation: 10,
    recommendedArmy: 16,
  },
  {
    id: 'warband',
    name: 'Rival Warband',
    difficulty: 'Medium',
    blurb: 'A neighbouring warlord has crossed onto open ground and wants a decisive battle. Proud, with a strong horse wing.',
    rumour: 'A proud warband with horsemen. It wants to fight.',
    terrain: 'plain',
    weather: 'clear',
    enemy: {
      name: "Hesk's warband",
      commander: 'Warlord Hesk',
      trait: 'impetuous',
      units: { spearmen: 13, archers: 5, cavalry: 6, heavy: 0 },
      morale: 75,
      supply: 8,
      fortified: false,
      basePosture: null,
    },
    rewards: { gold: 220, food: 50, wood: 30, stone: 10, reputation: 3 },
    requiresReputation: 10,
    recommendedArmy: 26,
  },
  {
    id: 'hillfort',
    name: 'The Hill Camp',
    difficulty: 'Hard',
    blurb: 'A cautious commander has dug in on a fog-wreathed hill with ditches and palisades. He will not come down to fight.',
    rumour: 'A fortified camp on high ground. Numbers unknown.',
    terrain: 'hills',
    weather: 'fog',
    enemy: {
      name: 'Hill-camp garrison',
      commander: 'Warden Maro',
      trait: 'cautious',
      units: { spearmen: 14, archers: 8, cavalry: 0, heavy: 5 },
      morale: 70,
      supply: 6,
      fortified: true,
      basePosture: 'defensive',
    },
    rewards: { gold: 350, food: 40, wood: 40, stone: 40, reputation: 5 },
    requiresReputation: 10,
    recommendedArmy: 32,
  },
  {
    id: 'steppe',
    name: 'Steppe Riders',
    difficulty: 'Hard',
    blurb: 'Mounted archers sweep the grassland. A cunning leader reads your every move and refuses to be pinned.',
    rumour: 'Fast riders. No one knows how many.',
    terrain: 'plain',
    weather: 'heat',
    enemy: {
      name: 'Steppe horde',
      commander: 'Khan Orlag',
      trait: 'cunning',
      units: { spearmen: 0, archers: 14, cavalry: 14, heavy: 0 },
      morale: 78,
      supply: 8,
      fortified: false,
      basePosture: null,
    },
    rewards: { gold: 400, food: 60, wood: 0, stone: 0, reputation: 6 },
    requiresReputation: 10,
    recommendedArmy: 30,
  },
];

/** Scenarios created during play (wars with rival kingdoms). Re-registered from the save on every tick. */
const dynamic = new Map<string, Scenario>();
export function registerScenario(s: Scenario): void {
  dynamic.set(s.id, s);
}

export function getScenario(id: string): Scenario {
  const s = SCENARIOS.find((x) => x.id === id) ?? dynamic.get(id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}

/** Fixed operations plus the current war, if any. */
export function scenariosFor(war: { scenario: Scenario } | null): Scenario[] {
  return war ? [war.scenario, ...SCENARIOS] : SCENARIOS;
}
