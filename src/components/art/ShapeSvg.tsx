import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { Shape } from '@/utils/shapes';

function wrap(s: Shape, key: number, child: ReactNode): ReactNode {
  return s.rot ? (
    <G key={key} rotation={s.rot[0]} origin={`${s.rot[1]}, ${s.rot[2]}`}>
      {child}
    </G>
  ) : (
    child
  );
}

/** Draws a list of shapes (see utils/shapes) with react-native-svg. */
export function ShapeSvg({ shapes, w, h, width, height }: { shapes: Shape[]; w: number; h: number; width: number; height?: number }) {
  return (
    <Svg width={width} height={height ?? (width * h) / w} viewBox={`0 0 ${w} ${h}`}>
      {shapes.map((s, i) => {
        const o = s.o;
        let el: ReactNode = null;
        switch (s.t) {
          case 'rect':
            el = <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} fill={s.fill ?? 'none'} stroke={s.stroke} strokeWidth={s.stroke ? (s.sw ?? 1) : undefined} opacity={o} />;
            break;
          case 'circle':
            el = <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill ?? 'none'} stroke={s.stroke} strokeWidth={s.stroke ? (s.sw ?? 1) : undefined} opacity={o} />;
            break;
          case 'ellipse':
            el = <Ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill ?? 'none'} stroke={s.stroke} strokeWidth={s.stroke ? (s.sw ?? 1) : undefined} opacity={o} />;
            break;
          case 'path':
            el = (
              <Path key={i} d={s.d} fill={s.fill ?? 'none'} stroke={s.stroke} strokeWidth={s.stroke ? (s.sw ?? 1) : undefined} strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round" opacity={o} />
            );
            break;
          case 'line':
            el = <Line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={s.sw ?? 1} strokeDasharray={s.dash} strokeLinecap="round" opacity={o} />;
            break;
          case 'text':
            el = (
              <SvgText key={i} x={s.x} y={s.y} fontSize={s.size ?? 5} fill={s.fill ?? '#EDE3CC'} textAnchor={s.anchor ?? 'middle'} fontWeight={s.bold ? 'bold' : 'normal'} fontFamily="Georgia" opacity={o}>
                {s.text}
              </SvgText>
            );
            break;
        }
        return wrap(s, i, el);
      })}
    </Svg>
  );
}
