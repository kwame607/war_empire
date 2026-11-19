import { BuildingPreview } from '@/components/3d/BuildingPreview';
import { Panel } from '@/components/ui/Panel';
import { PlainScreen } from '@/components/ui/PlainScreen';
import { colors, fonts, spacing } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function ThreeDLabScreen() {
  return (
    <PlainScreen title="3D Rendering Lab" subtitle="Hybrid 3D prototype · Stage 1">
      <Text style={styles.intro}>
        This is an isolated real-time 3D test. It does not replace your settlement artwork or change any game systems.
      </Text>
      <BuildingPreview />
      <Panel>
        <Text style={styles.heading}>Prototype objectives</Text>
        <View style={styles.list}>
          <Text style={styles.item}>✓ Real-time 3D geometry and lighting</Text>
          <Text style={styles.item}>✓ Drag to rotate the building</Text>
          <Text style={styles.item}>✓ Zoom controls</Text>
          <Text style={styles.pending}>○ Next: a small settlement with several buildings</Text>
          <Text style={styles.pending}>○ Then: a 3D terrain and battlefield test</Text>
        </View>
      </Panel>
      <Text style={styles.note}>Performance and touch behaviour still need verification on a physical iPhone.</Text>
    </PlainScreen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.parchmentDim, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21 },
  heading: { color: colors.goldBright, fontFamily: fonts.serif, fontSize: 17, fontWeight: '800' },
  list: { gap: spacing.sm, marginTop: spacing.md },
  item: { color: colors.parchment, fontFamily: fonts.sans, fontSize: 13 },
  pending: { color: colors.parchmentDim, fontFamily: fonts.sans, fontSize: 13 },
  note: { color: colors.bronze, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, paddingHorizontal: 4 },
});
