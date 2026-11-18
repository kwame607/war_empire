import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, MAX_CONTENT_WIDTH, spacing } from '@/theme';

type Props = { title: string; subtitle?: string; onBack?: () => void; footer?: ReactNode; children: ReactNode };

/** Full-screen frame for screens outside the game (create, settings, starting world). No resource bar. */
export function PlainScreen({ title, subtitle, onBack, footer, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          {onBack !== undefined || router.canGoBack() ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={onBack ?? (() => router.back())} style={styles.back}>
              <Ionicons name="chevron-back" size={30} color={colors.gold} />
            </Pressable>
          ) : null}
          <View style={styles.flex}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  back: { marginLeft: -8 },
  title: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '800', color: colors.parchment, letterSpacing: 1 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.parchmentDim, marginTop: 2 },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.charcoal },
});
