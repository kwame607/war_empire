import { StyleSheet, Text, View } from 'react-native';

import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { campaignFor } from '@/data/campaigns';
import { currentAct } from '@/game/campaign';
import type { GameState } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';

/** The civilisation's story arc: the current act, its goal, and a finale line once complete. */
export function CampaignCard({ state }: { state: GameState }) {
  const c = campaignFor(state.player.civId);
  if (!c) return null;
  const cur = currentAct(state);
  if (!cur) {
    return (
      <Panel>
        <Text style={styles.kicker}>{c.title} · complete</Text>
        <Text style={styles.story}>Your story is told, and chroniclers will copy it for centuries. The world is still yours to shape.</Text>
      </Panel>
    );
  }
  return (
    <Panel>
      <Text style={styles.kicker}>
        {c.title} · Act {cur.index + 1} of {cur.total}
      </Text>
      <Text style={styles.title}>{cur.act.title}</Text>
      <Text style={styles.story}>{cur.act.story}</Text>
      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar progress={cur.index / cur.total} />
      </View>
      <Text style={styles.goal}>
        Goal: {cur.act.goalText} Reward: {cur.act.reward.gold} gold, {cur.act.reward.rep} reputation.
      </Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.bronze, fontFamily: fonts.serif, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', marginVertical: 4 },
  story: { color: colors.parchment, fontFamily: fonts.serif, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  goal: { color: colors.goldBright, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
});
