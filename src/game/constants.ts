export const SAVE_VERSION = 1;

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
