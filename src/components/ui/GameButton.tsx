import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radius } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function GameButton({ label, onPress, variant = 'primary' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
      ]}>
      <Text style={[styles.label, { color: primary ? colors.charcoal : colors.parchment }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1.5,
  },
  primary: { backgroundColor: colors.gold, borderColor: colors.goldBright },
  secondary: { backgroundColor: 'transparent', borderColor: colors.bronze },
  label: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
});
