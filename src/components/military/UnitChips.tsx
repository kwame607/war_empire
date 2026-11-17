import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { getUnitType, UNIT_IDS } from '@/data/units';
import type { UnitCounts } from '@/game/types';
import { colors, fonts } from '@/theme';

/** One chip per unit type that is present. */
export function UnitChips({ units, empty = 'No soldiers' }: { units: UnitCounts; empty?: string }) {
  const present = UNIT_IDS.filter((id) => units[id] > 0);
  if (present.length === 0) return <Text style={styles.empty}>{empty}</Text>;
  return (
    <View style={styles.row}>
      {present.map((id) => (
        <Chip key={id} label={`${units[id]} ${getUnitType(id).name}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empty: { fontFamily: fonts.sans, fontSize: 14, color: colors.parchmentDim },
});
