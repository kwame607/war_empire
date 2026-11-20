import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { QUIZ } from '@/data/quiz';
import { openQuestions, QUIZ_REWARD } from '@/game/quiz';
import type { GameState } from '@/game/types';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

/** One history question at a time, drawn from records the player has discovered. */
export function QuizCard({ state }: { state: GameState }) {
  const { answer } = useGame();
  const [note, setNote] = useState<{ correct: boolean; text: string } | null>(null);
  const open = openQuestions(state);
  const done = Object.keys(state.quiz).length;
  const q = open[0];

  if (!q) {
    return (
      <Panel>
        <Text style={styles.kicker}>Test yourself · {done}/{QUIZ.length}</Text>
        <Text style={styles.body}>
          {note ? `${note.text}\n\n` : ''}
          {done >= QUIZ.length ? 'You have answered every question. A true scholar of war.' : 'Discover more records to unlock more questions.'}
        </Text>
      </Panel>
    );
  }

  return (
    <Panel>
      <Text style={styles.kicker}>
        Test yourself · {done}/{QUIZ.length}
      </Text>
      <Text style={styles.q}>{q.question}</Text>
      {note ? (
        <Text style={[styles.note, { color: note.correct ? colors.goldBright : colors.parchmentDim }]}>
          {note.correct ? '✔ Correct. ' : '✘ Not quite. '}
          {note.text}
        </Text>
      ) : null}
      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        {q.options.map((o, i) => (
          <GameButton
            key={o}
            compact
            variant="secondary"
            label={o}
            onPress={() => {
              const r = answer(q.id, i);
              if (r.ok) setNote({ correct: !!r.correct, text: r.correct ? `${r.explain ?? ''} (+${QUIZ_REWARD.gold} gold, +${QUIZ_REWARD.rep} reputation)` : 'Read the record again and try once more.' });
            }}
          />
        ))}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.bronze, fontFamily: fonts.serif, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  q: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginTop: 4 },
  body: { color: colors.parchmentDim, fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, marginTop: 4 },
  note: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
});
