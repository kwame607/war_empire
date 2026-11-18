import type { Scenario } from '../data/scenarios';
import { emptyUnits } from '../data/units';
import { mulberry32 } from './battle';
import { ANNEX_WINS_REQUIRED, WAR_ENEMY_SHARE } from './constants';
import { capitalOf } from './territoryCore';
import type { EnemyTrait, GameState, Rival, Terrain, War, Weather } from './types';

const TRAIT_OF: Record<Rival['trait'], EnemyTrait> = {
  expansionist: 'impetuous',
  honourable: 'cautious',
  treacherous: 'cunning',
  mercantile: 'cautious',
};
const TERRAINS: Terrain[] = ['plain', 'forest', 'hills', 'river', 'desert'];
const WEATHERS: Weather[] = ['clear', 'clear', 'rain', 'fog', 'heat'];
const COMMANDERS = ['General Auren', 'Marshal Teo', 'Warden Isak', 'Captain Ruvo', 'General Adwoa', 'Strategos Pell'];

/** The army a kingdom can send against you, scaled from its strength. */
export function buildWarScenario(rival: Rival, seed: number): Scenario {
  const rng = mulberry32((seed + rival.id.length * 977) >>> 0);
  const total = Math.max(12, Math.round(rival.power * WAR_ENEMY_SHARE));
  const heavy = rival.power > 80 ? Math.round(total * 0.1) : 0;
  const cavalry = Math.round(total * (0.1 + rng() * 0.15));
  const archers = Math.round(total * (0.2 + rng() * 0.1));
  const spearmen = Math.max(1, total - heavy - cavalry - archers);
  const units = { ...emptyUnits(), spearmen, archers, cavalry, heavy };
  const terrain = TERRAINS[Math.floor(rng() * TERRAINS.length)];
  const hard = total > 45;
  return {
    id: `war-${rival.id}`,
    name: `War with ${rival.name}`,
    difficulty: hard ? 'Hard' : total > 28 ? 'Medium' : 'Easy',
    blurb: `${rival.name} musters a field army. Win battles to weaken them, then dictate terms of peace.`,
    rumour: `Their armies are ${rival.power < 40 ? 'modest' : rival.power < 80 ? 'sizeable' : 'vast'}.`,
    terrain,
    weather: WEATHERS[Math.floor(rng() * WEATHERS.length)],
    enemy: {
      name: `${rival.name} army`,
      commander: COMMANDERS[Math.floor(rng() * COMMANDERS.length)],
      trait: TRAIT_OF[rival.trait],
      units,
      morale: 62,
      supply: 4 + Math.floor(rng() * 2),
      fortified: terrain === 'hills' && rng() < 0.5,
      basePosture: null,
    },
    rewards: { gold: 120 + Math.round(rival.power * 3), food: 40, wood: 30, stone: 20, reputation: 3 },
    requiresReputation: 10,
    recommendedArmy: Math.round(total * 1.1),
  };
}

export function warScore(war: War): number {
  return war.wins - war.losses;
}

/** What peace would look like right now. */
/** Provinces you could take instead of gold. The capital is never on offer. */
export function annexable(war: War, rival: Rival): string[] {
  if (war.wins < ANNEX_WINS_REQUIRED || warScore(war) < 1) return [];
  return rival.holdings.filter((id) => id !== capitalOf(rival.id));
}

export function peaceTerms(war: War, rival: Rival): { kind: 'reparations' | 'white' | 'tribute'; gold: number; text: string } {
  const score = warScore(war);
  if (score >= 1) {
    const gold = Math.round(200 + rival.power * 3 + 100 * war.wins);
    return { kind: 'reparations', gold, text: `${rival.name} must pay ${gold} gold in reparations.` };
  }
  if (score === 0) return { kind: 'white', gold: 0, text: 'A white peace: both sides lay down arms, nothing exchanged.' };
  const gold = Math.round(100 + 50 * war.losses);
  return { kind: 'tribute', gold, text: `You must pay ${gold} gold to end the war.` };
}

export function atWarWith(state: GameState, rivalId: string): boolean {
  return state.war?.rivalId === rivalId;
}
