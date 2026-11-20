import { campaignFor, goalMet, type Act } from '../data/campaigns';
import { addLog } from './log';
import type { GameState } from './types';

export const campaignKey = (actId: string) => `camp:${actId}`;

/** The act the player is on now, or null when the story is finished. */
export function currentAct(state: GameState): { act: Act; index: number; total: number } | null {
  const c = campaignFor(state.player.civId);
  if (!c) return null;
  const index = c.acts.findIndex((a) => state.achievements[campaignKey(a.id)] === undefined);
  return index < 0 ? null : { act: c.acts[index], index, total: c.acts.length };
}

/** Completes the current act when its goal is met, one act at a time (so each story beat is seen). */
export function advanceCampaign(state: GameState, now: number): GameState {
  const cur = currentAct(state);
  if (!cur || !goalMet(state, cur.act.goal)) return state;
  const finale = cur.index === cur.total - 1;
  return {
    ...state,
    achievements: { ...state.achievements, [campaignKey(cur.act.id)]: now },
    resources: { ...state.resources, gold: state.resources.gold + cur.act.reward.gold },
    reputation: state.reputation + cur.act.reward.rep,
    log: addLog(state.log, now, `${finale ? 'Campaign complete' : 'Act complete'}: ${cur.act.title} (+${cur.act.reward.gold} gold).`),
  };
}
