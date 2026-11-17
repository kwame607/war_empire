import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SCENARIOS } from '@/data/scenarios';
import { SPY_MISSION_COST_GOLD, SPY_MISSION_SECONDS } from '@/game/constants';
import { spyBusy, spyHireCost } from '@/game/intel';
import { corroboration, TOPIC_HELP, TOPIC_LABEL } from '@/game/intelCore';
import { bureauLevel, formatDuration, spyCap } from '@/game/selectors';
import type { GameState, IntelReport, IntelTopic } from '@/game/types';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

const TOPICS: IntelTopic[] = ['strength', 'commander', 'plans', 'defences'];

export function IntelTab({ state }: { state: GameState }) {
  const { hireSpy, sendSpy } = useGame();
  const level = bureauLevel(state);
  const now = state.lastTickAt;
  const [faction, setFaction] = useState(SCENARIOS[0].id);
  const [topic, setTopic] = useState<IntelTopic>('strength');

  if (level < 1) {
    return (
      <LockedNotice
        title="No intelligence bureau"
        description="Build an Intelligence Bureau (Economy, Institutions) to recruit agents who watch your rivals. Their reports can be wrong, so learn to weigh them."
        arrivesIn="the Bureau"
      />
    );
  }

  const open = SCENARIOS.filter((s) => state.reputation >= s.requiresReputation);
  const reports = state.intel.reports;

  return (
    <>
      <Text style={styles.meta}>
        Agents bring back reports, but a report is only as good as its source. Compare independent reports before you trust one. After a battle you learn who told the truth.
      </Text>

      <SectionHeader title={`Agents ${state.intel.spies.length}/${spyCap(state)}`} />
      {state.intel.spies.map((spy) => {
        const m = state.intel.missions.find((x) => x.spyId === spy.id);
        return (
          <Panel key={spy.id}>
            <View style={styles.row}>
              <Text style={[styles.title, { flex: 1 }]}>{spy.name}</Text>
              <Chip tone={m ? 'gold' : 'muted'} label={m ? `Away · ${formatDuration(Math.max(0, (m.completesAt - now) / 1000))}` : 'Ready'} />
            </View>
            <Text style={styles.meta}>
              Skill {spy.skill} · {spy.missions} missions · Track record: {spy.sound} sound, {spy.unsound} unsound
            </Text>
          </Panel>
        );
      })}
      <GameButton
        compact
        variant="secondary"
        label={`Recruit an agent ${spyHireCost(state)}g`}
        onPress={() => {
          const r = hireSpy();
          if (!r.ok) Alert.alert('Cannot recruit', r.reason);
        }}
      />

      <SectionHeader title="Send an agent" />
      <SegmentedControl options={open.map((s) => ({ value: s.id, label: s.enemy.name.split(' ').slice(-1)[0] }))} value={faction} onChange={setFaction} />
      <SegmentedControl options={TOPICS.map((t) => ({ value: t, label: TOPIC_LABEL[t] }))} value={topic} onChange={setTopic} />
      <Text style={styles.meta}>
        {TOPIC_HELP[topic]} Costs {SPY_MISSION_COST_GOLD} gold and takes {formatDuration(SPY_MISSION_SECONDS)}. Agents can be caught.
      </Text>
      {state.intel.spies
        .filter((s) => !spyBusy(state, s.id))
        .map((s) => (
          <GameButton
            key={s.id}
            compact
            label={`Send ${s.name}`}
            onPress={() => {
              const r = sendSpy(s.id, faction, topic);
              if (!r.ok) Alert.alert('Cannot send', r.reason);
            }}
          />
        ))}

      <SectionHeader title="Reports" />
      {reports.length === 0 ? <Text style={styles.meta}>No reports yet.</Text> : null}
      {reports.map((r) => (
        <ReportCard key={r.id} state={state} report={r} />
      ))}
      {reports.length > 0 ? (
        <View style={{ marginTop: spacing.md }}>
          <GameButton compact variant="secondary" label="Go to operations" onPress={() => router.push('/military')} />
        </View>
      ) : null}
    </>
  );
}

export function ReportCard({ state, report, selected }: { state: GameState; report: IntelReport; selected?: boolean }) {
  const enemy = SCENARIOS.find((s) => s.id === report.factionId)?.enemy.name ?? report.factionId;
  const c = corroboration(state, report);
  return (
    <Panel>
      <View style={styles.row}>
        <Text style={[styles.title, { flex: 1 }]}>
          {TOPIC_LABEL[report.topic]}: {enemy}
        </Text>
        {selected ? <Chip label="Relied on" /> : null}
      </View>
      <Text style={styles.body}>{report.text}</Text>
      <View style={styles.chips}>
        <Chip tone="muted" label={`${report.spyName} · ${report.confidence} confidence`} />
        {report.ageLabel ? <Chip tone="burgundy" label={report.ageLabel} /> : null}
        {c.agree > 0 ? <Chip label={`${c.agree} agree`} /> : null}
        {c.conflict > 0 ? <Chip tone="burgundy" label={`${c.conflict} conflict`} /> : null}
        {report.verified ? <Chip tone="muted" label="Checked after battle" /> : null}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '800', color: colors.parchment },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.parchment, marginTop: 4 },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
});
