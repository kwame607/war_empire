import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

/**
 * Root layout: wraps every screen in the game.
 * A "Stack" navigator means screens are pushed on top of each other,
 * which is how we will move from title -> character creation -> dashboard.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.navy } }} />
    </>
  );
}
