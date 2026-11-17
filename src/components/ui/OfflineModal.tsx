import { Modal, StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { OFFLINE_CAP_SECONDS } from '@/game/constants';
import { formatDuration } from '@/game/selectors';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, radius, spacing } from '@/theme';

/** "Welcome back" report shown when the player returns after being away. */
export function OfflineModal() {
  const { offlineSummary, state, dismissOfflineSummary } = useGame();
  if (!offlineSummary || !state) return null;
  const s = offlineSummary;
  const capped = s.secondsAway > OFFLINE_CAP_SECONDS;
  const lines = (['gold', 'food', 'wood', 'stone'] as const)
    .map((k) => ({ k, v: s.gained[k] }))
    .filter((x) => Math.abs(x.v) >= 0.05);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismissOfflineSummary}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>
            You were away for {formatDuration(s.secondsAway)}.
            {capped ? ` Production counted for the last ${formatDuration(OFFLINE_CAP_SECONDS)}; construction and study finished on time.` : ''}
          </Text>

          {lines.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.heading}>Gained while away</Text>
              {lines.map(({ k, v }) => (
                <Text key={k} style={styles.line}>
                  {v > 0 ? '+' : ''}
                  {v.toFixed(1)} {k}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.line}>Nothing changed. Build a business to earn while you are away.</Text>
          )}

          {s.events.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.heading}>What happened</Text>
              {s.events.slice(-6).map((e, i) => (
                <Text key={i} style={styles.event}>
                  • {e}
                </Text>
              ))}
            </View>
          ) : null}

          <GameButton label="Continue" onPress={dismissOfflineSummary} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.navyLight, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.gold, padding: spacing.lg, gap: spacing.md },
  title: { fontFamily: fonts.serif, fontSize: 26, fontWeight: '800', color: colors.parchment, textAlign: 'center' },
  sub: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchmentDim, textAlign: 'center' },
  block: { gap: 4 },
  heading: { fontFamily: fonts.serif, fontSize: 13, letterSpacing: 2, color: colors.gold, textTransform: 'uppercase' },
  line: { fontFamily: fonts.serif, fontSize: 18, color: colors.parchment },
  event: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.parchmentDim },
});
