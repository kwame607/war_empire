/**
 * A tiny drawing language shared by the app (react-native-svg) and the preview tools (plain SVG).
 * Scenes are plain data, so they can be tested and previewed without a phone.
 */
export type Rot = [deg: number, cx: number, cy: number];

type Base = { o?: number; rot?: Rot };
export type Shape =
  | (Base & { t: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number; r?: number })
  | (Base & { t: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; sw?: number })
  | (Base & { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: string; stroke?: string; sw?: number })
  | (Base & { t: 'path'; d: string; fill?: string; stroke?: string; sw?: number; dash?: string })
  | (Base & { t: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; sw?: number; dash?: string })
  | (Base & { t: 'text'; x: number; y: number; text: string; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; bold?: boolean });

const attr = (k: string, v: string | number | undefined) => (v === undefined ? '' : ` ${k}="${String(v).replace(/"/g, '&quot;')}"`);

/** Plain SVG markup for one shape (used by the preview tooling and by tests). */
export function shapeToSvg(s: Shape): string {
  const common = attr('opacity', s.o) + (s.rot ? attr('transform', `rotate(${s.rot[0]} ${s.rot[1]} ${s.rot[2]})`) : '');
  const paint = (fill?: string, stroke?: string, sw?: number) => attr('fill', fill ?? 'none') + attr('stroke', stroke) + attr('stroke-width', stroke ? (sw ?? 1) : undefined);
  switch (s.t) {
    case 'rect':
      return `<rect${attr('x', s.x)}${attr('y', s.y)}${attr('width', s.w)}${attr('height', s.h)}${attr('rx', s.r)}${paint(s.fill, s.stroke, s.sw)}${common}/>`;
    case 'circle':
      return `<circle${attr('cx', s.cx)}${attr('cy', s.cy)}${attr('r', s.r)}${paint(s.fill, s.stroke, s.sw)}${common}/>`;
    case 'ellipse':
      return `<ellipse${attr('cx', s.cx)}${attr('cy', s.cy)}${attr('rx', s.rx)}${attr('ry', s.ry)}${paint(s.fill, s.stroke, s.sw)}${common}/>`;
    case 'path':
      return `<path${attr('d', s.d)}${paint(s.fill, s.stroke, s.sw)}${attr('stroke-dasharray', s.dash)} stroke-linejoin="round" stroke-linecap="round"${common}/>`;
    case 'line':
      return `<line${attr('x1', s.x1)}${attr('y1', s.y1)}${attr('x2', s.x2)}${attr('y2', s.y2)}${attr('stroke', s.stroke)}${attr('stroke-width', s.sw ?? 1)}${attr('stroke-dasharray', s.dash)} stroke-linecap="round"${common}/>`;
    case 'text':
      return `<text${attr('x', s.x)}${attr('y', s.y)}${attr('font-size', s.size ?? 5)}${attr('fill', s.fill ?? '#EDE3CC')}${attr('text-anchor', s.anchor ?? 'middle')}${s.bold ? ' font-weight="bold"' : ''} font-family="Georgia, serif"${common}>${s.text.replace(/&/g, '&amp;')}</text>`;
  }
}

export function shapesToSvg(shapes: Shape[], w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 4}" height="${h * 4}">${shapes.map(shapeToSvg).join('')}</svg>`;
}
