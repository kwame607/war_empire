import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { getEventDef } from '@/data/events';
import { eventCanChoose } from '@/game/events';
import type { GameState } from '@/game/types';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

/** A random happening that waits for the ruler's decision. */
export function EventCard({ state }: { state: GameState }) {
  const { decide } = useGame();
  const [result, setResult] = useState<string | null>(null);
  const def = state.event ? getEventDef(state.event.id) : undefined;

  if (!def) {
    if (!result) return null;
    return (
      <Panel tone="parchment">
        <Text style={styles.kicker}>Your decision</Text>
        <Text style={styles.story}>{result}</Text>
        <View style={{ marginTop: spacing.sm }}>
          <GameButton compact variant="secondary" label="Dismiss" onPress={() => setResult(null)} />
        </View>
      </Panel>
    );
  }

  return (
    <Panel tone="burgundy">
      <Text style={styles.kicker}>A matter for the ruler</Text>
      <Text style={styles.title}>{def.title}</Text>
      <Text style={styles.story}>{def.story}</Text>
      {def.choices.map((c, i) => (
        <View key={c.label} style={styles.choice}>
          <Text style={styles.hint}>{c.hint}</Text>
          <GameButton
            compact
            variant={i === 0 ? 'primary' : 'secondary'}
            label={c.label}
            muted={!eventCanChoose(state, i)}
            onPress={() => {
              const r = decide(i);
              if (r.ok && r.outcome) setResult(r.outcome);
            }}
          />
        </View>
      ))}
    </Panel>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.bronze, fontFamily: fonts.serif, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', marginVertical: 4 },
  story: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 15, lineHeight: 22 },
  choice: { marginTop: spacing.md, gap: 4 },
  hint: { color: colors.bronze, fontFamily: fonts.serif, fontSize: 13 },
});
