import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { CONTINENTS, ISLAND_PATHS, MAP_HEIGHT, MAP_WIDTH, SETTLEMENTS } from '@/data/world';
import type { GameState } from '@/game/types';
import { colors, MAX_CONTENT_WIDTH, spacing } from '@/theme';

type Props = {
  state: GameState;
  selectedId: string | null;
  onSelect: (settlementId: string) => void;
};

/**
 * Illustrated 2D world map.
 * - Continents are always visible (you know the general geography).
 * - Settlements stay hidden behind fog ("?") until your scouts explore them.
 * - Continents where you have explored nothing are darkened.
 */
const MAX_ZOOM = 4;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const dist = (e: GestureResponderEvent) => {
  const [a, b] = e.nativeEvent.touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
};

export function WorldMap({ state, selectedId, onSelect }: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  // Fit the screen in both orientations: never wider than the content column, never taller than most of the screen.
  const maxW = Math.min(screenW, MAX_CONTENT_WIDTH) - spacing.md * 2;
  const maxH = screenH * 0.72;
  const width = Math.min(maxW, (maxH * MAP_WIDTH) / MAP_HEIGHT);
  const height = (width * MAP_HEIGHT) / MAP_WIDTH;

  // View window in map units. Pinch to zoom, drag to pan, or use the buttons.
  const [view, setView] = useState({ scale: 1, cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2 });
  const start = useRef({ scale: 1, cx: 0, cy: 0, dist: 0 });
  const viewRef = useRef(view);
  const applyView = (v: { scale: number; cx: number; cy: number }) => {
    const scale = clamp(v.scale, 1, MAX_ZOOM);
    const w = MAP_WIDTH / scale;
    const h = MAP_HEIGHT / scale;
    const next = { scale, cx: clamp(v.cx, w / 2, MAP_WIDTH - w / 2), cy: clamp(v.cy, h / 2, MAP_HEIGHT - h / 2) };
    viewRef.current = next;
    setView(next);
  };
  const widthRef = useRef(width);
  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  // The refs below are only read inside gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      // Taps pass through to the settlement markers; only drags and pinches are claimed.
      onMoveShouldSetPanResponder: (e, g) => e.nativeEvent.touches.length >= 2 || Math.hypot(g.dx, g.dy) > 8,
      onPanResponderGrant: () => {
        start.current = { ...viewRef.current, dist: 0 };
      },
      onPanResponderMove: (e, g) => {
        const t = e.nativeEvent.touches;
        if (t.length >= 2) {
          const d = dist(e);
          if (start.current.dist === 0) start.current = { ...viewRef.current, dist: d };
          applyView({ ...viewRef.current, scale: (start.current.scale * d) / start.current.dist });
          return;
        }
        // One finger: pan. Pixels to map units depends on the zoom when the drag began.
        const unitsPerPx = MAP_WIDTH / start.current.scale / widthRef.current;
        applyView({ scale: viewRef.current.scale, cx: start.current.cx - g.dx * unitsPerPx, cy: start.current.cy - g.dy * unitsPerPx });
      },
      onPanResponderRelease: () => {
        start.current.dist = 0;
      },
    }),
  );

  const vw = MAP_WIDTH / view.scale;
  const vh = MAP_HEIGHT / view.scale;
  const vx = clamp(view.cx - vw / 2, 0, MAP_WIDTH - vw);
  const vy = clamp(view.cy - vh / 2, 0, MAP_HEIGHT - vh);
  const explored = new Set(state.explored);
  const homeId = state.player.startSettlementId;

  const continentHasExplored = (id: string) => SETTLEMENTS.some((s) => s.continentId === id && explored.has(s.id));

  return (
    <View style={{ width, height, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.bronze, alignSelf: 'center' }} {...pan.panHandlers}>
      <Svg width={width} height={height} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
        <Rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="#0D2036" />

        {ISLAND_PATHS.map((d, i) => (
          <Path key={i} d={d} fill="#4A3B2A" stroke={colors.bronze} strokeWidth={1} />
        ))}

        {CONTINENTS.map((c) => {
          const known = continentHasExplored(c.id);
          return (
            <G key={c.id}>
              <Path d={c.path} fill={known ? '#6B5636' : '#352E25'} stroke={colors.bronze} strokeWidth={1.5} strokeLinejoin="round" />
              <SvgText
                x={c.labelX}
                y={c.labelY}
                fontSize={13}
                fontFamily="Georgia"
                fontWeight="bold"
                letterSpacing={2}
                fill={known ? colors.parchment : colors.parchmentDim}
                opacity={known ? 0.9 : 0.6}
                textAnchor="middle">
                {c.name.toUpperCase()}
              </SvgText>
            </G>
          );
        })}

        {SETTLEMENTS.map((s) => {
          const isExplored = explored.has(s.id);
          const isHome = s.id === homeId;
          const isSelected = s.id === selectedId;
          const isScouting = state.scouting?.settlementId === s.id;
          const r = s.kind === 'city' ? 5.5 : 4.5;
          return (
            <G key={s.id} onPress={() => onSelect(s.id)}>
              {/* Larger invisible circle so small markers are easy to tap on a phone */}
              <Circle cx={s.x} cy={s.y} r={16} fill="transparent" />
              {isSelected ? <Circle cx={s.x} cy={s.y} r={r + 6} fill="none" stroke={colors.parchment} strokeWidth={1.5} /> : null}
              {isHome ? <Circle cx={s.x} cy={s.y} r={r + 3.5} fill="none" stroke={colors.goldBright} strokeWidth={1.5} /> : null}
              {isExplored ? (
                <Circle cx={s.x} cy={s.y} r={r} fill={colors.gold} stroke={colors.charcoal} strokeWidth={1} />
              ) : (
                <>
                  <Circle
                    cx={s.x}
                    cy={s.y}
                    r={r}
                    fill={colors.charcoal}
                    stroke={isScouting ? colors.goldBright : colors.bronze}
                    strokeWidth={1.2}
                    strokeDasharray="2 2"
                  />
                  <SvgText x={s.x} y={s.y + 3} fontSize={8} fontWeight="bold" fill={colors.parchmentDim} textAnchor="middle">
                    ?
                  </SvgText>
                </>
              )}
              {isExplored ? (
                <SvgText x={s.x} y={s.y + r + 11} fontSize={8.5} fontFamily="Georgia" fill={colors.parchment} textAnchor="middle">
                  {s.name}
                </SvgText>
              ) : null}
            </G>
          );
        })}
      </Svg>
      <View style={{ position: 'absolute', right: 8, top: 8, gap: 6 }}>
        <ZoomButton label="+" onPress={() => applyView({ ...viewRef.current, scale: viewRef.current.scale * 1.5 })} />
        <ZoomButton label="−" onPress={() => applyView({ ...viewRef.current, scale: viewRef.current.scale / 1.5 })} />
        {view.scale > 1 ? <ZoomButton label="⌂" onPress={() => applyView({ scale: 1, cx: MAP_WIDTH / 2, cy: MAP_HEIGHT / 2 })} /> : null}
      </View>
    </View>
  );
}

function ZoomButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Zoom in' : label === '−' ? 'Zoom out' : 'Reset zoom'}
      onPress={onPress}
      style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(20,24,32,0.85)', borderWidth: 1, borderColor: colors.bronze, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.gold, fontSize: 20, fontWeight: '700', marginTop: -2 }}>{label}</Text>
    </Pressable>
  );
}
