import { getStageIndex, institutionLevel, sumUnits, understoodCount } from '../game/selectors';
import type { GameState } from '../game/types';

export type Goal =
  | { kind: 'businesses'; n: number }
  | { kind: 'understood'; n: number }
  | { kind: 'army'; n: number }
  | { kind: 'wins'; n: number }
  | { kind: 'territories'; n: number }
  | { kind: 'ships'; n: number }
  | { kind: 'rep'; n: number }
  | { kind: 'stage'; n: number }
  | { kind: 'institution'; id: string };

export type Act = {
  id: string;
  title: string;
  story: string;
  goalText: string;
  goal: Goal;
  reward: { gold: number; rep: number };
};

export function goalMet(s: GameState, g: Goal): boolean {
  switch (g.kind) {
    case 'businesses': return s.businesses.length >= g.n;
    case 'understood': return understoodCount(s) >= g.n;
    case 'army': return sumUnits(s.army.units) >= g.n;
    case 'wins': return s.reports.filter((r) => r.result === 'victory').length >= g.n;
    case 'territories': return s.territories.length >= g.n;
    case 'ships': return s.fleet.ships >= g.n;
    case 'rep': return s.reputation >= g.n;
    case 'stage': return getStageIndex(s) >= g.n;
    case 'institution': return institutionLevel(s, g.id) >= 1;
  }
}

/** One four-act story per civilisation. Progress is read from the game itself. */
export const CAMPAIGNS: Record<string, { title: string; acts: Act[] }> = {
  sikaman: {
    title: 'The Golden Stool',
    acts: [
      { id: 'sikaman-1', title: 'Gold of the Forest', story: 'The elders gather beneath the great tree. Your people are many clans, strong in the forest but divided in purpose. They ask you to show that one rule can feed them all.', goalText: 'Own three businesses.', goal: { kind: 'businesses', n: 3 }, reward: { gold: 150, rep: 3 } },
      { id: 'sikaman-2', title: 'The Counsel of Elders', story: 'A council is only as wise as the stories it remembers. The elders ask you to study how other peoples fought and fell, so that Sikaman need not learn every lesson with blood.', goalText: 'Understand three historical records.', goal: { kind: 'understood', n: 3 }, reward: { gold: 200, rep: 4 } },
      { id: 'sikaman-3', title: 'Unity Under Arms', story: 'Rivals on the border test your resolve. A kingdom that cannot defend its gold will soon not have any. The clans send their young to your standard.', goalText: 'Win a battle.', goal: { kind: 'wins', n: 1 }, reward: { gold: 300, rep: 6 } },
      { id: 'sikaman-4', title: 'The Stool Endures', story: 'Traders from three continents speak your name at the market. The Stool, the soul of the nation, is carried out before the people. They ask only one thing: be a kingdom that others must reckon with.', goalText: 'Reach reputation 150.', goal: { kind: 'rep', n: 150 }, reward: { gold: 800, rep: 15 } },
    ],
  },
  niani: {
    title: 'Rivers of Gold',
    acts: [
      { id: 'niani-1', title: 'The Caravan Road', story: 'Camel trains crawl across the Sahel and every one of them must pass through your markets. A well-run road is worth more than a mine.', goalText: 'Own four businesses.', goal: { kind: 'businesses', n: 4 }, reward: { gold: 200, rep: 3 } },
      { id: 'niani-2', title: 'The House of Learning', story: 'Scholars from the river cities beg for books, and you grant them a house to keep them. A court that can read its own history rules with open eyes.', goalText: 'Build a Library.', goal: { kind: 'institution', id: 'library' }, reward: { gold: 250, rep: 5 } },
      { id: 'niani-3', title: 'Horse and Spear', story: 'The river lands are rich and therefore coveted. Your cavalry must be quick, your spears disciplined, and your generals aware of the lessons of the Mongols and the Zulu alike.', goalText: 'Win a battle.', goal: { kind: 'wins', n: 1 }, reward: { gold: 300, rep: 6 } },
      { id: 'niani-4', title: 'An Empire of the Rivers', story: 'Provinces send tribute, envoys arrive from far shores, and chroniclers write your name beside the great rulers of the age.', goalText: 'Hold a province.', goal: { kind: 'territories', n: 1 }, reward: { gold: 800, rep: 15 } },
    ],
  },
  fjordlands: {
    title: 'The Long Winter',
    acts: [
      { id: 'fjordlands-1', title: 'Timber and Tide', story: 'The winters are long and the hills are steep, but the fjords hold fish and forests hold masts. Make the cold work for you.', goalText: 'Own three businesses.', goal: { kind: 'businesses', n: 3 }, reward: { gold: 150, rep: 3 } },
      { id: 'fjordlands-2', title: 'The First Longship', story: 'A ship is both a farm and a fortress to the people of the fjords. Launch one, and the seas become roads.', goalText: 'Launch a ship.', goal: { kind: 'ships', n: 1 }, reward: { gold: 250, rep: 4 } },
      { id: 'fjordlands-3', title: 'Shield Wall', story: 'Raiders come down from the moors. Your hearth-guard stand shoulder to shoulder and learn that discipline wins fights courage alone does not.', goalText: 'Win a battle.', goal: { kind: 'wins', n: 1 }, reward: { gold: 300, rep: 6 } },
      { id: 'fjordlands-4', title: 'Spring Returns', story: 'The ice breaks. Your ships carry grain and law to new shores, and your name is known where no one had ever heard of the fjords.', goalText: 'Hold a province.', goal: { kind: 'territories', n: 1 }, reward: { gold: 800, rep: 15 } },
    ],
  },
  aurelia: {
    title: 'The Road to the Forum',
    acts: [
      { id: 'aurelia-1', title: 'Stone and Law', story: 'The Republic is built of roads, aqueducts and written rules. Show that a city of order can feed itself and its neighbours.', goalText: 'Own four businesses.', goal: { kind: 'businesses', n: 4 }, reward: { gold: 200, rep: 3 } },
      { id: 'aurelia-2', title: 'The Legion Camp', story: 'Every night the legion builds a camp, and every morning it breaks one. A Barracks is where such habits begin.', goalText: 'Build a Barracks.', goal: { kind: 'institution', id: 'barracks' }, reward: { gold: 250, rep: 4 } },
      { id: 'aurelia-3', title: 'The Student of Cannae', story: 'The Senate remembers Hannibal with a shudder. Only by understanding how Rome once lost can you make sure it does not happen again.', goalText: 'Understand three records.', goal: { kind: 'understood', n: 3 }, reward: { gold: 300, rep: 6 } },
      { id: 'aurelia-4', title: 'Pax Aurelia', story: 'Your standards fly over distant provinces, and the Forum fills with delegations from cities that were once your rivals.', goalText: 'Hold a province.', goal: { kind: 'territories', n: 1 }, reward: { gold: 800, rep: 15 } },
    ],
  },
  serene: {
    title: 'Pearl of the Lagoon',
    acts: [
      { id: 'serene-1', title: 'Ledgers and Salt', story: 'The Republic floats on trade and trust. A merchant house that can never be cheated is worth ten that merely win.', goalText: 'Own four businesses.', goal: { kind: 'businesses', n: 4 }, reward: { gold: 200, rep: 3 } },
      { id: 'serene-2', title: 'The Arsenal', story: 'Galleys come off the slips like loaves from an oven. The Republic needs a fleet before it needs an army.', goalText: 'Launch a ship.', goal: { kind: 'ships', n: 1 }, reward: { gold: 250, rep: 4 } },
      { id: 'serene-3', title: 'Lessons of Lepanto', story: 'Great galleys clash on distant seas. Your admirals pore over how the Holy League won, and what it cost them.', goalText: 'Understand three records.', goal: { kind: 'understood', n: 3 }, reward: { gold: 300, rep: 6 } },
      { id: 'serene-4', title: 'Queen of the Seas', story: 'Ports from three continents hold your name in their ledgers. The lagoon city is small, but its voice carries across the water.', goalText: 'Reach reputation 150.', goal: { kind: 'rep', n: 150 }, reward: { gold: 800, rep: 15 } },
    ],
  },
};

export function campaignFor(civId: string) {
  return CAMPAIGNS[civId];
}
