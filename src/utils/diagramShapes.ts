import { DIAGRAM_H, DIAGRAM_W, type DArrow, type Diagram, type DPose, type DUnit } from '../data/diagramTypes';
import type { Shape } from './shapes';

const COLORS = {
  a: { fill: '#C9A24B', stroke: '#6B5320', arrow: '#F0CC72' },
  b: { fill: '#A3384A', stroke: '#4D1620', arrow: '#E58A97' },
  n: { arrow: '#EDE3CC' },
};
const SIZE: Record<string, { w: number; h: number }> = {
  infantry: { w: 14, h: 6 },
  heavy: { w: 14, h: 6 },
  cavalry: { w: 10, h: 5 },
  ranged: { w: 12, h: 5 },
  fleet: { w: 30, h: 20 },
  galleass: { w: 10, h: 4 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Fills in default pose values so poses can be mixed. */
function full(u: DUnit, p: DPose) {
  const d = SIZE[u.kind];
  return { x: p.x, y: p.y, w: p.w ?? d.w, h: p.h ?? d.h, rot: p.rot ?? 0, o: p.o ?? 1, count: p.count ?? 8 };
}
export type Pose = ReturnType<typeof full>;

/** The pose of every unit at the end of scene `index` (earlier poses carry forward). */
export function posesAt(diagram: Diagram, index: number): Record<string, Pose> {
  const out: Record<string, Pose> = {};
  for (let s = 0; s <= index; s++) {
    for (const u of diagram.units) {
      const p = diagram.scenes[s].poses[u.id];
      if (p) out[u.id] = full(u, p);
    }
  }
  // Units never posed yet start hidden at the centre rather than crashing.
  for (const u of diagram.units) if (!out[u.id]) out[u.id] = full(u, { x: 80, y: 50, o: 0 });
  return out;
}

export function mixPoses(a: Record<string, Pose>, b: Record<string, Pose>, t: number): Record<string, Pose> {
  const out: Record<string, Pose> = {};
  for (const id of Object.keys(b)) {
    const p = a[id] ?? b[id];
    const q = b[id];
    out[id] = { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), w: lerp(p.w, q.w, t), h: lerp(p.h, q.h, t), rot: lerp(p.rot, q.rot, t), o: lerp(p.o, q.o, t), count: Math.round(lerp(p.count, q.count, t)) };
  }
  return out;
}

function arrow(a: DArrow, o: number): Shape[] {
  const [x1, y1] = a.from;
  const [x2, y2] = a.to;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = 4;
  const p1 = [x2 - hx * Math.cos(ang - 0.45), y2 - hx * Math.sin(ang - 0.45)];
  const p2 = [x2 - hx * Math.cos(ang + 0.45), y2 - hx * Math.sin(ang + 0.45)];
  const color = COLORS[a.side].arrow;
  return [
    { t: 'line', x1, y1, x2: x2 - 1.2 * Math.cos(ang), y2: y2 - 1.2 * Math.sin(ang), stroke: color, sw: 1.4, o },
    { t: 'path', d: `M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`, fill: color, o },
  ];
}

function unitShapes(u: DUnit, p: Pose): Shape[] {
  if (p.o <= 0.02) return [];
  const c = COLORS[u.side];
  const rot: [number, number, number] | undefined = p.rot ? [p.rot, p.x, p.y] : undefined;
  const out: Shape[] = [];
  if (u.kind === 'fleet') {
    const n = Math.max(1, p.count);
    const cols = Math.max(1, Math.round(Math.sqrt((n * p.w) / Math.max(1, p.h))));
    const rows = Math.ceil(n / cols);
    const dx = cols > 1 ? p.w / (cols - 1) : 0;
    const dy = rows > 1 ? p.h / (rows - 1) : 0;
    for (let i = 0; i < n; i++) {
      const cx = p.x - p.w / 2 + (i % cols) * dx;
      const cy = p.y - p.h / 2 + Math.floor(i / cols) * dy;
      out.push({ t: 'ellipse', cx, cy, rx: 3.4, ry: 1.4, fill: c.fill, stroke: c.stroke, sw: 0.5, o: p.o, rot });
      out.push({ t: 'line', x1: cx - 3.4, y1: cy, x2: cx + 3.4, y2: cy, stroke: c.stroke, sw: 0.4, o: p.o, rot });
    }
  } else if (u.kind === 'galleass') {
    out.push({ t: 'ellipse', cx: p.x, cy: p.y, rx: p.w / 2, ry: p.h / 2, fill: c.fill, stroke: c.stroke, sw: 0.8, o: p.o, rot });
    out.push({ t: 'circle', cx: p.x, cy: p.y, r: 1.2, fill: c.stroke, o: p.o, rot });
  } else {
    out.push({ t: 'rect', x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h, r: 0.8, fill: c.fill, stroke: c.stroke, sw: u.kind === 'heavy' ? 1.6 : 0.8, o: p.o, rot });
    if (u.kind === 'cavalry') out.push({ t: 'line', x1: p.x - p.w / 2, y1: p.y + p.h / 2, x2: p.x + p.w / 2, y2: p.y - p.h / 2, stroke: c.stroke, sw: 0.8, o: p.o, rot });
    if (u.kind === 'ranged') out.push({ t: 'circle', cx: p.x, cy: p.y, r: Math.min(p.h, p.w) / 4, fill: c.stroke, o: p.o, rot });
  }
  if (u.label) out.push({ t: 'text', x: p.x, y: p.y - (u.kind === 'fleet' ? p.h / 2 + 4 : p.h / 2 + 2.6), text: u.label, size: 4.6, fill: '#EDE3CC', o: p.o });
  return out;
}

/**
 * The picture at a moment between scene `from` and scene `to` (t from 0 to 1).
 * Pass the same index for both to draw a still scene.
 */
export function diagramShapes(diagram: Diagram, from: number, to: number, t: number): Shape[] {
  const a = posesAt(diagram, from);
  const b = posesAt(diagram, to);
  const mid = from === to ? b : mixPoses(a, b, ease(t));
  const shapes: Shape[] = [{ t: 'rect', x: 0, y: 0, w: DIAGRAM_W, h: DIAGRAM_H, fill: diagram.bg }, ...diagram.decor];
  for (const u of diagram.units) shapes.push(...unitShapes(u, mid[u.id]));
  const scene = diagram.scenes[to];
  const fade = from === to ? 1 : ease(t);
  for (const ar of scene.arrows ?? []) shapes.push(...arrow(ar, fade));
  for (const m of scene.marks ?? []) shapes.push({ t: 'text', x: m.x, y: m.y, text: m.text, size: 5, fill: m.color ?? '#F5D88A', bold: true, o: fade });
  return shapes;
}

/** Scenes a reader at this knowledge stage may watch. */
export function visibleScenes(diagram: Diagram, stage: number): number[] {
  return diagram.scenes.map((s, i) => (s.unlocksAtStage <= stage ? i : -1)).filter((i) => i >= 0);
}
