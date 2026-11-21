import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { tap } from '@/utils/haptics';
import { useMotion } from '@/utils/motion';

type Rewards = { gold: number; food: number; wood: number; stone: number; reputation: number };
const ITEMS: { key: keyof Rewards; icon: keyof typeof Ionicons.glyphMap; tint: string; label: string }[] = [
  { key: 'gold', icon: 'cash-outline', tint: colors.goldBright, label: 'Gold' },
  { key: 'food', icon: 'restaurant-outline', tint: '#C98B4B', label: 'Food' },
  { key: 'wood', icon: 'git-branch-outline', tint: '#6F9B5A', label: 'Timber' },
  { key: 'stone', icon: 'cube-outline', tint: '#A3A7AD', label: 'Stone' },
  { key: 'reputation', icon: 'ribbon-outline', tint: '#E27B86', label: 'Renown' },
];

function Tile({ icon, tint, label, value, delay, motion }: { icon: keyof typeof Ionicons.glyphMap; tint: string; label: string; value: number; delay: number; motion: boolean }) {
  const [t] = useState(() => new Animated.Value(motion ? 0 : 1));
  const [shown, setShown] = useState(motion ? 0 : value);
  useEffect(() => {
    if (!motion) return;
    const id = t.addListener(({ value: v }) => setShown(Math.round(value * v)));
    const timer = setTimeout(() => tap('light'), delay);
    Animated.timing(t, { toValue: 1, duration: 900, delay, easing: Easing.out(Easing.back(1.3)), useNativeDriver: false }).start();
    return () => {
      t.removeListener(id);
      clearTimeout(timer);
    };
  }, [t, value, delay, motion]);
  return (
    <Animated.View style={[styles.tile, { opacity: t.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}>
      <Ionicons name={icon} size={24} color={tint} />
      <Text style={styles.value}>{value < 0 ? '−' : '+'}{Math.abs(shown)}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

/** The spoils of a battle, popping in one after another and counting up. */
export function LootReveal({ rewards }: { rewards: Rewards }) {
  const motion = useMotion();
  const items = ITEMS.filter((i) => rewards[i.key] !== 0);
  if (items.length === 0) return <Text style={styles.none}>No spoils this time.</Text>;
  return (
    <View style={styles.row}>
      {items.map((i, n) => (
        <Tile key={i.key} icon={i.icon} tint={i.tint} label={i.label} value={rewards[i.key]} delay={600 + n * 280} motion={motion} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tile: { minWidth: 84, flexGrow: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderBottomWidth: 4, borderColor: colors.bronze, backgroundColor: 'rgba(11,18,32,0.6)' },
  value: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '800', color: colors.parchment, marginTop: 2 },
  label: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.parchmentDim },
  none: { fontFamily: fonts.sans, fontSize: 13, color: colors.parchmentDim, marginTop: 6 },
});
