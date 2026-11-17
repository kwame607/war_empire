import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResourceBar } from '@/components/ui/ResourceBar';
import { colors, fonts, spacing } from '@/theme';

type Props = { title: string; subtitle?: string; showBack?: boolean; children: ReactNode };

/**
 * Standard frame for every in-game screen:
 * resource bar on top, then a title row with a Profile shortcut (or a Back button),
 * then scrolling content.
 */
export function GameScreen({ title, subtitle, showBack, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ResourceBar />
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
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  icon: { marginLeft: -8 },
  titles: { flex: 1 },
  title: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '800', color: colors.parchment, letterSpacing: 1 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.parchmentDim, marginTop: 2 },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
});
