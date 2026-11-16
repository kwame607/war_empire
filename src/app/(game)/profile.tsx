import { StyleSheet, Text, View } from 'react-native';

import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { previewPlayer as p } from '@/data/previewState';
import { ATTRIBUTES } from '@/data/progression';
import { colors, fonts, spacing } from '@/theme';

export default function ProfileScreen() {
  return (
    <GameScreen title="Profile" subtitle={`${p.name} · ${p.status}`}>
      <SectionHeader title="Attributes" />
      <Panel>
        {ATTRIBUTES.map((a) => (
          <View key={a} style={styles.row}>
            <Text style={styles.label}>{a}</Text>
            <Text style={styles.value}>{a === 'Reputation' ? p.reputation : 1}</Text>
          </View>
        ))}
      </Panel>
      <Text style={styles.note}>Attributes will grow through your actions, education and decisions.</Text>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { fontFamily: fonts.sans, fontSize: 16, color: colors.parchmentDim },
  value: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchment },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.bronze, marginTop: spacing.md, textAlign: 'center' },
});
