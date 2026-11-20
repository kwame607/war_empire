import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PROGRESSION_STAGES } from '@/data/progression';
import { getStageIndex } from '@/game/selectors';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { tap } from '@/utils/haptics';
import { useMotion } from '@/utils/motion';

type Toast = { key: string; title: string; text: string; tone: 'gold' | 'info' };

/** Which log lines deserve a pop-up, and how to present them. */
function toastFor(text: string): Omit<Toast, 'key'> | null {
  if (text.startsWith('Achievement:')) return { title: 'Achievement', text: text.slice(12).trim(), tone: 'gold' };
  if (text.startsWith('Act complete:') || text.startsWith('Campaign complete:')) return { title: text.startsWith('Campaign') ? 'Campaign complete' : 'Act complete', text: text.split(':').slice(1).join(':').trim(), tone: 'gold' };
  if (text.startsWith('Event:')) return { title: 'A matter for the ruler', text: text.slice(6).trim(), tone: 'info' };
  if (text.startsWith('Investigation:')) return { title: 'Case solved', text: text.slice(14).trim(), tone: 'gold' };
  if (text.startsWith('Scholarship:')) return { title: 'Scholarship', text: text.slice(12).trim(), tone: 'gold' };
  if (text.endsWith('construction is complete.') || text.endsWith(' is complete.')) return { title: 'Construction complete', text: text.replace(' construction is complete.', ' stands finished.').replace(' is complete.', ' stands finished.'), tone: 'gold' };
  if (text.includes(' upgraded to level ')) return { title: 'Upgrade complete', text, tone: 'gold' };
  if (text.includes('have finished training')) return { title: 'Troops ready', text, tone: 'info' };
  if (text.includes('launched.')) return { title: 'Fleet', text, tone: 'info' };
  return null;
}

const SPARKS = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2, d: 38 + (i % 3) * 14 }));

/** A quick ring of gold sparks that flies out from the card. */
function Sparkles({ burstKey }: { burstKey: string }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 900, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [burstKey, t]);
  return (
    <View pointerEvents="none" style={styles.sparks}>
      {SPARKS.map((s, i) => (
        <Animated.View
          key={i}
          style={[styles.spark, { opacity: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }), transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(s.a) * s.d * 2.2] }) }, { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(s.a) * s.d * 0.7] }) }, { rotate: '45deg' }, { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }] }]}
        />
      ))}
    </View>
  );
}

/** Slides short banners down from the top when something worth celebrating is written to the log. */
export function ToastHost() {
  const { state } = useGame();
  const insets = useSafeAreaInsets();
  const motion = useMotion();
  const seen = useRef<Set<string> | null>(null);
  const lastStage = useRef<number | null>(null);
  const [queue, setQueue] = useState<Toast[]>([]);
  const [slide] = useState(() => new Animated.Value(0));

  // Pick up new log lines (the first look at a save only records what is already there).
  const log = state?.log;
  useEffect(() => {
    if (!log) return;
    const keys = log.map((l) => `${l.at}|${l.text}`);
    if (seen.current === null) {
      seen.current = new Set(keys);
      return;
    }
    const fresh: Toast[] = [];
    log.forEach((l, i) => {
      if (seen.current!.has(keys[i])) return;
      const t = toastFor(l.text);
      if (t) fresh.push({ key: keys[i], ...t });
    });
    keys.forEach((k) => seen.current!.add(k));
    if (fresh.length > 0) setQueue((q) => [...q, ...fresh].slice(-4));
  }, [log]);

  // A rise in rank gets its own celebration.
  const stage = state ? getStageIndex(state) : null;
  useEffect(() => {
    if (stage === null) return;
    if (lastStage.current !== null && stage > lastStage.current) {
      const name = PROGRESSION_STAGES[stage]?.name ?? 'a new rank';
      setQueue((q) => [...q, { key: `stage-${stage}-${Date.now()}`, title: 'Rank gained', text: `Your standing grows: you are now ${name}.`, tone: 'gold' as const }].slice(-4));
    }
    lastStage.current = stage;
  }, [stage]);

  const current = queue[0] ?? null;
  const currentKey = current?.key;
  const tone = current?.tone;

  useEffect(() => {
    if (!currentKey) return;
    tap(tone === 'gold' ? 'success' : 'light');
    slide.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(slide, { toValue: 1, duration: motion ? 320 : 0, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(slide, { toValue: 0, duration: motion ? 260 : 0, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && setQueue((q) => q.slice(1)));
    return () => anim.stop();
  }, [currentKey, tone, slide, motion]);

  if (!current) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { top: insets.top + 6, opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }] }]}>
      <View style={[styles.card, current.tone === 'gold' && styles.gold]}>
        {current.tone === 'gold' && motion ? <Sparkles burstKey={current.key} /> : null}
        <Text style={styles.title}>{current.tone === 'gold' ? '✦ ' : ''}{current.title}</Text>
        <Text style={styles.text} numberOfLines={2}>{current.text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md, zIndex: 9999, alignItems: 'center' },
  card: { maxWidth: 520, width: '100%', backgroundColor: 'rgba(11,18,32,0.96)', borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingVertical: 10, paddingHorizontal: spacing.md },
  sparks: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 },
  spark: { position: 'absolute', width: 8, height: 8, backgroundColor: colors.goldBright },
  gold: { borderColor: colors.goldBright, backgroundColor: 'rgba(40,30,8,0.97)' },
  title: { fontFamily: fonts.serif, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.goldBright },
  text: { fontFamily: fonts.sans, fontSize: 15, color: colors.parchment, marginTop: 2 },
});
