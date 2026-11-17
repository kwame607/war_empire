import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GameScreen } from '@/components/ui/GameScreen';
import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { getBusinessType } from '@/data/businesses';
import { getKnowledgeEntry } from '@/data/knowledge';
import { PROGRESSION_STAGES } from '@/data/progression';
import { getSettlement } from '@/data/world';
import { buildSeconds } from '@/game/economy';
import { formatDuration, getGameDate, getPopulation, getRates, getStageIndex } from '@/game/selectors';
import { useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';
import { perHour } from '@/utils/format';

export default function OverviewScreen() {
  const state = useGameState();
  const now = state.lastTickAt;
  const stageIdx = getStageIndex(state);
  const stage = PROGRESSION_STAGES[stageIdx];
  const next = PROGRESSION_STAGES[stageIdx + 1];
  const rates = getRates(state);
  const home = getSettlement(state.player.startSettlementId);
  const date = getGameDate(state);

  const jobs: { key: string; text: string; progress: number; remaining: number }[] = [];
  for (const b of state.businesses) {
    if (!b.pending) continue;
    const type = getBusinessType(b.typeId);
    const total = buildSeconds(state, type, b.pending.targetLevel);
    const remaining = (b.pending.completesAt - now) / 1000;
    jobs.push({
      key: b.typeId,
      text: b.pending.targetLevel === 1 ? `Building ${type.name}` : `Upgrading ${type.name} to level ${b.pending.targetLevel}`,
      progress: 1 - remaining / total,
      remaining,
    });
  }
  if (state.study) {
    const entry = getKnowledgeEntry(state.study.entryId);
    const remaining = (state.study.completesAt - now) / 1000;
    jobs.push({ key: 'study', text: `Studying: ${entry?.title ?? 'record'}`, progress: 1 - remaining / (entry?.studySeconds ?? 60), remaining });
  }
  if (state.scouting) {
    const remaining = (state.scouting.completesAt - now) / 1000;
    jobs.push({ key: 'scout', text: `Scouting ${getSettlement(state.scouting.settlementId).name}`, progress: 1 - remaining / 45, remaining });
  }

  const nextProgress = next ? (state.reputation - stage.reputation) / (next.reputation - stage.reputation) : 1;

  return (
    <GameScreen title="Overview" subtitle={date.label}>
      <Panel tone="burgundy">
        <Text style={styles.name}>{state.player.name}</Text>
        <Text style={styles.status}>{stage.name}</Text>
        <Text style={styles.meta}>Home: {home.name}</Text>
      </Panel>

      <View style={styles.tiles}>
        <StatTile icon="ribbon-outline" label="Reputation" value={String(Math.floor(state.reputation))} />
        <StatTile icon="people-outline" label="Population" value={String(getPopulation(state))} />
        <StatTile icon="cash-outline" label="Gold / hour" value={perHour(rates.net)} />
      </View>

      <SectionHeader title="Path to power" />
      <Panel>
        <Text style={styles.stageLine}>
          {next ? `Next: ${next.name}` : 'You have reached the highest stage'}
        </Text>
        <ProgressBar progress={nextProgress} />
        {next ? (
          <Text style={styles.meta}>
            Reputation {Math.floor(state.reputation)} / {next.reputation}. Earn it by building, upgrading and studying.
          </Text>
        ) : null}
      </Panel>

      <SectionHeader title="In progress" />
      {jobs.length === 0 ? (
        <Panel>
          <Text style={styles.body}>Nothing is under way. Start a build, a study or a scouting mission.</Text>
          <View style={{ marginTop: spacing.md }}>
            <GameButton compact label="Go to Economy" onPress={() => router.push('/economy')} />
          </View>
        </Panel>
      ) : (
        <Panel>
          {jobs.map((j) => (
            <View key={j.key} style={styles.job}>
              <Text style={styles.body}>{j.text}</Text>
              <ProgressBar progress={j.progress} />
              <Text style={styles.meta}>{formatDuration(j.remaining)} left</Text>
            </View>
          ))}
        </Panel>
      )}

      <SectionHeader title="Recent events" />
      <Panel>
        {[...state.log].reverse().slice(0, 6).map((e, i) => (
          <Text key={`${e.at}-${i}`} style={styles.event}>
            • {e.text}
          </Text>
        ))}
      </Panel>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '800', color: colors.parchment },
  status: { fontFamily: fonts.serif, fontSize: 16, fontStyle: 'italic', color: colors.goldBright, marginTop: 2 },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  tiles: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  stageLine: { fontFamily: fonts.serif, fontSize: 16, color: colors.parchment, marginBottom: spacing.sm },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchment },
  job: { gap: 6, paddingVertical: spacing.sm },
  event: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.parchmentDim },
});
