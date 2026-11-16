import { StyleSheet, Text, View } from 'react-native';

import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { previewPlayer } from '@/data/previewState';
import { colors, fonts, spacing } from '@/theme';

export default function EconomyScreen() {
  const { gold } = previewPlayer.resources;
  return (
    <GameScreen title="Economy" subtitle="Acquire · Earn · Upgrade · Unlock · Expand">
      <Panel>
        <Row label="Treasury" value={`${gold} gold`} />
        <Row label="Income per hour" value="0" />
        <Row label="Expenses per hour" value="0" />
      </Panel>

      <SectionHeader title="Businesses" />
      <LockedNotice
        title="Businesses and upgrades"
        description="Buy farms and workshops, watch them earn, and upgrade them. Construction timers and operating costs appear here."
        arrivesIn="Phase 5"
      />
    </GameScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { fontFamily: fonts.sans, fontSize: 16, color: colors.parchmentDim },
  value: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchment },
});
