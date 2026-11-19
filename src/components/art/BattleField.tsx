import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { BATTLE_FIELD, BATTLE_FIELDS, BATTLE_PPU, BATTLE_SIN, BATTLE_SPRITES } from '@/data/battleAssets';
import { enemyAsSeen, frontLine, isFlanking, layoutArmy, type Counts } from '@/data/battleLayout';
import { estimateEnemy } from '@/game/battle';
import { sumUnits } from '@/game/selectors';
import type { Battle } from '@/game/types';
import { colors, fonts } from '@/theme';

const WEATHER_TINT: Record<string, string | null> = { clear: null, rain: 'rgba(28,43,68,0.30)', fog: 'rgba(222,230,238,0.38)', heat: 'rgba(255,176,80,0.16)' };

function Block({ sprite, x, y, scale, z }: { sprite: string; x: number; y: number; scale: number; z: number }) {
  const s = BATTLE_SPRITES[sprite];
  const [pos] = useState(() => new Animated.ValueXY({ x, y }));
  useEffect(() => {
    Animated.timing(pos, { toValue: { x, y }, duration: 1100, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  }, [x, y, pos]);
  return <Animated.Image source={s.src} style={{ position: 'absolute', zIndex: z, width: s.w * scale, height: s.h * scale, left: Animated.subtract(pos.x, s.ax * scale), top: Animated.subtract(pos.y, s.ay * scale) }} />;
}

function Burst({ x, y, round, scale }: { x: number; y: number; round: number; scale: number }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (round <= 0) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 1300, delay: 900, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [round, t]);
  const R = 9 * BATTLE_PPU * scale;
  const puffs = [-0.9, -0.45, 0, 0.45, 0.9];
  return (
    <>
      {puffs.map((k, i) => (
        <Animated.View
          key={k}
          pointerEvents="none"
          style={{
            position: 'absolute',
            zIndex: 999,
            left: x + k * R - 14 * scale * 3,
            top: y - 14 * scale * 3,
            width: 28 * scale * 3,
            height: 28 * scale * 3 * BATTLE_SIN + 10,
            borderRadius: 40,
            backgroundColor: i % 2 ? '#d9c9a4' : '#b9a98a',
            opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.75, 0] }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.9] }) }, { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }],
          }}
        />
      ))}
    </>
  );
}

function Loss({ value, x, y, color, round }: { value: number; x: number; y: number; color: string; round: number }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (round <= 0) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 2400, delay: 1100, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [round, t]);
  if (value <= 0) return null;
  return (
    <Animated.Text
      pointerEvents="none"
      style={{ position: 'absolute', zIndex: 1000, left: x - 30, top: y, width: 60, textAlign: 'center', fontFamily: fonts.serif, fontWeight: '900', fontSize: 20, color, textShadowColor: '#000', textShadowRadius: 4, opacity: t.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -34] }) }] }}>
      −{value}
    </Animated.Text>
  );
}

/** The battle drawn as two armies on a 3D-rendered field. They close and clash as rounds pass. */
export function BattleField({ battle }: { battle: Battle }) {
  const [width, setWidth] = useState(360);
  const scale = width / BATTLE_FIELD.w;
  const height = BATTLE_FIELD.h * scale;
  const pos = (sx: number, sd: number) => ({ x: (BATTLE_FIELD.ox + sx * BATTLE_PPU) * scale, y: (BATTLE_FIELD.oy + sd * BATTLE_PPU * BATTLE_SIN) * scale });

  const est = estimateEnemy(battle);
  const seen = enemyAsSeen(battle, est);
  const playerTotal = sumUnits(battle.player.initial);
  const enemyTotal = (est.total[0] + est.total[1]) / 2;
  const perBlock = Math.max(6, Math.ceil(Math.max(playerTotal, enemyTotal) / 8));
  const front = frontLine(battle.round, battle.lastOrder);
  const flanking = isFlanking(battle.lastOrder);
  const mine = layoutArmy(battle.player.units as Counts, perBlock, 'p', front, flanking);
  const theirs = layoutArmy(seen.counts, perBlock, 'e', front, false);
  const all = [...mine, ...theirs].sort((a, b) => a.sd - b.sd);
  const last = battle.rounds[battle.rounds.length - 1];
  const tint = WEATHER_TINT[battle.weather];
  const mid = pos(0, 0);
  const youLeft = sumUnits(battle.player.units);
  const foeLine = est.exact ? `${enemyTotal}` : `≈ ${est.total[0]}–${est.total[1]}`;
  const stakes = battle.lastOrder === 'fortify';
  const pal = BATTLE_SPRITES.palisade;
  const palPos = pos(0, front - 3.2);

  return (
    <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ width, height }}>
        <Image source={BATTLE_FIELDS[battle.terrain]} style={{ width, height, position: 'absolute' }} />
        {all.map((r) => {
          const p = pos(r.sx, r.sd);
          return <Block key={r.key} sprite={r.sprite} x={p.x} y={p.y} scale={scale} z={Math.round(r.sd * 10) + 1000 - 500} />;
        })}
        {stakes ? <Image source={pal.src} style={{ position: 'absolute', zIndex: Math.round((front - 3.2) * 10) + 500, left: palPos.x - pal.ax * scale, top: palPos.y - pal.ay * scale, width: pal.w * scale, height: pal.h * scale }} /> : null}
        <Burst x={mid.x} y={mid.y} round={battle.round} scale={scale} />
        {last ? <Loss value={last.playerLoss} x={pos(0, front + 8).x} y={pos(0, front + 8).y} color="#8FB4FF" round={battle.round} /> : null}
        {last ? <Loss value={last.enemyLoss} x={pos(0, -front - 8).x} y={pos(0, -front - 8).y} color="#FF9A8F" round={battle.round} /> : null}
        {tint ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint, zIndex: 2000 }]} /> : null}
        <View pointerEvents="none" style={styles.hud}>
          <View style={styles.side}>
            <Text style={[styles.sideTitle, { color: '#8FB4FF' }]}>You · {youLeft}</Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, battle.player.morale))}%`, backgroundColor: '#7DBE7D' }]} /></View>
          </View>
          <View style={styles.side}>
            <Text style={[styles.sideTitle, { color: '#FF9A8F', textAlign: 'right' }]}>{battle.enemy.name} · {foeLine}</Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, battle.enemy.morale))}%`, backgroundColor: '#C0485A' }]} /></View>
          </View>
        </View>
        {seen.guessed ? <Text pointerEvents="none" style={styles.guess}>Enemy shown from estimates</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold, backgroundColor: '#2c4a28' },
  hud: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', gap: 10, padding: 8, zIndex: 3000, backgroundColor: 'rgba(11,18,32,0.5)' },
  side: { flex: 1 },
  sideTitle: { fontFamily: fonts.serif, fontSize: 13, fontWeight: '800' },
  track: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 4, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  guess: { position: 'absolute', zIndex: 3000, left: 8, bottom: 6, fontFamily: fonts.sans, fontSize: 11, color: 'rgba(237,227,204,0.85)' },
});
