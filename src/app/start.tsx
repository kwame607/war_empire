import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WorldMap } from '@/components/map/WorldMap';
import { SettlementPanel } from '@/components/map/SettlementPanel';
import { GameButton } from '@/components/ui/GameButton';
import { PlainScreen } from '@/components/ui/PlainScreen';
import { CONTINENTS, continentName, getSettlement } from '@/data/world';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

/** Screen 3: the starting world. Shown once after character creation. */
export default function StartingWorldScreen() {
  const { state, scout } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  if (!state) return <Redirect href="/" />;

  const home = getSettlement(state.player.startSettlementId);
  const shownId = selected ?? home.id;

  return (
    <PlainScreen
      title="The Known World"
      subtitle={`${state.player.name} begins in ${home.name}, ${continentName(home.continentId)}`}
      onBack={() => router.replace('/')}
      footer={<GameButton label="Begin your journey" onPress={() => router.replace('/overview')} />}>
      <Text style={styles.help}>
        Five continents lie before you. You know their shapes, but not their secrets. Tap a marker to inspect it; the gold ring is your home.
      </Text>
      <WorldMap state={state} selectedId={shownId} onSelect={setSelected} />
      <View style={styles.legend}>
        <Text style={styles.legendText}>● Explored   ◌ Unexplored (fog)   ◎ Home</Text>
      </View>
      <SettlementPanel state={state} settlementId={shownId} onScout={scout} />
      <Text style={styles.help}>
        {CONTINENTS.map((c) => c.name).join(' · ')}. You can send scouts to reveal more at any time from the Map tab.
      </Text>
    </PlainScreen>
  );
}

const styles = StyleSheet.create({
  help: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.parchmentDim },
  legend: { alignItems: 'center', paddingVertical: spacing.xs },
  legendText: { fontFamily: fonts.sans, fontSize: 12, color: colors.parchmentDim, letterSpacing: 0.5 },
});
