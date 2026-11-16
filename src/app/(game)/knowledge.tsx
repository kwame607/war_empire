import { StyleSheet, Text } from 'react-native';

import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts } from '@/theme';

const STAGES = ['Discovery', 'Understanding', 'Practical Experience', 'Mastery'];

export default function KnowledgeScreen() {
  return (
    <GameScreen title="Knowledge" subtitle="Learn from the history of war">
      <LockedNotice
        title="Historical library"
        description="Study real strategies such as Hannibal's double envelopment at Cannae: where they began, how they worked, their weaknesses and how to counter them."
        arrivesIn="Phase 7"
      />
      <SectionHeader title="Four stages of learning" />
      <Panel>
        {STAGES.map((s, i) => (
          <Text key={s} style={styles.stage}>
            {i + 1}. {s}
          </Text>
        ))}
      </Panel>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  stage: { fontFamily: fonts.serif, fontSize: 17, color: colors.parchment, paddingVertical: 6 },
});
