import * as SQLite from 'expo-sqlite';

import { SAVE_VERSION } from '@/game/constants';
import type { GameState } from '@/game/types';

/**
 * Local save storage in SQLite.
 * The whole game state is stored as one JSON document in a `saves` table (one row per slot).
 * That keeps saving simple and atomic, and the table can later gain more slots or a
 * cloud-sync timestamp without changing the game code.
 *
 * If SQLite is unavailable (for example the browser preview), it falls back to memory so
 * the game still runs, but nothing survives a reload.
 */

const DB_NAME = 'war-empire.db';
const SLOT = 'main';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let memorySave: string | null = null;
let useMemory = false;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS saves (
          slot TEXT PRIMARY KEY NOT NULL,
          version INTEGER NOT NULL,
          data TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

function parseSave(json: string): GameState | null {
  try {
    const raw = JSON.parse(json) as Partial<GameState>;
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.version !== 'number' || raw.version > SAVE_VERSION) return null;
    if (!raw.player || !raw.resources || !Array.isArray(raw.businesses)) return null;
    // Future save-format migrations go here, keyed on raw.version.
    return raw as GameState;
  } catch {
    return null;
  }
}

export async function loadSave(): Promise<GameState | null> {
  if (!useMemory) {
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM saves WHERE slot = ?', SLOT);
      return row ? parseSave(row.data) : null;
    } catch (e) {
      console.warn('SQLite unavailable, using memory storage:', e);
      useMemory = true;
    }
  }
  return memorySave ? parseSave(memorySave) : null;
}

export async function writeSave(state: GameState): Promise<void> {
  const json = JSON.stringify(state);
  if (!useMemory) {
    try {
      const db = await getDb();
      await db.runAsync(
        'INSERT OR REPLACE INTO saves (slot, version, data, updated_at) VALUES (?, ?, ?, ?)',
        SLOT,
        state.version,
        json,
        Date.now(),
      );
      return;
    } catch (e) {
      console.warn('SQLite write failed, using memory storage:', e);
      useMemory = true;
    }
  }
  memorySave = json;
}

export async function deleteSave(): Promise<void> {
  memorySave = null;
  if (!useMemory) {
    const db = await getDb();
    await db.runAsync('DELETE FROM saves WHERE slot = ?', SLOT);
  }
}
