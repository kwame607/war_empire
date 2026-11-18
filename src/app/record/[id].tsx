import { masteryProgress } from '@/game/masteryCore';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getKnowledgeEntry, KNOWLEDGE_STAGE_NAMES } from '@/data/knowledge';
import { studyCost } from '@/game/engine';
import { formatDuration, studyTimeMult } from '@/game/selectors';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

const DOCTRINE_ORDER: Record<string, string> = {
  cannae: 'Double envelopment',
  'buffalo-horns': 'Horns of the buffalo',
  'feigned-retreat': 'Feigned retreat',
  'russia-1812': 'Strategic withdrawal',
};

function MasteryPanel({ doctrine }: { doctrine: string }) {
  const { state, claimMastery } = useGame();
  if (!state) return null;
  const prog = masteryProgress(state, doctrine);
  return (
    <Panel tone="burgundy">
      <Text style={styles.heading}>Path to Mastery</Text>
      <Text style={styles.body}>Mastery is earned by repetition on different ground. Practise in the War room (Military tab) and use it in real battles.</Text>
      {prog.parts.map((p) => (
        <Text key={p.label} style={styles.body}>
          {p.have >= p.need ? '✓' : '○'} {p.label}: {Math.min(p.have, p.need)} / {p.need}
        </Text>
      ))}
      <View style={{ marginTop: spacing.md }}>
        <GameButton
          compact
          muted={!prog.complete}
          label="Claim Mastery"
          onPress={() => {
            const r = claimMastery(doctrine);
            if (!r.ok) Alert.alert('Not yet', r.reason);
          }}
        />
      </View>
    </Panel>
  );
}

export default function RecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, discover, study } = useGame();
  const entry = getKnowledgeEntry(String(id));
  const stage = state && entry ? (state.knowledge[entry.id] ?? 0) : 0;

  // Opening a record for the first time discovers it (free).
  useEffect(() => {
    if (entry && state && stage === 0) discover(entry.id);
  }, [entry, state, stage, discover]);

  if (!state) return <Redirect href="/" />;
  if (!entry) return <Redirect href="/knowledge" />;

  const studyingThis = state.study?.entryId === entry.id;
  const studyingOther = !!state.study && !studyingThis;
  const cost = studyCost(state, entry.id);

  return (
    <GameScreen title={entry.title} subtitle={entry.era} showBack>
      <View style={styles.stages}>
        {KNOWLEDGE_STAGE_NAMES.slice(1).map((name, i) => (
          <Chip key={name} label={name} tone={stage >= i + 1 ? 'gold' : 'muted'} />
        ))}
      </View>

      {entry.sections.map((s) =>
        stage >= s.unlocksAtStage ? (
          <Panel key={s.heading}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </Panel>
        ) : (
          <LockedNotice key={s.heading} title={s.heading} description="Study this record to understand it fully." arrivesIn="Understanding stage" />
        ),
      )}

      {stage < 2 ? (
        <Panel tone="burgundy">
          <Text style={styles.heading}>Study this record</Text>
          {studyingThis && state.study ? (
            <View style={{ gap: 6 }}>
              <ProgressBar progress={1 - (state.study.completesAt - state.lastTickAt) / 1000 / (state.study.totalSeconds ?? entry.studySeconds)} />
              <Text style={styles.body}>Scholars are working: {formatDuration((state.study.completesAt - state.lastTickAt) / 1000)} left</Text>
            </View>
          ) : (
            <>
              <Text style={styles.body}>
                Hire scholars to analyse the sources and move from Discovery to Understanding. This also earns reputation.
              </Text>
              <View style={{ marginTop: spacing.md }}>
                <GameButton
                  compact
                  muted={studyingOther || state.resources.gold < cost}
                  label={`Study · ${cost} gold · ${formatDuration(Math.max(10, Math.round(entry.studySeconds * studyTimeMult(state))))}`}
                  onPress={() => {
                    const r = study(entry.id);
                    if (!r.ok) Alert.alert('Cannot study yet', r.reason);
                  }}
                />
              </View>
            </>
          )}
        </Panel>
      ) : (
        <>
          {stage >= 3 ? (
            <Panel>
              <Text style={styles.heading}>Practical Experience</Text>
              <Text style={styles.body}>
                You have applied this doctrine successfully in battle. Its effects are 15% stronger, and your commanders know what to look for.
              </Text>
            </Panel>
          ) : (
            <LockedNotice
              title="Practical Experience"
              description={
                DOCTRINE_ORDER[entry.id]
                  ? `Use the order "${DOCTRINE_ORDER[entry.id]}" successfully in battle (Military → Operations) to turn understanding into experience.`
                  : 'Apply this doctrine in battle to gain experience.'
              }
              arrivesIn="your first successful use"
            />
          )}
          {stage >= 4 ? (
            <Panel>
              <Text style={styles.heading}>Mastery</Text>
              <Text style={styles.body}>
                You have drilled this doctrine until it is second nature. Its effects are 28% stronger.
              </Text>
            </Panel>
          ) : stage >= 3 ? (
            <MasteryPanel doctrine={entry.id} />
          ) : (
            <LockedNotice title="Mastery" description="Reach Practical Experience first, then prove the doctrine in practice." arrivesIn="Practical Experience" />
          )}
        </>
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  stages: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heading: { fontFamily: fonts.serif, fontSize: 13, letterSpacing: 2, color: colors.gold, textTransform: 'uppercase', marginBottom: 6 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.parchment },
});
