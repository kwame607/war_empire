import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { TOWN_PPU, TOWN_SIN, TOWN_SPRITES, TOWN_TERRAIN } from '@/data/townAssets';
import { TOWN_SHIPS, TOWN_SLOTS, keepSpriteForStage } from '@/data/townLayout';
import { getStageIndex } from '@/game/selectors';
import type { GameState } from '@/game/types';
import { colors, fonts } from '@/theme';

const SCENE_HEIGHT = 320;

/** The player's settlement as a 3D-rendered island town, built up from what they own. */
export function SettlementScene({ state, title, subtitle }: { state: GameState; title: string; subtitle: string }) {
  const [width, setWidth] = useState(360);
  const scale = Math.max(SCENE_HEIGHT / TOWN_TERRAIN.h, width / TOWN_TERRAIN.w);
  const sceneW = TOWN_TERRAIN.w * scale;
  const sceneH = TOWN_TERRAIN.h * scale;

  const levels: Record<string, number> = {};
  for (const b of state.businesses) levels[b.typeId] = b.level;
  for (const i of state.institutions) levels[i.typeId] = i.level;

  const pos = (sx: number, sd: number) => ({ x: (TOWN_TERRAIN.ox + sx * TOWN_PPU) * scale, y: (TOWN_TERRAIN.oy + sd * TOWN_PPU * TOWN_SIN) * scale });

  type Item = { key: string; sprite: string; sx: number; sd: number };
  const items: Item[] = [];
  const empty: { key: string; sx: number; sd: number }[] = [];
  for (const [id, slot] of Object.entries(TOWN_SLOTS)) {
    if (id === 'keep') items.push({ key: id, sprite: keepSpriteForStage(getStageIndex(state)), sx: slot.sx, sd: slot.sd });
    else if ((levels[id] ?? 0) > 0) items.push({ key: id, sprite: slot.sprite, sx: slot.sx, sd: slot.sd });
    else empty.push({ key: id, sx: slot.sx, sd: slot.sd });
  }
  TOWN_SHIPS.slice(0, Math.min(4, state.fleet.ships)).forEach(([sx, sd], i) => items.push({ key: `ship${i}`, sprite: 'ship', sx, sd }));
  items.sort((a, b) => a.sd - b.sd);

  const half = 7.5 * TOWN_PPU * scale;
  return (
    <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentOffset={{ x: Math.max(0, (sceneW - width) / 2), y: 0 }} style={{ height: SCENE_HEIGHT }} contentContainerStyle={{ width: sceneW, height: sceneH }}>
        <Image source={TOWN_TERRAIN.src} style={{ width: sceneW, height: sceneH, position: 'absolute' }} />
        <Svg width={sceneW} height={sceneH} style={StyleSheet.absoluteFill}>
          {empty.map((e) => {
            const p = pos(e.sx, e.sd);
            return <Polygon key={e.key} points={`${p.x - half},${p.y} ${p.x},${p.y - half * TOWN_SIN} ${p.x + half},${p.y} ${p.x},${p.y + half * TOWN_SIN}`} fill="rgba(240,204,114,0.10)" stroke="rgba(240,204,114,0.55)" strokeWidth={1.2} strokeDasharray="5 4" />;
          })}
        </Svg>
        {items.map((it) => {
          const s = TOWN_SPRITES[it.sprite];
          const p = pos(it.sx, it.sd);
          return <Image key={it.key} source={s.src} style={{ position: 'absolute', left: p.x - s.ax * scale, top: p.y - s.ay * scale, width: s.w * scale, height: s.h * scale }} />;
        })}
      </ScrollView>
      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold, backgroundColor: '#1f5b8c' },
  banner: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, backgroundColor: 'rgba(11,18,32,0.5)' },
  title: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '800', color: colors.parchment },
  subtitle: { fontFamily: fonts.serif, fontSize: 14, fontStyle: 'italic', color: colors.goldBright },
});
