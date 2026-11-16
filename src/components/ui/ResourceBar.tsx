import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { previewPlayer } from '@/data/previewState';
import type { Resources } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';
import { compact } from '@/utils/format';

const ITEMS: { key: keyof Resources; icon: keyof typeof Ionicons.glyphMap; tint: string }[] = [
  { key: 'gold', icon: 'cash-outline', tint: colors.goldBright },
  { key: 'food', icon: 'restaurant-outline', tint: '#C98B4B' },
  { key: 'wood', icon: 'leaf-outline', tint: '#6F9B5A' },
  { key: 'stone', icon: 'cube-outline', tint: '#A3A7AD' },
  { key: 'population', icon: 'people-outline', tint: colors.parchment },
];

/** The always-visible strip showing the player's resources. */
export function ResourceBar({ resources = previewPlayer.resources }: { resources?: Resources }) {
  return (
    <View style={styles.bar}>
      {ITEMS.map(({ key, icon, tint }) => (
        <View key={key} style={styles.item}>
          <Ionicons name={icon} size={16} color={tint} />
          <Text style={styles.value}>{compact(resources[key])}</Text>
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
