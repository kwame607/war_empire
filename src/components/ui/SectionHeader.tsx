import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/theme';

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{title}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.sm },
  text: { fontFamily: fonts.serif, fontSize: 14, fontWeight: '700', letterSpacing: 3, color: colors.gold, textTransform: 'uppercase' },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
});
