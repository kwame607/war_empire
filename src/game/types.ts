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
  study: { entryId: string; completesAt: number } | null;
  scouting: { settlementId: string; completesAt: number } | null;
  explored: string[];
  lastTickAt: number;
  /** Seconds of game time that have passed (offline time is capped). Drives the calendar. */
  totalSeconds: number;
  log: LogEntry[];
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
