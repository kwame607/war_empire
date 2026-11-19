import { getEventDef } from '../data/events';
import type { GameState, OfflineSummary } from './types';

/** Turns an offline summary into a short, readable story of what happened while the ruler was away. */
export function chronicleFor(state: GameState, s: OfflineSummary): string[] {
  const out: string[] = [];
  const away = s.secondsAway;
  const name = state.player.name;

  const opening =
    away < 3600
      ? 'A short while passed.'
      : away < 6 * 3600
        ? 'The sun crossed the sky once or twice before you returned.'
        : away < 24 * 3600
          ? 'A day and a night went by in the realm.'
          : 'Days passed, and the realm carried on without its ruler.';
  const gold = s.gained.gold;
  let money: string;
  if (gold >= 300) money = 'The treasury swelled, and the counting-house clerks ran out of ledger pages.';
  else if (gold >= 60) money = 'Coin flowed in steadily from your workshops and fields.';
  else if (gold > 0.5) money = 'A little gold trickled into the treasury.';
  else if (gold < -0.5) money = 'Wages and upkeep outran your income, and the treasury shrank.';
  else money = 'The treasury stood unchanged.';
  out.push(`${opening} ${money}`);

  const built = s.events.filter((e) => /complete|upgraded|trained|ready|returned|finished|learned|understood/i.test(e));
  if (built.length > 0) {
    out.push(`Work was done in your absence. ${built.slice(0, 3).join(' ')}`);
  }

  const goods: string[] = [];
  if (s.gained.food >= 5) goods.push('granaries filled');
  if (s.gained.wood >= 5) goods.push('timber was stacked');
  if (s.gained.stone >= 5) goods.push('cut stone piled up');
  if (goods.length > 0) out.push(`Meanwhile ${goods.join(', ')}.`);

  const waiting: string[] = [];
  const ev = state.event ? getEventDef(state.event.id) : undefined;
  if (ev) waiting.push(`“${ev.title}” needs your decision`);
  if (state.battle) waiting.push('a battle awaits your orders');
  if (state.war) waiting.push('the war with your rival is not over');
  if (state.world.offers.length > 0) waiting.push('a foreign court is waiting for your reply');
  if (waiting.length > 0) out.push(`${name}, ${waiting.join('; ')}.`);
  else out.push(`${name}, nothing demands you at this hour. Plan your next move.`);

  return out;
}
