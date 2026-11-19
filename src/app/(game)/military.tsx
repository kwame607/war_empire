import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Portrait } from '@/components/art/Portrait';
import { NavyTab } from '@/components/military/NavyTab';
import { WarRoomTab } from '@/components/military/WarRoomTab';
import { IntelTab } from '@/components/military/IntelTab';
import { UnitChips } from '@/components/military/UnitChips';
import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { getInstitutionType } from '@/data/institutions';
import { TRAIT_TEXT } from '@/data/names';
import { MILITARY_UNLOCK_STAGE, PROGRESSION_STAGES } from '@/data/progression';
import { getScenario, scenariosFor } from '@/data/scenarios';
import { getUnitType, UNIT_TYPES } from '@/data/units';
import { getLeader } from '@/game/battle';
import { canAfford } from '@/game/economy';
import { commanderHireCost, recruitCost, recruitSeconds, scenarioReadyIn } from '@/game/military';
import { resultLabel } from '@/game/report';
import {
  commanderCap,
  formatDuration,
  getArmyCapacity,
  getArmySize,
  getArmyUpkeep,
  getManpowerCap,
  getStageIndex,
  institutionLevel,
  sumUnits,
} from '@/game/selectors';
import type { GameState } from '@/game/types';
import { useGame, useGameState } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';
import { costText } from '@/utils/format';

type Tab = 'army' | 'operations' | 'navy' | 'intel' | 'warroom' | 'reports';

export default function MilitaryScreen() {
  const state = useGameState();
  const [tab, setTab] = useState<Tab>('army');
  const params = useLocalSearchParams<{ tab?: string; n?: string }>();
  const [seen, setSeen] = useState('');
  if (params.n && params.n !== seen) {
    setSeen(params.n);
    if (params.tab === 'army' || params.tab === 'navy' || params.tab === 'operations') setTab(params.tab);
  }
  const idx = getStageIndex(state);
  const need = PROGRESSION_STAGES[MILITARY_UNLOCK_STAGE];

  if (idx < MILITARY_UNLOCK_STAGE) {
    return (
      <GameScreen title="Military" subtitle="Commanders, armies and campaigns">
        <LockedNotice
          title="Locked: no army yet"
          description={`Every ruler starts as a civilian. Military institutions open when you reach "${need.name}".`}
          arrivesIn={`reputation ${need.reputation}`}
        />
        <Panel>
          <Text style={styles.body}>
            Reputation {Math.floor(state.reputation)} / {need.reputation}
          </Text>
          <View style={{ marginTop: 8 }}>
            <ProgressBar progress={state.reputation / need.reputation} />
          </View>
        </Panel>
      </GameScreen>
    );
  }

  return (
    <GameScreen title="Military" subtitle="Commanders, armies and campaigns">
      {state.battle ? (
        <Panel tone="burgundy">
          <Text style={styles.heading}>Battle in progress</Text>
          <Text style={styles.body}>
            {getScenario(state.battle.scenarioId).name}: round {state.battle.round + 1} of {state.battle.maxRounds}
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <GameButton compact label="Return to the battle" onPress={() => router.push('/battle')} />
          </View>
        </Panel>
      ) : null}

      {state.expedition ? (
        <Panel tone="burgundy">
          <Text style={styles.heading}>Army on expedition</Text>
          <Text style={styles.body}>
            Marching on the {state.expedition.battle.enemy.name}. Back in {formatDuration(Math.max(0, (state.expedition.endsAt - state.lastTickAt) / 1000))}.
          </Text>
          <Text style={styles.meta}>The result arrives as a battle report, even if you close the app.</Text>
        </Panel>
      ) : null}

      <SegmentedControl
        options={[
          { value: 'army', label: 'Army' },
          { value: 'operations', label: 'Operations' },
          { value: 'navy', label: 'Navy' },
          { value: 'intel', label: 'Intel' },
          { value: 'warroom', label: 'War room' },
          { value: 'reports', label: 'Reports' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'army' ? <ArmyTab state={state} /> : null}
      {tab === 'operations' ? <OperationsTab state={state} /> : null}
      {tab === 'navy' ? <NavyTab state={state} /> : null}
      {tab === 'intel' ? <IntelTab state={state} /> : null}
      {tab === 'warroom' ? <WarRoomTab state={state} /> : null}
      {tab === 'reports' ? <ReportsTab state={state} /> : null}
    </GameScreen>
  );
}

// ---------------------------------------------------------------------------

function ArmyTab({ state }: { state: GameState }) {
  const { recruit, hireCommander, assignCommander } = useGame();
  const barracks = institutionLevel(state, 'barracks');
  const academy = institutionLevel(state, 'academy');
  const upkeep = getArmyUpkeep(state);
  const now = state.lastTickAt;
  const leader = getLeader(state, state.army.commanderId);

  return (
    <>
      {barracks === 0 ? (
        <>
          <LockedNotice
            title="No barracks"
            description="Without barracks there is no army, only men with spears. Found one under Economy → Institutions."
            arrivesIn="your hands"
          />
          <GameButton compact variant="secondary" label="Go to Institutions" onPress={() => router.push('/economy')} />
        </>
      ) : null}

      <SectionHeader title="Your army" />
      <Panel>
        <Text style={styles.big}>
          {getArmySize(state)} / {getArmyCapacity(state)} soldiers
        </Text>
        <Text style={styles.meta}>
          Barracks capacity. Your lands can spare up to {getManpowerCap(state)} men; more people means more recruits.
        </Text>
        <View style={{ marginTop: spacing.sm }}>
          <UnitChips units={state.army.units} empty="No soldiers at home" />
        </View>
        {state.battle ? <Text style={styles.meta}>{sumUnits(state.battle.player.units)} are in the field.</Text> : null}
        {state.army.training.map((b, i) => (
          <View key={i} style={{ marginTop: spacing.sm, gap: 4 }}>
            <Text style={styles.body}>
              Training {b.count} {getUnitType(b.unitId).name.toLowerCase()}
            </Text>
            <ProgressBar progress={1 - (b.completesAt - now) / 1000 / recruitSeconds(state, b.unitId, b.count)} />
            <Text style={styles.meta}>{formatDuration((b.completesAt - now) / 1000)} left</Text>
          </View>
        ))}
        <Text style={styles.meta}>
          Upkeep: {Math.round(upkeep.gold * 10) / 10} gold/h, {Math.round(upkeep.food * 10) / 10} food/h
        </Text>
      </Panel>

      <SectionHeader title="Who leads" />
      <Panel>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Portrait civId={state.player.civId} name={leader.name} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={styles.big}>{leader.name}</Text>
            <Text style={styles.meta}>
              {leader.isPlayer ? 'You lead in person' : 'Commander'} · Tactics {leader.tactics} · Logistics {leader.logistics} · Leadership {leader.leadership}
            </Text>
          </View>
        </View>
        {leader.trait ? <Text style={[styles.meta, { marginTop: spacing.sm }]}>{TRAIT_TEXT[leader.trait]}</Text> : null}
        {state.commanders.length > 0 ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {state.commanders.map((c) => {
              const active = c.id === state.army.commanderId;
              return (
                <View key={c.id} style={styles.cmdRow}>
                  <Portrait civId={state.player.civId} name={c.name} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.body}>
                      {c.name} {active ? '(leading)' : ''}
                    </Text>
                    <Text style={styles.meta}>
                      Tactics {c.tactics + Math.floor(c.xp / 3)} · {c.victories}/{c.battles} won · {c.trait}
                    </Text>
                  </View>
                  {!active ? (
                    <GameButton
                      compact
                      variant="secondary"
                      label="Lead"
                      onPress={() => {
                        const r = assignCommander(c.id);
                        if (!r.ok) Alert.alert('Cannot change commander', r.reason);
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
            {state.army.commanderId ? (
              <GameButton compact variant="secondary" label="Lead in person instead" onPress={() => assignCommander(null)} />
            ) : null}
          </View>
        ) : null}
      </Panel>
      {academy > 0 ? (
        <GameButton
          compact
          muted={state.commanders.length >= commanderCap(state) || state.resources.gold < commanderHireCost(state)}
          label={`Employ a commander · ${commanderHireCost(state)} gold (${state.commanders.length}/${commanderCap(state)})`}
          onPress={() => {
            const r = hireCommander();
            if (!r.ok) Alert.alert('Cannot employ a commander', r.reason);
          }}
        />
      ) : (
        <LockedNotice
          title="No officers"
          description={`Hired commanders are usually better than you at first. They need a ${getInstitutionType('academy').name}, which needs you to have studied a historical record to Understanding.`}
          arrivesIn="Economy → Institutions"
        />
      )}

      <SectionHeader title="Recruit" />
      {UNIT_TYPES.map((u) => {
        const have = institutionLevel(state, u.requires.institution) >= u.requires.level;
        return (
          <Panel key={u.id} style={have ? undefined : { opacity: 0.75 }}>
            <View style={styles.cmdRow}>
              <Text style={[styles.title, { flex: 1 }]}>{u.name}</Text>
              <Chip tone="muted" label={`Atk ${u.attack} · Def ${u.defence}`} />
            </View>
            <Text style={styles.meta}>{u.description}</Text>
            <Text style={styles.meta}>
              Each: {costText(u.cost)} · upkeep {u.upkeepGold} gold + {u.upkeepFood} food per hour
            </Text>
            {have ? (
              <View style={[styles.cmdRow, { marginTop: spacing.md }]}>
                {[1, 5, 10].map((n) => (
                  <View key={n} style={{ flex: 1 }}>
                    <GameButton
                      compact
                      muted={!canAfford(state.resources, recruitCost(u.id, n))}
                      label={`+${n}`}
                      onPress={() => {
                        const r = recruit(u.id, n);
                        if (!r.ok) Alert.alert('Cannot recruit', r.reason);
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.meta, { color: colors.bronze }]}>
                Requires {getInstitutionType(u.requires.institution).name} level {u.requires.level}.
              </Text>
            )}
          </Panel>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------

function OperationsTab({ state }: { state: GameState }) {
  const now = state.lastTickAt;
  const men = sumUnits(state.army.units);
  return (
    <>
      <Text style={styles.meta}>
        Fights are decided by preparation, intelligence, terrain, supply and your orders, not a single number. Losing a battle is not losing the war.
      </Text>
      {scenariosFor(state.war).map((sc) => {
        const wait = scenarioReadyIn(state, sc.id, now);
        const blocked = state.expedition ? 'Army is away' : state.battle ? 'A battle is under way' : men === 0 ? 'No soldiers ready' : wait > 0 ? `Enemy withdrawn · ${formatDuration(wait)}` : null;
        return (
          <Panel key={sc.id}>
            <View style={styles.cmdRow}>
              <Text style={[styles.title, { flex: 1 }]}>{sc.name}</Text>
              <Chip tone={sc.difficulty === 'Hard' ? 'burgundy' : sc.difficulty === 'Medium' ? 'gold' : 'muted'} label={sc.difficulty} />
            </View>
            <Text style={styles.meta}>{sc.blurb}</Text>
            <View style={styles.chips}>
              <Chip tone="muted" label={`Terrain: ${sc.terrain}`} />
              <Chip tone="muted" label={`Weather: ${sc.weather}`} />
            </View>
            <Text style={styles.meta}>Rumour: {sc.rumour}</Text>
            <Text style={styles.meta}>Veterans advise an army of about {sc.recommendedArmy}.</Text>
            <Text style={styles.meta}>
              Reward: {sc.rewards.gold} gold, reputation +{sc.rewards.reputation}
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <GameButton
                compact
                muted={!!blocked}
                label={blocked ?? 'Prepare for battle'}
                onPress={() => {
                  if (blocked) Alert.alert('Not now', blocked);
                  else router.push({ pathname: '/battle', params: { scenario: sc.id } });
                }}
              />
            </View>
          </Panel>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------

function ReportsTab({ state }: { state: GameState }) {
  if (state.reports.length === 0) {
    return <LockedNotice title="No battles yet" description="After every battle you get a detailed report: casualties, decisions, what worked, and what to learn." arrivesIn="your first battle" />;
  }
  return (
    <>
      {state.reports.map((r) => {
        const lost = sumUnits(r.playerInitial) - sumUnits(r.playerFinal);
        const killed = sumUnits(r.enemyInitial) - sumUnits(r.enemyFinal);
        return (
          <Pressable key={r.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/report/[id]', params: { id: r.id } })}>
            <Panel>
              <View style={styles.cmdRow}>
                <Text style={[styles.title, { flex: 1 }]}>{r.scenarioName}</Text>
                <Chip tone={r.result === 'victory' ? 'gold' : r.result === 'defeat' ? 'burgundy' : 'muted'} label={resultLabel(r.result)} />
              </View>
              <Text style={styles.meta}>
                You lost {lost} · they lost {killed} · led by {r.leader.name}
              </Text>
            </Panel>
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.serif, fontSize: 13, letterSpacing: 2, color: colors.goldBright, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '800', color: colors.parchment },
  big: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '800', color: colors.parchment },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchment },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  cmdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
});
