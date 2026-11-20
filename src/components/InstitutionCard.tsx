import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { InstitutionArt } from '@/components/art/InstitutionArt';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getInstitutionType } from '@/data/institutions';
import { buildSeconds, canAfford, upgradeCost } from '@/game/economy';
import { formatDuration, institutionBlocker } from '@/game/selectors';
import type { ActionResult, GameState, InstitutionInstance, InstitutionType } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';
import { costText } from '@/utils/format';

type Icon = keyof typeof Ionicons.glyphMap;

function Header({ type, right, dim }: { type: InstitutionType; right: React.ReactNode; dim?: boolean }) {
  return (
    <>
    <InstitutionArt id={type.id} dim={dim} />
    <View style={styles.header}>
      <Ionicons name={type.icon as Icon} size={26} color={colors.gold} />
      <Text style={styles.name}>{type.name}</Text>
      {right}
    </View>
    </>
  );
}

type OwnedProps = { state: GameState; instance: InstitutionInstance; onUpgrade: (id: string) => ActionResult };

export function OwnedInstitutionCard({ state, instance, onUpgrade }: OwnedProps) {
  const type = getInstitutionType(instance.typeId);
  const pending = instance.pending;
  const atMax = instance.level >= type.maxLevel;
  const cost = atMax || instance.level === 0 ? {} : upgradeCost(type, instance.level);
  const affordable = canAfford(state.resources, cost);

  return (
    <Panel>
      <Header type={type} right={<Chip label={instance.level === 0 ? 'Building' : `Level ${instance.level}/${type.maxLevel}`} />} />
      {instance.level > 0 ? (
        <>
          <Text style={styles.effect}>{type.effects[instance.level - 1]}</Text>
          <Text style={styles.meta}>Upkeep {type.upkeepPerHour} gold/h</Text>
        </>
      ) : null}
      {pending ? (
        <View style={styles.timer}>
          <ProgressBar progress={1 - (pending.completesAt - state.lastTickAt) / 1000 / buildSeconds(state, type, pending.targetLevel)} />
          <Text style={styles.timerText}>
            {pending.targetLevel === 1 ? 'Under construction' : `Upgrading to level ${pending.targetLevel}`} ·{' '}
            {formatDuration((pending.completesAt - state.lastTickAt) / 1000)} left
          </Text>
        </View>
      ) : null}
      {!pending && !atMax ? (
        <View style={styles.action}>
          <Text style={styles.meta}>Next: {type.effects[instance.level]}</Text>
          <View style={{ height: spacing.sm }} />
          <GameButton
            compact
            muted={!affordable}
            label={`Upgrade · ${costText(cost)} · ${formatDuration(buildSeconds(state, type, instance.level + 1))}`}
            onPress={() => {
              const r = onUpgrade(instance.typeId);
              if (!r.ok) Alert.alert('Cannot upgrade', r.reason);
            }}
          />
        </View>
      ) : null}
      {atMax && !pending ? <Text style={styles.meta}>Fully upgraded</Text> : null}
    </Panel>
  );
}

type AvailableProps = { state: GameState; type: InstitutionType; onBuy: (id: string) => ActionResult };

export function AvailableInstitutionCard({ state, type, onBuy }: AvailableProps) {
  const blocker = institutionBlocker(state, type.id);
  const affordable = canAfford(state.resources, type.cost);
  return (
    <Panel style={blocker ? { opacity: 0.8 } : undefined}>
      <Header type={type} dim={!!blocker} right={blocker ? <Chip tone="muted" label="Locked" /> : null} />
      <Text style={styles.desc}>{type.description}</Text>
      <Text style={styles.effect}>Level 1: {type.effects[0]}</Text>
      <Text style={styles.meta}>
        Upkeep {type.upkeepPerHour} gold/h · Build time {formatDuration(buildSeconds(state, type, 1))}
      </Text>
      {blocker ? (
        <Text style={styles.blocker}>{blocker}.</Text>
      ) : (
        <View style={styles.action}>
          <GameButton
            compact
            muted={!affordable}
            label={`Build · ${costText(type.cost)}`}
            onPress={() => {
              const r = onBuy(type.id);
              if (!r.ok) Alert.alert('Cannot build', r.reason);
            }}
          />
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1, fontFamily: fonts.serif, fontSize: 19, fontWeight: '800', color: colors.parchment },
  desc: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.parchmentDim, marginTop: spacing.sm },
  effect: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.goldBright, marginTop: spacing.sm },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  blocker: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.bronze, marginTop: spacing.sm },
  timer: { marginTop: spacing.md, gap: 6 },
  timerText: { fontFamily: fonts.sans, fontSize: 13, color: colors.goldBright },
  action: { marginTop: spacing.md },
});
