import { getQuestion, QUIZ, type QuizQuestion } from '../data/quiz';
import { addLog, fail } from './log';
import type { ActionResult, GameState } from './types';

export const QUIZ_REWARD = { gold: 25, rep: 2 };

/** Questions from records you have at least discovered, not yet answered correctly. */
export function openQuestions(state: GameState): QuizQuestion[] {
  return QUIZ.filter((q) => (state.knowledge[q.entryId] ?? 0) >= 1 && state.quiz[q.id] === undefined);
}

export function answerQuiz(state: GameState, id: string, choice: number, now: number): ActionResult & { correct?: boolean; explain?: string } {
  const q = getQuestion(id);
  if (!q) return fail('That question no longer exists.');
  if ((state.knowledge[q.entryId] ?? 0) < 1) return fail('Discover that record first.');
  if (state.quiz[id] !== undefined) return fail('You already answered that correctly.');
  if (choice < 0 || choice >= q.options.length) return fail('Pick one of the answers.');
  if (choice !== q.answer) return { ok: true, state, correct: false, explain: q.explain };
  return {
    ok: true,
    correct: true,
    explain: q.explain,
    state: {
      ...state,
      quiz: { ...state.quiz, [id]: now },
      resources: { ...state.resources, gold: state.resources.gold + QUIZ_REWARD.gold },
      reputation: state.reputation + QUIZ_REWARD.rep,
      log: addLog(state.log, now, `Scholarship: correct answer (+${QUIZ_REWARD.gold} gold, +${QUIZ_REWARD.rep} reputation).`),
    },
  };
}
