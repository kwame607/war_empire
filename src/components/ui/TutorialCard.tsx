import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Portrait } from '@/components/art/Portrait';
import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { tutorialProgress } from '@/game/tutorial';
import type { GameState } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';

let skippedThisSession = false;

/** The adviser's guided first steps. Disappears once every step is done. */
export function TutorialCard({ state }: { state: GameState }) {
  const [skipped, setSkipped] = useState(skippedThisSession);
  const { done, total, current } = tutorialProgress(state);
  if (!current || skipped) return null;
  return (
    <Panel>
      <View style={styles.row}>
        <Portrait civId={state.player.civId} name="Royal Adviser" size={64} />
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            Your adviser · step {done + 1} of {total}
          </Text>
          <Text style={styles.title}>{current.title}</Text>
        </View>
      </View>
      <Text style={styles.body}>{current.text}</Text>
      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar progress={done / total} color={colors.gold} />
      </View>
      <View style={styles.actions}>
        <GameButton compact label="Show me" onPress={() => router.push(current.href)} />
        <GameButton
          compact
          variant="secondary"
          label="Skip guide"
          onPress={() => {
            skippedThisSession = true;
            setSkipped(true);
          }}
        />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  kicker: { color: colors.bronze, fontFamily: fonts.serif, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 19, fontWeight: '700' },
  body: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
