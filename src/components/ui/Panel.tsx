import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

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
    <Animated.View style={[styles.base, toneStyles[tone], style, { opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>{tone === 'dark' ? <View pointerEvents="none" style={styles.inner} /> : null}
      {tone === 'dark' ? (['tl', 'tr', 'bl', 'br'] as const).map((c) => <View key={c} pointerEvents="none" style={[styles.stud, studPos[c]]} />) : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 1.5, padding: spacing.md },
  inner: { position: 'absolute', left: 3, right: 3, top: 3, bottom: 3, borderRadius: radius.md - 3, borderWidth: 1, borderColor: 'rgba(201,162,39,0.16)' },
  stud: { position: 'absolute', width: 7, height: 7, backgroundColor: colors.gold, borderWidth: 1, borderColor: '#5a431f', transform: [{ rotate: '45deg' }] },
});

const studPos = StyleSheet.create({
  tl: { left: -4, top: -4 },
  tr: { right: -4, top: -4 },
  bl: { left: -4, bottom: -4 },
  br: { right: -4, bottom: -4 },
});

const toneStyles = StyleSheet.create({
  dark: { backgroundColor: colors.navyLight, borderColor: colors.bronze },
  parchment: { backgroundColor: colors.parchment, borderColor: colors.bronze },
  burgundy: { backgroundColor: colors.burgundy, borderColor: colors.gold },
});
