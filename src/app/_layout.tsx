import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { OfflineModal } from '@/components/ui/OfflineModal';
import { GameProvider } from '@/store/GameProvider';
import { colors } from '@/theme';

/**
 * Root layout: wraps every screen in the game.
 * GameProvider holds the live game state and handles saving; OfflineModal shows the
 * "welcome back" report on top of whichever screen is open.
 */
export default function RootLayout() {
  return (
    <GameProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.navy } }} />
      <OfflineModal />
    </GameProvider>
  );
}
