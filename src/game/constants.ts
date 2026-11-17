export const SAVE_VERSION = 2;

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
