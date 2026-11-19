import type { GameState } from './types';
import { institutionLevel, sumUnits } from './selectors';

export type TutorialStep = {
  id: string;
  title: string;
  text: string;
  href: '/economy' | '/knowledge' | '/military' | '/overview';
  done: (s: GameState) => boolean;
};

/** The first hour, as a checklist derived entirely from game state (nothing extra to save). */
export const TUTORIAL: TutorialStep[] = [
  {
    id: 'farm',
    title: 'Plant your first Farm',
    text: 'Every empire starts with bread. Open Economy and build a Farm. It earns gold while you are away.',
    href: '/economy',
    done: (s) => s.businesses.length > 0,
  },
  {
    id: 'second',
    title: 'Open a second business',
    text: 'One income is fragile. Spread your risk with another trade.',
    href: '/economy',
    done: (s) => s.businesses.length >= 2,
  },
  {
    id: 'upgrade',
    title: 'Upgrade a business',
    text: 'Better workshops pay more. Upgrade any business to level 2.',
    href: '/economy',
    done: (s) => s.businesses.some((b) => b.level >= 2 || (b.pending?.targetLevel ?? 0) >= 2),
  },
  {
    id: 'discover',
    title: 'Discover a historical record',
    text: 'Discovering is free. Records teach you how real commanders won and lost, and that knowledge helps in war.',
    href: '/knowledge',
    done: (s) => Object.values(s.knowledge).some((v) => v >= 1),
  },
  {
    id: 'study',
    title: 'Study a record',
    text: 'Studying takes time but turns a rumour into understanding. It continues while the app is closed.',
    href: '/knowledge',
    done: (s) => Object.values(s.knowledge).some((v) => v >= 2) || !!s.study,
  },
  {
    id: 'library',
    title: 'Build a Library',
    text: 'Institutions make you stronger over the long run. A Library speeds up your studies.',
    href: '/economy',
    done: (s) => institutionLevel(s, 'library') >= 1,
  },
  {
    id: 'army',
    title: 'Raise your first soldiers',
    text: 'Once your realm is old enough, build a Barracks and train troops under Military.',
    href: '/military',
    done: (s) => sumUnits(s.army.units) > 0 || s.army.training.length > 0,
  },
];

export function tutorialProgress(state: GameState): { done: number; total: number; current: TutorialStep | null } {
  const done = TUTORIAL.filter((t) => t.done(state)).length;
  const current = TUTORIAL.find((t) => !t.done(state)) ?? null;
  return { done, total: TUTORIAL.length, current };
}
