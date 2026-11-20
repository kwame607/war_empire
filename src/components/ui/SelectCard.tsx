import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';

import { colors, radius, spacing } from '@/theme';
import { tap } from '@/utils/haptics';

type Props = { selected: boolean; onPress: () => void; children: ReactNode };

/** A tappable card for choosing one option from a list. */
export function SelectCard({ selected, onPress, children }: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap('light');
        onPress();
      }}
      pressedScale={0.98}
      style={[styles.card, selected && styles.selected]}>
      {children}
    </PressableScale>
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
