import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Bob } from '@/components/art/TownLife';
import { BANNERS } from '@/data/bannerArt';
import { TOWN_SPRITES } from '@/data/townAssets';
import { colors, fonts } from '@/theme';

/** Where each ship rides in formation, as fractions of the scene (x of width, y of height). */
const FORMATION: [number, number][] = [[0.5, 0.64], [0.27, 0.46], [0.73, 0.46], [0.1, 0.7], [0.9, 0.7], [0.37, 0.86], [0.63, 0.86], [0.5, 0.28]];

/** Your warships at sea, drawn from the rendered ship model. Up to eight show; more are only counted. */
export function FleetScene({ ships, building }: { ships: number; building: number }) {
  const [w, setW] = useState(360);
  const h = Math.max(190, w * 0.5);
  const sp = TOWN_SPRITES.ship;
  const k = Math.min(0.62, w / 620);
  const shown = Math.min(FORMATION.length, ships);
  const order = FORMATION.slice(0, shown).map((f, i) => ({ f, i })).sort((a, b) => a.f[1] - b.f[1]);
  return (
    <View style={[styles.frame, { height: h }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Image source={BANNERS.sea} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      {order.map(({ f, i }) => (
        <View key={i} style={{ position: 'absolute', left: f[0] * w - sp.ax * k, top: f[1] * h - sp.ay * k, width: sp.w * k, height: sp.h * k, zIndex: Math.round(f[1] * 100) }}>
          <Bob phase={(i % 4) * 450}>
            <Image source={sp.src} style={{ width: sp.w * k, height: sp.h * k }} accessibilityIgnoresInvertColors />
          </Bob>
        </View>
      ))}
      <View style={styles.cap} pointerEvents="none">
        <Text style={styles.title}>{ships === 0 ? 'No ships yet' : `${ships} warship${ships === 1 ? '' : 's'} at sea`}</Text>
        <Text style={styles.sub}>{building > 0 ? `${building} more on the slipway` : ships === 0 ? 'Build ships to command the waves' : 'Your fleet rides at anchor'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.gold, backgroundColor: '#1f5b8c' },
  cap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(11,18,32,0.72)', zIndex: 999 },
  title: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '800', color: colors.goldBright },
  sub: { fontFamily: fonts.sans, fontSize: 12, color: colors.parchment },
});

/** The two fleets of a finished sea battle: yours on the left, theirs mirrored on the right. Sunk ships fade and tilt. */
export function EngagementScene({ mine, myLost, theirs, theirLost }: { mine: number; myLost: number; theirs: number; theirLost: number }) {
  const [w, setW] = useState(360);
  const h = Math.max(150, w * 0.4);
  const sp = TOWN_SPRITES.ship;
  const k = Math.min(0.5, w / 760);
  const side = (n: number, lost: number, left: boolean) =>
    Array.from({ length: Math.min(4, n) }, (_, i) => {
      const x = left ? 0.12 + (i % 2) * 0.17 : 0.88 - (i % 2) * 0.17;
      const y = 0.38 + Math.floor(i / 2) * 0.32 + (i % 2) * 0.08;
      const sunk = i >= Math.min(4, n) - Math.round((lost / Math.max(1, n)) * Math.min(4, n));
      return { x, y, sunk, left, key: `${left ? 'a' : 'b'}${i}` };
    });
  const all = [...side(mine, myLost, true), ...side(theirs, theirLost, false)].sort((a, b) => a.y - b.y);
  return (
    <View style={[styles.frame, { height: h, marginBottom: 8 }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Image source={BANNERS.sea} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
      {all.map((s) => (
        <View key={s.key} style={{ position: 'absolute', left: s.x * w - sp.ax * k, top: s.y * h - sp.ay * k, width: sp.w * k, height: sp.h * k, opacity: s.sunk ? 0.3 : 1, transform: [{ scaleX: s.left ? 1 : -1 }, { rotate: s.sunk ? '18deg' : '0deg' }], zIndex: Math.round(s.y * 100) }}>
          <Image source={sp.src} style={{ width: sp.w * k, height: sp.h * k }} accessibilityIgnoresInvertColors />
        </View>
      ))}
      <View style={styles.cap} pointerEvents="none">
        <Text style={styles.sub}>You {mine - myLost} of {mine} afloat · Them {theirs - theirLost} of {theirs} afloat</Text>
      </View>
    </View>
  );
}
