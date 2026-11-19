import { StyleSheet, Text, View } from 'react-native';

import { ResultBanner } from '@/components/art/ResultBanner';
import { UnitChips } from '@/components/military/UnitChips';
import { Chip } from '@/components/ui/Chip';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { resultLabel } from '@/game/report';
import { sumUnits } from '@/game/selectors';
import type { BattleReport } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((t, i) => (
        <Text key={i} style={styles.body}>
          • {t}
        </Text>
      ))}
    </>
  );
}

/** The full after-action report. */
export function ReportView({ report: r }: { report: BattleReport }) {
  const lost = sumUnits(r.playerInitial) - sumUnits(r.playerFinal);
  const killed = sumUnits(r.enemyInitial) - sumUnits(r.enemyFinal);
  const rw = r.rewards;
  const rewardParts = [
    rw.gold ? `${rw.gold} gold` : null,
    rw.food ? `${rw.food} food` : null,
    rw.wood ? `${rw.wood} wood` : null,
    rw.stone ? `${rw.stone} stone` : null,
    rw.reputation ? `reputation ${rw.reputation > 0 ? '+' : ''}${rw.reputation}` : null,
  ].filter(Boolean);

  return (
    <>
      <ResultBanner report={r} />
      <Panel tone={r.result === 'victory' ? 'burgundy' : 'dark'}>
        <View style={styles.row}>
          <Text style={styles.title}>{r.scenarioName}</Text>
          <Chip tone={r.result === 'victory' ? 'gold' : r.result === 'defeat' ? 'burgundy' : 'muted'} label={resultLabel(r.result)} />
        </View>
        <Text style={styles.meta}>
          Against {r.enemyName} · {r.rounds.length} round{r.rounds.length === 1 ? '' : 's'}
        </Text>
        <Text style={styles.meta}>Rewards: {rewardParts.length ? rewardParts.join(', ') : 'none'}</Text>
      </Panel>

      <SectionHeader title="Casualties" />
      <Panel>
        <Text style={styles.label}>Your army: {lost} lost of {sumUnits(r.playerInitial)}</Text>
        <UnitChips units={r.playerFinal} empty="No survivors" />
        <Text style={[styles.label, { marginTop: spacing.md }]}>Enemy: {killed} lost of {sumUnits(r.enemyInitial)}</Text>
        <UnitChips units={r.enemyFinal} empty="None left standing" />
      </Panel>

      <SectionHeader title="Commander" />
      <Panel>
        <Text style={styles.label}>
          {r.leader.name} {r.leader.isPlayer ? '(you)' : ''}
        </Text>
        <Text style={styles.body}>Performance: {r.leader.performance}</Text>
        {r.delegated ? <Text style={styles.meta}>The later rounds were delegated and fought under the commander’s own judgement.</Text> : null}
      </Panel>

      <SectionHeader title="Tactical decisions" />
      <Panel>
        <Bullets items={r.decisions} />
      </Panel>

      <SectionHeader title="Enemy strengths" />
      <Panel>
        <Bullets items={r.enemyStrengths} />
      </Panel>

      <SectionHeader title="Weaknesses exploited" />
      <Panel>
        <Bullets items={r.exploited} />
        {r.doctrinesPracticed.length > 0 ? (
          <Text style={[styles.meta, { color: colors.goldBright }]}>
            Practical experience gained: {Array.from(new Set(r.doctrinesPracticed)).join(', ')}.
          </Text>
        ) : null}
      </Panel>

      <SectionHeader title="Terrain and weather" />
      <Panel>
        <Text style={styles.body}>{r.terrainWeather}</Text>
      </Panel>

      <SectionHeader title="Logistics" />
      <Panel>
        <Text style={styles.body}>{r.logistics}</Text>
      </Panel>

      {r.intelligence && r.intelligence.length > 0 ? (
        <>
          <SectionHeader title="Intelligence" />
          <Panel>
            <Bullets items={r.intelligence} />
          </Panel>
        </>
      ) : null}

      <SectionHeader title="Lessons learned" />
      <Panel>
        <Bullets items={r.lessons} />
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 22, fontWeight: '800', color: colors.parchment },
  label: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchment, marginBottom: 6 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.parchment, marginTop: 2 },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
});
