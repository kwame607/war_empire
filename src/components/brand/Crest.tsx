import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type Props = { size?: number };

/**
 * A simple heraldic crest built from plain Views (no images or extra libraries):
 * two rings, a diamond, and crossed swords.
 */
export function Crest({ size = 150 }: Props) {
  const s = size;
  const sword = (rotate: string) => (
    <View style={[styles.swordWrap, { width: s * 0.86, height: s * 0.86, transform: [{ rotate }] }]}>
      <View style={[styles.blade, { height: s * 0.74, width: s * 0.045 }]} />
      <View style={[styles.guard, { width: s * 0.2, height: s * 0.04, top: s * 0.5 }]} />
    </View>
  );

  return (
    <View style={[styles.center, { width: s, height: s }]}>
      <View style={[styles.ring, { width: s, height: s, borderRadius: s / 2, borderWidth: 3, borderColor: colors.gold }]} />
      <View
        style={[
          styles.ring,
          { width: s * 0.9, height: s * 0.9, borderRadius: (s * 0.9) / 2, borderWidth: 1, borderColor: colors.bronze },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: s * 0.6,
            height: s * 0.6,
            backgroundColor: colors.burgundy,
            borderWidth: 2,
            borderColor: colors.gold,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      {sword('45deg')}
      {sword('-45deg')}
      <View style={[styles.gem, { width: s * 0.12, height: s * 0.12, borderRadius: s * 0.06 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  swordWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  blade: { backgroundColor: colors.parchment, borderRadius: 2 },
  guard: { position: 'absolute', backgroundColor: colors.gold, borderRadius: 2 },
  gem: { position: 'absolute', backgroundColor: colors.goldBright, borderWidth: 2, borderColor: colors.charcoal },
});
