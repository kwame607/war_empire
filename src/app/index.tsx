import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Crest } from '@/components/brand/Crest';
import { GameButton } from '@/components/ui/GameButton';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function TitleScreen() {
  const { ready, hasSave, continueGame } = useGame();
  const [fade] = useState(() => new Animated.Value(0));
  const [rise] = useState(() => new Animated.Value(24));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  const onStart = () => {
    if (!hasSave) {
      router.push('/create');
      return;
    }
    Alert.alert('Start a new game?', 'Your saved game will be replaced when you finish creating your new character.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: () => router.push('/create') },
    ]);
  };

  const onContinue = () => {
    if (continueGame()) router.push('/overview');
  };

  return (
    <View style={styles.root}>
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
            {ready && hasSave ? <GameButton label="Continue Game" onPress={onContinue} /> : null}
            <GameButton label="Start Game" variant={ready && hasSave ? 'secondary' : 'primary'} onPress={onStart} />
            <GameButton label="Settings" variant="secondary" onPress={() => router.push('/settings')} />
          </View>

          <Text style={styles.footer}>{ready ? 'Version 0.27' : 'Loading…'}</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  safe: { flex: 1 },
  glow: { position: 'absolute', top: -120, alignSelf: 'center', width: 520, height: 520, borderRadius: 260, backgroundColor: colors.navyLight, opacity: 0.8 },
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
  dividerDiamond: { width: 9, height: 9, marginHorizontal: spacing.sm, backgroundColor: colors.gold, transform: [{ rotate: '45deg' }] },
  tagline: { fontFamily: fonts.serif, fontStyle: 'italic', color: colors.parchmentDim, fontSize: 16, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.md },
  buttons: { gap: spacing.md },
  footer: { fontFamily: fonts.sans, color: colors.bronze, fontSize: 12, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' },
});
