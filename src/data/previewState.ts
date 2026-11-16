import type { PlayerSummary } from '@/game/types';

/**
 * TEMPORARY sample data so the Phase 2 screens have something to show.
 * It is replaced by the real saved game state in Phases 3 to 6.
 */
export const previewPlayer: PlayerSummary = {
  name: 'Unnamed Citizen',
  status: 'Ordinary Citizen',
  location: 'Unknown Village',
  reputation: 0,
  dateLabel: 'Year 1 · Spring',
  resources: { gold: 500, food: 200, wood: 120, stone: 60, population: 12 },
};
