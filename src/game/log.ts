import { MAX_LOG_ENTRIES } from './constants';
import type { ActionResult, LogEntry } from './types';

export const fail = (reason: string): ActionResult => ({ ok: false, reason });

export function addLog(log: LogEntry[], at: number, text: string): LogEntry[] {
  return [...log, { at, text }].slice(-MAX_LOG_ENTRIES);
}
