import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BattleField } from '@/components/art/BattleField';
import { UnitChips } from '@/components/military/UnitChips';
import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getOrder, ORDERS } from '@/data/orders';
import { getScenario } from '@/data/scenarios';
import { estimateEnemy, getLeader, orderChecks, type Check } from '@/game/battle';
import { ReportCard } from '@/components/military/IntelTab';
import { EXPEDITION_SECONDS } from '@/game/constants';
import { intelCost, provisionsFood } from '@/game/military';
import { sumUnits } from '@/game/selectors';
import type { ActionResult, Battle, GameState, OrderId, Provisions } from '@/game/types';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function BattleScreen() {
  const { scenario } = useLocalSearchParams<{ scenario?: string }>();
  const { state } = useGame();
  // Set just before leaving for the report, so this screen does not redirect while closing.
  const [leaving, setLeaving] = useState(false);

  if (leaving) return null;
  if (!state) return <Redirect href="/" />;
  if (state.battle) return <Active state={state} battle={state.battle} onLeave={() => setLeaving(true)} />;
  if (scenario) return <Deploy state={state} scenarioId={String(scenario)} />;
  return <Redirect href="/military" />;
}

// ---------------------------------------------------------------------------
// Deployment: scouting and provisions
// ---------------------------------------------------------------------------

function Deploy({ state, scenarioId }: { state: GameState; scenarioId: string }) {
  const { beginBattle, beginExpedition } = useGame();
  const sc = getScenario(scenarioId);
  const [intel, setIntel] = useState<'0' | '1' | '2'>('0');
  const [prov, setProv] = useState<Provisions>('standard');
  const [picked, setPicked] = useState<string[]>([]);
  const available = state.intel.reports.filter((r) => r.factionId === scenarioId);
  const men = sumUnits(state.army.units);
  const leader = getLeader(state, state.army.commanderId);

  return (
    <GameScreen title={sc.name} subtitle={`${sc.difficulty} · ${sc.terrain} · ${sc.weather}`} showBack>
      <Panel>
        <Text style={styles.body}>{sc.blurb}</Text>
        <Text style={styles.meta}>Rumour: {sc.rumour}</Text>
        <Text style={styles.meta}>Veterans advise an army of about {sc.recommendedArmy}.</Text>
      </Panel>

      <SectionHeader title="Your force" />
      <Panel>
        <Text style={styles.label}>
          {men} soldiers led by {leader.name}
        </Text>
        <UnitChips units={state.army.units} />
        <Text style={styles.meta}>
          Tactics {leader.tactics} · Logistics {leader.logistics} · Leadership {leader.leadership}
        </Text>
      </Panel>

      <SectionHeader title="Intelligence" />
      <Text style={styles.meta}>Rumours are unreliable. Scouts tell you what you will face before you commit.</Text>
      <SegmentedControl
        options={[
          { value: '0', label: 'Rumour' },
          { value: '1', label: `Scout ${intelCost(1)}g` },
          { value: '2', label: `Spy ${intelCost(2)}g` },
        ]}
        value={intel}
        onChange={setIntel}
      />
      <Text style={styles.meta}>
        {intel === '0'
          ? 'You will see only a wide estimate of enemy numbers.'
          : intel === '1'
            ? 'You will see a tighter estimate by branch of service, and learn whether they are fortified.'
            : 'You will know the enemy’s exact troops and supplies.'}
      </Text>

      {available.length > 0 ? (
        <>
          <SectionHeader title="Spy reports" />
          <Text style={styles.meta}>
            Tap a report to rely on it. Reports can be wrong; reports from independent agents that agree are safer. Reports tell you only what the agent claims.
          </Text>
          {available.map((r) => (
            <Pressable key={r.id} onPress={() => setPicked((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]))}>
              <ReportCard state={state} report={r} selected={picked.includes(r.id)} />
            </Pressable>
          ))}
        </>
      ) : null}

      <SectionHeader title="Provisions" />
      <Text style={styles.meta}>Each round of supplies costs food. When supplies run out, attack falls and morale sinks.</Text>
      <SegmentedControl
        options={(['light', 'standard', 'ample'] as Provisions[]).map((p) => ({
          value: p,
          label: `${p[0].toUpperCase()}${p.slice(1)} ${provisionsFood(men, p)}f`,
        }))}
        value={prov}
        onChange={setProv}
      />
      <Text style={styles.meta}>
        {prov === 'light' ? '3 rounds of supplies' : prov === 'standard' ? '5 rounds of supplies' : '7 rounds of supplies'}. Battles last up to 6 rounds.
      </Text>

      <View style={{ marginTop: spacing.lg }}>
        <GameButton
          label="March to battle"
          onPress={() => {
            const r = beginBattle(scenarioId, Number(intel) as 0 | 1 | 2, prov, picked);
            if (!r.ok) Alert.alert('Cannot begin', r.reason);
          }}
        />
      </View>
      <Text style={styles.meta}>
        Or send your army under {leader.name} and let the commander fight it. It resolves by itself in {Math.round(EXPEDITION_SECONDS[sc.difficulty] / 60)} minutes, even if you close the app, using ordinary orders only.
      </Text>
      <GameButton
        variant="secondary"
        label="Send on expedition"
        onPress={() => {
          const r = beginExpedition(scenarioId, Number(intel) as 0 | 1 | 2, prov, picked);
          if (!r.ok) Alert.alert('Cannot send', r.reason);
          else router.replace('/military');
        }}
      />
    </GameScreen>
  );
}

// ---------------------------------------------------------------------------
// The battle itself
// ---------------------------------------------------------------------------

const CHECK_MARK: Record<Check['status'], string> = { ok: '✓', bad: '✗', unknown: '?' };
const CHECK_COLOR: Record<Check['status'], string> = { ok: '#7DBE7D', bad: '#E58A8A', unknown: colors.parchmentDim };

function Active({ state, battle, onLeave }: { state: GameState; battle: Battle; onLeave: () => void }) {
  const { giveOrder, delegate } = useGame();
  const sc = getScenario(battle.scenarioId);
  const est = estimateEnemy(battle);
  const leader = getLeader(state, battle.player.leaderId);

  const finish = (r: ActionResult) => {
    if (!r.ok) {
      Alert.alert('Cannot do that', r.reason);
      return;
    }
    if (r.state.battle === null) {
      onLeave();
      const id = r.state.reports[0]?.id;
      if (id) router.replace({ pathname: '/report/[id]', params: { id } });
      else router.replace('/military');
    }
  };

  const order = (id: OrderId) => {
    if (id === 'retreat') {
      Alert.alert('Retreat?', 'You will break off and save most of the army, but forfeit any reward. Losing a battle is not losing the war.', [
        { text: 'Keep fighting', style: 'cancel' },
        { text: 'Retreat', style: 'destructive', onPress: () => finish(giveOrder('retreat')) },
      ]);
      return;
    }
    finish(giveOrder(id));
  };

  const supplyLeft = Math.max(0, battle.player.supply);
  const known = (battle.enemy.lastStance ?? null);

  return (
    <GameScreen title={sc.name} subtitle={`Round ${battle.round + 1} of ${battle.maxRounds}`} showBack>
      <BattleField battle={battle} />
      <View style={styles.chips}>
        <Chip tone="muted" label={`Terrain: ${battle.terrain}`} />
        <Chip tone="muted" label={`Weather: ${battle.weather}`} />
        <Chip tone="muted" label={`Led by ${leader.name}`} />
      </View>

      <SectionHeader title="Your army" />
      <Panel>
        <UnitChips units={battle.player.units} empty="Nothing left" />
        <Text style={styles.meta}>Morale</Text>
        <ProgressBar progress={battle.player.morale / 100} color="#7DBE7D" />
        <Text style={styles.meta}>
          Supplies: {supplyLeft > 0 ? `${supplyLeft} round${supplyLeft === 1 ? '' : 's'} left` : 'exhausted (attack reduced, morale sinking)'}
        </Text>
      </Panel>

      <SectionHeader title={`Enemy: ${battle.enemy.name}`} />
      <Panel tone="burgundy">
        <Text style={styles.label}>Commanded by {battle.enemy.commander}</Text>
        {est.exact && est.units ? (
          <UnitChips units={est.units} />
        ) : (
          <Text style={styles.body}>
            About {est.total[0]} to {est.total[1]} soldiers
            {est.classes
              ? ` (infantry ${est.classes.infantry[0]}–${est.classes.infantry[1]}, missile ${est.classes.ranged[0]}–${est.classes.ranged[1]}, cavalry ${est.classes.cavalry[0]}–${est.classes.cavalry[1]})`
              : ''}
            .
          </Text>
        )}
        {est.source === 'report' ? (
          <Text style={styles.meta}>Based on spy reports: {battle.beliefSources.map((x) => x.spyName).join(', ')}. They may be wrong.</Text>
        ) : null}
        {battle.intel === 0 && est.source === 'rumour' ? <Text style={styles.meta}>You fought on rumour alone: composition and defences unknown.</Text> : null}
        {battle.intel >= 1 ? (
          <Text style={styles.meta}>{battle.enemy.fortified ? 'They are fortified.' : 'They are not fortified.'}</Text>
        ) : battle.belief.fortified !== undefined ? (
          <Text style={styles.meta}>Reports say they are {battle.belief.fortified ? '' : 'not '}fortified.</Text>
        ) : null}
        <Text style={styles.meta}>Enemy morale</Text>
        <ProgressBar progress={battle.enemy.morale / 100} color={colors.burgundyBright} />
        <Text style={styles.meta}>
          {known ? `Last seen: ${known === 'aggressive' ? 'pressing forward' : known === 'defensive' ? 'behind defences' : known === 'reserve' ? 'holding reserves' : 'holding a steady line'}.` : 'Their intentions are not yet known.'}
          {battle.intel >= 2 ? ` Their supplies: ${Math.max(0, battle.enemy.supply)} rounds.` : ''}
        </Text>
      </Panel>

      <SectionHeader title="Command window" />
      <Text style={styles.meta}>Choose your order for this round. The enemy commander adapts, so do not repeat yourself too often.</Text>
      {ORDERS.map((o) => {
        if (o.doctrine && (state.knowledge[o.doctrine] ?? 0) < 2) {
          return (
            <View key={o.id} style={styles.locked}>
              <Text style={styles.lockedTitle}>{o.name} (locked)</Text>
              <Text style={styles.meta}>Study the matching historical record in Knowledge to understand this doctrine.</Text>
            </View>
          );
        }
        const checks = orderChecks(state, battle, o.id);
        const sprung = o.twoStep && battle.setup?.kind === (o.id === 'envelop' ? 'envelop' : 'feint');
        const practiced = o.doctrine && (state.knowledge[o.doctrine] ?? 0) >= 3;
        return (
          <Panel key={o.id}>
            <View style={styles.row}>
              <Text style={styles.title}>{o.name}</Text>
              {o.doctrine ? <Chip label={practiced ? 'Doctrine · practised' : 'Doctrine'} /> : null}
            </View>
            <Text style={styles.meta}>{o.summary}</Text>
            {sprung ? <Text style={[styles.meta, { color: colors.goldBright }]}>The first step is done. Order it again to complete the manoeuvre.</Text> : null}
            {checks.map((c) => (
              <Text key={c.label} style={[styles.check, { color: CHECK_COLOR[c.status] }]}>
                {CHECK_MARK[c.status]} {c.label}
              </Text>
            ))}
            <View style={{ marginTop: spacing.md }}>
              <GameButton
                compact
                variant={o.id === 'retreat' ? 'danger' : 'primary'}
                label={sprung ? (o.id === 'envelop' ? 'Spring the trap' : 'Turn and strike') : o.twoStep ? `${o.name} (step 1)` : o.name}
                onPress={() => order(o.id)}
              />
            </View>
          </Panel>
        );
      })}

      <SectionHeader title="Or delegate" />
      <Text style={styles.meta}>
        {leader.isPlayer
          ? 'You lead in person; your own skill is modest.'
          : `${leader.name} will fight the rest of the battle using ordinary orders and sometimes errs.`}{' '}
        Doctrines are never used when delegated.
      </Text>
      <GameButton
        compact
        variant="secondary"
        label="Delegate the rest of the battle"
        onPress={() =>
          Alert.alert('Delegate?', 'Your commander will decide the remaining rounds. You will see the result in the report.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delegate', onPress: () => finish(delegate()) },
          ])
        }
      />

      {battle.rounds.length > 0 ? (
        <>
          <SectionHeader title="What has happened" />
          {[...battle.rounds].reverse().map((r) => (
            <Panel key={r.round}>
              <Text style={styles.label}>
                Round {r.round}: {getOrder(r.order).name}
              </Text>
              <Text style={styles.meta}>
                You lost {r.playerLoss} · they lost {r.enemyLoss}
              </Text>
              {r.notes.map((n, i) => (
                <Text key={i} style={styles.body}>
                  • {n}
                </Text>
              ))}
            </Panel>
          ))}
        </>
      ) : null}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 18, fontWeight: '800', color: colors.parchment },
  label: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchment, marginBottom: 6 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchment, marginTop: 2 },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  check: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, marginTop: 2 },
  locked: { padding: spacing.md, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.bronze },
  lockedTitle: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: colors.parchmentDim },
});
