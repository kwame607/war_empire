import { KNOWLEDGE_ENTRIES } from '../data/knowledge';
import { MILITARY_UNLOCK_STAGE } from '../data/progression';
import { garrisonNeeded } from './territoryCore';
import { getStageIndex, institutionLevel, sumUnits } from './selectors';
import type { GameState } from './types';

export type Advice = { text: string; href?: '/economy' | '/knowledge' | '/military' | '/map' };

/** A few plain-language suggestions for what to do next, most useful first. */
export function adviceFor(state: GameState): Advice[] {
  const out: (Advice & { p: number })[] = [];
  // Lower numbers are more urgent.
  const push = (a: Advice, p = 5) => out.push({ ...a, p });
  const military = getStageIndex(state) >= MILITARY_UNLOCK_STAGE;

  if (state.businesses.length === 0) push({ text: 'Build a Farm to start earning gold.', href: '/economy' }, 1);
  else if (state.resources.gold >= 250 && state.businesses.length < 5 && !state.businesses.some((b) => b.pending)) {
    push({ text: 'You have gold to spare. Open another business, or upgrade one you own.', href: '/economy' }, 4);
  }

  const studying = !!state.study;
  const undiscovered = KNOWLEDGE_ENTRIES.find((e) => (state.knowledge[e.id] ?? 0) === 0);
  const discovered = KNOWLEDGE_ENTRIES.find((e) => (state.knowledge[e.id] ?? 0) === 1);
  if (undiscovered && !studying) push({ text: `Discover a historical record (free): try "${undiscovered.title}".`, href: '/knowledge' }, 6);
  else if (discovered && !studying) push({ text: `Study "${discovered.title}" to reach Understanding.`, href: '/knowledge' }, 6);

  if (state.reputation >= 4 && institutionLevel(state, 'library') < 1) push({ text: 'Build a Library to study faster.', href: '/economy' }, 5);

  if (military) {
    if (institutionLevel(state, 'barracks') < 1) push({ text: 'You can now raise an army. Build a Barracks first.', href: '/economy' }, 3);
    else if (sumUnits(state.army.units) + state.army.training.reduce((a, b) => a + b.count, 0) === 0) {
      push({ text: 'Train your first soldiers in Military → Army.', href: '/military' }, 3);
    } else if (state.reports.length === 0 && !state.battle && !state.expedition) {
      push({ text: 'Try your first operation in Military → Operations. Scout first to see what you face.', href: '/military' }, 3);
    }
  }

  if (state.world.offers.length > 0) push({ text: 'A kingdom is waiting for your reply (Map → Diplomacy).', href: '/map' }, 2);
  if (state.war) push({ text: 'You are at war. Fight the campaign in Military → Operations, or sue for peace in Map → Diplomacy.', href: '/military' }, 2);
  if (state.territories.length > 0 && sumUnits(state.army.units) < garrisonNeeded(state)) {
    push({ text: 'Your garrison is thin. Provinces may revolt unless you train more soldiers.', href: '/military' }, 2);
  }
  if (state.battle) push({ text: 'A battle is waiting for your orders.', href: '/military' }, 0);

  return out.sort((a, b) => a.p - b.p).slice(0, 3).map(({ text, href }) => ({ text, href }));
}
