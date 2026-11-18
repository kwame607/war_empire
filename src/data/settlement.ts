import type { Shape } from '../utils/shapes';

/**
 * The home-screen picture of the player's settlement, at dusk. Pure data in, shapes out, so it can
 * be previewed and tested without a phone. Buildings appear as they are built; empty plots show as
 * faint outlines so the player can see where the settlement can grow.
 */
export const SCENE_W = 240;
export const SCENE_H = 150;

export type SettlementInput = {
  /** typeId -> level (0 or missing = not built). Covers businesses and institutions. */
  levels: Record<string, number>;
  ships: number;
  /** 0-6, from PROGRESSION_STAGES. */
  stage: number;
  /** Soldiers in the army, drawn drilling outside the barracks. */
  soldiers: number;
};

const K = {
  wall: '#E2D2AC', wallD: '#B5A27E', plaster: '#EADFC4',
  stone: '#9A9EA5', stoneD: '#6A6F77', stoneL: '#B9BCC1',
  wood: '#7E5632', woodD: '#4A3019', woodL: '#9A6E42',
  thatch: '#C9A04C', thatchD: '#8F6E2E',
  roofR: '#A33440', roofRD: '#6B1F2A', roofB: '#46689A', roofBD: '#2C4468', roofG: '#5C7A48', roofGD: '#3A5230',
  gold: '#D4AC4F', goldB: '#F0CC72', glow: '#FFD27A', glowD: '#F29B38',
  grass: '#4A6A3A', grassD: '#34502B', grassL: '#6B8A4A',
  green: '#4E7040', greenD: '#2C4A28', greenL: '#78A055',
  water: '#1B4B78', waterD: '#12365A', waterL: '#3C7FB5',
  parch: '#EDE3CC', red: '#9C2F3B', dark: '#14161A', path: '#C2A472', pathD: '#9C8352',
};

type RectS = Extract<Shape, { t: 'rect' }>;
const rect = (x: number, y: number, w: number, h: number, fill: string | undefined, e: Partial<RectS> = {}): Shape => ({ t: 'rect', x, y, w, h, fill, ...e });
const circ = (cx: number, cy: number, r: number, fill: string, o?: number): Shape => ({ t: 'circle', cx, cy, r, fill, o });
const ell = (cx: number, cy: number, rx: number, ry: number, fill: string, o?: number): Shape => ({ t: 'ellipse', cx, cy, rx, ry, fill, o });
const path = (d: string, fill?: string, e: Partial<Extract<Shape, { t: 'path' }>> = {}): Shape => ({ t: 'path', d, fill, ...e });
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 1, o?: number): Shape => ({ t: 'line', x1, y1, x2, y2, stroke, sw, o });

const shadow = (x: number, y: number, w: number): Shape => ell(x + w * 0.12, y + 0.4, w * 0.62, 1.8, '#0A0E14', 0.35);
const plot = (x: number, y: number, w: number, h: number): Shape => rect(x - w / 2, y - h, w, h, undefined, { stroke: K.goldB, sw: 0.6, o: 0.32, r: 1.5 });

function smoke(x: number, y: number): Shape[] {
  return [circ(x, y, 1.6, '#E8E0D0', 0.5), circ(x + 1.5, y - 3.6, 2.2, '#E8E0D0', 0.36), circ(x + 3.4, y - 7.6, 2.9, '#E8E0D0', 0.22)];
}

function person(x: number, y: number, coat: string): Shape[] {
  return [rect(x - 0.9, y - 3.2, 1.8, 3.2, coat), circ(x, y - 4.2, 1, '#E6C49A'), rect(x - 0.9, y - 0.2, 0.7, 1.2, K.woodD), rect(x + 0.2, y - 0.2, 0.7, 1.2, K.woodD)];
}

function windowAt(x: number, y: number, w: number, h: number, lit = true): Shape[] {
  return [rect(x - 0.6, y - 0.6, w + 1.2, h + 1.2, K.woodD, { r: 0.6 }), rect(x, y, w, h, lit ? K.glow : '#2A3A52', { r: 0.4 }), ...(lit ? [rect(x - 1.6, y - 1.6, w + 3.2, h + 3.2, K.glow, { o: 0.16, r: 1.5 })] : []), line(x + w / 2, y, x + w / 2, y + h, K.woodD, 0.4), line(x, y + h / 2, x + w, y + h / 2, K.woodD, 0.4)];
}

function doorAt(x: number, y: number, w: number, h: number): Shape[] {
  return [path(`M${x - w / 2 - 0.6} ${y} L${x - w / 2 - 0.6} ${y - h + w / 2} Q${x} ${y - h - 1} ${x + w / 2 + 0.6} ${y - h + w / 2} L${x + w / 2 + 0.6} ${y} Z`, K.woodD), path(`M${x - w / 2} ${y} L${x - w / 2} ${y - h + w / 2} Q${x} ${y - h + 0.4} ${x + w / 2} ${y - h + w / 2} L${x + w / 2} ${y} Z`, K.woodL), line(x, y - h + 0.5, x, y, K.woodD, 0.4), circ(x + w / 4, y - h / 2, 0.45, K.goldB)];
}

type HouseOpts = { wall?: string; wallD?: string; roof?: string; roofD?: string; beams?: boolean; chimney?: boolean; windows?: number; eave?: number; doorW?: number };

/** A gabled building: shaded walls, tiled roof, lit windows, arched door. Base centred on x, standing on y. */
function house(x: number, y: number, w: number, h: number, o: HouseOpts = {}): Shape[] {
  const wall = o.wall ?? K.wall;
  const wallD = o.wallD ?? K.wallD;
  const roof = o.roof ?? K.roofR;
  const roofD = o.roofD ?? K.roofRD;
  const rh = Math.max(6, h * 0.62);
  const ov = o.eave ?? 2;
  const s: Shape[] = [shadow(x, y, w)];
  s.push(rect(x - w / 2, y - h, w, h, wall), rect(x + w * 0.1, y - h, w * 0.4, h, wallD, { o: 0.6 }));
  if (o.beams) {
    s.push(rect(x - w / 2, y - h, w, 1, K.woodD), rect(x - w / 2, y - 1, w, 1, K.woodD));
    for (let i = 0; i <= 3; i++) s.push(line(x - w / 2 + (w * i) / 3, y - h, x - w / 2 + (w * i) / 3, y, K.woodD, 0.9));
    s.push(line(x - w / 2, y - h, x - w / 6, y - h / 2, K.woodD, 0.7), line(x + w / 6, y - h / 2, x + w / 2, y - h, K.woodD, 0.7));
  }
  const n = o.windows ?? (w < 12 ? 1 : w < 22 ? 2 : 3);
  const dx = o.doorW ?? 3.2;
  for (let i = 0; i < n; i++) {
    const wx = x - w / 2 + ((i + 0.5) * w) / n - 1.4;
    if (Math.abs(wx + 1.4 - x) > dx + 1.5 || n === 1) s.push(...windowAt(n === 1 ? x - w / 2 + 2 : wx, y - h * 0.78, 2.8, 3));
  }
  s.push(...doorAt(x + (n === 1 ? w * 0.1 : 0), y, dx, Math.min(h * 0.6, 8)));
  // roof
  s.push(path(`M${x - w / 2 - ov} ${y - h} L${x} ${y - h - rh} L${x + w / 2 + ov} ${y - h} Z`, roof), path(`M${x} ${y - h - rh} L${x + w / 2 + ov} ${y - h} L${x + 1} ${y - h} Z`, roofD, { o: 0.7 }));
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const yy = y - h - rh * (1 - t);
    s.push(line(x - (w / 2 + ov) * t, yy, x + (w / 2 + ov) * t, yy, roofD, 0.5, 0.5));
  }
  s.push(line(x - w / 2 - ov, y - h, x + w / 2 + ov, y - h, '#0A0E14', 0.9, 0.5));
  if (o.chimney) s.push(rect(x + w * 0.22, y - h - rh * 0.9, 2.6, rh * 0.8, K.stoneD), rect(x + w * 0.22 - 0.5, y - h - rh * 0.9 - 0.8, 3.6, 1, K.stone), ...smoke(x + w * 0.22 + 1.3, y - h - rh - 2));
  return s;
}

function masonry(x: number, y: number, w: number, h: number, base = K.stone, dark = K.stoneD): Shape[] {
  const s: Shape[] = [rect(x, y, w, h, base), rect(x + w * 0.62, y, w * 0.38, h, dark, { o: 0.45 })];
  for (let r = 1; r * 3 < h; r++) {
    s.push(line(x, y + r * 3, x + w, y + r * 3, dark, 0.35, 0.55));
    for (let c = 0; c * 4.5 < w; c++) s.push(line(x + ((c * 4.5 + (r % 2) * 2.2) % w), y + (r - 1) * 3, x + ((c * 4.5 + (r % 2) * 2.2) % w), y + r * 3, dark, 0.3, 0.45));
  }
  return s;
}

const battlements = (x: number, y: number, w: number, color = K.stoneD): Shape[] => {
  const s: Shape[] = [];
  for (let i = 0; i * 4 < w - 2; i++) s.push(rect(x + i * 4, y - 2.6, 2.4, 2.8, color));
  return s;
};

const flag = (x: number, y: number, color = K.red, h = 11): Shape[] => [line(x, y, x, y - h, K.woodD, 0.9), path(`M${x} ${y - h} Q${x + 3} ${y - h + 1.2} ${x + 6.5} ${y - h + 0.4} L${x + 5} ${y - h + 2.6} L${x + 6.5} ${y - h + 4.6} Q${x + 3} ${y - h + 5.4} ${x} ${y - h + 4.4} Z`, color)];

function tree(x: number, y: number, s = 1, pine = true): Shape[] {
  const out: Shape[] = [ell(x + 2 * s, y + 0.3, 5 * s, 1.5, '#0A0E14', 0.3), rect(x - 0.9 * s, y - 4 * s, 1.8 * s, 4.6 * s, K.woodD)];
  if (pine) out.push(path(`M${x - 6.5 * s} ${y - 3.5 * s} L${x} ${y - 16 * s} L${x + 6.5 * s} ${y - 3.5 * s} Z`, K.greenD), path(`M${x - 5.2 * s} ${y - 9 * s} L${x} ${y - 20 * s} L${x + 5.2 * s} ${y - 9 * s} Z`, K.green), path(`M${x - 3.6 * s} ${y - 14 * s} L${x} ${y - 23 * s} L${x + 3.6 * s} ${y - 14 * s} Z`, K.greenL), path(`M${x} ${y - 23 * s} L${x + 3.6 * s} ${y - 14 * s} L${x + 0.4} ${y - 14 * s} Z`, K.greenD, { o: 0.35 }));
  else out.push(circ(x, y - 9 * s, 5.5 * s, K.greenD), circ(x - 1.6 * s, y - 10.6 * s, 4 * s, K.green), circ(x - 2.2 * s, y - 11.6 * s, 2.2 * s, K.greenL, 0.7));
  return out;
}

function ship(x: number, y: number): Shape[] {
  return [
    ell(x, y + 3.6, 8, 1.2, '#0A0E14', 0.35),
    path(`M${x - 9} ${y} Q${x - 7} ${y + 5} ${x - 3} ${y + 5} L${x + 5} ${y + 5} Q${x + 9} ${y + 4} ${x + 11} ${y - 1} L${x + 9} ${y} Z`, K.woodD),
    line(x - 8, y + 1.2, x + 9, y + 1.2, K.gold, 0.6),
    line(x, y, x, y - 14, K.woodD, 0.9),
    path(`M${x + 0.6} ${y - 13} Q${x + 8} ${y - 8} ${x + 0.6} ${y - 2} Z`, K.parch),
    path(`M${x - 0.6} ${y - 11} Q${x - 6} ${y - 7} ${x - 0.6} ${y - 3} Z`, '#D8CDB0'),
    ...flag(x, y - 14, K.red, 4),
  ];
}

function keep(stage: number): Shape[] {
  const x = 120;
  const y = 90;
  if (stage <= 1) return [...house(x, y, 22, 11, { wall: K.wallD, wallD: '#8B7A5C', roof: K.thatch, roofD: K.thatchD, beams: true, chimney: true }), ell(x + 17, y + 0.5, 3, 1, '#0A0E14', 0.35), circ(x + 17, y - 1.4, 2, K.glowD), circ(x + 17, y - 1.4, 5, K.glowD, 0.25), ...person(x - 16, y + 3, '#6B3E2E')];
  if (stage <= 3) return [...house(x, y, 36, 16, { beams: true, windows: 3, chimney: true, eave: 3 }), ...house(x - 26, y + 1, 14, 8, { roof: K.roofB, roofD: K.roofBD }), ...flag(x + 17, y - 26, K.gold, 12), ...person(x + 12, y + 4, '#2F4A7A')];
  const s: Shape[] = [shadow(x - 28, y, 56)];
  s.push(...masonry(x - 30, y - 18, 60, 18));
  s.push(...masonry(x - 36, y - 32, 12, 32, K.stone, K.stoneD), ...masonry(x + 24, y - 32, 12, 32, K.stone, K.stoneD), ...masonry(x - 11, y - 42, 22, 42, K.stoneL, K.stoneD));
  s.push(...battlements(x - 36, y - 32, 12), ...battlements(x + 24, y - 32, 12), ...battlements(x - 11, y - 42, 22), ...battlements(x - 30, y - 18, 19), ...battlements(x + 11, y - 18, 19));
  for (const tx of [-30, 30]) s.push(path(`M${x + tx - 5} ${y - 35} L${x + tx} ${y - 47} L${x + tx + 5} ${y - 35} Z`, K.roofB), path(`M${x + tx} ${y - 47} L${x + tx + 5} ${y - 35} L${x + tx + 0.5} ${y - 35} Z`, K.roofBD, { o: 0.7 }), ...windowAt(x + tx - 1.3, y - 26, 2.6, 4), rect(x + tx - 0.5, y - 14, 1, 3.5, K.dark));
  s.push(...windowAt(x - 7, y - 36, 3, 5), ...windowAt(x + 4, y - 36, 3, 5), rect(x - 6.5, y - 26, 1, 4, K.dark), rect(x + 5.5, y - 26, 1, 4, K.dark));
  s.push(path(`M${x - 6} ${y} L${x - 6} ${y - 9} Q${x} ${y - 17} ${x + 6} ${y - 9} L${x + 6} ${y} Z`, K.woodD), path(`M${x - 4.6} ${y} L${x - 4.6} ${y - 8.4} Q${x} ${y - 14.4} ${x + 4.6} ${y - 8.4} L${x + 4.6} ${y} Z`, K.woodL));
  for (let i = -3; i <= 3; i += 3) s.push(line(x + i, y - 12, x + i, y, K.woodD, 0.5));
  s.push(line(x - 5, y - 6, x + 5, y - 6, K.dark, 0.6), ...flag(x, y - 42, K.gold, 14), ...flag(x - 30, y - 47, K.red, 9), ...flag(x + 30, y - 47, K.red, 9));
  if (stage >= 5) s.push(...masonry(x - 54, y - 12, 18, 12), ...masonry(x + 36, y - 12, 18, 12), ...battlements(x - 54, y - 12, 18), ...battlements(x + 36, y - 12, 18));
  return s;
}

function sky(): Shape[] {
  const bands = ['#0A1224', '#0F1B34', '#16264A', '#223763', '#35477A', '#6A5A84', '#B7677A', '#E48C62', '#F2B56B'];
  const s: Shape[] = bands.map((c, i) => rect(0, i * 11, SCENE_W, 12, c));
  const stars: [number, number][] = [[14, 8], [38, 18], [60, 6], [84, 22], [110, 10], [140, 5], [165, 16], [190, 9], [214, 20], [228, 7], [26, 30], [72, 34], [128, 26], [178, 32], [204, 38]];
  stars.forEach(([x, y], i) => s.push(circ(x, y, i % 3 === 0 ? 0.7 : 0.45, '#FFF4D6', 0.85)));
  // sun sinking behind the hills
  s.push(circ(196, 80, 22, '#FFD58A', 0.14), circ(196, 80, 14, '#FFD58A', 0.28), circ(196, 80, 8, '#FFE9B0', 0.95));
  // clouds, lit warm underneath
  const cloud = (cx: number, cy: number, sc: number) => [ell(cx, cy, 16 * sc, 3 * sc, '#2B3A66', 0.85), ell(cx - 4 * sc, cy - 2 * sc, 9 * sc, 2.4 * sc, '#3C4C7C', 0.85), ell(cx + 2 * sc, cy + 1.4 * sc, 14 * sc, 1.2 * sc, '#E48C62', 0.55)];
  s.push(...cloud(52, 46, 1), ...cloud(150, 38, 0.8), ...cloud(212, 56, 0.7));
  // birds
  for (const [bx, by] of [[90, 52], [98, 48], [104, 55]]) s.push(path(`M${bx - 3} ${by} Q${bx - 1.5} ${by - 2} ${bx} ${by} Q${bx + 1.5} ${by - 2} ${bx + 3} ${by}`, undefined, { stroke: '#0A0E14', sw: 0.6 }));
  return s;
}

function land(): Shape[] {
  const s: Shape[] = [];
  s.push(path('M0 84 L22 66 L40 78 L66 58 L96 80 L130 70 L160 82 L190 64 L222 78 L240 70 L240 100 L0 100 Z', '#2A3552'), path('M0 90 Q40 76 80 86 T160 84 T240 82 L240 110 L0 110 Z', '#2E4B50'), ell(120, 88, 130, 3, '#F2B56B', 0.1));
  s.push(path('M0 94 Q60 84 120 92 T240 90 L240 150 L0 150 Z', K.grassD), path('M0 102 Q70 94 130 102 T240 100 L240 150 L0 150 Z', K.grass));
  for (let i = 0; i < 26; i++) {
    const gx = (i * 53) % 236 + 2;
    const gy = 108 + ((i * 29) % 40);
    s.push(line(gx, gy, gx - 0.7, gy - 2, K.grassL, 0.5, 0.7), line(gx, gy, gx + 0.7, gy - 2.2, K.grassL, 0.5, 0.7));
    if (i % 5 === 0) s.push(circ(gx + 2, gy - 0.5, 0.5, '#F5E27A', 0.9));
  }
  // The road from the gate to the front of the settlement
  s.push(path('M114 92 Q104 104 112 116 T100 132 T88 150 L112 150 Q122 136 126 124 T132 108 T128 92 Z', K.path), path('M118 94 Q110 106 116 118 T106 134 T98 150', undefined, { stroke: K.pathD, sw: 0.5, o: 0.7 }));
  return s;
}

export function settlementScene(inp: SettlementInput): Shape[] {
  const L = (id: string) => inp.levels[id] ?? 0;
  const s: Shape[] = [...sky(), ...land()];

  // Harbour
  s.push(path('M176 150 L172 122 Q200 112 240 118 L240 150 Z', K.water), path('M176 150 L173 126 Q200 118 240 123 L240 128 Q200 124 176 134 Z', K.waterD, { o: 0.5 }));
  for (const [wy, wx] of [[130, 184], [138, 196], [145, 188], [134, 214]]) s.push(path(`M${wx} ${wy} Q${wx + 6} ${wy - 1.4} ${wx + 12} ${wy} T${wx + 24} ${wy}`, undefined, { stroke: K.waterL, sw: 0.6, o: 0.8 }));
  s.push(ell(222, 128, 10, 2, '#F2B56B', 0.35));
  if (L('shipyard') > 0) {
    s.push(rect(168, 124, 30, 2.6, K.wood), rect(168, 126.6, 30, 0.8, K.woodD), ...[170, 180, 190, 197].map((px) => rect(px, 126.6, 1.6, 8, K.woodD)));
    s.push(...house(160, 126, 14, 9, { roof: K.roofB, roofD: K.roofBD, wall: K.wallD, wallD: '#8B7A5C' }));
    s.push(line(190, 124, 190, 108, K.woodD, 1.4), line(190, 108, 200, 112, K.woodD, 1.2), line(200, 112, 200, 120, K.dark, 0.5));
    s.push(path('M204 138 Q216 136 228 128 L226 134 Q214 142 204 142 Z', K.woodD), ...[206, 212, 218, 224].map((ribx, i) => line(ribx, 138 - i * 1.8, ribx, 130 - i * 1.4, K.woodL, 0.7)));
  } else s.push(plot(172, 128, 22, 10));
  for (let i = 0; i < Math.min(inp.ships, 5); i++) s.push(...ship(194 + (i % 3) * 14, 134 + Math.floor(i / 3) * 8 - (i % 2) * 2));

  // Back row
  if (L('timber') > 0) {
    s.push(...tree(8, 104, 1.1), ...tree(19, 108, 1), ...tree(31, 104, 1.25), ...tree(43, 108, 1), ...(L('timber') >= 2 ? tree(14, 98, 0.8, false) : []), ...(L('timber') >= 3 ? tree(52, 103, 1.1) : []));
    s.push(rect(34, 108, 8, 2, K.woodL), rect(35, 106, 8, 2, K.woodD), rect(33, 110, 9, 2, K.woodL), circ(34.2, 109, 0.8, K.thatch), circ(41.6, 111, 0.8, K.thatch));
  } else s.push(plot(28, 106, 48, 18));
  if (L('quarry') > 0) {
    s.push(shadow(48, 113, 28), path('M34 113 L44 100 L54 103 L64 113 Z', K.stone), path('M44 100 L54 103 L64 113 L52 113 Z', K.stoneD, { o: 0.6 }), path('M40 113 L47 105 L58 108 L62 113 Z', K.stoneL, { o: 0.4 }));
    for (const [bx, by] of [[34, 114], [40, 114], [37, 111.4]]) s.push(rect(bx, by - 3.4, 5.4, 3.4, K.stoneL), rect(bx, by - 3.4, 5.4, 0.7, '#fff', { o: 0.25 }));
    s.push(line(56, 113, 56, 101, K.woodD, 1.3), line(56, 101, 65, 104, K.woodD, 1.1), line(65, 104, 65, 109, K.dark, 0.5), rect(63, 109, 4, 3, K.woodL));
  } else s.push(plot(48, 113, 32, 14));

  s.push(...keep(inp.stage));

  if (L('library') > 0) {
    s.push(shadow(62, 94, 30), ...masonry(48, 78, 28, 16, K.plaster, K.wallD));
    s.push(path('M45 78 L62 66 L79 78 Z', K.gold), path('M62 66 L79 78 L62 78 Z', '#A88838', { o: 0.7 }), circ(62, 73, 1.8, K.woodD), circ(62, 73, 1, K.glow));
    for (const cx of [50, 56, 62.6, 68.6]) s.push(rect(cx, 80, 2.2, 14, K.plaster), rect(cx + 1.2, 80, 1, 14, K.wallD, { o: 0.6 }), rect(cx - 0.4, 79.4, 3, 1, K.wall), rect(cx - 0.4, 93, 3, 1, K.wall));
    s.push(rect(47, 94, 30, 1.6, K.stoneL), rect(45, 95.6, 34, 1.6, K.stone), ...windowAt(59.4, 82, 3, 6));
  } else s.push(plot(62, 94, 36, 18));
  if (L('academy') > 0) {
    s.push(shadow(168, 94, 26), ...masonry(156, 78, 24, 16, K.stone, K.stoneD));
    s.push(path('M156 78 Q168 54 180 78 Z', K.roofB), path('M168 60 Q176 62 180 78 L168 78 Z', K.roofBD, { o: 0.6 }), line(168, 62, 168, 55, K.woodD, 0.8), circ(168, 54, 1.4, K.goldB));
    for (const wx of [159, 175]) s.push(path(`M${wx} 90 L${wx} 84 Q${wx + 1.5} 81 ${wx + 3} 84 L${wx + 3} 90 Z`, K.glow), rect(wx - 1, 83, 5, 8, K.glow, { o: 0.18 }));
    s.push(...doorAt(168, 94, 4, 8), ...flag(180, 78, K.roofB, 10));
  } else s.push(plot(168, 94, 28, 20));
  if (L('bureau') > 0) {
    s.push(shadow(202, 98, 16), ...masonry(194, 66, 16, 32, K.wall, K.wallD), ...battlements(193, 66, 18, K.wallD), path('M192 66 L202 54 L212 66 Z', K.roofR), path('M202 54 L212 66 L202 66 Z', K.roofRD, { o: 0.7 }));
    s.push(...windowAt(199.6, 72, 3.4, 5), ...windowAt(199.6, 84, 3.4, 5), ...doorAt(202, 98, 4, 7), ...flag(202, 54, K.gold, 8));
    s.push(rect(209, 80, 7, 5, K.parch), line(210.4, 81.4, 214.6, 81.4, K.woodD, 0.4), line(210.4, 83, 214.6, 83, K.woodD, 0.4), circ(209, 82.5, 1.2, K.parch), circ(216, 82.5, 1.2, K.parch));
  } else s.push(plot(204, 98, 20, 30));

  // Middle row
  if (L('workshop') > 0) {
    s.push(...house(92, 120, 20, 11, { wall: K.wallD, wallD: '#8B7A5C', roof: K.roofG, roofD: K.roofGD, beams: true, chimney: true, windows: 1 }), rect(80, 118, 6, 1.4, K.woodD), rect(81, 116, 4, 2, K.stoneD), ell(83, 115.6, 3, 0.8, K.stoneL), circ(98.8, 113, 1.6, K.glowD, 0.9), circ(98.8, 113, 4, K.glowD, 0.25));
  } else s.push(plot(92, 120, 22, 12));
  if (L('armoury') > 0) {
    s.push(shadow(152, 114, 20), ...masonry(142, 102, 20, 12, K.stone, K.stoneD), ...battlements(142, 102, 20), ...doorAt(152, 114, 4.4, 8), rect(144, 106, 3.6, 4.8, K.red), circ(145.8, 108, 1, K.goldB), line(158, 104, 158, 112, K.stoneL, 0.8), line(155.4, 105.4, 160.6, 105.4, K.stoneL, 0.8), ...flag(162, 102, K.red, 8));
  } else s.push(plot(152, 114, 22, 14));

  // Front row
  if (L('farm') > 0) {
    s.push(path('M2 142 L56 138 L62 150 L0 150 Z', K.grassL), path('M2 130 L56 128 L60 138 L2 142 Z', K.thatch), path('M2 130 L56 128 L60 138 L2 142 Z', '#8F6E2E', { o: 0.25 }));
    for (let i = 0; i < 12; i++) s.push(line(3 + i * 4.8, 141, 6 + i * 4.8, 129.4, K.thatchD, 0.5, 0.8), ...(i % 2 === 0 ? [line(4 + i * 4.8, 140, 4.5 + i * 4.8, 134, K.goldB, 0.9, 0.8)] : []));
    s.push(...house(20, 126, 16, 10, { wall: K.plaster, wallD: K.wallD, roof: K.thatch, roofD: K.thatchD, chimney: true, eave: 2.6 }), ...house(44, 124, 14, 9, { wall: K.red, wallD: K.roofRD, roof: K.woodD, roofD: '#2E1E10', windows: 0 }));
    s.push(ell(60, 132, 4, 2, K.thatch), path('M56 132 Q60 124 64 132 Z', K.thatchD), line(8, 124, 8, 118, K.woodD, 0.7), line(5.4, 120, 10.6, 120, K.woodD, 0.7), circ(8, 117, 1.3, '#C9A04C'));
    s.push(...person(30, 133, '#7A3A2A'));
  } else s.push(plot(30, 148, 62, 22));
  if (L('market') > 0) {
    const stall = (mx: number, awn: string, awn2: string): Shape[] => [
      shadow(mx - 7, 134, 14), rect(mx - 7, 128, 14, 6, K.woodD), rect(mx - 6, 130, 12, 3, K.woodL), line(mx - 7, 120, mx - 7, 134, K.woodD, 1), line(mx + 7, 120, mx + 7, 134, K.woodD, 1),
      path(`M${mx - 9} 120 L${mx + 9} 120 L${mx + 7} 127 L${mx - 7} 127 Z`, awn), ...[0, 1, 2, 3].map((i) => path(`M${mx - 9 + i * 4.5} 120 L${mx - 4.5 + i * 4.5} 120 L${mx - 5.2 + i * 4.5} 127 L${mx - 7.5 + i * 4.5} 127 Z`, awn2, { o: 0.9 })),
      circ(mx - 3, 129.4, 1.1, '#D9534F'), circ(mx - 0.4, 129.4, 1.1, '#E8A33D'), circ(mx + 2.4, 129.4, 1.1, '#7DBB5A'), rect(mx + 4, 128, 2.4, 3, K.woodD),
    ];
    s.push(...stall(108, K.red, K.parch), ...stall(128, K.roofB, K.parch), ...person(118, 136, '#2F6A4A'), ...person(121, 137, '#8A4A8A'), ...person(100, 139, '#B07A2A'));
  } else s.push(plot(118, 134, 40, 16));
  if (L('barracks') > 0) {
    s.push(...house(150, 142, 30, 13, { wall: '#9A4A4A', wallD: '#6B2A2F', roof: K.woodD, roofD: '#2E1E10', beams: true, windows: 2, eave: 2.4 }), ...flag(166, 130, K.red, 11), ...flag(134, 132, K.gold, 9));
    for (let i = 0; i < Math.min(6, Math.ceil(inp.soldiers / 10)); i++) s.push(rect(138 + i * 4.4 - 0.9, 145.6, 1.8, 3.4, '#C9A24B'), circ(138 + i * 4.4, 144.8, 1, '#E6C49A'), line(138 + i * 4.4 + 1.6, 143, 138 + i * 4.4 + 1.6, 149, K.stoneL, 0.5));
    s.push(line(134, 146, 134, 138, K.woodD, 0.9), rect(132, 138, 4, 1.4, K.woodD), circ(134, 136.8, 1.2, '#C2A472'));
  } else s.push(plot(152, 146, 32, 16));

  return s;
}
