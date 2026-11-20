import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type Props = { progress: number; color?: string; height?: number };

/** progress is 0 to 1 */
export function ProgressBar({ progress, color = colors.gold, height = 8 }: Props) {
  const target = Math.max(0, Math.min(1, progress));
  const [v] = useState(() => new Animated.Value(target));
  useEffect(() => {
    const a = Animated.timing(v, { toValue: target, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [target, v]);
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={{ width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
});
