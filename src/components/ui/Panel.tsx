import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { nextStagger, useMotion } from '@/utils/motion';

type Props = { children: ReactNode; tone?: 'dark' | 'parchment' | 'burgundy'; style?: ViewStyle };

/** A framed card. The basic container for information on every screen. */
export function Panel({ children, tone = 'dark', style }: Props) {
  const motion = useMotion();
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!motion) {
      t.setValue(1);
      return;
    }
    const anim = Animated.timing(t, { toValue: 1, duration: 320, delay: nextStagger(), easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [t, motion]);
  return (
    <Animated.View style={[styles.base, toneStyles[tone], style, { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
});

const toneStyles = StyleSheet.create({
  dark: { backgroundColor: colors.navyLight, borderColor: colors.line },
  parchment: { backgroundColor: colors.parchment, borderColor: colors.bronze },
  burgundy: { backgroundColor: colors.burgundy, borderColor: colors.gold },
});
