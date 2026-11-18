import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ShapeSvg } from '@/components/art/ShapeSvg';
import { SCENE_H, SCENE_W, settlementScene } from '@/data/settlement';
import { getStageIndex, sumUnits } from '@/game/selectors';
import type { GameState } from '@/game/types';
import { colors, fonts } from '@/theme';

/** The player's settlement, drawn from what they have built, with their name and rank on top. */
export function SettlementScene({ state, title, subtitle }: { state: GameState; title: string; subtitle: string }) {
  const [width, setWidth] = useState(0);
  const levels: Record<string, number> = {};
  for (const b of state.businesses) levels[b.typeId] = b.level;
  for (const i of state.institutions) levels[i.typeId] = i.level;
  const shapes = settlementScene({ levels, ships: state.fleet.ships, stage: getStageIndex(state), soldiers: sumUnits(state.army.units) });

  return (
    <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? <ShapeSvg shapes={shapes} w={SCENE_W} h={SCENE_H} width={width} /> : <View style={{ aspectRatio: SCENE_W / SCENE_H }} />}
      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold },
  banner: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 18, backgroundColor: 'rgba(11,18,32,0.55)' },
  title: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '800', color: colors.parchment },
  subtitle: { fontFamily: fonts.serif, fontSize: 14, fontStyle: 'italic', color: colors.goldBright },
});
