import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { OFFLINE_SUMMARY_MIN_SECONDS } from '@/game/constants';
import {
  buildOfflineSummary,
  buyBusiness,
  createNewGame,
  discoverKnowledge,
  fastForward,
  startScouting,
  startStudy,
  tick,
  upgradeBusiness,
} from '@/game/engine';
import { breakPact, respondToOffer, sendEnvoy } from '@/game/diplomacy';
import { hireSpy, sendSpy } from '@/game/intel';
import { declareWar, makePeace } from '@/game/war';
import { claimMastery, runSimulation } from '@/game/mastery';
import {
  buyInstitution,
  delegateBattle,
  grantTestBoost,
  hireCommander,
  issueOrder,
  recruitUnits,
  setCommander,
  startBattle,
  startExpedition,
  upgradeInstitution,
} from '@/game/military';
import type { ActionResult, EnvoyKind, GameState, IntelTopic, NewGameConfig, OfflineSummary, OrderId, Provisions, UnitId } from '@/game/types';
import { deleteSave, loadSave, writeSave } from '@/storage/saveRepo';

const AUTOSAVE_MS = 15_000;
const TICK_MS = 1_000;

type GameContextValue = {
  /** False until the save database has been checked. */
  ready: boolean;
  hasSave: boolean;
  state: GameState | null;
  offlineSummary: OfflineSummary | null;
  saveError: string | null;
  dismissOfflineSummary: () => void;
  startNewGame: (config: NewGameConfig) => void;
  /** Resumes a saved game (or the one already in memory). Returns false if there is none. */
  continueGame: () => boolean;
  saveNow: () => Promise<void>;
  removeSave: () => Promise<void>;
  buy: (typeId: string) => ActionResult;
  upgrade: (typeId: string) => ActionResult;
  discover: (entryId: string) => void;
  study: (entryId: string) => ActionResult;
  scout: (settlementId: string) => ActionResult;
  buyInstitution: (typeId: string) => ActionResult;
  upgradeInstitution: (typeId: string) => ActionResult;
  recruit: (unitId: UnitId, count: number) => ActionResult;
  hireCommander: () => ActionResult;
  assignCommander: (commanderId: string | null) => ActionResult;
  beginBattle: (scenarioId: string, intel: 0 | 1 | 2, provisions: Provisions, reportIds?: string[]) => ActionResult;
  beginExpedition: (scenarioId: string, intel: 0 | 1 | 2, provisions: Provisions, reportIds?: string[]) => ActionResult;
  runSimulation: (scenarioId: string, orderId: OrderId) => ActionResult;
  claimMastery: (doctrine: string) => ActionResult;
  declareWar: (rivalId: string) => ActionResult;
  makePeace: () => ActionResult;
  hireSpy: () => ActionResult;
  sendEnvoy: (rivalId: string, kind: EnvoyKind) => ActionResult;
  respondToOffer: (offerId: string, accept: boolean) => ActionResult;
  breakPact: (rivalId: string) => ActionResult;
  sendSpy: (spyId: string, factionId: string, topic: IntelTopic) => ActionResult;
  giveOrder: (order: OrderId) => ActionResult;
  delegate: () => ActionResult;
  /** Testing tool: simulates time passing. */
  advanceTime: (seconds: number) => void;
  /** Testing tool: some gold, materials and reputation. */
  testBoost: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [offlineSummary, setOfflineSummary] = useState<OfflineSummary | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Refs always hold the very latest state, so timers and event handlers never act on stale data.
  const stateRef = useRef<GameState | null>(null);
  const savedRef = useRef<GameState | null>(null);

  const commit = useCallback((next: GameState | null) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const persist = useCallback(async (s: GameState) => {
    try {
      await writeSave(s);
      setHasSave(true);
      setSaveError(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save the game.');
    }
  }, []);

  // 1. On launch, look for an existing save.
  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await loadSave().catch(() => null);
      if (!alive) return;
      savedRef.current = saved;
      setHasSave(saved !== null);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const active = state !== null;

  // 2. While a game is running: advance time every second and autosave regularly.
  useEffect(() => {
    if (!active) return;
    const tickId = setInterval(() => {
      const cur = stateRef.current;
      if (cur) commit(tick(cur, Date.now()));
    }, TICK_MS);
    const saveId = setInterval(() => {
      const cur = stateRef.current;
      if (cur) void persist(cur);
    }, AUTOSAVE_MS);
    return () => {
      clearInterval(tickId);
      clearInterval(saveId);
    };
  }, [active, commit, persist]);

  // 3. Save when the app goes to the background; catch up when it returns.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const cur = stateRef.current;
      if (!cur) return;
      const now = Date.now();
      if (next === 'background' || next === 'inactive') {
        const ticked = tick(cur, now);
        commit(ticked);
        void persist(ticked);
      } else if (next === 'active') {
        const after = tick(cur, now);
        const summary = buildOfflineSummary(cur, after, now);
        commit(after);
        if (summary.secondsAway >= OFFLINE_SUMMARY_MIN_SECONDS) setOfflineSummary(summary);
      }
    });
    return () => sub.remove();
  }, [commit, persist]);

  const apply = useCallback(
    (fn: (s: GameState, now: number) => ActionResult): ActionResult => {
      const cur = stateRef.current;
      if (!cur) return { ok: false, reason: 'No game in progress.' };
      const result = fn(cur, Date.now());
      if (result.ok) {
        commit(result.state);
        void persist(result.state);
      }
      return result;
    },
    [commit, persist],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      ready,
      hasSave,
      state,
      offlineSummary,
      saveError,
      dismissOfflineSummary: () => setOfflineSummary(null),
      startNewGame: (config) => {
        const fresh = createNewGame(config, Date.now());
        setOfflineSummary(null);
        commit(fresh);
        void persist(fresh);
      },
      continueGame: () => {
        if (stateRef.current) return true;
        const saved = savedRef.current;
        if (!saved) return false;
        const now = Date.now();
        const after = tick(saved, now);
        const summary = buildOfflineSummary(saved, after, now);
        commit(after);
        setOfflineSummary(summary.secondsAway >= OFFLINE_SUMMARY_MIN_SECONDS ? summary : null);
        void persist(after);
        return true;
      },
      saveNow: async () => {
        const cur = stateRef.current;
        if (cur) await persist(tick(cur, Date.now()));
      },
      removeSave: async () => {
        await deleteSave();
        savedRef.current = null;
        setHasSave(false);
        setOfflineSummary(null);
        commit(null);
      },
      buy: (typeId) => apply((s, now) => buyBusiness(s, typeId, now)),
      upgrade: (typeId) => apply((s, now) => upgradeBusiness(s, typeId, now)),
      study: (entryId) => apply((s, now) => startStudy(s, entryId, now)),
      scout: (settlementId) => apply((s, now) => startScouting(s, settlementId, now)),
      discover: (entryId) => {
        const cur = stateRef.current;
        if (!cur || (cur.knowledge[entryId] ?? 0) >= 1) return;
        const next = discoverKnowledge(cur, entryId, Date.now());
        commit(next);
        void persist(next);
      },
      buyInstitution: (typeId) => apply((s, now) => buyInstitution(s, typeId, now)),
      upgradeInstitution: (typeId) => apply((s, now) => upgradeInstitution(s, typeId, now)),
      recruit: (unitId, count) => apply((s, now) => recruitUnits(s, unitId, count, now)),
      hireCommander: () => apply((s, now) => hireCommander(s, now)),
      assignCommander: (id) => apply((s, now) => setCommander(s, id, now)),
      beginBattle: (scenarioId, intel, provisions, reportIds) =>
        apply((s, now) => startBattle(s, scenarioId, { intel, provisions, reportIds }, now)),
      beginExpedition: (scenarioId, intel, provisions, reportIds) =>
        apply((s, now) => startExpedition(s, scenarioId, { intel, provisions, reportIds }, now)),
      runSimulation: (scenarioId, orderId) => apply((s, now) => runSimulation(s, scenarioId, orderId, now)),
      claimMastery: (doctrine) => apply((s, now) => claimMastery(s, doctrine, now)),
      declareWar: (rivalId) => apply((s, now) => declareWar(s, rivalId, now)),
      makePeace: () => apply((s, now) => makePeace(s, now)),
      hireSpy: () => apply((s, now) => hireSpy(s, now)),
      sendEnvoy: (rivalId, kind) => apply((s, now) => sendEnvoy(s, rivalId, kind, now)),
      respondToOffer: (offerId, accept) => apply((s, now) => respondToOffer(s, offerId, accept, now)),
      breakPact: (rivalId) => apply((s, now) => breakPact(s, rivalId, now)),
      sendSpy: (spyId, factionId, topic) => apply((s, now) => sendSpy(s, spyId, factionId, topic, now)),
      giveOrder: (order) => apply((s, now) => issueOrder(s, order, now)),
      delegate: () => apply((s, now) => delegateBattle(s, now)),
      testBoost: () => {
        const cur = stateRef.current;
        if (!cur) return;
        const next = grantTestBoost(cur, Date.now());
        commit(next);
        void persist(next);
      },
      advanceTime: (seconds) => {
        const cur = stateRef.current;
        if (!cur) return;
        const next = fastForward(cur, seconds, Date.now());
        commit(next);
        void persist(next);
      },
    }),
    [ready, hasSave, state, offlineSummary, saveError, apply, commit, persist],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}

/** For screens that only render when a game exists (the tab layout guarantees this). */
export function useGameState(): GameState {
  const { state } = useGame();
  if (!state) throw new Error('No active game');
  return state;
}
