import { ACHIEVEMENTS } from '../data/achievements';
import { addLog } from './log';
import type { GameState } from './types';

/** Awards any newly completed achievement (once) with its small reward. Called from tick(). */
export function unlockAchievements(state: GameState, now: number): GameState {
  let next = state;
  for (const a of ACHIEVEMENTS) {
    if (next.achievements[a.id] !== undefined || !a.done(next)) continue;
    next = {
      ...next,
      achievements: { ...next.achievements, [a.id]: now },
      resources: { ...next.resources, gold: next.resources.gold + (a.reward.gold ?? 0) },
      reputation: next.reputation + (a.reward.rep ?? 0),
      log: addLog(next.log, now, `Achievement: ${a.title}${a.reward.gold ? ` (+${a.reward.gold} gold)` : ''}.`),
    };
  }
  return next;
}
