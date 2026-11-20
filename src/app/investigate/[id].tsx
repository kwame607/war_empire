import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { PressableScale } from '@/components/ui/PressableScale';
import { SCENE_ASSETS } from '@/data/investigationAssets';
import { getInvestigation } from '@/data/investigations';
import { starsFor } from '@/game/investigations';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { tap } from '@/utils/haptics';

const MAX_HINTS = 3;

function Pulse({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - size, top: y - size, width: size * 2, height: size * 2, borderRadius: size, borderWidth: 3, borderColor: color, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.4] }) }] }}
    />
  );
}

export default function InvestigateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, finishCase } = useGame();
  const inv = id ? getInvestigation(id) : undefined;
  const scene = id ? SCENE_ASSETS[id] : undefined;

  const [width, setWidth] = useState(340);
  const [zoom, setZoom] = useState(2);
  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [hints, setHints] = useState(0);
  const [hintId, setHintId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ stars: number; seconds: number; gold: number } | null>(null);
  const [flashMiss, setFlashMiss] = useState<{ x: number; y: number; k: number } | null>(null);
  const start = useRef(0);

  useEffect(() => {
    start.current = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!hintId) return;
    const t = setTimeout(() => setHintId(null), 3500);
    return () => clearTimeout(t);
  }, [hintId]);
  useEffect(() => {
    if (!flashMiss) return;
    const t = setTimeout(() => setFlashMiss(null), 450);
    return () => clearTimeout(t);
  }, [flashMiss]);

  if (!state) return <Redirect href="/" />;
  if (!inv || !scene) return <Redirect href="/knowledge" />;

  const W = width * zoom;
  const H = W / scene.aspect;
  const left = scene.items.filter((it) => !found.includes(it.id));
  const best = state.investigations[inv.id]?.stars ?? 0;

  const onTap = (px: number, py: number) => {
    if (result) return;
    const radius = Math.max(22, W * 0.035);
    const hit = left.find((it) => Math.hypot(it.x * W - px, it.y * H - py) < radius);
    if (!hit) {
      setMisses((m) => m + 1);
      setFlashMiss({ x: px, y: py, k: Date.now() });
      tap('warning');
      return;
    }
    tap('success');
    const next = [...found, hit.id];
    setFound(next);
    if (hintId === hit.id) setHintId(null);
    if (next.length === scene.items.length) {
      const seconds = Math.floor((Date.now() - start.current) / 1000);
      const stars = starsFor(seconds, misses, hints);
      const r = finishCase(inv.id, stars);
      setResult({ stars, seconds, gold: r.ok ? (r.gold ?? 0) : 0 });
    }
  };

  const useHint = () => {
    if (hints >= MAX_HINTS || left.length === 0 || result) return;
    setHints((h) => h + 1);
    setHintId(left[0].id);
    tap('light');
  };

  const again = () => {
    setFound([]);
    setMisses(0);
    setHints(0);
    setHintId(null);
    setResult(null);
    setElapsed(0);
    start.current = Date.now();
  };

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <GameScreen title={inv.title} subtitle={`Found ${found.length}/${scene.items.length} · ${mm}:${ss} · Best ${'★'.repeat(best)}${'☆'.repeat(3 - best)}`} showBack>
      <Panel>
        <View style={styles.list}>
          {scene.items.map((it) => {
            const got = found.includes(it.id);
            return (
              <View key={it.id} style={[styles.item, got && { opacity: 0.35 }]}>
                <Image source={it.icon} style={styles.icon} />
                <Text style={[styles.itemName, got && { textDecorationLine: 'line-through' }]} numberOfLines={1}>
                  {it.name}
                </Text>
              </View>
            );
          })}
        </View>
      </Panel>

      <View style={styles.tools}>
        <View style={{ flex: 1 }}>
          <GameButton compact variant="secondary" label={`Zoom ${zoom}×`} onPress={() => setZoom((z) => (z >= 3 ? 1 : z + 1))} />
        </View>
        <View style={{ flex: 1 }}>
          <GameButton compact variant="secondary" label={`Hint (${MAX_HINTS - hints})`} muted={hints >= MAX_HINTS} onPress={useHint} />
        </View>
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={styles.frame}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
          <PressableScale pressedScale={1} onPress={(e) => onTap(e.nativeEvent.locationX, e.nativeEvent.locationY)} style={{ width: W, height: H }}>
            <Image source={scene.image} style={{ width: W, height: H }} />
            {scene.items
              .filter((it) => found.includes(it.id))
              .map((it) => (
                <View key={it.id} pointerEvents="none" style={[styles.found, { left: it.x * W - 18, top: it.y * H - 18 }]}>
                  <Text style={styles.check}>✓</Text>
                </View>
              ))}
            {hintId ? (() => {
              const it = scene.items.find((i) => i.id === hintId);
              return it ? <Pulse x={it.x * W} y={it.y * H} size={Math.max(26, W * 0.045)} color={colors.goldBright} /> : null;
            })() : null}
            {flashMiss ? <Pulse key={flashMiss.k} x={flashMiss.x} y={flashMiss.y} size={18} color="#F07F7F" /> : null}
          </PressableScale>
        </ScrollView>
      </View>
      <Text style={styles.tip}>Tap an object when you spot it. Swipe the picture sideways when zoomed. Wrong taps cost stars.</Text>

      {result ? (
        <Panel tone="burgundy">
          <Text style={styles.kicker}>Case closed</Text>
          <Text style={styles.stars}>{'★'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</Text>
          <Text style={styles.resText}>
            {Math.floor(result.seconds / 60)}:{String(result.seconds % 60).padStart(2, '0')} · {misses} wrong tap{misses === 1 ? '' : 's'} · {hints} hint{hints === 1 ? '' : 's'}
            {result.gold > 0 ? `\nReward: ${result.gold} gold` : '\nNo new reward. Beat your best for more.'}
          </Text>
          <View style={styles.tools}>
            <View style={{ flex: 1 }}>
              <GameButton compact variant="secondary" label="Search again" onPress={again} />
            </View>
            <View style={{ flex: 1 }}>
              <GameButton compact label="Done" onPress={() => router.back()} />
            </View>
          </View>
        </Panel>
      ) : null}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  item: { width: '31%', flexDirection: 'row', alignItems: 'center', gap: 4 },
  icon: { width: 30, height: 30, resizeMode: 'contain' },
  itemName: { flex: 1, color: colors.parchment, fontFamily: fonts.sans, fontSize: 11 },
  tools: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  frame: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold },
  found: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#7BD389', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,80,40,0.35)' },
  check: { color: '#7BD389', fontWeight: '800', fontSize: 18 },
  tip: { color: colors.parchmentDim, fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  kicker: { color: colors.bronze, fontFamily: fonts.serif, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  stars: { color: colors.goldBright, fontSize: 38, textAlign: 'center', marginVertical: 4 },
  resText: { color: colors.parchment, fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
