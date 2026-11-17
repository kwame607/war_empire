import type { Civilisation } from '../game/types';

/**
 * Sample civilisations. Each is a fictional realm inspired by real history.
 * Historical figures appear in the Knowledge library with context, never as
 * contemporaries of each other.
 */
export const CIVILISATIONS: Civilisation[] = [
  {
    id: 'sikaman',
    name: 'Kingdom of Sikaman',
    inspiredBy: 'Ashanti (Asante) Empire',
    startSettlementId: 'sikaman-crossing',
    tagline: 'Gold, unity and the spirit of a nation',
    history:
      'Inspired by the Asante (Ashanti) Empire of the Gold Coast hinterland. Around 1701 Osei Tutu, guided by the priest Okomfo Anokye, united several states under the Golden Stool, a sacred symbol of the nation. Asante power grew on gold, trade and carefully coordinated armies. Centuries later Yaa Asantewaa led Asante resistance in the War of the Golden Stool (1900).',
    modifiers: { goldIncomeMult: 1.1, woodOutputMult: 1, buildTimeMult: 1, studyCostMult: 1, startGoldBonus: 0 },
    perks: ['+10% business gold income'],
  },
  {
    id: 'niani',
    name: 'Empire of Niani',
    inspiredBy: 'Mali Empire',
    startSettlementId: 'niani-bend',
    tagline: 'Scholars, caravans and rivers of gold',
    history:
      'Inspired by the Mali Empire (13th to 16th centuries), founded by Sundiata Keita. Mali grew rich on gold and the trans-Saharan trade. Mansa Musa, who ruled from about 1312 to 1337, is remembered for his pilgrimage to Mecca in 1324 and for supporting learning in cities such as Timbuktu.',
    modifiers: { goldIncomeMult: 1.05, woodOutputMult: 1, buildTimeMult: 1, studyCostMult: 0.85, startGoldBonus: 0 },
    perks: ['+5% business gold income', '15% cheaper study'],
  },
  {
    id: 'fjordlands',
    name: 'The Fjordlands',
    inspiredBy: 'Viking-age Norse',
    startSettlementId: 'fjordhaven',
    tagline: 'Longships, timber and hard seas',
    history:
      'Inspired by Norse seafaring communities of the Viking Age (roughly 8th to 11th centuries): farmers, traders, shipbuilders and raiders who crossed seas and rivers from Scandinavia to the wider world.',
    modifiers: { goldIncomeMult: 1, woodOutputMult: 1.25, buildTimeMult: 1, studyCostMult: 1, startGoldBonus: 0 },
    perks: ['+25% wood output'],
  },
  {
    id: 'aurelia',
    name: 'Aurelian Republic',
    inspiredBy: 'Roman Republic and Empire',
    startSettlementId: 'aurelia',
    tagline: 'Roads, law and disciplined legions',
    history:
      'Inspired by Rome, whose strength rested on administration, engineering and a citizen army organised in legions. Roads, aqueducts and law bound far-flung provinces together.',
    modifiers: { goldIncomeMult: 1, woodOutputMult: 1, buildTimeMult: 0.85, studyCostMult: 1, startGoldBonus: 0 },
    perks: ['15% faster construction and upgrades'],
  },
  {
    id: 'serene',
    name: 'Serene Republic',
    inspiredBy: 'Medieval merchant republics',
    startSettlementId: 'serene-harbour',
    tagline: 'Ships, ledgers and island wealth',
    history:
      'Inspired by maritime merchant republics such as Venice and Genoa, where trading families, fleets and banking made small island states powerful far beyond their size.',
    modifiers: { goldIncomeMult: 1.05, woodOutputMult: 1, buildTimeMult: 1, studyCostMult: 1, startGoldBonus: 100 },
    perks: ['+5% business gold income', '+100 starting gold'],
  },
];

export function getCivilisation(id: string): Civilisation {
  const civ = CIVILISATIONS.find((c) => c.id === id);
  if (!civ) throw new Error(`Unknown civilisation: ${id}`);
  return civ;
}
