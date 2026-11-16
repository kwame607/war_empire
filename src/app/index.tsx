import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Crest } from '@/components/brand/Crest';
import { GameButton } from '@/components/ui/GameButton';
import { colors, fonts, spacing } from '@/theme';

function comingSoon(feature: string, phase: number) {
  Alert.alert(feature, `This arrives in Phase ${phase} of development.`);
}

export default function TitleScreen() {
  const [fade] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(24));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  return (
    <View style={styles.root}>
      {/* Decorative horizon glow: a large soft burgundy disc behind the crest */}
      <View style={styles.glow} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: rise }] }]}>
          <View style={styles.top}>
            <Crest size={150} />
            <Text style={styles.title}>WAR</Text>
            <Text style={[styles.title, styles.titleSecond]}>EMPIRE</Text>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDiamond} />
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.tagline}>The business of becoming a master strategist</Text>
          </View>

          <View style={styles.buttons}>
            <GameButton label="Start Game" onPress={() => router.push('/overview')} />
            <GameButton label="Continue Game" variant="secondary" onPress={() => comingSoon('Continue Game', 6)} />
            <GameButton label="Settings" variant="secondary" onPress={() => comingSoon('Settings', 6)} />
          </View>

          <Text style={styles.footer}>Phase 2 · Navigation preview</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  safe: { flex: 1 },
  glow: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: colors.navyLight,
    opacity: 0.8,
  },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  top: { alignItems: 'center', marginTop: spacing.xl },
  title: {
    fontFamily: fonts.serif,
    color: colors.parchment,
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: 14,
    marginTop: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  titleSecond: { color: colors.gold, marginTop: 0, fontSize: 50 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, width: '70%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerDiamond: {
    width: 9,
    height: 9,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
  },
  tagline: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: colors.parchmentDim,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  buttons: { gap: spacing.md },
  footer: {
    fontFamily: fonts.sans,
    color: colors.bronze,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
