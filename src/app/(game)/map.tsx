import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SettlementPanel } from '@/components/map/SettlementPanel';
import { DiplomacyPanel } from '@/components/map/DiplomacyPanel';
import { WorldMap } from '@/components/map/WorldMap';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CONTINENTS, getSettlement, SETTLEMENTS } from '@/data/world';
import { sumUnits } from '@/game/selectors';
import { garrisonNeeded, holdingYield } from '@/game/territoryCore';
import { useGame, useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function MapScreen() {
  const state = useGameState();
  const [tab, setTab] = useState<'map' | 'diplomacy'>('map');
  const { scout } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const shownId = selected ?? state.player.startSettlementId;
  const explored = new Set(state.explored);

  return (
    <GameScreen title="World Map" subtitle={`${explored.size} of ${SETTLEMENTS.length} settlements explored`}>
      <SegmentedControl
        options={[
          { value: 'map', label: 'Map' },
          { value: 'diplomacy', label: `Diplomacy${state.world.offers.length ? ` (${state.world.offers.length})` : ''}` },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'diplomacy' ? <DiplomacyPanel state={state} /> : null}
      {tab === 'map' ? (
        <>
      <WorldMap state={state} selectedId={shownId} onSelect={setSelected} />
      <View style={styles.legend}>
        <Text style={styles.legendText}>● Explored   ◌ Unexplored (fog)   ◎ Home</Text>
      </View>
      <SettlementPanel state={state} settlementId={shownId} onScout={scout} />

      {state.territories.length > 0 ? (
        <>
          <SectionHeader title="Your provinces" />
          <Panel>
            {state.territories.map((id) => {
              const st = getSettlement(id);
              const y = holdingYield(id);
              return (
                <View key={id} style={styles.cont}>
                  <Text style={styles.contName}>{st.name}</Text>
                  <Text style={styles.contBlurb}>
                    {y.gold >= 0 ? '+' : ''}{y.gold} gold{y.food ? `, +${y.food} food` : ''}{y.wood ? `, +${y.wood} wood` : ''}{y.stone ? `, +${y.stone} stone` : ''} per hour
                  </Text>
                </View>
              );
            })}
            <Text style={styles.contBlurb}>
              Garrison needed: {garrisonNeeded(state)} soldiers. You have {sumUnits(state.army.units)}. Thin garrisons invite revolt.
            </Text>
          </Panel>
        </>
      ) : null}

      <SectionHeader title="Continents" />
      <Panel>
        {CONTINENTS.map((c) => {
          const total = SETTLEMENTS.filter((s) => s.continentId === c.id).length;
          const known = SETTLEMENTS.filter((s) => s.continentId === c.id && explored.has(s.id)).length;
          return (
            <View key={c.id} style={styles.cont}>
              <View style={styles.contTop}>
                <Text style={styles.contName}>{c.name}</Text>
                <Text style={styles.contCount}>
                  {known} / {total}
                </Text>
              </View>
              <Text style={styles.contBlurb}>{c.blurb}</Text>
            </View>
          );
        })}
      </Panel>
        </>
      ) : null}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  legend: { alignItems: 'center' },
  legendText: { fontFamily: fonts.sans, fontSize: 12, color: colors.parchmentDim, letterSpacing: 0.5 },
  cont: { paddingVertical: spacing.sm },
  contTop: { flexDirection: 'row', justifyContent: 'space-between' },
  contName: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700', color: colors.parchment },
  contCount: { fontFamily: fonts.sans, fontSize: 14, color: colors.goldBright },
  contBlurb: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 2 },
});
