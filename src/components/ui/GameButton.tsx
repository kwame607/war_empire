import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';

import { colors, fonts, radius } from '@/theme';
import { tap } from '@/utils/haptics';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  /** Smaller button for use inside cards. */
  compact?: boolean;
  /** Looks dimmed (e.g. you cannot afford it) but still explains why when pressed. */
  muted?: boolean;
};

export function GameButton({ label, onPress, variant = 'primary', compact, muted }: Props) {
  const textColor = variant === 'primary' ? colors.charcoal : colors.parchment;
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={() => {
        tap('light');
        onPress();
      }}
      style={[styles.base, compact && styles.compact, variants[variant], muted && { opacity: 0.5 }]}>
      {variant !== 'secondary' ? <View pointerEvents="none" style={styles.shine} /> : null}
      <Text style={[styles.label, compact && styles.labelCompact, { color: textColor }]}>{label}</Text>
    </PressableScale>
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
    borderBottomWidth: 4,
    overflow: 'hidden',
  },
  shine: { position: 'absolute', left: 0, right: 0, top: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.18)' },
  compact: { minHeight: 44, paddingHorizontal: 14 },
  label: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' },
  labelCompact: { fontSize: 14, letterSpacing: 1 },
});

const variants = StyleSheet.create({
  primary: { backgroundColor: colors.gold, borderColor: colors.goldBright, borderBottomColor: '#7a5c14' },
  secondary: { backgroundColor: 'rgba(11,18,32,0.55)', borderColor: colors.bronze, borderBottomColor: '#4a3820' },
  danger: { backgroundColor: colors.burgundy, borderColor: colors.burgundyBright, borderBottomColor: '#3a0f16' },
});
