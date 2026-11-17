import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { CONTINENTS, ISLAND_PATHS, MAP_HEIGHT, MAP_WIDTH, SETTLEMENTS } from '@/data/world';
import type { GameState } from '@/game/types';
import { colors, spacing } from '@/theme';

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
export function WorldMap({ state, selectedId, onSelect }: Props) {
  const { width: screenW } = useWindowDimensions();
  const width = screenW - spacing.md * 2;
  const height = (width * MAP_HEIGHT) / MAP_WIDTH;
  const explored = new Set(state.explored);
  const homeId = state.player.startSettlementId;

  const continentHasExplored = (id: string) => SETTLEMENTS.some((s) => s.continentId === id && explored.has(s.id));

  return (
    <View style={{ width, height, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.bronze }}>
      <Svg width={width} height={height} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
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
    </View>
  );
}
