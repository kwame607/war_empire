import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { SettlementScene } from '@/components/art/SettlementScene';
import { GameScreen } from '@/components/ui/GameScreen';
import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { getBusinessType } from '@/data/businesses';
import { getInstitutionType } from '@/data/institutions';
import { getKnowledgeEntry } from '@/data/knowledge';
import { getUnitType } from '@/data/units';
import { recruitSeconds } from '@/game/military';
import { PROGRESSION_STAGES } from '@/data/progression';
import { getSettlement } from '@/data/world';
import { buildSeconds } from '@/game/economy';
import { adviceFor } from '@/game/advisor';
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
  const advice = adviceFor(state);

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
    jobs.push({ key: 'study', text: `Studying: ${entry?.title ?? 'record'}`, progress: 1 - remaining / (state.study.totalSeconds ?? entry?.studySeconds ?? 60), remaining });
  }
  state.institutions.forEach((inst) => {
    if (!inst.pending) return;
    const type = getInstitutionType(inst.typeId);
    const total = buildSeconds(state, type, inst.pending.targetLevel);
    const remaining = (inst.pending.completesAt - now) / 1000;
    jobs.push({
      key: `inst-${inst.typeId}`,
      text: inst.pending.targetLevel === 1 ? `Founding the ${type.name}` : `Upgrading the ${type.name} to level ${inst.pending.targetLevel}`,
      progress: 1 - remaining / total,
      remaining,
    });
  });
  state.army.training.forEach((b, i) => {
    const remaining = (b.completesAt - now) / 1000;
    jobs.push({
      key: `train-${i}`,
      text: `Training ${b.count} ${getUnitType(b.unitId).name.toLowerCase()}`,
      progress: 1 - remaining / recruitSeconds(state, b.unitId, b.count),
      remaining,
    });
  });
  if (state.expedition) {
    const remaining = (state.expedition.endsAt - now) / 1000;
    jobs.push({ key: 'expedition', text: `Army marching on the ${state.expedition.battle.enemy.name}`, progress: 1 - remaining / ((state.expedition.endsAt - state.expedition.startedAt) / 1000), remaining });
  }
  state.fleet.training.forEach((b, i) => {
    const remaining = (b.completesAt - now) / 1000;
    jobs.push({ key: `ship-${i}`, text: `Building ${b.count} warship${b.count > 1 ? 's' : ''}`, progress: 1 - remaining / Math.max(1, b.count * 20), remaining });
  });
  state.intel.missions.forEach((m) => {
    const spy = state.intel.spies.find((x) => x.id === m.spyId);
    const remaining = (m.completesAt - now) / 1000;
    jobs.push({ key: m.id, text: `${spy?.name ?? 'An agent'} is gathering intelligence`, progress: 1 - remaining / 90, remaining });
  });
  state.world.envoys.forEach((e) => {
    const rival = state.world.rivals.find((r) => r.id === e.rivalId);
    const remaining = (e.completesAt - now) / 1000;
    jobs.push({ key: e.id, text: `Envoy travelling to ${rival?.name ?? 'a kingdom'}`, progress: 1 - remaining / 120, remaining });
  });
  if (state.scouting) {
    const remaining = (state.scouting.completesAt - now) / 1000;
    jobs.push({ key: 'scout', text: `Scouting ${getSettlement(state.scouting.settlementId).name}`, progress: 1 - remaining / 45, remaining });
  }

  const nextProgress = next ? (state.reputation - stage.reputation) / (next.reputation - stage.reputation) : 1;

  return (
    <GameScreen title="Overview" subtitle={date.label}>
      <SettlementScene state={state} title={state.player.name} subtitle={`${stage.name} · ${home.name}`} />

      {state.world.offers.length > 0 ? (
        <Panel>
          <Text style={styles.meta}>
            {state.world.offers.length} message{state.world.offers.length > 1 ? 's' : ''} from other kingdoms await your reply.
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <GameButton compact label="Open diplomacy" onPress={() => router.push('/map')} />
          </View>
        </Panel>
      ) : null}

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

      {advice.length > 0 ? (
        <>
          <SectionHeader title="Next steps" />
          <Panel>
            {advice.map((a) => (
              <View key={a.text} style={styles.job}>
                <Text style={styles.body}>• {a.text}</Text>
                {a.href ? <GameButton compact variant="secondary" label="Go" onPress={() => router.push(a.href!)} /> : null}
              </View>
            ))}
          </Panel>
        </>
      ) : null}

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
