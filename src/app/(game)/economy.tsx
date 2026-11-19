import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AvailableBusinessCard, OwnedBusinessCard } from '@/components/BusinessCard';
import { AvailableInstitutionCard, OwnedInstitutionCard } from '@/components/InstitutionCard';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { BUSINESS_TYPES, getBusinessType } from '@/data/businesses';
import { INSTITUTION_TYPES } from '@/data/institutions';
import { OFFLINE_CAP_SECONDS, BUILD_SLOTS } from '@/game/constants';
import { businessRates } from '@/game/economy';
import { formatDuration, getArmyUpkeep, getInstitutionUpkeep, getRates, pendingCount } from '@/game/selectors';
import { useGame, useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';
import { perHour } from '@/utils/format';

type Tab = 'finances' | 'businesses' | 'institutions';

export default function EconomyScreen() {
  const state = useGameState();
  const { buy, upgrade, buyInstitution, upgradeInstitution } = useGame();
  const [tab, setTab] = useState<Tab>('finances');
  const params = useLocalSearchParams<{ tab?: string; n?: string }>();
  const [seen, setSeen] = useState('');
  if (params.n && params.n !== seen) {
    setSeen(params.n);
    if (params.tab === 'finances' || params.tab === 'businesses' || params.tab === 'institutions') setTab(params.tab);
  }

  return (
    <GameScreen title="Economy" subtitle="Acquire · Earn · Upgrade · Unlock · Expand">
      <SegmentedControl
        options={[
          { value: 'finances', label: 'Finances' },
          { value: 'businesses', label: 'Businesses' },
          { value: 'institutions', label: 'Institutions' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'finances' ? <Finances /> : null}
      {tab === 'institutions' ? (
        <>
          <Text style={styles.note}>
            Businesses make money. Institutions create capabilities: faster study, an army, officers, better arms. Some need more than gold.
          </Text>
          <Text style={styles.note}>
            Builders busy: {pendingCount(state)} / {BUILD_SLOTS}
          </Text>
          {state.institutions.length > 0 ? <SectionHeader title="Your institutions" /> : null}
          {state.institutions.map((i) => (
            <OwnedInstitutionCard key={i.typeId} state={state} instance={i} onUpgrade={upgradeInstitution} />
          ))}
          <SectionHeader title="Available to found" />
          {INSTITUTION_TYPES.filter((t) => !state.institutions.some((i) => i.typeId === t.id)).map((t) => (
            <AvailableInstitutionCard key={t.id} state={state} type={t} onBuy={buyInstitution} />
          ))}
        </>
      ) : null}
      {tab === 'businesses' ? (
        <>
          <Text style={styles.note}>
            Builders busy: {pendingCount(state)} / {BUILD_SLOTS}
          </Text>

          {state.businesses.length > 0 ? <SectionHeader title="Your businesses" /> : null}
          {state.businesses.map((b) => (
            <OwnedBusinessCard key={b.typeId} state={state} instance={b} onUpgrade={upgrade} />
          ))}

          <SectionHeader title="Available to build" />
          {BUSINESS_TYPES.filter((t) => !state.businesses.some((b) => b.typeId === t.id)).map((t) => (
            <AvailableBusinessCard key={t.id} state={state} type={t} onBuy={buy} />
          ))}
          {BUSINESS_TYPES.every((t) => state.businesses.some((b) => b.typeId === t.id)) ? (
            <Text style={styles.note}>You own every business type that exists so far. More arrive in later milestones.</Text>
          ) : null}
        </>
      ) : null}
    </GameScreen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && { color: colors.goldBright }]}>{value}</Text>
    </View>
  );
}

function Finances() {
  const state = useGameState();
  const rates = getRates(state);
  const army = getArmyUpkeep(state);
  const inst = getInstitutionUpkeep(state);
  const producing = state.businesses.filter((b) => b.level > 0);
  const nets = producing.map((b) => {
    const r = businessRates(state, b.typeId, b.level);
    return { id: b.typeId, name: getBusinessType(b.typeId).name, net: r.income - r.expenses };
  });
  const maxNet = Math.max(1, ...nets.map((n) => Math.abs(n.net)));

  return (
    <>
      <SectionHeader title="Treasury" />
      <Panel>
        <Row label="Gold in the treasury" value={String(Math.floor(state.resources.gold))} strong />
        <Row label="Income" value={`${perHour(rates.income)} gold/h`} />
        <Row label="Running costs" value={`-${Math.round(rates.expenses * 10) / 10} gold/h`} />
        {army.gold > 0 || inst > 0 ? (
          <Row label="  of which institutions and army" value={`-${Math.round((inst + army.gold) * 10) / 10} gold/h`} />
        ) : null}
        <Row label="Net" value={`${perHour(rates.net)} gold/h`} strong />
      </Panel>

      <SectionHeader title="Production" />
      <Panel>
        <Row label="Food" value={`${perHour(rates.food)}/h`} />
        <Row label="Wood" value={`${perHour(rates.wood)}/h`} />
        <Row label="Stone" value={`${perHour(rates.stone)}/h`} />
      </Panel>

      <SectionHeader title="Net income by business" />
      <Panel>
        {nets.length === 0 ? (
          <Text style={styles.note}>You own no producing businesses yet. Open the Businesses tab to build your first.</Text>
        ) : (
          nets.map((n) => (
            <View key={n.id} style={styles.bar}>
              <View style={styles.row}>
                <Text style={styles.label}>{n.name}</Text>
                <Text style={styles.value}>{perHour(n.net)}/h</Text>
              </View>
              <ProgressBar progress={Math.abs(n.net) / maxNet} color={n.net >= 0 ? colors.gold : colors.burgundyBright} />
            </View>
          ))
        )}
      </Panel>

      <Text style={styles.note}>
        Away from the game? Businesses keep earning for up to {formatDuration(OFFLINE_CAP_SECONDS)}. If the treasury ever runs dry, costs simply stop being
        paid; nothing is lost.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontFamily: fonts.sans, fontSize: 15, color: colors.parchmentDim },
  value: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchment },
  bar: { paddingVertical: 4, gap: 4 },
  note: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.bronze, marginTop: spacing.sm },
});
