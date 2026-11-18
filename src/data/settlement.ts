import type { Shape } from '../utils/shapes';

/**
 * The home-screen picture of the player's settlement. Pure data in, shapes out, so it can be
 * previewed and tested without a phone. Buildings appear as they are built; empty plots show
 * as faint outlines so the player can see where the settlement can grow.
 */
export const SCENE_W = 160;
export const SCENE_H = 100;

export type SettlementInput = {
  /** typeId -> level (0 or missing = not built). Covers businesses and institutions. */
  levels: Record<string, number>;
  ships: number;
  /** 0-6, from PROGRESSION_STAGES. */
  stage: number;
  /** Soldiers in the army, drawn as a few figures in the parade ground. */
  soldiers: number;
};

const C = {
  skyTop: '#0E1A2E',
  skyMid: '#24395C',
  skyLow: '#E0A860',
  sun: '#F4D58D',
  hillFar: '#2D3B4F',
  hillNear: '#33503A',
  ground: '#3E5A33',
  groundD: '#2D4426',
  path: '#B79B6A',
  wall: '#D8C9A5',
  wallD: '#A8977A',
  stone: '#8A8F96',
  stoneD: '#5C6168',
  wood: '#7A5230',
  woodD: '#4E331C',
  roofR: '#8F2B38',
  roofB: '#3D5C86',
  gold: '#C9A24B',
  goldB: '#E6C468',
  water: '#1B4B78',
  waterL: '#2D6A9E',
  green: '#4E7040',
  greenD: '#2F4A2A',
  red: '#9C2F3B',
  parch: '#EDE3CC',
};

type R = Extract<Shape, { t: 'rect' }>;
const rect = (x: number, y: number, w: number, h: number, fill: string | undefined, e: Partial<R> = {}): Shape => ({ t: 'rect', x, y, w, h, fill, ...e });
const circ = (cx: number, cy: number, r: number, fill: string, o?: number): Shape => ({ t: 'circle', cx, cy, r, fill, o });
const path = (d: string, fill?: string, e: Partial<Extract<Shape, { t: 'path' }>> = {}): Shape => ({ t: 'path', d, fill, ...e });
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 1): Shape => ({ t: 'line', x1, y1, x2, y2, stroke, sw });

/** A plain building with its base centred on x and standing on y. */
function house(x: number, y: number, w: number, h: number, wall: string, roof: string): Shape[] {
  return [
    rect(x - w / 2, y - h, w, h, wall),
    path(`M${x - w / 2 - 1.5} ${y - h} L${x} ${y - h - h * 0.6} L${x + w / 2 + 1.5} ${y - h} Z`, roof),
    rect(x - 1.4, y - h * 0.5, 2.8, h * 0.5, C.woodD),
    rect(x - w / 2 + 1.5, y - h * 0.8, 2, 2, C.woodD),
  ];
}

const flag = (x: number, y: number, color = C.red): Shape[] => [line(x, y, x, y - 9, C.woodD, 0.8), path(`M${x} ${y - 9} L${x + 5} ${y - 7.5} L${x} ${y - 6} Z`, color)];

/** A faint dashed outline marking an empty plot. */
const plot = (x: number, y: number, w: number, h: number): Shape =>
  rect(x - w / 2, y - h, w, h, undefined, { stroke: C.goldB, sw: 0.5, o: 0.35, r: 1 });

function tree(x: number, y: number, s = 1): Shape[] {
  return [rect(x - 0.9 * s, y - 3 * s, 1.8 * s, 3.5 * s, C.woodD), path(`M${x - 5 * s} ${y - 3 * s} L${x} ${y - 15 * s} L${x + 5 * s} ${y - 3 * s} Z`, C.greenD), path(`M${x - 4 * s} ${y - 8 * s} L${x} ${y - 17 * s} L${x + 4 * s} ${y - 8 * s} Z`, C.green)];
}

function ship(x: number, y: number): Shape[] {
  return [
    path(`M${x - 6} ${y} L${x + 6} ${y} L${x + 4} ${y + 3} L${x - 4} ${y + 3} Z`, C.woodD),
    line(x, y, x, y - 9, C.woodD, 0.7),
    path(`M${x} ${y - 9} L${x + 5} ${y - 3} L${x} ${y - 2} Z`, C.parch),
  ];
}

function keep(stage: number): Shape[] {
  const x = 80;
  const y = 60;
  if (stage <= 1) {
    // A modest hall with a hearth
    return [...house(x, y, 16, 9, C.wallD, C.woodD), circ(x + 14, y - 1, 1.6, '#F29B38'), circ(x + 14, y - 1, 3.2, '#F29B38', 0.25)];
  }
  if (stage <= 3) {
    return [...house(x, y, 26, 13, C.wall, C.roofR), ...flag(x + 12, y - 21)];
  }
  // A fortified keep with towers
  const out: Shape[] = [rect(x - 20, y - 14, 40, 14, C.stone), rect(x - 24, y - 24, 9, 24, C.stoneD), rect(x + 15, y - 24, 9, 24, C.stoneD), rect(x - 9, y - 30, 18, 30, C.stone)];
  for (const bx of [-24, -21, -18, 15, 18, 21, -9, -5, -1, 3, 7]) out.push(rect(x + bx + (bx < -9 ? 0 : 0), (bx >= -9 && bx <= 7 ? y - 33 : y - 27), 2.2, 3, C.stoneD));
  out.push(rect(x - 3, y - 9, 6, 9, C.woodD), path(`M${x - 3} ${y - 9} Q${x} ${y - 13} ${x + 3} ${y - 9} Z`, C.woodD), ...flag(x, y - 33, C.gold));
  if (stage >= 5) out.push(...flag(x - 20, y - 24, C.red), ...flag(x + 20, y - 24, C.red));
  return out;
}

export function settlementScene(inp: SettlementInput): Shape[] {
  const L = (id: string) => inp.levels[id] ?? 0;
  const s: Shape[] = [];

  // Sky and sun
  s.push(rect(0, 0, SCENE_W, SCENE_H, C.skyTop), rect(0, 20, SCENE_W, 30, C.skyMid, { o: 0.8 }), rect(0, 40, SCENE_W, 20, C.skyLow, { o: 0.35 }), circ(126, 30, 9, C.sun, 0.9), circ(126, 30, 15, C.sun, 0.18));
  // Hills, ground, path
  s.push(path('M0 56 Q25 40 55 52 T110 48 T160 54 L160 100 L0 100 Z', C.hillFar), path('M0 62 Q40 52 80 60 T160 58 L160 100 L0 100 Z', C.hillNear), rect(0, 64, SCENE_W, 36, C.ground), path('M0 72 Q60 66 120 74 T160 72 L160 76 Q100 80 60 74 T0 76 Z', C.groundD, { o: 0.6 }));
  s.push(path('M80 62 Q70 76 56 84 T30 100 L46 100 Q64 90 76 82 T92 62 Z', C.path, { o: 0.8 }));

  // Harbour (always water; fills with ships)
  s.push(path('M116 100 L116 82 Q136 76 160 80 L160 100 Z', C.water), path('M120 88 Q130 86 140 88 T160 88', undefined, { stroke: C.waterL, sw: 0.5 }), path('M122 95 Q132 93 142 95 T160 95', undefined, { stroke: C.waterL, sw: 0.5 }));
  if (L('shipyard') > 0) s.push(rect(112, 84, 14, 2, C.wood), rect(114, 84, 1.5, 6, C.woodD), rect(122, 84, 1.5, 6, C.woodD), ...house(110, 84, 9, 6, C.wallD, C.roofB));
  else s.push(plot(112, 86, 12, 6));
  for (let i = 0; i < Math.min(inp.ships, 5); i++) s.push(...ship(126 + (i % 3) * 10, 90 + Math.floor(i / 3) * 5 - (i % 2) * 2));

  // Back row: forest, quarry, then the keep and institutions
  if (L('timber') > 0) s.push(...tree(10, 66, 1.1), ...tree(18, 68, 1), ...tree(26, 65, 1.2), ...(L('timber') >= 3 ? tree(34, 67, 1) : []));
  else s.push(plot(18, 66, 24, 10));
  if (L('quarry') > 0) s.push(path('M40 66 L46 58 L54 60 L60 66 Z', C.stone), path('M46 66 L50 60 L56 63 L58 66 Z', C.stoneD), rect(53, 62, 3, 4, C.woodD));
  else s.push(plot(50, 66, 18, 8));

  s.push(...keep(inp.stage));

  if (L('library') > 0) s.push(rect(98, 52, 14, 8, C.wall), path('M96 52 L105 45 L114 52 Z', C.gold), ...[100, 104, 108].map((cx) => rect(cx, 52, 1.6, 8, C.wallD)));
  else s.push(plot(105, 60, 16, 12));
  if (L('academy') > 0) s.push(rect(124, 50, 13, 10, C.stone), path('M124 50 Q130.5 38 137 50 Z', C.roofB), circ(130.5, 55, 1.5, C.woodD));
  else s.push(plot(130, 60, 14, 12));
  if (L('bureau') > 0) s.push(rect(140, 46, 8, 14, C.wall), rect(139, 44, 10, 3, C.roofB), rect(143, 50, 2, 3, C.goldB));
  else s.push(plot(144, 60, 10, 14));

  // Front row: farm, workshop, market, barracks, armoury
  if (L('farm') > 0) {
    s.push(path('M4 94 L36 92 L38 98 L2 100 Z', C.green), path('M6 86 L36 85 L37 91 L4 92 Z', C.goldB, { o: 0.9 }));
    for (let i = 0; i < 6; i++) s.push(line(7 + i * 5, 91, 8 + i * 5, 86, C.gold, 0.7));
    s.push(...house(12, 82, 9, 6, C.red, C.woodD));
  } else s.push(plot(20, 90, 34, 10));
  if (L('workshop') > 0) s.push(...house(46, 80, 12, 8, C.wallD, C.woodD), rect(49, 66, 2.5, 6, C.stoneD), circ(51, 63, 1.6, C.parch, 0.5), circ(52.5, 60, 2.2, C.parch, 0.35));
  else s.push(plot(46, 80, 12, 8));
  if (L('market') > 0) {
    for (const mx of [62, 72]) s.push(rect(mx - 4, 86, 8, 4, C.woodD), path(`M${mx - 5} 83 L${mx + 5} 83 L${mx + 4} 86 L${mx - 4} 86 Z`, mx === 62 ? C.red : C.parch), line(mx - 4, 83, mx - 4, 90, C.woodD, 0.6), line(mx + 4, 83, mx + 4, 90, C.woodD, 0.6));
  } else s.push(plot(67, 90, 22, 8));
  if (L('barracks') > 0) {
    s.push(rect(84, 82, 18, 8, C.red), path('M82 82 L93 76 L104 82 Z', C.woodD), ...flag(105, 82));
    for (let i = 0; i < Math.min(5, Math.ceil(inp.soldiers / 12)); i++) s.push(rect(86 + i * 3.4, 92, 1.4, 3, C.goldB), circ(86.7 + i * 3.4, 91.2, 0.9, C.parch));
  } else s.push(plot(93, 90, 20, 10));
  if (L('armoury') > 0) s.push(rect(100, 76, 11, 6, C.stoneD), path('M99 76 L105.5 71 L112 76 Z', C.stone), circ(105.5, 79, 1.7, C.goldB));
  else s.push(plot(105, 82, 12, 8));

  return s;
}
