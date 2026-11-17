import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = { selected: boolean; onPress: () => void; children: ReactNode };

/** A tappable card for choosing one option from a list. */
export function SelectCard({ selected, onPress, children }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.card, selected && styles.selected]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.navyLight,
    gap: 6,
  },
  selected: { borderColor: colors.goldBright, borderWidth: 2, backgroundColor: '#1B2A47' },
});
