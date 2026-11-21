import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BATTLE_FIELD, BATTLE_FIELDS, BATTLE_PPU, BATTLE_SIN, BATTLE_SPRITES } from '@/data/battleAssets';
import { layoutArmy, type Counts } from '@/data/battleLayout';
import { sumUnits } from '@/game/selectors';
import type { BattleReport } from '@/game/types';
import { fonts } from '@/theme';
import { tap } from '@/utils/haptics';
import { useMotion } from '@/utils/motion';

const LOOK: Record<BattleReport['result'], { word: string; color: string; tint: string; line: string }> = {
  victory: { word: 'VICTORY', color: '#F0CC72', tint: 'rgba(30,20,0,0.35)', line: 'The field is yours.' },
  defeat: { word: 'DEFEAT', color: '#E27B86', tint: 'rgba(40,0,10,0.5)', line: 'The army is broken, but the war is not lost.' },
  withdrawn: { word: 'WITHDRAWN', color: '#C9D3DA', tint: 'rgba(10,20,40,0.45)', line: 'You saved what you could.' },
  stalemate: { word: 'STALEMATE', color: '#E6D6A8', tint: 'rgba(20,20,20,0.4)', line: 'Neither side could break the other.' },
};

/** A wide picture of the field as it ended, with the result written across it. */
export function ResultBanner({ report }: { report: BattleReport }) {
  const [width, setWidth] = useState(360);
  const motion = useMotion();
  const [pop] = useState(() => new Animated.Value(motion ? 0 : 1));
  const result = report.result;
  useEffect(() => {
    if (!motion) {
      pop.setValue(1);
      return;
    }
    pop.setValue(0);
    const timer = setTimeout(() => tap(result === 'victory' ? 'success' : result === 'defeat' ? 'heavy' : 'light'), 350);
    Animated.timing(pop, { toValue: 1, duration: 800, delay: 250, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
    return () => clearTimeout(timer);
  }, [pop, motion, result]);
  const scale = width / BATTLE_FIELD.w;
  const height = BATTLE_FIELD.h * scale * 0.82;
  const look = LOOK[report.result];
  const perBlock = Math.max(6, Math.ceil(Math.max(sumUnits(report.playerInitial), sumUnits(report.enemyInitial)) / 8));
  const pos = (sx: number, sd: number) => ({ x: (BATTLE_FIELD.ox + sx * BATTLE_PPU) * scale, y: (BATTLE_FIELD.oy + sd * BATTLE_PPU * BATTLE_SIN) * scale - BATTLE_FIELD.h * scale * 0.09 });
  const mine = layoutArmy(report.playerFinal as Counts, perBlock, 'p', 3, false);
  const theirs = layoutArmy(report.enemyFinal as Counts, perBlock, 'e', 3, false);
  const all = [...mine, ...theirs].sort((a, b) => a.sd - b.sd);
  return (
    <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ width, height, overflow: 'hidden' }}>
        <Image source={BATTLE_FIELDS[report.terrain]} style={{ width, height: BATTLE_FIELD.h * scale, position: 'absolute', top: -BATTLE_FIELD.h * scale * 0.09 }} />
        {all.map((r) => {
          const s = BATTLE_SPRITES[r.sprite];
          const p = pos(r.sx, r.sd);
          return <Image key={r.key} source={s.src} style={{ position: 'absolute', left: p.x - s.ax * scale, top: p.y - s.ay * scale, width: s.w * scale, height: s.h * scale, opacity: report.result === 'defeat' && r.sprite.endsWith('_p') ? 0.8 : 1 }} />;
        })}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: look.tint }]} />
        <Animated.View pointerEvents="none" style={[styles.center, { opacity: pop.interpolate({ inputRange: [0, 0.4], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1] }) }] }]}>
          <Svg width={Math.min(260, width * 0.7)} height={14} viewBox="0 0 260 14">
            <Path d="M0 7 H110 M150 7 H260" stroke={look.color} strokeWidth={1.5} opacity={0.8} />
            <Path d="M130 1 L137 7 L130 13 L123 7 Z" fill={look.color} />
          </Svg>
          <Text style={[styles.word, { color: look.color }]}>{look.word}</Text>
          <Text style={styles.line}>{look.line}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#C9A24B' },
  center: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 6 },
  word: { fontFamily: fonts.serif, fontSize: 40, fontWeight: '900', letterSpacing: 6, textShadowColor: '#000', textShadowRadius: 10, textShadowOffset: { width: 0, height: 2 } },
  line: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 15, color: '#EDE3CC', textShadowColor: '#000', textShadowRadius: 6 },
});
