import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { PlainScreen } from '@/components/ui/PlainScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { OFFLINE_CAP_SECONDS } from '@/game/constants';
import { formatDuration } from '@/game/selectors';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function SettingsScreen() {
  const { state, hasSave, saveError, saveNow, removeSave, advanceTime, testBoost } = useGame();

  const confirmDelete = () =>
    Alert.alert('Delete saved game?', 'This permanently erases your progress. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeSave();
          router.replace('/');
        },
      },
    ]);

  return (
    <PlainScreen title="Settings">
      <SectionHeader title="Saving" />
      <Panel>
        <Text style={styles.body}>
          Your game is saved on this phone automatically every 15 seconds, after every action, and whenever you leave the app.
        </Text>
        {saveError ? <Text style={styles.error}>Last save failed: {saveError}</Text> : null}
        {state ? (
          <View style={styles.gap}>
            <GameButton
              compact
              variant="secondary"
              label="Save now"
              onPress={async () => {
                await saveNow();
                Alert.alert('Saved', 'Your game has been saved.');
              }}
            />
          </View>
        ) : null}
      </Panel>

      <SectionHeader title="Offline progression" />
      <Panel>
        <Text style={styles.body}>
          While you are away, businesses keep earning for up to {formatDuration(OFFLINE_CAP_SECONDS)}. Construction, study and scouting always
          finish on time. You will get a summary when you return.
        </Text>
      </Panel>

      {state ? (
        <>
          <SectionHeader title="Testing tools" />
          <Panel>
            <Text style={styles.body}>
              For testing only: pretend time has passed so you can see timers finish and income arrive without waiting.
            </Text>
            <View style={[styles.row, styles.gap]}>
              <View style={styles.flex}>
                <GameButton compact variant="secondary" label="+1 hour" onPress={() => advanceTime(3600)} />
              </View>
              <View style={styles.flex}>
                <GameButton compact variant="secondary" label="+8 hours" onPress={() => advanceTime(8 * 3600)} />
              </View>
            </View>
            <View style={styles.gap}>
              <GameButton
                compact
                variant="secondary"
                label="+1500 gold, +20 reputation"
                onPress={() => {
                  testBoost();
                  Alert.alert('Boost applied', 'Gold, materials and reputation added so you can try institutions and battles quickly.');
                }}
              />
            </View>
          </Panel>
        </>
      ) : null}

      <SectionHeader title="Danger zone" />
      <GameButton label="Delete saved game" variant="danger" muted={!hasSave} onPress={() => (hasSave ? confirmDelete() : Alert.alert('Nothing to delete', 'There is no saved game.'))} />

      <Text style={styles.footer}>WAR EMPIRE · Version 0.14 (Illustrated)</Text>
    </PlainScreen>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchment },
  error: { fontFamily: fonts.sans, fontSize: 14, color: '#E58A8A', marginTop: spacing.sm },
  gap: { marginTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  footer: { fontFamily: fonts.sans, fontSize: 12, color: colors.bronze, textAlign: 'center', marginTop: spacing.lg, letterSpacing: 1 },
});
