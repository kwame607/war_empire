import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, fonts } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'overview', title: 'Overview', icon: 'home-outline' },
  { name: 'economy', title: 'Economy', icon: 'cash-outline' },
  { name: 'knowledge', title: 'Knowledge', icon: 'library-outline' },
  { name: 'military', title: 'Military', icon: 'shield-outline' },
  { name: 'map', title: 'Map', icon: 'map-outline' },
];

/**
 * Bottom tab bar for the main game.
 * Businesses live inside the Economy tab (Phase 5) and Profile opens from the
 * person icon in each screen header, so the bar stays at 5 comfortable thumb targets.
 */
export default function GameLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldBright,
        tabBarInactiveTintColor: colors.parchmentDim,
        tabBarStyle: { backgroundColor: colors.charcoal, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 0.5 },
        sceneStyle: { backgroundColor: colors.navy },
      }}>
      {TABS.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, size }) => (
              <Ionicons name={icon} size={size} color={focused ? colors.goldBright : colors.parchmentDim} />
            ),
          }}
        />
      ))}
      {/* Reachable from the header icon, but not shown in the tab bar */}
      <Tabs.Screen name="profile" options={{ href: null, title: 'Profile' }} />
    </Tabs>
  );
}
