import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type Props = { progress: number; color?: string; height?: number };

/** progress is 0 to 1 */
export function ProgressBar({ progress, color = colors.gold, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
});
