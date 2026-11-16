import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';

type Props = { title: string; description: string; arrivesIn: string };

/** Honest placeholder for a feature that is planned but not built yet. */
export function LockedNotice({ title, description, arrivesIn }: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name="lock-closed-outline" size={26} color={colors.bronze} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
        <Text style={styles.when}>Arrives in {arrivesIn}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.bronze,
    backgroundColor: 'rgba(140,106,59,0.08)',
  },
  text: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700', color: colors.parchment },
  desc: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21, color: colors.parchmentDim },
  when: { fontFamily: fonts.sans, fontSize: 12, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
});
