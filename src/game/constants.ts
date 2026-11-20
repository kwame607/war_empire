export const SAVE_VERSION = 13;

/** Production counts for at most this long while the player is away. */
export const OFFLINE_CAP_SECONDS = 12 * 3600;

/** Away shorter than this does not trigger a "welcome back" summary. */
export const OFFLINE_SUMMARY_MIN_SECONDS = 60;

/** How many builds/upgrades can run at once. */
export const BUILD_SLOTS = 2;

/** 1 real hour = 1 game day. */
export const SECONDS_PER_GAME_DAY = 3600;
export const DAYS_PER_SEASON = 90;
export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

export const SCOUT_COST_GOLD = 40;
export const SCOUT_SECONDS = 45;

export const MAX_LOG_ENTRIES = 30;

// --- Military ---
export const BATTLE_ROUNDS = 6;
export const MAX_TRAINING_BATCHES = 3;
export const SCENARIO_COOLDOWN_SECONDS = 600;
export const MAX_REPORTS = 20;
export const ARMY_CAPACITY_PER_BARRACKS_LEVEL = 20;
/** Gold cost to send scouts before a battle, for intel level 1 and 2. */
export const INTEL_COST_GOLD = [60, 120] as const;
export const COMMANDER_BASE_COST_GOLD = 150;
export const PROVISION_ROUNDS = { light: 3, standard: 5, ample: 7 } as const;
export const FOOD_PER_MAN_PER_ROUND = 0.5;

// --- Intelligence ---
export const SPY_HIRE_COST_GOLD = 120;
export const SPY_MISSION_COST_GOLD = 80;
export const SPY_MISSION_SECONDS = 90;
export const MAX_INTEL_REPORTS = 30;

// --- Living world (v0.4) ---
export const WORLD_TURN_SECONDS = 1800;
export const WORLD_MAX_CATCHUP_TURNS = 24;
export const OFFER_LIFETIME_TURNS = 6;
export const ENVOY_SECONDS = 120;
export const ENVOY_COST_GOLD = { goodwill: 100, trade: 60, alliance: 150 } as const;
export const TRADE_PACT_GOLD_PER_HOUR = 18;
export const ALLIANCE_GOLD_PER_HOUR = 10;

// --- Expeditions (v0.5) ---
export const EXPEDITION_SECONDS = { Easy: 300, Medium: 900, Hard: 1800 } as const;

// --- Mastery (v0.6) ---
export const SIM_COST_GOLD = 40;
export const MASTERY_REQUIRES = { battles: 2, sims: 3, terrains: 2 } as const;
export const MASTERY_BOOST = 1.28;
export const PRACTICAL_BOOST = 1.15;

// --- War (v0.7) ---
export const WAR_RELATION_ON_DECLARE = -50;
export const WAR_ENEMY_SHARE = 0.6;

// --- Territory (v0.8) ---
export const ANNEX_WINS_REQUIRED = 2;
export const GARRISON_PER_PROVINCE = 18;
export const REVOLT_CHANCE = 0.15;

// --- Navy (v0.9) ---
export const SHIP_COST = { gold: 120, wood: 40 } as const;
export const SHIP_SECONDS = 20;
export const SHIP_UPKEEP_GOLD = 1.5;
export const FLEET_CAPACITY_PER_LEVEL = [4, 12, 20] as const;
export const FLEET_DETERS_RAIDS_AT = 3;

/** Seconds between random events (a random gap in this range). */
export const EVENT_GAP_MIN_S = 25 * 60;
export const EVENT_GAP_MAX_S = 60 * 60;
