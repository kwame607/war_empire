import { mulberry32 } from './battle';
import type { GameState, NavalReport, NavalTactic, Rival, RivalTrait } from './types';

export const NAVAL_TACTICS: { id: NavalTactic; name: string; text: string }[] = [
  { id: 'line', name: 'Line of battle', text: 'Keep formation and pound them with missiles. Strong against boarders.' },
  { id: 'board', name: 'Grapple and board', text: 'Close and fight on the decks. Strong against fast skirmishers.' },
  { id: 'screen', name: 'Fast screen', text: 'Darting, harassing ships. Strong against a slow line.' },
];

/** line beats board, board beats screen, screen beats line. */
const BEATS: Record<NavalTactic, NavalTactic> = { line: 'board', board: 'screen', screen: 'line' };

/** How a kingdom's fleet tends to fight. */
const HABIT: Record<RivalTrait, NavalTactic> = {
  expansionist: 'board',
  mercantile: 'screen',
  honourable: 'line',
  treacherous: 'screen',
};

export function habitOf(rival: Rival): NavalTactic {
  return HABIT[rival.trait];
}

export function enemyFleetSize(rival: Rival): number {
  return Math.max(3, Math.round(rival.power * 0.12) + (rival.holdings.length > 1 ? 1 : 2));
}

/** Island kingdoms cannot be reached by land. */
export function needsSeaControl(rival: Rival): boolean {
  return rival.id === 'serene';
}

export function seaControlBlocker(state: GameState, scenarioId: string): string | null {
  const war = state.war;
  if (!war || war.scenario.id !== scenarioId) return null;
  const rival = state.world.rivals.find((r) => r.id === war.rivalId);
  if (rival && needsSeaControl(rival) && !war.seaControl) return `${rival.name} lies across the sea. Win command of the sea with your fleet first (Military → Navy).`;
  return null;
}

/** Three exchanges of fire. Each side loses ships in proportion to what the other brings and the matchup. */
export function resolveNaval(state: GameState, rival: Rival, plan: NavalTactic[], seed: number, now: number): { report: NavalReport; shipsLeft: number } {
  const rng = mulberry32((seed + 31337) >>> 0);
  const shipsBefore = state.fleet.ships;
  const enemyBefore = enemyFleetSize(rival);
  let mine = shipsBefore;
  let theirs = enemyBefore;
  const lines: string[] = [];
  const habit = habitOf(rival);
  plan.forEach((t, i) => {
    if (mine <= 0 || theirs <= 0) return;
    // They follow their habit 60% of the time, and otherwise try something else.
    const others = (['line', 'board', 'screen'] as NavalTactic[]).filter((x) => x !== habit);
    const enemy = rng() < 0.6 ? habit : others[Math.floor(rng() * others.length)];
    const edge = BEATS[t] === enemy ? 1.35 : BEATS[enemy] === t ? 0.7 : 1;
    const mineDmg = Math.max(0.3, mine * 0.3 * edge * (0.85 + rng() * 0.3));
    const theirDmg = Math.max(0.3, theirs * 0.3 * (edge === 1 ? 1 : edge > 1 ? 0.7 : 1.35) * (0.85 + rng() * 0.3));
    const theirLoss = Math.min(theirs, Math.round(mineDmg));
    const myLoss = Math.min(mine, Math.round(theirDmg));
    theirs -= theirLoss;
    mine -= myLoss;
    const how = edge > 1 ? 'You held the advantage' : edge < 1 ? 'They had the better of it' : 'An even exchange';
    lines.push(`Round ${i + 1}: you chose ${t}, they fought by ${enemy}. ${how}. You lost ${myLoss}, they lost ${theirLoss}.`);
  });
  const won = theirs < mine && mine > 0;
  lines.push(won ? 'Their fleet is broken or driven off. The sea is yours.' : 'Your fleet could not win the sea this time.');
  return {
    shipsLeft: mine,
    report: { at: now, rivalName: rival.name, won, shipsBefore, shipsLost: shipsBefore - mine, enemyBefore, enemyLost: enemyBefore - theirs, lines },
  };
}
