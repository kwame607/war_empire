import type { Shape } from '../utils/shapes';
import type { Diagram } from './diagramTypes';

/**
 * Schematic, animated maps of the historical records. They show the shape of each battle, not exact
 * positions or numbers; the captions say what is firmly known and what is debated.
 * Gold is the side whose method the record teaches; red is its opponent.
 */

const grass = (): Shape[] => [
  { t: 'rect', x: 0, y: 0, w: 160, h: 100, fill: '#4F5E33' },
  ...[12, 30, 52, 70, 90].map((y): Shape => ({ t: 'line', x1: 0, y1: y, x2: 160, y2: y + 4, stroke: '#5A6A3A', sw: 0.6 })),
];

const sea = (): Shape[] => [{ t: 'rect', x: 0, y: 0, w: 160, h: 100, fill: '#173E66' }, ...[14, 34, 54, 74, 92].map((y): Shape => ({ t: 'path', d: `M0 ${y} Q10 ${y - 3} 20 ${y} T40 ${y} T60 ${y} T80 ${y} T100 ${y} T120 ${y} T140 ${y} T160 ${y}`, stroke: '#245580', sw: 0.5, fill: undefined }))];

export const DIAGRAMS: Record<string, Diagram> = {
  cannae: {
    bg: '#4F5E33',
    decor: [
      ...grass(),
      // The river Aufidus on the west (left) flank
      { t: 'path', d: 'M10 0 Q22 20 10 40 Q0 60 14 80 Q20 92 12 100 L0 100 L0 0 Z', fill: '#2F5C86' },
      { t: 'text', x: 8, y: 56, text: 'River', size: 4, fill: '#BFD6EA', rot: [-90, 8, 56] },
    ],
    sideA: 'Carthage (Hannibal)',
    sideB: 'Rome',
    units: [
      { id: 'cavL', side: 'a', kind: 'cavalry', label: 'Iberian & Gallic horse' },
      { id: 'libL', side: 'a', kind: 'heavy', label: 'Libyans' },
      { id: 'mid', side: 'a', kind: 'infantry', label: 'Gauls & Iberians' },
      { id: 'libR', side: 'a', kind: 'heavy' },
      { id: 'cavR', side: 'a', kind: 'cavalry', label: 'Numidians' },
      { id: 'romCav', side: 'b', kind: 'cavalry' },
      { id: 'legions', side: 'b', kind: 'infantry', label: 'Roman legions' },
      { id: 'allyCav', side: 'b', kind: 'cavalry' },
    ],
    scenes: [
      {
        unlocksAtStage: 1,
        caption: 'August 216 BC. Rome masses a deep block in the centre. Hannibal bows his weaker infantry forward in a crescent, with his best troops on both ends and cavalry on the wings.',
        poses: {
          cavL: { x: 24, y: 74 },
          libL: { x: 52, y: 72, w: 16, h: 7 },
          mid: { x: 80, y: 64, w: 40, h: 6 },
          libR: { x: 108, y: 72, w: 16, h: 7 },
          cavR: { x: 138, y: 74 },
          romCav: { x: 26, y: 32 },
          legions: { x: 80, y: 28, w: 52, h: 22 },
          allyCav: { x: 138, y: 32 },
        },
      },
      {
        unlocksAtStage: 1,
        caption: 'The legions advance on the centre. Hannibal’s centre gives ground slowly, so the crescent bends inward and the Romans are drawn in between his strong flanks.',
        poses: {
          legions: { x: 80, y: 46, w: 48, h: 24 },
          mid: { x: 80, y: 74, w: 34, h: 6 },
          libL: { x: 52, y: 62, w: 16, h: 7 },
          libR: { x: 108, y: 62, w: 16, h: 7 },
          cavL: { x: 24, y: 40 },
          romCav: { x: 26, y: 34 },
        },
        arrows: [{ from: [80, 30], to: [80, 52], side: 'b' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'On the river flank the Carthaginian cavalry beat the Roman horse. The Libyan infantry on the ends turn inward to face the packed Roman flanks.',
        poses: {
          romCav: { x: 14, y: 20, o: 0.25 },
          cavL: { x: 22, y: 30 },
          libL: { x: 56, y: 60, w: 18, h: 7, rot: 90 },
          libR: { x: 104, y: 60, w: 18, h: 7, rot: 90 },
          legions: { x: 80, y: 52, w: 36, h: 26 },
        },
        arrows: [
          { from: [56, 60], to: [66, 56], side: 'a' },
          { from: [104, 60], to: [94, 56], side: 'a' },
        ],
      },
      {
        unlocksAtStage: 2,
        caption: 'The victorious cavalry sweep around behind the Roman army, while the Numidians hold the allied horse in check on the other wing.',
        poses: {
          cavL: { x: 60, y: 14 },
          cavR: { x: 100, y: 22 },
          allyCav: { x: 138, y: 30, o: 0.3 },
          legions: { x: 80, y: 54, w: 32, h: 26 },
        },
        arrows: [
          { from: [24, 30], to: [58, 14], side: 'a' },
          { from: [138, 66], to: [104, 24], side: 'a' },
        ],
      },
      {
        unlocksAtStage: 2,
        caption: 'The ring closes. Packed so tightly that most cannot fight, the Roman army is cut down: one of the worst defeats in Roman history. Ancient sources give very large numbers of dead, and modern estimates are debated.',
        poses: {
          cavL: { x: 52, y: 22 },
          cavR: { x: 108, y: 22 },
          legions: { x: 80, y: 52, w: 24, h: 22, o: 0.8 },
          mid: { x: 80, y: 74, w: 34, h: 6 },
        },
        marks: [{ x: 80, y: 90, text: 'Surrounded', color: '#F5D88A' }],
      },
    ],
  },

  'buffalo-horns': {
    bg: '#6A6A3A',
    decor: [
      { t: 'rect', x: 0, y: 0, w: 160, h: 100, fill: '#6A6A3A' },
      ...[10, 28, 46, 64, 82].map((y): Shape => ({ t: 'line', x1: 0, y1: y, x2: 160, y2: y + 3, stroke: '#77763F', sw: 0.6 })),
      { t: 'path', d: 'M120 96 Q130 80 150 84 L160 100 L110 100 Z', fill: '#5B5A33' },
    ],
    sideA: 'Zulu impi',
    sideB: 'Opposing force',
    units: [
      { id: 'hornL', side: 'a', kind: 'infantry', label: 'Left horn' },
      { id: 'chest', side: 'a', kind: 'infantry', label: 'Chest' },
      { id: 'hornR', side: 'a', kind: 'infantry', label: 'Right horn' },
      { id: 'loins', side: 'a', kind: 'infantry', label: 'Loins (reserve)' },
      { id: 'foe', side: 'b', kind: 'infantry', label: 'Enemy' },
    ],
    scenes: [
      {
        unlocksAtStage: 1,
        caption: 'The impi forms up in the shape of a buffalo: a strong chest in the middle, two horns on the flanks, and a reserve, the loins, held back.',
        poses: {
          hornL: { x: 36, y: 74, w: 14, h: 6 },
          chest: { x: 80, y: 68, w: 36, h: 8 },
          hornR: { x: 124, y: 74, w: 14, h: 6 },
          loins: { x: 80, y: 88, w: 22, h: 6 },
          foe: { x: 80, y: 22, w: 36, h: 8 },
        },
      },
      {
        unlocksAtStage: 1,
        caption: 'The chest advances to pin the enemy to the spot. Meanwhile the horns run wide, out of the enemy’s line of sight, to circle round each side.',
        poses: {
          chest: { x: 80, y: 44, w: 36, h: 8 },
          hornL: { x: 16, y: 52, w: 14, h: 6 },
          hornR: { x: 144, y: 52, w: 14, h: 6 },
        },
        arrows: [
          { from: [80, 62], to: [80, 50], side: 'a' },
          { from: [30, 70], to: [18, 54], side: 'a' },
          { from: [130, 70], to: [142, 54], side: 'a' },
        ],
      },
      {
        unlocksAtStage: 2,
        caption: 'The horns sweep forward and inward, and the enemy, held in front, finds fighters closing in on both flanks.',
        poses: {
          hornL: { x: 40, y: 22, w: 14, h: 6, rot: 90 },
          hornR: { x: 120, y: 22, w: 14, h: 6, rot: 90 },
          foe: { x: 80, y: 28, w: 30, h: 8 },
        },
        arrows: [
          { from: [20, 46], to: [38, 26], side: 'a' },
          { from: [140, 46], to: [122, 26], side: 'a' },
        ],
      },
      {
        unlocksAtStage: 2,
        caption: 'The horns meet behind the enemy. The loins, kept fresh until now, are sent in where the line is weakest. Surrounded, the enemy cannot retreat or use its numbers.',
        poses: {
          hornL: { x: 56, y: 14, w: 16, h: 6 },
          hornR: { x: 104, y: 14, w: 16, h: 6 },
          loins: { x: 80, y: 62, w: 22, h: 6 },
          foe: { x: 80, y: 28, w: 22, h: 8, o: 0.7 },
        },
        arrows: [{ from: [80, 80], to: [80, 66], side: 'a' }],
        marks: [{ x: 80, y: 90, text: 'Encircled', color: '#F5D88A' }],
      },
    ],
  },

  'feigned-retreat': {
    bg: '#6E6A3C',
    decor: [
      { t: 'rect', x: 0, y: 0, w: 160, h: 100, fill: '#6E6A3C' },
      ...[8, 26, 44, 62, 80].map((y): Shape => ({ t: 'line', x1: 0, y1: y, x2: 160, y2: y + 3, stroke: '#7A7645', sw: 0.6 })),
      { t: 'path', d: 'M150 0 Q138 30 150 55 Q160 75 148 100 L160 100 L160 0 Z', fill: '#2F5C86' },
      { t: 'text', x: 154, y: 50, text: 'Kalka', size: 4, fill: '#BFD6EA', rot: [-90, 154, 50] },
    ],
    sideA: 'Mongol army',
    sideB: 'Rus’ and allies',
    units: [
      { id: 'vanguard', side: 'a', kind: 'cavalry', label: 'Mongol vanguard' },
      { id: 'main', side: 'a', kind: 'cavalry', label: 'Main force' },
      { id: 'ruCav', side: 'b', kind: 'cavalry', label: 'Eager contingent' },
      { id: 'ruInf', side: 'b', kind: 'infantry', label: 'Rest of the army' },
    ],
    scenes: [
      {
        unlocksAtStage: 1,
        caption: 'Kalka River, 1223. A Mongol raiding army meets a coalition of Rus’ princes and Cuman allies. The Mongols’ main strength is held back out of sight.',
        poses: {
          vanguard: { x: 70, y: 30 },
          main: { x: 70, y: 8, w: 18, h: 6, o: 0.35 },
          ruCav: { x: 64, y: 74 },
          ruInf: { x: 96, y: 86, w: 22, h: 6 },
        },
      },
      {
        unlocksAtStage: 1,
        caption: 'The Mongol vanguard skirmishes, then pulls back. The most eager Rus’ contingent charges after what looks like a beaten enemy.',
        poses: {
          vanguard: { x: 60, y: 16 },
          ruCav: { x: 62, y: 52 },
          ruInf: { x: 96, y: 82, w: 22, h: 6 },
        },
        arrows: [{ from: [64, 64], to: [62, 50], side: 'b' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'The pursuit goes on for days in the sources. The retreating horsemen keep their distance while the pursuers stretch out, tire and lose touch with the rest of their army.',
        poses: {
          vanguard: { x: 36, y: 14 },
          main: { x: 54, y: 10, w: 18, h: 6, o: 1 },
          ruCav: { x: 44, y: 34 },
          ruInf: { x: 92, y: 74, w: 22, h: 6 },
        },
        arrows: [{ from: [58, 30], to: [44, 18], side: 'b' }],
        marks: [{ x: 72, y: 54, text: 'Gap opens', color: '#F5D88A' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'The Mongols turn. The vanguard and the fresh main force strike the exhausted, separated contingent.',
        poses: {
          vanguard: { x: 50, y: 30 },
          main: { x: 40, y: 26, w: 18, h: 6 },
          ruCav: { x: 44, y: 38, o: 0.55 },
        },
        arrows: [
          { from: [34, 14], to: [42, 32], side: 'a' },
          { from: [60, 14], to: [52, 32], side: 'a' },
        ],
      },
      {
        unlocksAtStage: 2,
        caption: 'Then they turn on the rest. The coalition never fought as one: its divided command and a camp left unprepared meant a heavy defeat for the Rus’. Sources differ on details and numbers.',
        poses: {
          vanguard: { x: 80, y: 62 },
          main: { x: 70, y: 56, w: 20, h: 6 },
          ruCav: { x: 44, y: 38, o: 0 },
          ruInf: { x: 96, y: 78, w: 20, h: 6, o: 0.7 },
        },
        arrows: [{ from: [72, 50], to: [90, 70], side: 'a' }],
      },
    ],
  },

  'russia-1812': {
    bg: '#34445A',
    decor: [
      { t: 'rect', x: 0, y: 0, w: 160, h: 100, fill: '#34445A' },
      { t: 'path', d: 'M0 60 Q40 50 80 58 T160 54 L160 100 L0 100 Z', fill: '#C9D3DA', o: 0.35 },
      { t: 'line', x1: 8, y1: 20, x2: 8, y2: 86, stroke: '#EDE3CC', sw: 0.8, dash: '2 2' },
      { t: 'text', x: 8, y: 14, text: 'Niemen', size: 4, fill: '#EDE3CC' },
      { t: 'circle', cx: 146, cy: 50, r: 3, fill: '#EDE3CC' },
      { t: 'text', x: 146, y: 44, text: 'Moscow', size: 4, fill: '#EDE3CC' },
    ],
    sideA: 'Grande Armée',
    sideB: 'Russian armies',
    units: [
      { id: 'grande', side: 'a', kind: 'infantry', label: 'Grande Armée' },
      { id: 'rus', side: 'b', kind: 'infantry', label: 'Russian armies' },
    ],
    scenes: [
      {
        unlocksAtStage: 1,
        caption: 'June 1812. A huge Grande Armée crosses the Niemen into Russia, expecting a decisive battle near the border.',
        poses: { grande: { x: 24, y: 50, w: 36, h: 18 }, rus: { x: 62, y: 50, w: 22, h: 10 } },
      },
      {
        unlocksAtStage: 1,
        caption: 'The Russian armies keep falling back, avoiding a general battle. Supplies, sickness and long marches begin to cost the invaders far more men than the fighting.',
        poses: { grande: { x: 58, y: 50, w: 30, h: 16 }, rus: { x: 96, y: 50, w: 22, h: 10 } },
        arrows: [{ from: [84, 36], to: [104, 36], side: 'b' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'Withdrawing, the Russians strip the land of food and fodder. The French must haul supplies over long, thinning roads. Borodino is a bloody but indecisive battle; Moscow falls in September.',
        poses: { grande: { x: 112, y: 50, w: 24, h: 12 }, rus: { x: 128, y: 70, w: 22, h: 10 } },
        marks: [
          { x: 70, y: 76, text: 'Scorched land', color: '#F29B38' },
        ],
      },
      {
        unlocksAtStage: 2,
        caption: 'The Russians will not make peace, and Moscow cannot feed the army through winter. The Grande Armée turns back in October. Hunger, cold and constant harassment destroy most of what is left.',
        poses: { grande: { x: 70, y: 50, w: 12, h: 6, o: 0.8 }, rus: { x: 90, y: 34, w: 22, h: 10 } },
        arrows: [{ from: [124, 52], to: [78, 52], side: 'a' }],
        marks: [{ x: 70, y: 84, text: 'Winter, hunger, loss', color: '#CFE3F2' }],
      },
    ],
  },

  salamis: {
    bg: '#173E66',
    decor: [
      ...sea(),
      // land: the mainland coast above and the island of Salamis below, pinching the channel in the middle
      { t: 'path', d: 'M0 0 L160 0 L160 12 Q130 14 110 30 Q90 40 70 32 Q40 14 0 12 Z', fill: '#5C4B32' },
      { t: 'path', d: 'M0 100 L160 100 L160 88 Q130 86 110 70 Q90 62 70 68 Q40 86 0 88 Z', fill: '#5C4B32' },
      { t: 'text', x: 20, y: 7, text: 'Attica', size: 4.4, fill: '#EDE3CC' },
      { t: 'text', x: 20, y: 96, text: 'Salamis', size: 4.4, fill: '#EDE3CC' },
    ],
    sideA: 'Greek fleet',
    sideB: 'Persian fleet',
    units: [
      { id: 'greeks', side: 'a', kind: 'fleet', label: 'Greeks' },
      { id: 'persians', side: 'b', kind: 'fleet', label: 'Persians' },
    ],
    scenes: [
      {
        unlocksAtStage: 1,
        caption: 'September 480 BC. The smaller Greek fleet waits in the sheltered waters by the island of Salamis. The much larger Persian fleet masses in the open sea.',
        poses: {
          greeks: { x: 130, y: 50, w: 20, h: 30, count: 8 },
          persians: { x: 30, y: 50, w: 44, h: 40, count: 16 },
        },
      },
      {
        unlocksAtStage: 2,
        caption: 'Tempted by a message, in Herodotus’s account, that the Greeks are about to flee, the Persians send their fleet into the narrow strait.',
        poses: {
          persians: { x: 68, y: 50, w: 36, h: 24, count: 16 },
        },
        arrows: [{ from: [40, 50], to: [78, 50], side: 'b' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'In the narrows the numbers become a handicap. Ships cannot turn or keep formation, and they foul each other’s oars.',
        poses: {
          persians: { x: 90, y: 50, w: 22, h: 20, count: 16 },
          greeks: { x: 120, y: 50, w: 10, h: 34, count: 8 },
        },
        marks: [{ x: 90, y: 38, text: 'Crowded', color: '#F5D88A' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'The Greek line holds together and rams the Persian ships as they bunch up. The ancient accounts give about 200 Persian ships lost against about 40 Greek, and the numbers are uncertain.',
        poses: {
          greeks: { x: 104, y: 50, w: 12, h: 34, count: 8 },
          persians: { x: 84, y: 50, w: 22, h: 20, count: 9 },
        },
        arrows: [{ from: [118, 50], to: [98, 50], side: 'a' }],
      },
    ],
  },

  lepanto: {
    bg: '#173E66',
    decor: [
      ...sea(),
      { t: 'path', d: 'M0 0 L160 0 L160 8 Q110 16 80 8 Q40 2 0 10 Z', fill: '#5C4B32' },
      { t: 'path', d: 'M0 100 L160 100 L160 92 Q110 86 80 94 Q40 98 0 90 Z', fill: '#5C4B32' },
      { t: 'text', x: 80, y: 5, text: 'Gulf of Patras', size: 4.4, fill: '#EDE3CC' },
    ],
    sideA: 'Holy League',
    sideB: 'Ottoman fleet',
    units: [
      { id: 'gal1', side: 'a', kind: 'galleass', label: 'Galleasses' },
      { id: 'gal2', side: 'a', kind: 'galleass' },
      { id: 'gal3', side: 'a', kind: 'galleass' },
      { id: 'league', side: 'a', kind: 'fleet', label: 'Holy League galleys' },
      { id: 'ottoman', side: 'b', kind: 'fleet', label: 'Ottoman galleys' },
    ],
    scenes: [
      {
        unlocksAtStage: 1,
        caption: '7 October 1571. Two great galley fleets face each other in the Gulf of Patras. The Holy League has towed six heavy galleasses ahead of its line.',
        poses: {
          gal1: { x: 56, y: 26 },
          gal2: { x: 56, y: 50 },
          gal3: { x: 56, y: 74 },
          league: { x: 38, y: 50, w: 10, h: 66, count: 18 },
          ottoman: { x: 126, y: 50, w: 10, h: 66, count: 18 },
        },
      },
      {
        unlocksAtStage: 2,
        caption: 'As the Ottoman fleet advances, the galleasses fire into its leading galleys, sinking some and, by most accounts, breaking up its formation.',
        poses: {
          ottoman: { x: 96, y: 50, w: 14, h: 70, count: 18 },
        },
        arrows: [
          { from: [62, 26], to: [86, 32], side: 'a' },
          { from: [62, 50], to: [86, 50], side: 'a' },
          { from: [62, 74], to: [86, 68], side: 'a' },
        ],
        marks: [{ x: 100, y: 16, text: 'Line disordered', color: '#F5D88A' }],
      },
      {
        unlocksAtStage: 2,
        caption: 'The lines clash. Soldiers with firearms aboard the League galleys decide the boarding fights, and the Ottoman centre is overwhelmed.',
        poses: {
          league: { x: 66, y: 50, w: 12, h: 60, count: 18 },
          ottoman: { x: 82, y: 50, w: 16, h: 56, count: 13 },
        },
      },
      {
        unlocksAtStage: 2,
        caption: 'The Ottoman fleet is largely destroyed, a great victory for the League. Estimates of losses vary, but the Ottomans rebuilt their fleet within a year and kept Cyprus.',
        poses: {
          league: { x: 62, y: 50, w: 12, h: 56, count: 16 },
          ottoman: { x: 90, y: 50, w: 14, h: 40, count: 6, o: 0.8 },
        },
      },
    ],
  },
};

export function getDiagram(id: string): Diagram | undefined {
  return DIAGRAMS[id];
}
