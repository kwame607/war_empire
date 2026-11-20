import React, { useEffect, useState } from 'react';
import Svg, { Ellipse, Polygon, Polyline } from 'react-native-svg';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { BATTLE_FIELD, BATTLE_FIELDS, BATTLE_PPU, BATTLE_SIN, BATTLE_SPRITES } from '@/data/battleAssets';
import { enemyAsSeen, frontLine, layoutArmy, type Counts } from '@/data/battleLayout';
import { tacticView, type Arrow } from '@/data/tactics';
import { estimateEnemy } from '@/game/battle';
import { sumUnits } from '@/game/selectors';
import type { Battle } from '@/game/types';
import { colors, fonts } from '@/theme';

const WEATHER_TINT: Record<string, string | null> = { clear: null, rain: 'rgba(28,43,68,0.30)', fog: 'rgba(222,230,238,0.38)', heat: 'rgba(255,176,80,0.16)' };

/** Reduce-motion aware looping value. */
function useLoop(duration: number, delay: number, enabled: boolean): Animated.Value {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!enabled) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [v, duration, delay, enabled]);
  return v;
}

function useMotion(): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => alive && setOn(!r))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return on;
}

/** One block of soldiers: glides to its place with a marching bounce, sways while it stands, and flinches when hit. */
function Block({ id, sprite, x, y, scale, z, round, hurt, motion }: { id: string; sprite: string; x: number; y: number; scale: number; z: number; round: number; hurt: boolean; motion: boolean }) {
  const s = BATTLE_SPRITES[sprite];
  const [pos] = useState(() => new Animated.ValueXY({ x, y }));
  const [march] = useState(() => new Animated.Value(0));
  const [flinch] = useState(() => new Animated.Value(0));
  const sway = useLoop(1500 + (id.length % 5) * 170, (id.charCodeAt(id.length - 1) % 7) * 130, motion);
  useEffect(() => {
    Animated.timing(pos, { toValue: { x, y }, duration: 1100, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
    if (motion) {
      march.setValue(0);
      Animated.timing(march, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }).start();
    }
  }, [x, y, pos, march, motion]);
  useEffect(() => {
    if (!hurt || round <= 0 || !motion) return;
    flinch.setValue(0);
    Animated.timing(flinch, { toValue: 1, duration: 700, delay: 1000, useNativeDriver: true }).start();
  }, [round, hurt, flinch, motion]);
  const bounce = march.interpolate({ inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], outputRange: [0, -3, 0, -3, 0, -3, 0, -3, 0, -3, 0] });
  const idle = sway.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -1.5, 0] });
  const shake = flinch.interpolate({ inputRange: [0, 0.15, 0.3, 0.45, 0.6, 1], outputRange: [0, -3, 3, -2, 1, 0] });
  const blink = flinch.interpolate({ inputRange: [0, 0.1, 0.3, 0.5, 1], outputRange: [1, 0.45, 1, 0.6, 1] });
  return (
    <Animated.View style={{ position: 'absolute', zIndex: z, width: s.w * scale, height: s.h * scale, left: Animated.subtract(pos.x, s.ax * scale), top: Animated.subtract(pos.y, s.ay * scale) }}>
      <Animated.Image source={s.src} style={{ width: s.w * scale, height: s.h * scale, opacity: blink, transform: [{ translateY: Animated.add(bounce, idle) }, { translateX: shake }] }} />
    </Animated.View>
  );
}

/** A volley of arrows arcing from one line to another, once per round. */
function Volley({ from, to, round, color, motion }: { from: { x: number; y: number }; to: { x: number; y: number }; round: number; color: string; motion: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (round <= 0 || !motion) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 900, delay: 350, easing: Easing.linear, useNativeDriver: true }).start();
  }, [round, t, motion]);
  if (!motion) return null;
  const arrows = [-24, -12, 0, 12, 24];
  return (
    <>
      {arrows.map((dx, i) => {
        const lag = i * 0.06;
        const r = [0, lag, Math.min(0.98, 0.7 + lag), 1];
        return (
          <Animated.View
            key={dx}
            pointerEvents="none"
            style={{
              position: 'absolute',
              zIndex: 1500,
              left: from.x + dx,
              top: from.y,
              width: 2,
              height: 9,
              backgroundColor: color,
              opacity: t.interpolate({ inputRange: [0, lag, lag + 0.05, 0.92, 1], outputRange: [0, 0, 1, 1, 0] }),
              transform: [
                { translateX: t.interpolate({ inputRange: r, outputRange: [0, 0, (to.x - from.x) * 0.95, to.x - from.x] }) },
                { translateY: t.interpolate({ inputRange: [0, lag, lag + (1 - lag) / 2, 1], outputRange: [0, 0, (to.y - from.y) / 2 - 34, to.y - from.y] }) },
              ],
            }}
          />
        );
      })}
    </>
  );
}

/** Sparks where the lines meet, with a brief screen shake on the whole field. */
function Clash({ x, y, round, motion }: { x: number; y: number; round: number; motion: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (round <= 0 || !motion) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 800, delay: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [round, t, motion]);
  if (!motion) return null;
  const rays = [-60, -30, 0, 30, 60, 90, 120, 150];
  return (
    <>
      {rays.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <Animated.View
            key={deg}
            pointerEvents="none"
            style={{
              position: 'absolute',
              zIndex: 1600,
              left: x - 1.5 + (i - 3.5) * 14,
              top: y - 2,
              width: 3,
              height: 8,
              backgroundColor: i % 2 ? '#ffe9a6' : '#fff6d8',
              opacity: t.interpolate({ inputRange: [0, 0.08, 1], outputRange: [0, 1, 0] }),
              transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * 22] }) }, { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -Math.abs(Math.sin(rad)) * 26 - 6] }) }, { rotate: `${deg}deg` }],
            }}
          />
        );
      })}
    </>
  );
}

/** Falling rain streaks, or slow drifting mist, depending on the weather. */
function Weather({ kind, width, height, motion }: { kind: string; width: number; height: number; motion: boolean }) {
  const v = useLoop(kind === 'rain' ? 700 : 18000, 0, motion && (kind === 'rain' || kind === 'fog'));
  if (!motion) return null;
  if (kind === 'rain') {
    const drops = Array.from({ length: 22 }, (_, i) => i);
    return (
      <>
        {drops.map((i) => {
          const phase = (i * 0.37) % 1;
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={{
                position: 'absolute',
                zIndex: 2100,
                left: ((i * 53) % 100) * (width / 100),
                top: 0,
                width: 1.5,
                height: 12,
                backgroundColor: 'rgba(200,215,235,0.55)',
                transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [phase * height - 20, phase * height + height] }) }, { rotate: '14deg' }],
              }}
            />
          );
        })}
      </>
    );
  }
  if (kind === 'fog') {
    return (
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', zIndex: 2100, top: height * 0.25, left: -width, width: width * 3, height: height * 0.4, borderRadius: height, backgroundColor: 'rgba(235,240,245,0.18)', transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }] }}
      />
    );
  }
  return null;
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


const ARROW_TONE = { you: '#8FB4FF', foe: '#FF9A8F', retreat: '#E8C766' } as const;

/** Dashed tactical arrows, a ring round an encircled enemy and a flickering fire line, drawn over the field. */
function TacticLayer({ arrows, surround, fire, round, width, height, pos, motion }: { arrows: Arrow[]; surround: boolean; fire: boolean; round: number; width: number; height: number; pos: (sx: number, sd: number) => { x: number; y: number }; motion: boolean }) {
  const [t] = useState(() => new Animated.Value(motion ? 0 : 1));
  const [flick] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motion) { t.setValue(1); return; }
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 700, delay: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [round, t, motion]);
  useEffect(() => {
    if (!fire || !motion) return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(flick, { toValue: 1, duration: 350, useNativeDriver: true }), Animated.timing(flick, { toValue: 0, duration: 350, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [fire, motion, flick]);
  const c = pos(0, 0);
  const rx = 6.5 * BATTLE_PPU * (width / BATTLE_FIELD.w);
  const ry = 3.2 * BATTLE_PPU * BATTLE_SIN * (width / BATTLE_FIELD.w);
  const eyc = pos(0, -6).y;
  return (
    <>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height, zIndex: 1500, opacity: t }}>
        <Svg width={width} height={height}>
          {surround ? <Ellipse cx={c.x} cy={eyc} rx={rx * 1.5} ry={ry * 1.6} stroke="#E8C766" strokeWidth={2} strokeDasharray="6 5" fill="rgba(232,199,102,0.08)" /> : null}
          {arrows.map((a, i) => {
            const pts = a.pts.map(([x, y]) => pos(x, y));
            const e = pts[pts.length - 1];
            const q = pts[pts.length - 2];
            const ang = Math.atan2(e.y - q.y, e.x - q.x);
            const h = 9;
            const head = [[e.x, e.y], [e.x - h * Math.cos(ang - 0.5), e.y - h * Math.sin(ang - 0.5)], [e.x - h * Math.cos(ang + 0.5), e.y - h * Math.sin(ang + 0.5)]].map((v) => v.join(',')).join(' ');
            const col = ARROW_TONE[a.tone];
            return (
              <React.Fragment key={i}>
                <Polyline points={pts.map((v) => `${v.x},${v.y}`).join(' ')} stroke={col} strokeWidth={3} strokeDasharray="7 5" strokeLinejoin="round" strokeLinecap="round" fill="none" opacity={0.95} />
                <Polygon points={head} fill={col} />
              </React.Fragment>
            );
          })}
        </Svg>
      </Animated.View>
      {fire ? (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: c.y - 10, height: 22, zIndex: 900, opacity: flick.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] }) }}>
          <Svg width={width} height={22}>
            {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((f, i) => (
              <Ellipse key={i} cx={width * f} cy={11} rx={22} ry={i % 2 ? 7 : 9} fill={i % 2 ? '#E8742A' : '#F2A93B'} opacity={0.75} />
            ))}
          </Svg>
        </Animated.View>
      ) : null}
    </>
  );
}

function TacticBanner({ title, text, round }: { title: string; text: string; round: number }) {
  return (
    <View key={round} pointerEvents="none" style={styles.banner}>
      <Text style={styles.bannerTitle}>{title}</Text>
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
}

/** The battle drawn as two armies on a 3D-rendered field. They close and clash as rounds pass. */
export function BattleField({ battle }: { battle: Battle }) {
  const [width, setWidth] = useState(360);
  const motion = useMotion();
  const [shake] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motion || battle.round <= 0) return;
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 500, delay: 1000, useNativeDriver: true }).start();
  }, [battle.round, shake, motion]);
  const scale = width / BATTLE_FIELD.w;
  const height = BATTLE_FIELD.h * scale;
  const pos = (sx: number, sd: number) => ({ x: (BATTLE_FIELD.ox + sx * BATTLE_PPU) * scale, y: (BATTLE_FIELD.oy + sd * BATTLE_PPU * BATTLE_SIN) * scale });

  const est = estimateEnemy(battle);
  const seen = enemyAsSeen(battle, est);
  const playerTotal = sumUnits(battle.player.initial);
  const enemyTotal = (est.total[0] + est.total[1]) / 2;
  const perBlock = Math.max(6, Math.ceil(Math.max(playerTotal, enemyTotal) / 8));
  const front = frontLine(battle.round, null);
  const view = tacticView(battle, layoutArmy(battle.player.units as Counts, perBlock, 'p', front, false), layoutArmy(seen.counts, perBlock, 'e', front, false), front);
  const mine = view.mine;
  const theirs = view.theirs;
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
      <Animated.View style={{ width, height, transform: [{ translateX: shake.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -3, 3, -2, 1, 0] }) }] }}>
        <Image source={BATTLE_FIELDS[battle.terrain]} style={{ width, height, position: 'absolute' }} />
        {all.map((r) => {
          const p = pos(r.sx, r.sd);
          return <Block key={r.key} id={r.key} sprite={r.sprite} x={p.x} y={p.y} scale={scale} z={Math.round(r.sd * 10) + 1000 - 500} round={battle.round} hurt={last ? (r.key.startsWith('p') ? last.playerLoss : last.enemyLoss) > 0 && !r.key.includes('archers') : false} motion={motion} />;
        })}
        {stakes ? <Image source={pal.src} style={{ position: 'absolute', zIndex: Math.round((front - 3.2) * 10) + 500, left: palPos.x - pal.ax * scale, top: palPos.y - pal.ay * scale, width: pal.w * scale, height: pal.h * scale }} /> : null}
        <Volley from={pos(0, front + 5.6)} to={pos(0, -front)} round={battle.round} color="#2b2118" motion={motion} />
        <Volley from={pos(0, -(front + 5.6))} to={pos(0, front)} round={battle.round} color="#2b2118" motion={motion} />
        <Clash x={mid.x} y={mid.y} round={battle.round} motion={motion} />
        <Burst x={mid.x} y={mid.y} round={battle.round} scale={scale} />
        {last ? <Loss value={last.playerLoss} x={pos(0, front + 8).x} y={pos(0, front + 8).y} color="#8FB4FF" round={battle.round} /> : null}
        {last ? <Loss value={last.enemyLoss} x={pos(0, -front - 8).x} y={pos(0, -front - 8).y} color="#FF9A8F" round={battle.round} /> : null}
        <TacticLayer arrows={view.arrows} surround={view.surround} fire={view.fire} round={battle.round} width={width} height={height} pos={pos} motion={motion} />
        <Weather kind={battle.weather} width={width} height={height} motion={motion} />
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
        {view.caption ? <TacticBanner title={view.caption.title} text={view.caption.text} round={battle.round} /> : null}
        {seen.guessed ? <Text pointerEvents="none" style={styles.guess}>Enemy shown from estimates</Text> : null}
      </Animated.View>
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
  banner: { position: 'absolute', zIndex: 3000, left: 8, right: 8, bottom: 22, padding: 8, borderRadius: 8, backgroundColor: 'rgba(11,18,32,0.82)', borderWidth: 1, borderColor: colors.gold },
  bannerTitle: { fontFamily: fonts.serif, fontSize: 13, fontWeight: '800', color: colors.gold },
  bannerText: { fontFamily: fonts.sans, fontSize: 11, color: 'rgba(237,227,204,0.92)', marginTop: 2 },
  guess: { position: 'absolute', zIndex: 3000, left: 8, bottom: 6, fontFamily: fonts.sans, fontSize: 11, color: 'rgba(237,227,204,0.85)' },
});
