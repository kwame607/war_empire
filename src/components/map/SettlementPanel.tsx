import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { continentName, getSettlement } from '@/data/world';
import { SCOUT_COST_GOLD, SCOUT_SECONDS } from '@/game/constants';
import { formatDuration } from '@/game/selectors';
import type { ActionResult, GameState } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';

type Props = {
  state: GameState;
  settlementId: string;
  onScout: (settlementId: string) => ActionResult;
};

export function SettlementPanel({ state, settlementId, onScout }: Props) {
  const s = getSettlement(settlementId);
  const explored = state.explored.includes(s.id);
  const isHome = s.id === state.player.startSettlementId;
  const scoutingThis = state.scouting?.settlementId === s.id;
  const scoutingOther = !!state.scouting && !scoutingThis;

  if (explored) {
    return (
      <Panel>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{s.name}</Text>
          {isHome ? <Chip label="Your home" /> : null}
        </View>
        <Text style={styles.meta}>
          {s.kind[0].toUpperCase() + s.kind.slice(1)} · {continentName(s.continentId)}
        </Text>
        <Text style={styles.body}>{s.description}</Text>
        <Text style={styles.meta}>
          Population {s.population} · Terrain: {s.terrain}
        </Text>
        <View style={styles.chips}>
          {s.resources.map((r) => (
            <Chip key={r} label={r} tone="muted" />
          ))}
        </View>
      </Panel>
    );
  }

  const remaining = state.scouting && scoutingThis ? (state.scouting.completesAt - state.lastTickAt) / 1000 : 0;

  return (
    <Panel>
      <Text style={styles.name}>Unexplored settlement</Text>
      <Text style={styles.meta}>{continentName(s.continentId)}</Text>
      <Text style={styles.body}>
        Fog hides this place. Send scouts to learn its name, people, terrain and resources.
      </Text>
      {scoutingThis ? (
        <View style={{ gap: 6 }}>
          <ProgressBar progress={1 - remaining / SCOUT_SECONDS} />
          <Text style={styles.meta}>Scouts returning in {formatDuration(remaining)}</Text>
        </View>
      ) : (
        <GameButton
          compact
          muted={scoutingOther || state.resources.gold < SCOUT_COST_GOLD}
          label={`Send scouts · ${SCOUT_COST_GOLD} gold · ${formatDuration(SCOUT_SECONDS)}`}
          onPress={() => {
            const r = onScout(s.id);
            if (!r.ok) Alert.alert('Cannot send scouts', r.reason);
          }}
        />
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '800', color: colors.parchment },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.parchmentDim, marginTop: 2 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchment, marginVertical: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
});
