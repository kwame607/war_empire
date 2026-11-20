import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Bob, Clouds, Smoke } from '@/components/art/TownLife';
import { TOWN_PPU, TOWN_SIN, TOWN_SPRITES, TOWN_TERRAIN } from '@/data/townAssets';
import { GameButton } from '@/components/ui/GameButton';
import { BUSINESS_TYPES } from '@/data/businesses';
import { INSTITUTION_TYPES } from '@/data/institutions';
import { TOWN_SHIPS, TOWN_SLOTS, keepSpriteForStage } from '@/data/townLayout';
import { getStageIndex } from '@/game/selectors';
import type { GameState } from '@/game/types';
import { colors, fonts } from '@/theme';

const SCENE_HEIGHT = 380;

type Target = { name: string; blurb: string; tab: string; screen: '/economy' | '/military' | '/market' };
/** What a tap on each part of the town opens. */
function describe(id: string, level: number): Target {
  if (id === 'keep') return { name: 'Your seat of power', blurb: 'The heart of your settlement. It grows as your rank rises.', tab: 'finances', screen: '/economy' };
  if (id === 'ship') return { name: 'Your fleet', blurb: 'Ships built at the shipyard. Command them from the Navy tab.', tab: 'navy', screen: '/military' };
  if (id === 'market') return { name: 'Marketplace', blurb: 'Buy and sell food, timber and stone at the day’s prices.', tab: 'businesses', screen: '/market' };
  const b = BUSINESS_TYPES.find((x) => x.id === id);
  if (b) return { name: b.name, blurb: level > 0 ? `Level ${level}. ${b.description}` : `Not built yet. ${b.description}`, tab: 'businesses', screen: '/economy' };
  const i = INSTITUTION_TYPES.find((x) => x.id === id);
  if (i) {
    const military = id === 'barracks' || id === 'armoury';
    return { name: i.name, blurb: level > 0 ? `Level ${level}. ${i.description}` : `Not built yet. ${i.description}`, tab: id === 'shipyard' ? 'navy' : military ? 'army' : 'institutions', screen: id === 'shipyard' || military ? '/military' : '/economy' };
  }
  return { name: id, blurb: '', tab: 'finances', screen: '/economy' };
}

/** The player's settlement as a 3D-rendered island town, built up from what they own. */
export function SettlementScene({ state, title, subtitle }: { state: GameState; title: string; subtitle: string }) {
  const [width, setWidth] = useState(360);
  const [picked, setPicked] = useState<{ id: string; level: number } | null>(null);
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
            return <Polygon key={e.key} onPress={() => setPicked({ id: e.key, level: 0 })} points={`${p.x - half},${p.y} ${p.x},${p.y - half * TOWN_SIN} ${p.x + half},${p.y} ${p.x},${p.y + half * TOWN_SIN}`} fill="rgba(240,204,114,0.10)" stroke="rgba(240,204,114,0.55)" strokeWidth={1.2} strokeDasharray="5 4" />;
          })}
        </Svg>
        {items.map((it) => {
          const s = TOWN_SPRITES[it.sprite];
          const p = pos(it.sx, it.sd);
          const id = it.key.startsWith('ship') ? 'ship' : it.key;
          const isPicked = picked?.id === id;
          const sprite = <Image source={s.src} style={{ width: s.w * scale, height: s.h * scale }} />;
          return (
            <Pressable key={it.key} onPress={() => setPicked({ id, level: levels[id] ?? 0 })} style={{ position: 'absolute', left: p.x - s.ax * scale, top: p.y - s.ay * scale, width: s.w * scale, height: s.h * scale, opacity: picked && !isPicked ? 0.82 : 1 }}>
              {id === 'ship' ? <Bob phase={(it.key.charCodeAt(4) % 4) * 500}>{sprite}</Bob> : sprite}
            </Pressable>
          );
        })}
        {items
          .filter((it) => ['keep', 'workshop', 'armoury', 'barracks', 'market'].includes(it.key))
          .map((it) => {
            const sp = TOWN_SPRITES[it.sprite];
            const p = pos(it.sx, it.sd);
            return <Smoke key={`smoke-${it.key}`} x={p.x - (sp.ax - sp.w * 0.62) * scale} y={p.y - sp.ay * scale + sp.h * 0.12 * scale} scale={scale} />;
          })}
        <Clouds sceneW={sceneW} sceneH={sceneH} />
      </ScrollView>
      {picked ? (
        <View style={styles.caption}>
          <View style={{ flex: 1 }}>
            <Text style={styles.capTitle}>{describe(picked.id, picked.level).name}</Text>
            <Text style={styles.capBlurb} numberOfLines={2}>{describe(picked.id, picked.level).blurb}</Text>
          </View>
          <GameButton compact label="Open" onPress={() => { const d = describe(picked.id, picked.level); router.navigate({ pathname: d.screen, params: { tab: d.tab, n: String(Date.now()) } }); }} />
          <Pressable onPress={() => setPicked(null)} hitSlop={10}><Text style={styles.close}>✕</Text></Pressable>
        </View>
      ) : null}
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
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'rgba(11,18,32,0.88)', borderTopWidth: 1, borderTopColor: colors.gold },
  capTitle: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '800', color: colors.goldBright },
  capBlurb: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.parchment, marginTop: 2 },
  close: { fontSize: 18, color: colors.parchmentDim, paddingHorizontal: 4 },
  title: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '800', color: colors.parchment },
  subtitle: { fontFamily: fonts.serif, fontSize: 14, fontStyle: 'italic', color: colors.goldBright },
});
