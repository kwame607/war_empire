import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getKnowledgeEntry } from '@/data/knowledge';
import { getOrder } from '@/data/orders';
import { getScenario, scenariosFor } from '@/data/scenarios';
import { SIM_COST_GOLD } from '@/game/constants';
import { availableTactics } from '@/game/navalCore';
import { masteryProgress, practisableOrders } from '@/game/masteryCore';
import { institutionLevel, sumUnits } from '@/game/selectors';
import type { GameState, NavalTactic, OrderId } from '@/game/types';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export function WarRoomTab({ state }: { state: GameState }) {
  const { runSimulation, runNavalSimulation } = useGame();
  const orders = practisableOrders(state);
  const navalOptions = availableTactics(state).filter((t) => t.doctrine);
  const [foe, setFoe] = useState(state.world.rivals[0]?.id ?? '');
  const [navalPick, setNavalPick] = useState<NavalTactic | null>(null);
  const open = scenariosFor(state.war).filter((s) => state.reputation >= s.requiresReputation);
  const [scenario, setScenario] = useState(open[0]?.id ?? scenariosFor(state.war)[0].id);
  const [order, setOrder] = useState<OrderId>(orders[0] ?? 'envelop');

  if (institutionLevel(state, 'academy') < 1) {
    return <LockedNotice title="No war room" description="A Military Academy gives you a war room, where you can rehearse doctrines with your army at no risk." arrivesIn="the Military Academy" />;
  }
  if (orders.length === 0 && navalOptions.length === 0) {
    return <LockedNotice title="Nothing to rehearse" description="Study a historical record to Understanding (Knowledge tab) and its doctrine becomes available here." arrivesIn="a studied doctrine" />;
  }
  const chosen = orders.includes(order) ? order : orders[0];
  const sim = state.simulation;
  const navalChosen = navalOptions.find((t) => t.id === navalPick) ?? navalOptions[0];
  const practice = state.fleet.practice;

  return (
    <>
      {orders.length > 0 ? (
        <>
      <Text style={styles.meta}>
        Rehearse a doctrine on the sand table with your current army. No soldiers are lost. Successes on different ground, together with real battles, lead to Mastery of that doctrine.
      </Text>
      <SectionHeader title="Doctrine" />
      <SegmentedControl options={orders.map((o) => ({ value: o, label: getOrder(o).name.split(' ')[0] }))} value={chosen} onChange={setOrder} />
      <Text style={styles.meta}>{getOrder(chosen).needs}</Text>
      <SectionHeader title="Against" />
      <SegmentedControl options={open.map((s) => ({ value: s.id, label: s.enemy.name.split(' ').slice(-1)[0] }))} value={scenario} onChange={setScenario} />
      <Text style={styles.meta}>
        {getScenario(scenario).terrain} ground, {getScenario(scenario).weather}.
      </Text>
      <GameButton
        label={`Run simulation · ${SIM_COST_GOLD}g`}
        muted={sumUnits(state.army.units) <= 0}
        onPress={() => {
          const r = runSimulation(scenario, chosen);
          if (!r.ok) Alert.alert('Cannot simulate', r.reason);
        }}
      />

      {sim ? (
        <>
          <SectionHeader title="Last exercise" />
          <Panel tone={sim.success ? 'dark' : 'burgundy'}>
            <Chip tone={sim.success ? 'gold' : 'burgundy'} label={sim.success ? 'Doctrine worked' : 'Doctrine did not work'} />
            {sim.lines.map((l) => (
              <Text key={l} style={styles.line}>
                {l}
              </Text>
            ))}
            <Text style={styles.lesson}>{sim.lesson}</Text>
          </Panel>
        </>
      ) : null}

        </>
      ) : null}

      {navalChosen ? (
        <>
          <SectionHeader title="Naval exercise" />
          <Text style={styles.meta}>Rehearse a naval doctrine against the fleet of a rival kingdom. No ships are lost. Needs at least 2 warships.</Text>
          <SegmentedControl options={navalOptions.map((t) => ({ value: t.id, label: t.name.split(' ')[0] }))} value={navalChosen.id} onChange={setNavalPick} />
          <SegmentedControl options={state.world.rivals.map((r) => ({ value: r.id, label: r.name.split(' ').slice(-1)[0] }))} value={foe} onChange={setFoe} />
          <Text style={styles.meta}>{navalChosen.text}</Text>
          <GameButton
            label={`Run naval exercise · ${SIM_COST_GOLD}g`}
            muted={state.fleet.ships < 2}
            onPress={() => {
              const r = runNavalSimulation(foe, navalChosen.id);
              if (!r.ok) Alert.alert('Cannot simulate', r.reason);
            }}
          />
          {practice ? (
            <Panel tone={practice.success ? 'dark' : 'burgundy'}>
              <Chip tone={practice.success ? 'gold' : 'burgundy'} label={practice.success ? 'Doctrine worked' : 'Doctrine did not work'} />
              {practice.report.lines.map((l) => (
                <Text key={l} style={styles.line}>
                  {l}
                </Text>
              ))}
            </Panel>
          ) : null}
        </>
      ) : null}

      <SectionHeader title="Mastery progress" />
      {[...orders.map((o) => getOrder(o).doctrine!), ...navalOptions.map((t) => t.doctrine!)].map((d) => {
        const stage = state.knowledge[d] ?? 0;
        const p = masteryProgress(state, d);
        return (
          <Panel key={d}>
            <Text style={styles.title}>{getKnowledgeEntry(d)?.title ?? d}</Text>
            {stage >= 4 ? (
              <Chip label="Mastered" />
            ) : stage < 3 ? (
              <Text style={styles.meta}>Needs Practical Experience: use it successfully in a real battle first.</Text>
            ) : (
              p.parts.map((x) => (
                <Text key={x.label} style={styles.meta}>
                  {x.have >= x.need ? '✓' : '○'} {x.label}: {Math.min(x.have, x.need)} / {x.need}
                </Text>
              ))
            )}
          </Panel>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '800', color: colors.parchment },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  line: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchment, marginTop: 4 },
  lesson: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.goldBright, marginTop: spacing.sm },
});
