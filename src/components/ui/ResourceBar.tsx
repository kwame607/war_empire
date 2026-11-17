import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { getPopulation } from '@/game/selectors';
import { useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';
import { compact } from '@/utils/format';

type IconName = keyof typeof Ionicons.glyphMap;

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
          <Text style={styles.value}>{compact(value)}</Text>
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
});
