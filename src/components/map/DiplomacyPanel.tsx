import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ENVOY_COST_GOLD } from '@/game/constants';
import { envoyBlocker } from '@/game/diplomacy';
import { formatDuration } from '@/game/selectors';
import type { ActionResult, EnvoyKind, GameState } from '@/game/types';
import { pactIncome, powerEstimate, relationLabel, TRAIT_HELP, TRAIT_LABEL } from '@/game/worldCore';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

const KIND_LABEL: Record<EnvoyKind, string> = { goodwill: 'Send gifts', trade: 'Propose trade', alliance: 'Propose alliance' };

export function DiplomacyPanel({ state }: { state: GameState }) {
  const { sendEnvoy, respondToOffer, breakPact } = useGame();
  const now = state.lastTickAt;
  const say = (r: ActionResult, title: string) => {
    if (!r.ok) Alert.alert(title, r.reason);
  };

  return (
    <>
      <Text style={styles.meta}>
        Other kingdoms act on their own, even while you are away. Their temperament is hidden until you deal with them. Pacts earn gold, but a pact is only as good as the partner.
      </Text>
      {pactIncome(state) > 0 ? <Text style={styles.gold}>Pacts bring in {pactIncome(state)} gold per hour.</Text> : null}

      {state.world.offers.length > 0 ? <SectionHeader title="Messages" /> : null}
      {state.world.offers.map((o) => {
        const rival = state.world.rivals.find((r) => r.id === o.rivalId);
        return (
          <Panel key={o.id} tone="parchment">
            <Text style={styles.titleDark}>{rival?.name}</Text>
            <Text style={styles.bodyDark}>{o.text}</Text>
            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}>
                <GameButton compact label={o.kind === 'tribute' ? `Pay ${o.gold}g` : 'Accept'} onPress={() => say(respondToOffer(o.id, true), 'Cannot accept')} />
              </View>
              <View style={{ flex: 1 }}>
                <GameButton compact variant="secondary" label="Refuse" onPress={() => say(respondToOffer(o.id, false), 'Cannot refuse')} />
              </View>
            </View>
          </Panel>
        );
      })}

      <SectionHeader title="Kingdoms" />
      {state.world.rivals.map((r) => {
        const envoy = state.world.envoys.find((e) => e.rivalId === r.id);
        return (
          <Panel key={r.id}>
            <View style={styles.row}>
              <Text style={[styles.title, { flex: 1 }]}>{r.name}</Text>
              {r.pact !== 'none' ? <Chip label={r.pact === 'trade' ? 'Trade pact' : 'Alliance'} /> : null}
            </View>
            <Text style={styles.meta}>{powerEstimate(state, r)}</Text>
            <Text style={styles.meta}>
              Relations: {relationLabel(r.relation)} ({Math.round(r.relation)})
            </Text>
            <ProgressBar progress={(r.relation + 100) / 200} color={r.relation < -20 ? colors.burgundyBright : colors.gold} />
            <Text style={styles.meta}>
              {r.traitKnown ? `${TRAIT_LABEL[r.trait]}: ${TRAIT_HELP[r.trait]}` : 'Temperament unknown. Send an envoy to learn their character.'}
            </Text>
            {envoy ? (
              <Chip tone="muted" label={`Envoy on the road · ${formatDuration(Math.max(0, (envoy.completesAt - now) / 1000))}`} />
            ) : (
              <View style={styles.btns}>
                {(['goodwill', 'trade', 'alliance'] as EnvoyKind[])
                  .filter((k) => !(k === 'trade' && r.pact !== 'none') && !(k === 'alliance' && r.pact === 'alliance'))
                  .map((k) => (
                    <GameButton
                      key={k}
                      compact
                      variant="secondary"
                      muted={envoyBlocker(state, r.id, k) !== null}
                      label={`${KIND_LABEL[k]} ${ENVOY_COST_GOLD[k]}g`}
                      onPress={() => say(sendEnvoy(r.id, k), 'Cannot send')}
                    />
                  ))}
                {r.pact !== 'none' ? (
                  <GameButton
                    compact
                    variant="danger"
                    label="Break pact"
                    onPress={() =>
                      Alert.alert('Break the pact?', 'They will remember it, and your reputation suffers.', [
                        { text: 'Keep it', style: 'cancel' },
                        { text: 'Break', style: 'destructive', onPress: () => say(breakPact(r.id), 'Cannot break') },
                      ])
                    }
                  />
                ) : null}
              </View>
            )}
          </Panel>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '800', color: colors.parchment },
  titleDark: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '800', color: colors.charcoal },
  bodyDark: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal, marginTop: 4 },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  gold: { fontFamily: fonts.sans, fontSize: 13, color: colors.goldBright, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btns: { gap: spacing.sm, marginTop: spacing.md },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
