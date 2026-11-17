import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

type Props = { label: string; tone?: 'gold' | 'muted' | 'burgundy' };

export function Chip({ label, tone = 'gold' }: Props) {
  return (
    <View style={[styles.chip, toneStyles[tone]]}>
      <Text style={[styles.text, { color: tone === 'muted' ? colors.parchmentDim : colors.parchment }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, alignSelf: 'flex-start' },
  text: { fontFamily: fonts.sans, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
});

const toneStyles = StyleSheet.create({
  gold: { borderColor: colors.gold, backgroundColor: 'rgba(201,162,39,0.15)' },
  muted: { borderColor: colors.line, backgroundColor: 'transparent' },
  burgundy: { borderColor: colors.burgundyBright, backgroundColor: 'rgba(110,31,43,0.5)' },
});
