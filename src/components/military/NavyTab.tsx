import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { FLEET_DETERS_RAIDS_AT, SHIP_COST, SHIP_UPKEEP_GOLD } from '@/game/constants';
import { pendingShips, shipSeconds } from '@/game/naval';
import { enemyFleetSize, habitOf, NAVAL_TACTICS, needsSeaControl } from '@/game/navalCore';
import { fleetCapacity, formatDuration, shipyardLevel } from '@/game/selectors';
import type { GameState, NavalTactic } from '@/game/types';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export function NavyTab({ state }: { state: GameState }) {
  const { buildShips, fightNaval } = useGame();
  const [plan, setPlan] = useState<NavalTactic[]>(['line', 'board', 'screen']);

  if (shipyardLevel(state) < 1) {
    return (
      <LockedNotice
        title="No shipyard"
        description="Build a Shipyard (Economy → Institutions, needs a Barracks) to launch warships. A fleet deters raiders and opens the sea lanes to island kingdoms."
        arrivesIn="the Shipyard"
      />
    );
  }

  const cap = fleetCapacity(state);
  const total = state.fleet.ships + pendingShips(state);
  const war = state.war;
  const rival = war ? state.world.rivals.find((r) => r.id === war.rivalId) : undefined;
  const seaWar = !!(war && rival && needsSeaControl(rival));
  const last = state.fleet.lastEngagement;

  return (
    <>
      <Panel>
        <Text style={styles.title}>
          Fleet: {state.fleet.ships} warship{state.fleet.ships === 1 ? '' : 's'} (capacity {cap})
        </Text>
        <Text style={styles.meta}>
          Each ship costs {SHIP_COST.gold} gold and {SHIP_COST.wood} wood, {formatDuration(shipSeconds(state))} to build, and {SHIP_UPKEEP_GOLD} gold per hour to maintain.
          {state.fleet.ships >= FLEET_DETERS_RAIDS_AT ? ' Your fleet halves the raids on your coasts.' : ` ${FLEET_DETERS_RAIDS_AT} ships or more deter raiders.`}
        </Text>
        {state.fleet.training.length > 0 ? (
          <Text style={styles.meta}>
            In the slipways: {pendingShips(state)} ({formatDuration(Math.max(0, (state.fleet.training[state.fleet.training.length - 1].completesAt - state.lastTickAt) / 1000))} left)
          </Text>
        ) : null}
        <View style={styles.row}>
          {[1, 3].map((n) => (
            <View key={n} style={{ flex: 1 }}>
              <GameButton
                compact
                muted={total + n > cap}
                label={`Build ${n}`}
                onPress={() => {
                  const r = buildShips(n);
                  if (!r.ok) Alert.alert('Cannot build', r.reason);
                }}
              />
            </View>
          ))}
        </View>
      </Panel>

      {seaWar && war && rival ? (
        <>
          <SectionHeader title="Command of the sea" />
          <Panel tone="burgundy">
            <Text style={styles.title}>{rival.name} lies across the sea</Text>
            {war.seaControl ? (
              <Chip label="The sea is yours" />
            ) : (
              <>
                <Text style={styles.meta}>
                  Their fleet is rumoured to be about {Math.max(2, enemyFleetSize(rival) - 2)} to {enemyFleetSize(rival) + 2} ships.{' '}
                  {rival.traitKnown ? `They tend to fight by ${habitOf(rival) === 'line' ? 'the line of battle' : habitOf(rival) === 'board' ? 'boarding' : 'fast screens'}.` : 'Their naval habits are unknown. Send an envoy to learn their character.'}
                </Text>
                <Text style={styles.meta}>Choose a tactic for each of three rounds. Line beats boarding, boarding beats screens, screens beat the line.</Text>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{ marginTop: spacing.sm }}>
                    <Text style={styles.meta}>Round {i + 1}</Text>
                    <SegmentedControl
                      options={NAVAL_TACTICS.map((t) => ({ value: t.id, label: t.id === 'line' ? 'Line' : t.id === 'board' ? 'Board' : 'Screen' }))}
                      value={plan[i]}
                      onChange={(v) => setPlan((p) => p.map((x, j) => (j === i ? v : x)))}
                    />
                  </View>
                ))}
                <View style={{ marginTop: spacing.md }}>
                  <GameButton
                    compact
                    label="Engage their fleet"
                    onPress={() => {
                      const r = fightNaval(plan);
                      if (!r.ok) Alert.alert('Cannot engage', r.reason);
                    }}
                  />
                </View>
              </>
            )}
          </Panel>
        </>
      ) : null}

      {last ? (
        <>
          <SectionHeader title="Last engagement" />
          <Panel>
            <Chip tone={last.won ? 'gold' : 'burgundy'} label={`${last.won ? 'Victory' : 'Defeat'} against ${last.rivalName}`} />
            <Text style={styles.meta}>
              Ships lost {last.shipsLost} of {last.shipsBefore} · Enemy lost {last.enemyLost} of {last.enemyBefore}
            </Text>
            {last.lines.map((l) => (
              <Text key={l} style={styles.line}>
                {l}
              </Text>
            ))}
          </Panel>
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '800', color: colors.parchment },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  line: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchment, marginTop: 4 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
