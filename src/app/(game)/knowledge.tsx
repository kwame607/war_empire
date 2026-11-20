import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuizCard } from '@/components/ui/QuizCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { KNOWLEDGE_ENTRIES, KNOWLEDGE_STAGE_NAMES } from '@/data/knowledge';
import { formatDuration } from '@/game/selectors';
import { useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function KnowledgeScreen() {
  const state = useGameState();
  const now = state.lastTickAt;

  return (
    <GameScreen title="Knowledge" subtitle="Learn from the history of war">
      {state.study ? (
        <Panel tone="burgundy">
          <Text style={styles.studyTitle}>Scholars at work</Text>
          <Text style={styles.body}>{KNOWLEDGE_ENTRIES.find((e) => e.id === state.study!.entryId)?.title}</Text>
          <View style={{ marginTop: spacing.sm }}>
            <ProgressBar
              progress={
                1 -
                (state.study.completesAt - now) / 1000 / (state.study.totalSeconds ?? KNOWLEDGE_ENTRIES.find((e) => e.id === state.study!.entryId)?.studySeconds ?? 60)
              }
            />
          </View>
          <Text style={styles.meta}>{formatDuration((state.study.completesAt - now) / 1000)} left</Text>
        </Panel>
      ) : null}

      <SectionHeader title="Historical library" />
      {KNOWLEDGE_ENTRIES.map((entry) => {
        const stage = state.knowledge[entry.id] ?? 0;
        return (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/record/[id]', params: { id: entry.id } })}>
            <Panel>
              <View style={styles.top}>
                <Text style={styles.title}>{entry.title}</Text>
              </View>
              <Text style={styles.era}>{entry.era}</Text>
              <Text style={styles.body}>{entry.summary}</Text>
              <View style={{ marginTop: spacing.sm }}>
                <Chip label={stage === 0 ? 'Not yet examined' : KNOWLEDGE_STAGE_NAMES[stage]} tone={stage === 0 ? 'muted' : 'gold'} />
              </View>
            </Panel>
          </Pressable>
        );
      })}
      <SectionHeader title="Test your knowledge" />
      <QuizCard state={state} />

      <Text style={styles.meta}>More records from every era and continent will be added over time.</Text>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 19, fontWeight: '800', color: colors.parchment },
  era: { fontFamily: fonts.sans, fontSize: 13, color: colors.goldBright, marginTop: 2, marginBottom: 6 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchmentDim },
  studyTitle: { fontFamily: fonts.serif, fontSize: 13, letterSpacing: 2, color: colors.goldBright, textTransform: 'uppercase', marginBottom: 4 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.bronze, marginTop: spacing.sm },
});
