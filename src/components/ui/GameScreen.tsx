import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BANNERS, type BannerKey } from '@/data/bannerArt';
import { ResourceBar } from '@/components/ui/ResourceBar';
import { colors, fonts, MAX_CONTENT_WIDTH, spacing } from '@/theme';

type Props = { title: string; subtitle?: string; showBack?: boolean; banner?: BannerKey; children: ReactNode };

/**
 * Standard frame for every in-game screen:
 * resource bar on top, then a title row with a Profile shortcut (or a Back button),
 * then scrolling content.
 */
export function GameScreen({ title, subtitle, showBack, banner, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ResourceBar />
      {banner ? (
        <View style={styles.banner}>
          <Image source={BANNERS[banner]} accessibilityIgnoresInvertColors style={StyleSheet.absoluteFill} resizeMode="cover" />
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
            <Defs>
              <LinearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0.3" stopColor="#0B1220" stopOpacity="0" />
                <Stop offset="1" stopColor="#0B1220" stopOpacity="0.95" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#bf)" />
          </Svg>
          <View style={styles.bannerText} pointerEvents="none">
            <Text style={styles.bannerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.bannerSub}>{subtitle}</Text> : null}
          </View>
          {showBack ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.bannerBtn}>
              <Ionicons name="chevron-back" size={26} color={colors.goldBright} />
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Open profile" hitSlop={10} onPress={() => router.push('/profile')} style={styles.bannerBtn}>
              <Ionicons name="person" size={20} color={colors.goldBright} />
            </Pressable>
          )}
          <View style={styles.bannerEdge} pointerEvents="none" />
        </View>
      ) : (
      <View style={styles.header}>
        {showBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.icon}>
            <Ionicons name="chevron-back" size={30} color={colors.gold} />
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {!showBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile" hitSlop={10} onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={34} color={colors.gold} />
          </Pressable>
        ) : null}
      </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', aspectRatio: 1024 / 318, maxHeight: 190, backgroundColor: '#1f2a3a', borderBottomWidth: 2, borderBottomColor: colors.gold },
  bannerEdge: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: 'rgba(0,0,0,0.5)' },
  bannerText: { position: 'absolute', left: spacing.md, right: 70, bottom: 10 },
  bannerTitle: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '800', color: '#F3E7C8', letterSpacing: 1.5, textShadowColor: '#000', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  bannerSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.goldBright, marginTop: 1, textShadowColor: '#000', textShadowRadius: 5 },
  bannerBtn: { position: 'absolute', top: 10, right: 12, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,18,32,0.7)', borderWidth: 1.5, borderColor: colors.gold },
  safe: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  icon: { marginLeft: -8 },
  titles: { flex: 1 },
  title: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '800', color: colors.parchment, letterSpacing: 1 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.parchmentDim, marginTop: 2 },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
