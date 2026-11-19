import { PROGRESSION_STAGES } from './progression';
import { getStageIndex, institutionLevel, sumUnits, understoodCount } from '../game/selectors';
import type { GameState } from '../game/types';

export type Achievement = {
  id: string;
  chapter: number;
  title: string;
  text: string;
  done: (s: GameState) => boolean;
  reward: { gold?: number; rep?: number };
};

export const CHAPTERS = [
  { title: 'I · Foundations', blurb: 'Every empire begins with a field and a first coin.' },
  { title: 'II · The Learned Ruler', blurb: 'Those who study the past are slower to repeat it.' },
  { title: 'III · The Sword', blurb: 'Armies are made of bread, drill and good orders.' },
  { title: 'IV · The Realm', blurb: 'Land, ships and neighbours.' },
  { title: 'V · Legend', blurb: 'What they will carve on your monument.' },
];

const wins = (s: GameState) => s.reports.filter((r) => r.result === 'victory').length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-trade', chapter: 0, title: 'First Furrow', text: 'Own your first business.', done: (s) => s.businesses.length >= 1, reward: { gold: 40 } },
  { id: 'three-trades', chapter: 0, title: 'Diverse Income', text: 'Own three businesses.', done: (s) => s.businesses.length >= 3, reward: { gold: 80 } },
  { id: 'master-builder', chapter: 0, title: 'Master Builder', text: 'Bring any business to level 3.', done: (s) => s.businesses.some((b) => b.level >= 3), reward: { gold: 120, rep: 2 } },
  { id: 'five-trades', chapter: 0, title: 'Merchant Prince', text: 'Own five businesses.', done: (s) => s.businesses.length >= 5, reward: { gold: 200, rep: 3 } },

  { id: 'first-understood', chapter: 1, title: 'A Lesson Learned', text: 'Reach Understanding of one record.', done: (s) => understoodCount(s) >= 1, reward: { rep: 2 } },
  { id: 'library', chapter: 1, title: 'House of Books', text: 'Build a Library.', done: (s) => institutionLevel(s, 'library') >= 1, reward: { gold: 100 } },
  { id: 'five-records', chapter: 1, title: 'Student of War', text: 'Understand five records.', done: (s) => understoodCount(s) >= 5, reward: { gold: 150, rep: 4 } },
  { id: 'rep-25', chapter: 1, title: 'A Name in the Market', text: 'Reach reputation 25.', done: (s) => s.reputation >= 25, reward: { gold: 60 } },

  { id: 'barracks', chapter: 2, title: 'Drums at Dawn', text: 'Build a Barracks.', done: (s) => institutionLevel(s, 'barracks') >= 1, reward: { gold: 100 } },
  { id: 'army-50', chapter: 2, title: 'A Real Army', text: 'Field 50 soldiers.', done: (s) => sumUnits(s.army.units) >= 50, reward: { gold: 150, rep: 3 } },
  { id: 'commander', chapter: 2, title: 'Captain of Captains', text: 'Hire a commander.', done: (s) => s.commanders.length >= 1, reward: { rep: 2 } },
  { id: 'first-victory', chapter: 2, title: 'First Blood', text: 'Win a battle.', done: (s) => wins(s) >= 1, reward: { gold: 200, rep: 5 } },

  { id: 'province', chapter: 3, title: 'Beyond the Walls', text: 'Hold a province.', done: (s) => s.territories.length >= 1, reward: { gold: 200, rep: 4 } },
  { id: 'first-ship', chapter: 3, title: 'Sails on the Horizon', text: 'Launch a ship.', done: (s) => s.fleet.ships >= 1, reward: { gold: 150 } },
  { id: 'stage-3', chapter: 3, title: 'A Kingdom Rises', text: 'Reach the third stage of power.', done: (s) => getStageIndex(s) >= 3, reward: { gold: 300, rep: 5 } },

  { id: 'wins-5', chapter: 4, title: 'Hardened Victor', text: 'Win five battles.', done: (s) => wins(s) >= 5, reward: { gold: 400, rep: 8 } },
  { id: 'rep-150', chapter: 4, title: 'Famed Across Seas', text: 'Reach reputation 150.', done: (s) => s.reputation >= 150, reward: { gold: 400 } },
  { id: 'top-stage', chapter: 4, title: 'Major World Power', text: `Reach "${PROGRESSION_STAGES[PROGRESSION_STAGES.length - 1].name}".`, done: (s) => getStageIndex(s) >= PROGRESSION_STAGES.length - 1, reward: { gold: 1000, rep: 20 } },
];
