import type { Shape } from '../utils/shapes';

/**
 * Small illustrated scenes for businesses and institutions (160 x 90 units).
 * Drawn as data so they render the same everywhere and can be previewed without a phone.
 */
export const ART_W = 160;
export const ART_H = 90;

const NAVY = '#14283F';
const NAVY2 = '#1C3652';
const GOLD = '#C9A24B';
const GOLDB = '#E6C468';
const BRONZE = '#8C6A35';
const PARCH = '#EDE3CC';
const STONE = '#8A8F96';
const STONE_D = '#5C6168';
const WOOD = '#7A5230';
const WOOD_D = '#4E331C';
const GREEN = '#4E7040';
const GREEN_D = '#2F4A2A';
const RED = '#9C2F3B';
const RED_D = '#5E1A24';
const SKY_GLOW = '#F4D58D';

const rect = (x: number, y: number, w: number, h: number, fill: string, extra: Partial<Extract<Shape, { t: 'rect' }>> = {}): Shape => ({ t: 'rect', x, y, w, h, fill, ...extra });
const circ = (cx: number, cy: number, r: number, fill: string, extra: Partial<Extract<Shape, { t: 'circle' }>> = {}): Shape => ({ t: 'circle', cx, cy, r, fill, ...extra });
const path = (d: string, fill: string | undefined, extra: Partial<Extract<Shape, { t: 'path' }>> = {}): Shape => ({ t: 'path', d, fill, ...extra });
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 1): Shape => ({ t: 'line', x1, y1, x2, y2, stroke, sw });
const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, extra: Partial<Extract<Shape, { t: 'ellipse' }>> = {}): Shape => ({ t: 'ellipse', cx, cy, rx, ry, fill, ...extra });

const sky = (glow = true): Shape[] => [
  rect(0, 0, ART_W, ART_H, NAVY),
  rect(0, 0, ART_W, 40, NAVY2, { o: 0.7 }),
  ...(glow ? [circ(28, 22, 11, SKY_GLOW, { o: 0.9 }), circ(28, 22, 16, SKY_GLOW, { o: 0.15 })] : []),
];

const tree = (x: number, y: number, s = 1): Shape[] => [
  rect(x - 1.6 * s, y - 6 * s, 3.2 * s, 7 * s, WOOD_D),
  path(`M${x - 9 * s} ${y - 5 * s} L${x} ${y - 30 * s} L${x + 9 * s} ${y - 5 * s} Z`, GREEN_D),
  path(`M${x - 7 * s} ${y - 14 * s} L${x} ${y - 34 * s} L${x + 7 * s} ${y - 14 * s} Z`, GREEN),
];

export const ILLUSTRATIONS: Record<string, Shape[]> = {
  farm: [
    ...sky(),
    path('M0 58 Q40 50 80 56 T160 54 L160 90 L0 90 Z', GREEN_D),
    path('M0 66 Q50 58 100 64 T160 62 L160 90 L0 90 Z', GREEN),
    ...[0, 1, 2, 3, 4].map((i) => line(-10 + i * 12, 90, 28 + i * 9, 62, '#6F9558', 1.2)),
    // barn
    rect(96, 38, 46, 30, RED),
    path('M91 40 L119 18 L147 40 Z', RED_D),
    rect(112, 48, 14, 20, WOOD_D),
    line(112, 48, 126, 68, GOLD, 1),
    line(126, 48, 112, 68, GOLD, 1),
    rect(103, 46, 6, 6, WOOD_D),
    // wheat
    ...[0, 1, 2, 3, 4, 5].flatMap((i): Shape[] => [line(20 + i * 8, 76, 20 + i * 8, 62, GOLDB, 1.2), ell(20 + i * 8, 60, 1.8, 4, GOLD)]),
    // fence
    line(60, 70, 92, 70, WOOD, 1.4),
    line(60, 74, 92, 74, WOOD, 1.4),
    ...[60, 70, 80, 90].map((x) => line(x, 66, x, 78, WOOD_D, 1.8)),
  ],
  timber: [
    ...sky(),
    path('M0 62 Q60 54 120 60 T160 58 L160 90 L0 90 Z', GREEN_D),
    ...tree(16, 70, 1),
    ...tree(36, 66, 1.2),
    ...tree(56, 72, 0.9),
    ...tree(78, 68, 1.3),
    rect(0, 72, 160, 18, '#35291B'),
    // log pile
    ...[0, 1, 2].map((i) => rect(104 + i * 0, 78 - i * 7, 40, 6, WOOD, { r: 3 })),
    ...[0, 1, 2].flatMap((i): Shape[] => [circ(144, 81 - i * 7, 3, '#C79A62', { stroke: WOOD_D, sw: 0.8 }), circ(144, 81 - i * 7, 1.2, WOOD)]),
    // axe in stump
    rect(96, 76, 10, 8, WOOD_D, { r: 1 }),
    line(101, 78, 118, 58, WOOD, 2),
    path('M113 55 L122 54 L119 63 L111 61 Z', STONE),
  ],
  quarry: [
    ...sky(false),
    circ(132, 20, 9, SKY_GLOW, { o: 0.6 }),
    path('M0 62 L24 34 L44 50 L70 26 L98 54 L124 40 L160 62 L160 90 L0 90 Z', STONE_D),
    path('M0 70 L30 52 L60 66 L96 48 L130 66 L160 56 L160 90 L0 90 Z', STONE),
    // stacked blocks
    rect(18, 70, 20, 10, '#B5B8BC', { stroke: STONE_D, sw: 0.8 }),
    rect(40, 70, 20, 10, '#A6AAB0', { stroke: STONE_D, sw: 0.8 }),
    rect(28, 60, 20, 10, '#C3C6CA', { stroke: STONE_D, sw: 0.8 }),
    // crane / sledge
    line(112, 78, 112, 40, WOOD, 2.4),
    line(112, 40, 140, 52, WOOD, 2),
    line(140, 52, 140, 64, PARCH, 0.8),
    rect(133, 64, 14, 9, '#B5B8BC', { stroke: STONE_D, sw: 0.8 }),
    // pickaxe
    line(76, 82, 92, 62, WOOD, 2),
    path('M84 58 Q94 56 100 64 L96 64 Q92 61 86 62 Z', '#C8CDD2'),
  ],
  workshop: [
    rect(0, 0, ART_W, ART_H, NAVY),
    rect(0, 58, ART_W, 32, '#2B2218'),
    // loom frame
    rect(30, 16, 5, 62, WOOD),
    rect(104, 16, 5, 62, WOOD),
    rect(26, 14, 86, 6, WOOD_D),
    // cloth
    ...[RED, GOLD, '#2F5C86', PARCH, RED, GOLD, '#2F5C86', PARCH, RED, GOLD, '#2F5C86', PARCH].map((c, i) => rect(36 + i * 5.6, 22, 5.6, 38, c, { o: 0.95 })),
    ...[0, 1, 2, 3, 4, 5].map((i) => line(36, 24 + i * 7, 103, 24 + i * 7, 'rgba(0,0,0,0.25)', 0.6)),
    // shuttle and thread
    path('M30 66 Q70 76 106 64', undefined, { stroke: GOLDB, sw: 1 }),
    ell(70, 70, 8, 2.2, WOOD_D),
    // bolts of cloth
    rect(122, 58, 26, 8, RED, { r: 4 }),
    rect(126, 66, 26, 8, '#2F5C86', { r: 4 }),
    rect(120, 74, 26, 8, GOLD, { r: 4 }),
    circ(36, 82, 6, PARCH, { stroke: BRONZE, sw: 1 }),
    line(36, 82, 36, 76, BRONZE, 1),
  ],
  market: [
    rect(0, 0, ART_W, ART_H, NAVY),
    rect(0, 64, ART_W, 26, '#3A2E20'),
    // stall posts and awning
    rect(22, 30, 3, 40, WOOD_D),
    rect(135, 30, 3, 40, WOOD_D),
    ...Array.from({ length: 10 }, (_, i) => path(`M${20 + i * 12} 22 L${32 + i * 12} 22 L${34 + i * 12} 38 L${22 + i * 12} 38 Z`, i % 2 ? PARCH : RED)),
    path('M20 38 Q26 44 32 38 Q38 44 44 38 Q50 44 56 38 Q62 44 68 38 Q74 44 80 38 Q86 44 92 38 Q98 44 104 38 Q110 44 116 38 Q122 44 128 38 Q134 44 140 38', undefined, { stroke: PARCH, sw: 0.8 }),
    // table
    rect(26, 60, 108, 6, WOOD),
    rect(30, 66, 4, 18, WOOD_D),
    rect(126, 66, 4, 18, WOOD_D),
    // wares
    ell(46, 57, 11, 5, '#B7803F'),
    ...[0, 1, 2, 3].map((i) => circ(40 + i * 5, 54 + (i % 2), 3, i % 2 ? '#C9473A' : '#D8A23A')),
    rect(72, 48, 14, 12, '#5E7A8C', { r: 2 }),
    rect(90, 44, 12, 16, '#8A5A9C', { r: 2 }),
    ell(118, 56, 10, 4, '#C9A24B'),
    ...[0, 1, 2, 3, 4].map((i) => circ(110 + i * 4.5, 52, 2.2, GOLDB, { stroke: BRONZE, sw: 0.5 })),
    // coin
    circ(146, 78, 5, GOLDB, { stroke: BRONZE, sw: 1 }),
    circ(146, 78, 2.4, undefined as unknown as string, { stroke: BRONZE, sw: 0.8 }),
  ],
  library: [
    ...sky(false),
    circ(132, 20, 10, SKY_GLOW, { o: 0.55 }),
    rect(0, 70, ART_W, 20, '#2B3A4A'),
    // steps
    rect(30, 66, 100, 4, STONE),
    rect(26, 70, 108, 5, STONE_D),
    // columns
    ...[0, 1, 2, 3, 4, 5].flatMap((i): Shape[] => [rect(36 + i * 16, 36, 7, 30, '#D9D3C3'), rect(35 + i * 16, 34, 9, 3, STONE), rect(35 + i * 16, 64, 9, 3, STONE)]),
    // pediment
    path('M28 34 L80 12 L132 34 Z', '#CFC8B4', { stroke: STONE_D, sw: 1 }),
    circ(80, 26, 4, GOLD, { stroke: BRONZE, sw: 0.8 }),
    // scroll and book in front
    rect(14, 74, 24, 8, PARCH, { r: 4 }),
    circ(14, 78, 4, '#D6CBB0', { stroke: BRONZE, sw: 0.8 }),
    circ(38, 78, 4, '#D6CBB0', { stroke: BRONZE, sw: 0.8 }),
    rect(122, 74, 22, 9, RED, { r: 1 }),
    rect(124, 75, 18, 7, PARCH, { r: 1 }),
    line(133, 75, 133, 82, BRONZE, 0.8),
  ],
  barracks: [
    ...sky(),
    rect(0, 66, ART_W, 24, '#3B3322'),
    // palisade
    ...Array.from({ length: 16 }, (_, i): Shape => path(`M${i * 10} 66 L${i * 10} 48 L${i * 10 + 5} 42 L${i * 10 + 10} 48 L${i * 10 + 10} 66 Z`, i % 2 ? WOOD : '#8B6039', { stroke: WOOD_D, sw: 0.6 })),
    // tents
    path('M24 82 L52 52 L80 82 Z', '#B8A47A', { stroke: BRONZE, sw: 1 }),
    path('M52 52 L52 82', undefined, { stroke: BRONZE, sw: 1 }),
    path('M44 82 L52 70 L60 82 Z', '#2A1F14'),
    path('M96 82 L120 56 L144 82 Z', '#A78F63', { stroke: BRONZE, sw: 1 }),
    path('M110 82 L120 68 L130 82 Z', '#2A1F14'),
    // banner
    line(88, 82, 88, 28, WOOD_D, 1.6),
    path('M88 28 L108 33 L88 42 Z', RED),
    circ(95, 34, 1.8, GOLDB),
    // spears in rack
    ...[0, 1, 2, 3].map((i) => line(10 + i * 4, 82, 12 + i * 4, 56, WOOD, 1)),
    ...[0, 1, 2, 3].map((i) => path(`M${10 + i * 4 + 2} 56 L${12 + i * 4 + 1} 51 L${12 + i * 4 + 3} 56 Z`, '#C8CDD2')),
  ],
  academy: [
    ...sky(false),
    circ(130, 22, 9, SKY_GLOW, { o: 0.5 }),
    rect(0, 72, ART_W, 18, '#2B3A4A'),
    // hall
    rect(34, 40, 92, 34, '#CFC8B4', { stroke: STONE_D, sw: 1 }),
    path('M28 42 L80 18 L132 42 Z', RED_D, { stroke: STONE_D, sw: 1 }),
    // towers
    rect(20, 36, 16, 38, '#BDB6A2', { stroke: STONE_D, sw: 1 }),
    rect(124, 36, 16, 38, '#BDB6A2', { stroke: STONE_D, sw: 1 }),
    path('M18 36 L28 24 L38 36 Z', RED),
    path('M122 36 L132 24 L142 36 Z', RED),
    // door
    path('M70 74 L70 56 Q80 44 90 56 L90 74 Z', '#2A1F14'),
    // crossed swords above door
    line(66, 40, 94, 54, '#D8DCE0', 1.6),
    line(94, 40, 66, 54, '#D8DCE0', 1.6),
    line(64, 40, 69, 40, GOLD, 1.6),
    line(96, 40, 91, 40, GOLD, 1.6),
    // windows
    ...[44, 54, 100, 110].map((x) => rect(x, 52, 5, 9, '#2A3F5C')),
    // flag
    line(80, 18, 80, 6, WOOD_D, 1.2),
    path('M80 6 L94 10 L80 14 Z', GOLD),
    // torches
    ...[54, 106].flatMap((x): Shape[] => [rect(x, 70, 2, 8, WOOD_D), ell(x + 1, 68, 2.6, 4, '#F29B38'), ell(x + 1, 69, 1.2, 2.4, '#FFE08A')]),
  ],
  armoury: [
    rect(0, 0, ART_W, ART_H, '#1A1410'),
    rect(0, 62, ART_W, 28, '#2B2118'),
    // forge glow
    circ(36, 66, 26, '#E8742A', { o: 0.18 }),
    circ(36, 66, 16, '#F29B38', { o: 0.25 }),
    path('M16 78 L22 58 L50 58 L56 78 Z', '#3A2B20', { stroke: '#6B4A2A', sw: 1 }),
    ell(36, 59, 14, 4, '#F29B38'),
    ell(36, 59, 8, 2, '#FFE08A'),
    // anvil
    path('M72 70 L112 70 L108 64 L98 62 L116 56 L116 52 L80 52 Q74 56 76 62 L82 64 Z', '#5B6068', { stroke: '#2C3036', sw: 1 }),
    rect(84, 70, 20, 10, '#4A4F56'),
    rect(78, 80, 32, 4, '#3A3E44'),
    // sword on anvil
    line(84, 50, 128, 28, '#D8DCE0', 2),
    line(84, 50, 78, 54, GOLD, 3),
    line(120, 36, 126, 42, GOLD, 2.4),
    // sparks
    ...[[96, 42], [102, 36], [90, 38], [108, 44], [98, 30]].map(([x, y]) => circ(x, y, 0.9, '#FFE08A')),
    // shield on wall
    path('M126 44 L146 44 L146 62 Q136 78 126 62 Z', RED, { stroke: GOLD, sw: 1.4 }),
    line(136, 44, 136, 70, GOLD, 1),
    line(126, 54, 146, 54, GOLD, 1),
  ],
  bureau: [
    rect(0, 0, ART_W, ART_H, '#0F1722'),
    circ(80, 45, 44, '#2B1F3A', { o: 0.35 }),
    // eye
    path('M28 46 Q80 6 132 46 Q80 86 28 46 Z', '#E9E0CB', { stroke: GOLD, sw: 1.6 }),
    circ(80, 46, 17, '#3A6EA5', { stroke: '#1B3C63', sw: 1.5 }),
    circ(80, 46, 8, '#0B0F16'),
    circ(75, 41, 3, '#FFFFFF', { o: 0.85 }),
    ...[-3, -2, -1, 0, 1, 2, 3].map((i) => line(80 + i * 12, 20 + Math.abs(i) * 4, 80 + i * 14, 12 + Math.abs(i) * 4, GOLD, 1)),
    // scroll with seal
    rect(8, 66, 38, 14, PARCH, { r: 7 }),
    line(16, 71, 38, 71, BRONZE, 0.8),
    line(16, 75, 34, 75, BRONZE, 0.8),
    circ(40, 74, 5, RED, { stroke: RED_D, sw: 1 }),
    // key
    circ(124, 74, 5, undefined as unknown as string, { stroke: GOLDB, sw: 2 }),
    line(129, 74, 152, 74, GOLDB, 2),
    line(146, 74, 146, 80, GOLDB, 2),
    line(151, 74, 151, 79, GOLDB, 2),
  ],
  shipyard: [
    ...sky(),
    path('M0 64 Q20 60 40 64 T80 64 T120 64 T160 64 L160 90 L0 90 Z', '#1D4A73'),
    path('M0 74 Q20 70 40 74 T80 74 T120 74 T160 74 L160 90 L0 90 Z', '#16395B'),
    // slipway
    path('M0 72 L100 60 L100 66 L0 78 Z', WOOD_D),
    // hull
    path('M30 62 Q70 80 120 54 L116 48 L36 50 Z', WOOD, { stroke: WOOD_D, sw: 1.2 }),
    line(36, 54, 114, 52, GOLD, 1),
    // ribs / planking
    ...[44, 54, 64, 74, 84, 94, 104].map((x) => line(x, 50, x + 2, 62 - Math.abs(x - 74) * 0.12, WOOD_D, 0.8)),
    // mast and sail
    line(76, 50, 76, 12, WOOD_D, 2),
    path('M76 14 L108 40 L76 44 Z', PARCH, { stroke: BRONZE, sw: 0.8 }),
    path('M76 18 L52 40 L76 44 Z', '#D6CBB0', { stroke: BRONZE, sw: 0.8 }),
    // scaffolding and crane
    line(128, 70, 128, 28, WOOD, 2),
    line(128, 28, 144, 28, WOOD, 2),
    line(144, 28, 144, 40, PARCH, 0.8),
    rect(139, 40, 10, 6, WOOD_D),
    line(120, 66, 128, 40, WOOD, 1.4),
    line(18, 74, 32, 56, WOOD, 1.6),
    line(26, 74, 40, 56, WOOD, 1.6),
  ],
};

export function getIllustration(id: string): Shape[] | undefined {
  return ILLUSTRATIONS[id];
}
