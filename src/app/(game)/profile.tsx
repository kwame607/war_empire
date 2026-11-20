import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ACHIEVEMENTS, CHAPTERS } from '@/data/achievements';
import { getBackground, getDifficulty } from '@/data/backgrounds';
import { getCivilisation } from '@/data/civilisations';
import { ATTRIBUTE_LABELS, PROGRESSION_STAGES } from '@/data/progression';
import { getSettlement } from '@/data/world';
import type { AttributeKey } from '@/game/types';
import { getGameDate, getStageIndex } from '@/game/selectors';
import { useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function ProfileScreen() {
  const state = useGameState();
  const civ = getCivilisation(state.player.civId);
  const bg = getBackground(state.player.backgroundId);
  const diff = getDifficulty(state.player.difficultyId);
  const stage = PROGRESSION_STAGES[getStageIndex(state)];

  return (
    <GameScreen title="Profile" subtitle={`${state.player.name} · ${stage.name}`}>
      <SectionHeader title={`Chronicle of deeds · ${ACHIEVEMENTS.filter((a) => state.achievements[a.id] !== undefined).length}/${ACHIEVEMENTS.length}`} />
      {CHAPTERS.map((ch, ci) => {
        const list = ACHIEVEMENTS.filter((a) => a.chapter === ci);
        const got = list.filter((a) => state.achievements[a.id] !== undefined).length;
        return (
          <Panel key={ch.title}>
            <Text style={styles.chTitle}>{ch.title}</Text>
            <Text style={styles.chBlurb}>{ch.blurb}</Text>
            <ProgressBar progress={got / list.length} />
            {list.map((a) => {
              const done = state.achievements[a.id] !== undefined;
              return (
                <Text key={a.id} style={[styles.deed, !done && { opacity: 0.55 }]}>
                  {done ? '✔ ' : '○ '}
                  {a.title} — {a.text}
                </Text>
              );
            })}
          </Panel>
        );
      })}

      <SectionHeader title="Attributes" />
      <Panel>
        {(Object.keys(ATTRIBUTE_LABELS) as AttributeKey[]).map((k) => (
          <View key={k} style={styles.attr}>
            <View style={styles.row}>
              <Text style={styles.label}>{ATTRIBUTE_LABELS[k]}</Text>
              <Text style={styles.value}>{state.attributes[k].toFixed(1)}</Text>
            </View>
            <ProgressBar progress={state.attributes[k] / 10} />
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.label}>Reputation</Text>
          <Text style={styles.value}>{Math.floor(state.reputation)}</Text>
        </View>
      </Panel>
      <Text style={styles.note}>Attributes grow through what you do: administering businesses, negotiating at markets and studying history.</Text>

      <SectionHeader title="Origins" />
      <Panel>
        <Fact label="Civilisation" value={civ.name} />
        <Fact label="Background" value={bg.name} />
        <Fact label="Home" value={getSettlement(state.player.startSettlementId).name} />
        <Fact label="Difficulty" value={diff.name} />
        <Fact label="Time played" value={getGameDate(state).label} />
      </Panel>

      <View style={{ marginTop: spacing.md }}>
        <GameButton variant="secondary" label="Settings" onPress={() => router.push('/settings')} />
      </View>
    </GameScreen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { flexShrink: 1, textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chTitle: { color: colors.gold, fontFamily: fonts.serif, fontSize: 17, fontWeight: '700' },
  chBlurb: { color: colors.parchmentDim, fontFamily: fonts.serif, fontSize: 13, fontStyle: 'italic', marginBottom: 6 },
  deed: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 14, lineHeight: 20, marginTop: 6 },
  attr: { paddingVertical: 4, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: spacing.md },
  label: { fontFamily: fonts.sans, fontSize: 15, color: colors.parchmentDim },
  value: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchment },
  note: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.bronze, marginTop: spacing.sm },
});
