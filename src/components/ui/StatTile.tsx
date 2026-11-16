import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

type Props = { icon: keyof typeof Ionicons.glyphMap; label: string; value: string };

/** One labelled number, e.g. "Reputation 0". */
export function StatTile({ icon, label, value }: Props) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={20} color={colors.gold} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 96,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    backgroundColor: colors.navyLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  value: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: colors.parchment },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.parchmentDim, letterSpacing: 1, textTransform: 'uppercase' },
});
