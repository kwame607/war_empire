import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = { children: ReactNode; tone?: 'dark' | 'parchment' | 'burgundy'; style?: ViewStyle };

/** A framed card. The basic container for information on every screen. */
export function Panel({ children, tone = 'dark', style }: Props) {
  return <View style={[styles.base, toneStyles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
});

const toneStyles = StyleSheet.create({
  dark: { backgroundColor: colors.navyLight, borderColor: colors.line },
  parchment: { backgroundColor: colors.parchment, borderColor: colors.bronze },
  burgundy: { backgroundColor: colors.burgundy, borderColor: colors.gold },
});
