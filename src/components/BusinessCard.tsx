import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { Illustration } from '@/components/art/Illustration';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getBusinessType } from '@/data/businesses';
import { buildSeconds, businessRates, canAfford, employeesOf, upgradeCost } from '@/game/economy';
import { formatDuration } from '@/game/selectors';
import type { ActionResult, BusinessInstance, BusinessType, GameState } from '@/game/types';
import { colors, fonts, spacing } from '@/theme';
import { costText, perHour } from '@/utils/format';

type OwnedProps = {
  state: GameState;
  instance: BusinessInstance;
  onUpgrade: (typeId: string) => ActionResult;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Header({ type, right }: { type: BusinessType; right: React.ReactNode }) {
  return (
    <>
    <Illustration id={type.id} />
    <View style={styles.header}>
      <Ionicons name={type.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.gold} />
      <Text style={styles.name}>{type.name}</Text>
      {right}
    </View>
    </>
  );
}

/** A business the player owns: stats, construction timer and upgrade button. */
export function OwnedBusinessCard({ state, instance, onUpgrade }: OwnedProps) {
  const type = getBusinessType(instance.typeId);
  const pending = instance.pending;
  const rates = businessRates(state, instance.typeId, instance.level);
  const atMax = instance.level >= type.maxLevel;
  const cost = atMax || instance.level === 0 ? {} : upgradeCost(type, instance.level);
  const affordable = canAfford(state.resources, cost);

  let timer: React.ReactNode = null;
  if (pending) {
    const total = buildSeconds(state, type, pending.targetLevel);
    const remaining = (pending.completesAt - state.lastTickAt) / 1000;
    timer = (
      <View style={styles.timer}>
        <ProgressBar progress={1 - remaining / total} />
        <Text style={styles.timerText}>
          {pending.targetLevel === 1 ? 'Under construction' : `Upgrading to level ${pending.targetLevel}`} · {formatDuration(remaining)} left
        </Text>
      </View>
    );
  }

  return (
    <Panel>
      <Header type={type} right={<Chip label={instance.level === 0 ? 'Building' : `Level ${instance.level}/${type.maxLevel}`} />} />
      {instance.level > 0 ? (
        <View style={styles.stats}>
          <Row label="Income" value={`${perHour(rates.income)} gold/h`} />
          <Row label="Running costs" value={`-${Math.round(rates.expenses * 10) / 10} gold/h`} />
          {rates.produces ? <Row label="Output" value={`${perHour(rates.produces.perHour)} ${rates.produces.resource}/h`} /> : null}
          <Row label="Workers" value={String(employeesOf(instance))} />
        </View>
      ) : null}
      {timer}
      {!pending && !atMax ? (
        <View style={styles.action}>
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
      {atMax && !pending ? <Text style={styles.maxed}>Fully upgraded</Text> : null}
    </Panel>
  );
}

type AvailableProps = {
  state: GameState;
  type: BusinessType;
  onBuy: (typeId: string) => ActionResult;
};

/** A business the player could build (or a locked one with its requirement). */
export function AvailableBusinessCard({ state, type, onBuy }: AvailableProps) {
  const locked = state.reputation < type.requiresReputation;
  const affordable = canAfford(state.resources, type.cost);
  return (
    <Panel style={locked ? { opacity: 0.75 } : undefined}>
      <Header type={type} right={locked ? <Chip tone="muted" label={`Reputation ${type.requiresReputation}`} /> : null} />
      <Text style={styles.desc}>{type.description}</Text>
      <View style={styles.stats}>
        <Row label="Base income" value={`${perHour(type.incomePerHour)} gold/h`} />
        <Row label="Running costs" value={`-${type.expensesPerHour} gold/h`} />
        {type.produces ? <Row label="Output" value={`${perHour(type.produces.perHour)} ${type.produces.resource}/h`} /> : null}
        <Row label="Build time" value={formatDuration(buildSeconds(state, type, 1))} />
      </View>
      {locked ? (
        <Text style={styles.maxed}>
          Locked: earn {type.requiresReputation - state.reputation} more reputation by building and upgrading.
        </Text>
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
  stats: { marginTop: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label: { fontFamily: fonts.sans, fontSize: 14, color: colors.parchmentDim },
  value: { fontFamily: fonts.sans, fontSize: 14, fontWeight: '600', color: colors.parchment },
  timer: { marginTop: spacing.md, gap: 6 },
  timerText: { fontFamily: fonts.sans, fontSize: 13, color: colors.goldBright },
  action: { marginTop: spacing.md },
  maxed: { fontFamily: fonts.sans, fontSize: 13, color: colors.bronze, marginTop: spacing.md },
});
