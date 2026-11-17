/** Core game types. Pure data shapes: no UI code lives here. */

export type Resources = {
  gold: number;
  food: number;
  wood: number;
  stone: number;
};

export type ResourceKey = keyof Resources;

export type AttributeKey = 'intelligence' | 'leadership' | 'negotiation' | 'military' | 'administration';

export type Attributes = Record<AttributeKey, number>;

/** Multipliers a civilisation can apply. 1 means "no change". */
export type Modifiers = {
  goldIncomeMult: number;
  woodOutputMult: number;
  buildTimeMult: number;
  studyCostMult: number;
  startGoldBonus: number;
};

export type ContinentId = 'nordheim' | 'valoria' | 'azrakar' | 'eshara' | 'myrath' | 'islands';

export type Civilisation = {
  id: string;
  name: string;
  inspiredBy: string;
  startSettlementId: string;
  tagline: string;
  history: string;
  modifiers: Modifiers;
  perks: string[];
};

export type Background = {
  id: string;
  name: string;
  summary: string;
  startResources: Partial<Resources>;
  startReputation: number;
  attributeBonus: Partial<Attributes>;
};

export type Difficulty = {
  id: string;
  name: string;
  summary: string;
  startGoldMult: number;
  expenseMult: number;
};

export type SettlementKind = 'city' | 'port' | 'village' | 'mine' | 'ruins' | 'farmland';

export type Settlement = {
  id: string;
  name: string;
  continentId: ContinentId;
  x: number;
  y: number;
  kind: SettlementKind;
  population: number;
  terrain: string;
  resources: string[];
  description: string;
};

export type Continent = {
  id: ContinentId;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
  blurb: string;
};

export type BusinessType = {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons glyph name
  cost: Partial<Resources>;
  buildSeconds: number;
  incomePerHour: number;
  expensesPerHour: number;
  produces?: { resource: ResourceKey; perHour: number };
  employees: number;
  maxLevel: number;
  requiresReputation: number;
};

export type BusinessInstance = {
  typeId: string;
  /** Level that is currently producing. 0 while the first construction is in progress. */
  level: number;
  /** If a build or upgrade is underway: when it finishes (ms since epoch) and what level it reaches. */
  pending: { completesAt: number; targetLevel: number } | null;
};

export type KnowledgeStage = 0 | 1 | 2 | 3; // 0 unknown, 1 Discovery, 2 Understanding, 3 Practical, (4 Mastery reserved)

export type KnowledgeSection = { heading: string; body: string; unlocksAtStage: 1 | 2 };

export type KnowledgeEntry = {
  id: string;
  title: string;
  era: string;
  summary: string;
  studyCost: number;
  studySeconds: number;
  sections: KnowledgeSection[];
};

export type LogEntry = { at: number; text: string };

export type PlayerInfo = {
  name: string;
  civId: string;
  backgroundId: string;
  difficultyId: string;
  startSettlementId: string;
  createdAt: number;
};

export type GameState = {
  version: number;
  player: PlayerInfo;
  resources: Resources;
  attributes: Attributes;
  reputation: number;
  businesses: BusinessInstance[];
  /** knowledge entry id -> stage (see KnowledgeStage) */
  knowledge: Record<string, number>;
  study: { entryId: string; completesAt: number; totalSeconds?: number } | null;
  scouting: { settlementId: string; completesAt: number } | null;
  explored: string[];
  lastTickAt: number;
  /** Seconds of game time that have passed (offline time is capped). Drives the calendar. */
  totalSeconds: number;
  log: LogEntry[];
  // --- added in save version 2 ---
  institutions: InstitutionInstance[];
  army: ArmyState;
  commanders: Commander[];
  battle: Battle | null;
  reports: BattleReport[];
  /** scenario id -> time (ms) when it can be fought again */
  scenarioReadyAt: Record<string, number>;
  rngSeed: number;
};

export type NewGameConfig = {
  name: string;
  civId: string;
  backgroundId: string;
  difficultyId: string;
};

export type ActionResult = { ok: true; state: GameState } | { ok: false; reason: string };

export type OfflineSummary = {
  secondsAway: number;
  secondsCounted: number;
  gained: Resources;
  events: string[];
};

// ---------------------------------------------------------------------------
// Institutions
// ---------------------------------------------------------------------------

export type InstitutionType = {
  id: string;
  name: string;
  description: string;
  icon: string; // Ionicons glyph name
  cost: Partial<Resources>;
  buildSeconds: number;
  upkeepPerHour: number;
  maxLevel: number;
  requiresReputation: number;
  /** Number of historical records the player must have reached "Understanding" on. */
  requiresUnderstood?: number;
  requiresInstitution?: { id: string; level: number };
  /** What the institution does at each level (index 0 = level 1). Shown in the UI. */
  effects: string[];
};

export type InstitutionInstance = {
  typeId: string;
  level: number;
  pending: { completesAt: number; targetLevel: number } | null;
};

// ---------------------------------------------------------------------------
// Army
// ---------------------------------------------------------------------------

export type UnitId = 'spearmen' | 'archers' | 'cavalry' | 'heavy';
export type UnitClass = 'infantry' | 'ranged' | 'cavalry';
export type UnitCounts = Record<UnitId, number>;

export type UnitType = {
  id: UnitId;
  name: string;
  description: string;
  unitClass: UnitClass;
  attack: number;
  defence: number;
  cost: Partial<Resources>;
  trainSecondsEach: number;
  upkeepGold: number; // per hour
  upkeepFood: number; // per hour
  requires: { institution: string; level: number };
};

export type TrainingBatch = { unitId: UnitId; count: number; completesAt: number };

export type ArmyState = {
  /** Soldiers at home, ready to deploy. */
  units: UnitCounts;
  training: TrainingBatch[];
  /** Commander leading the army, or null if the player leads in person. */
  commanderId: string | null;
};

export type CommanderTrait = 'bold' | 'cautious' | 'quartermaster' | 'scholar';

export type Commander = {
  id: string;
  name: string;
  tactics: number;
  logistics: number;
  leadership: number;
  trait: CommanderTrait;
  xp: number;
  battles: number;
  victories: number;
};

// ---------------------------------------------------------------------------
// Battle
// ---------------------------------------------------------------------------

export type Terrain = 'plain' | 'forest' | 'hills' | 'river' | 'desert';
export type Weather = 'clear' | 'rain' | 'fog' | 'heat';
export type EnemyStance = 'aggressive' | 'steady' | 'defensive' | 'reserve';
export type EnemyTrait = 'impetuous' | 'cautious' | 'cunning';
export type OrderId =
  | 'hold'
  | 'advance'
  | 'concentrate'
  | 'fortify'
  | 'retreat'
  | 'envelop'
  | 'horns'
  | 'feint'
  | 'scorch';
export type Provisions = 'light' | 'standard' | 'ample';
export type Setup = { kind: 'envelop' | 'feint' } | null;

export type RoundRecord = {
  round: number;
  order: OrderId;
  stance: EnemyStance;
  playerLoss: number;
  enemyLoss: number;
  playerMorale: number;
  enemyMorale: number;
  /** null for orders that have no success condition */
  success: boolean | null;
  notes: string[];
};

export type Battle = {
  id: string;
  scenarioId: string;
  round: number;
  maxRounds: number;
  terrain: Terrain;
  weather: Weather;
  player: {
    units: UnitCounts;
    initial: UnitCounts;
    morale: number;
    supply: number;
    leaderId: string | null;
    provisions: Provisions;
  };
  enemy: {
    name: string;
    commander: string;
    trait: EnemyTrait;
    units: UnitCounts;
    initial: UnitCounts;
    morale: number;
    supply: number;
    fortified: boolean;
    basePosture: EnemyStance | null;
    lastStance: EnemyStance | null;
  };
  /** 0 = rumours only, 1 = scouted, 2 = thoroughly scouted */
  intel: 0 | 1 | 2;
  setup: Setup;
  lastOrder: OrderId | null;
  repeatCount: number;
  rounds: RoundRecord[];
  seed: number;
  delegated: boolean;
};

export type BattleResult = 'victory' | 'defeat' | 'withdrawn' | 'stalemate';

export type BattleReport = {
  id: string;
  at: number;
  scenarioId: string;
  scenarioName: string;
  result: BattleResult;
  terrain: Terrain;
  weather: Weather;
  delegated: boolean;
  leader: { name: string; isPlayer: boolean; performance: string };
  enemyName: string;
  playerInitial: UnitCounts;
  playerFinal: UnitCounts;
  enemyInitial: UnitCounts;
  enemyFinal: UnitCounts;
  rounds: RoundRecord[];
  rewards: { gold: number; food: number; wood: number; stone: number; reputation: number };
  decisions: string[];
  enemyStrengths: string[];
  exploited: string[];
  terrainWeather: string;
  logistics: string;
  lessons: string[];
  doctrinesPracticed: string[];
};
