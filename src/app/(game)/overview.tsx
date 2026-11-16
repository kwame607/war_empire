import { StyleSheet, Text, View } from 'react-native';

import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { previewPlayer as p } from '@/data/previewState';
import { PROGRESSION_STAGES } from '@/data/progression';
import { colors, fonts, spacing } from '@/theme';

export default function OverviewScreen() {
  const currentIndex = PROGRESSION_STAGES.indexOf(p.status as (typeof PROGRESSION_STAGES)[number]);

  return (
    <GameScreen title="Overview" subtitle={p.dateLabel}>
      <Panel tone="burgundy">
        <Text style={styles.name}>{p.name}</Text>
        <Text style={styles.status}>{p.status}</Text>
        <Text style={styles.meta}>Location: {p.location}</Text>
      </Panel>

      <View style={styles.tiles}>
        <StatTile icon="ribbon-outline" label="Reputation" value={String(p.reputation)} />
        <StatTile icon="people-outline" label="Population" value={String(p.resources.population)} />
      </View>

      <SectionHeader title="Path to power" />
      <Panel>
        {PROGRESSION_STAGES.map((stage, i) => {
          const reached = i <= currentIndex;
          return (
            <View key={stage} style={styles.stageRow}>
              <View style={[styles.dot, reached && styles.dotActive]} />
              <Text style={[styles.stage, reached ? styles.stageActive : styles.stageLocked]}>{stage}</Text>
            </View>
          );
        })}
      </Panel>

      <Text style={styles.note}>Preview build: figures shown are sample data until character creation arrives.</Text>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '800', color: colors.parchment },
  status: { fontFamily: fonts.serif, fontSize: 16, fontStyle: 'italic', color: colors.goldBright, marginTop: 2 },
  meta: { fontFamily: fonts.sans, fontSize: 14, color: colors.parchmentDim, marginTop: spacing.sm },
  tiles: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 7 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: colors.bronze },
  dotActive: { backgroundColor: colors.gold, borderColor: colors.goldBright },
  stage: { fontFamily: fonts.serif, fontSize: 16 },
  stageActive: { color: colors.parchment, fontWeight: '700' },
  stageLocked: { color: colors.parchmentDim },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.bronze, marginTop: spacing.lg, textAlign: 'center' },
});
