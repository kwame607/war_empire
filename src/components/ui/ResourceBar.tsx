import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getPopulation } from '@/game/selectors';
import { useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';
import { compact } from '@/utils/format';
import { useMotion } from '@/utils/motion';

type IconName = keyof typeof Ionicons.glyphMap;

/** Shows a number. Big jumps (a purchase, a reward, a battle) count up or down and flash green or red. */
function ResourceValue({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const [flash, setFlash] = useState<0 | 1 | -1>(0);
  const [prev, setPrev] = useState(value);
  const motion = useMotion();
  const from = useRef(value);
  if (value !== prev) {
    const delta = value - prev;
    setPrev(value);
    if (Math.abs(delta) >= Math.max(5, Math.abs(prev) * 0.02)) setFlash(delta > 0 ? 1 : -1);
  }
  useEffect(() => {
    const start = from.current;
    const delta = value - start;
    if (!motion || Math.abs(delta) < Math.max(5, Math.abs(start) * 0.02)) {
      from.current = value;
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = Date.now();
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / 600);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = start + delta * eased;
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, motion]);
  useEffect(() => {
    if (flash === 0) return;
    const id = setTimeout(() => setFlash(0), 900);
    return () => clearTimeout(id);
  }, [flash]);
  return <Text style={[styles.value, flash === 1 && styles.up, flash === -1 && styles.down]}>{compact(shown)}</Text>;
}

/** The always-visible strip showing the player's resources. */
export function ResourceBar() {
  const state = useGameState();
  const items: { icon: IconName; tint: string; value: number }[] = [
    { icon: 'cash-outline', tint: colors.goldBright, value: state.resources.gold },
    { icon: 'restaurant-outline', tint: '#C98B4B', value: state.resources.food },
    { icon: 'git-branch-outline', tint: '#6F9B5A', value: state.resources.wood },
    { icon: 'cube-outline', tint: '#A3A7AD', value: state.resources.stone },
    { icon: 'people-outline', tint: colors.parchment, value: getPopulation(state) },
  ];
  return (
    <View style={styles.bar}>
      {items.map(({ icon, tint, value }) => (
        <View key={icon} style={styles.item}>
          <Ionicons name={icon} size={16} color={tint} />
          <ResourceValue value={value} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.charcoal,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  value: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '600', color: colors.parchment },
  up: { color: '#7BD389' },
  down: { color: '#F07F7F' },
});
