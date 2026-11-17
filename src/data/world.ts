import type { Continent, ContinentId, Settlement } from '../game/types';

/** Map coordinates use a 400 x 600 canvas. */
export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 600;

export const CONTINENTS: Continent[] = [
  {
    id: 'nordheim',
    name: 'Nordheim',
    path: 'M70 60 L120 30 L190 40 L250 25 L320 50 L340 100 L300 140 L260 130 L230 165 L180 150 L140 170 L90 140 L60 100 Z',
    labelX: 200,
    labelY: 110,
    blurb: 'Cold northern territories of forests, mountains and fjords.',
  },
  {
    id: 'valoria',
    name: 'Valoria',
    path: 'M40 220 L90 190 L150 200 L200 185 L240 215 L235 270 L250 320 L200 360 L140 350 L90 365 L50 330 L35 270 Z',
    labelX: 140,
    labelY: 310,
    blurb: 'Fertile central lands, major cities and powerful kingdoms.',
  },
  {
    id: 'eshara',
    name: 'Eshara',
    path: 'M270 230 L330 200 L375 230 L385 300 L360 370 L310 395 L275 350 L285 300 Z',
    labelX: 330,
    labelY: 325,
    blurb: 'Tropical forests, mountains, great rivers and wealthy eastern kingdoms.',
  },
  {
    id: 'azrakar',
    name: 'Azrakar',
    path: 'M40 410 L100 395 L170 405 L225 430 L235 490 L205 545 L140 575 L80 555 L45 500 Z',
    labelX: 135,
    labelY: 440,
    blurb: 'Savannah, desert and forest-gold country crossed by ancient trade routes.',
  },
  {
    id: 'myrath',
    name: 'Myrath',
    path: 'M270 440 L330 425 L375 455 L385 520 L350 570 L295 565 L265 515 Z',
    labelX: 325,
    labelY: 455,
    blurb: 'Mysterious lands of ancient ruins and forgotten knowledge.',
  },
];

/** Small islands drawn on the map (the Serene Isle is where the merchant republic lives). */
export const ISLAND_PATHS: string[] = [
  'M240 385 L262 378 L275 392 L262 408 L242 404 Z',
  'M45 170 L62 162 L70 176 L55 184 Z',
  'M185 568 L205 560 L215 575 L195 585 Z',
];

export const SETTLEMENTS: Settlement[] = [
  // Nordheim
  { id: 'fjordhaven', name: 'Fjordhaven', continentId: 'nordheim', x: 150, y: 80, kind: 'port', population: 14, terrain: 'Fjord coast', resources: ['Timber', 'Fish', 'Iron'], description: 'A sheltered harbour where longships are built and hauled out for winter.' },
  { id: 'ironpeak', name: 'Ironpeak', continentId: 'nordheim', x: 240, y: 70, kind: 'mine', population: 9, terrain: 'Mountains', resources: ['Iron', 'Stone'], description: 'Mining camps clinging to a cold ridge. Strong smiths, few farmers.' },
  { id: 'skaldmoor', name: 'Skaldmoor', continentId: 'nordheim', x: 285, y: 112, kind: 'village', population: 7, terrain: 'Moorland', resources: ['Sheep', 'Peat'], description: 'A windswept hall-village famous for its storytellers.' },
  // Valoria
  { id: 'aurelia', name: 'Aurelia', continentId: 'valoria', x: 140, y: 270, kind: 'city', population: 40, terrain: 'River plain', resources: ['Grain', 'Marble', 'Labour'], description: 'A walled city of forums and roads, the hub of Valorian administration.' },
  { id: 'veridian', name: 'Veridian Fields', continentId: 'valoria', x: 95, y: 240, kind: 'farmland', population: 18, terrain: 'Fertile plain', resources: ['Grain', 'Olives', 'Wine'], description: 'Rolling farmland that feeds half the continent.' },
  { id: 'port-calder', name: 'Port Calder', continentId: 'valoria', x: 205, y: 328, kind: 'port', population: 22, terrain: 'Coast', resources: ['Fish', 'Salt', 'Trade'], description: 'A busy trading port facing the southern seas.' },
  // Eshara
  { id: 'jade-delta', name: 'Jade Delta', continentId: 'eshara', x: 335, y: 282, kind: 'city', population: 36, terrain: 'River delta', resources: ['Rice', 'Silk', 'Jade'], description: 'Canals and silk markets spread across a green river delta.' },
  { id: 'mistwater', name: 'Mistwater', continentId: 'eshara', x: 308, y: 238, kind: 'village', population: 11, terrain: 'Misty highlands', resources: ['Tea', 'Timber'], description: 'Terraced hills wrapped in morning mist.' },
  { id: 'sunspire', name: 'Sunspire', continentId: 'eshara', x: 330, y: 352, kind: 'city', population: 28, terrain: 'Tropical forest', resources: ['Spices', 'Hardwood'], description: 'A temple city with golden roofs above the canopy.' },
  // Azrakar
  { id: 'sikaman-crossing', name: 'Sikaman Crossing', continentId: 'azrakar', x: 120, y: 470, kind: 'city', population: 22, terrain: 'Forest and savannah', resources: ['Gold', 'Kola', 'Timber'], description: 'A crossroads town at the edge of the gold country, where roads from forest and savannah meet.' },
  { id: 'niani-bend', name: 'Niani Bend', continentId: 'azrakar', x: 190, y: 452, kind: 'city', population: 26, terrain: 'River bend', resources: ['Gold', 'Salt', 'Grain'], description: 'A river-bend capital of caravans, scribes and granaries.' },
  { id: 'dunemark', name: 'Dunemark', continentId: 'azrakar', x: 95, y: 520, kind: 'village', population: 10, terrain: 'Desert edge', resources: ['Salt', 'Camels'], description: 'Salt traders at the edge of the great dunes.' },
  { id: 'sahari-wells', name: 'Sahari Wells', continentId: 'azrakar', x: 170, y: 525, kind: 'village', population: 8, terrain: 'Oasis', resources: ['Dates', 'Water'], description: 'An oasis that every caravan route depends on.' },
  // Myrath
  { id: 'forgotten-gate', name: 'The Forgotten Gate', continentId: 'myrath', x: 322, y: 482, kind: 'ruins', population: 2, terrain: 'Ruined stone', resources: ['Ancient stone', 'Relics'], description: 'A vast gateway to nowhere, older than any known kingdom.' },
  { id: 'veil-ruins', name: 'Veil Ruins', continentId: 'myrath', x: 312, y: 535, kind: 'ruins', population: 1, terrain: 'Overgrown valley', resources: ['Lost records'], description: 'Collapsed libraries half-swallowed by creeping vines.' },
  // Islands
  { id: 'serene-harbour', name: 'Serene Harbour', continentId: 'islands', x: 258, y: 394, kind: 'port', population: 24, terrain: 'Island harbour', resources: ['Trade', 'Ships', 'Salt'], description: 'A merchant island of warehouses and counting-houses.' },
];

export function getSettlement(id: string): Settlement {
  const s = SETTLEMENTS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown settlement: ${id}`);
  return s;
}

export function continentName(id: ContinentId): string {
  if (id === 'islands') return 'Isles of the Inner Sea';
  return CONTINENTS.find((c) => c.id === id)?.name ?? id;
}
