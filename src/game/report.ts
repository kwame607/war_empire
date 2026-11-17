import { getOrder } from '../data/orders';
import { getScenario } from '../data/scenarios';
import { getUnitType, UNIT_IDS } from '../data/units';
import { classShares, getLeader } from './battle';
import { sumUnits } from './selectors';
import type { Battle, BattleReport, BattleResult, GameState, Terrain, Weather } from './types';

const TERRAIN_TEXT: Record<Terrain, string> = {
  plain: 'open plain: cavalry strong (+20%)',
  forest: 'forest: cavalry badly hampered (-40%), archers struggle (-20%), infantry sturdy (+10%)',
  hills: 'hills: archers on high ground (+15%), infantry steady (+10%), cavalry hampered (-20%)',
  river: 'a river crossing: everyone hampered, cavalry most of all (-30%)',
  desert: 'desert: infantry tire (-10%)',
};
const WEATHER_TEXT: Record<Weather, string> = {
  clear: 'clear skies',
  rain: 'rain: bowstrings slackened (archers -20%, cavalry -10%)',
  fog: 'fog: archers could not see their targets (-30%), cavalry -10%',
  heat: 'heat: infantry and cavalry wilted (-5% and -10%)',
};

const RESULT_TEXT: Record<BattleResult, string> = {
  victory: 'Victory',
  defeat: 'Defeat',
  withdrawn: 'Withdrew',
  stalemate: 'Stalemate',
};
export const resultLabel = (r: BattleResult) => RESULT_TEXT[r];

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function buildReport(state: GameState, b: Battle, result: BattleResult, now: number): BattleReport {
  const scenario = getScenario(b.scenarioId);
  const leader = getLeader(state, b.player.leaderId);
  const pStart = Math.max(1, sumUnits(b.player.initial));
  const eStart = Math.max(1, sumUnits(b.enemy.initial));
  const pLost = pStart - sumUnits(b.player.units);
  const eLost = eStart - sumUnits(b.enemy.units);
  const ratio = eLost / pStart / Math.max(0.01, pLost / pStart);

  let performance: string;
  if (result === 'victory') performance = ratio >= 2 ? 'Outstanding' : ratio >= 1 ? 'Competent' : 'A costly victory';
  else if (result === 'defeat') performance = 'Overwhelmed';
  else if (result === 'withdrawn') performance = 'Prudent: the army was saved';
  else performance = 'Indecisive';

  // Decisions
  const decisions = b.rounds.map((r) => {
    const name = getOrder(r.order).name;
    const outcome = r.success === true ? ' (succeeded)' : r.success === false ? ' (failed)' : '';
    return `Round ${r.round}: ${name}${outcome}. Enemy stance: ${r.stance}. You lost ${r.playerLoss}, they lost ${r.enemyLoss}.`;
  });

  // Enemy strengths
  const enemyStrengths: string[] = [];
  const eShare = classShares(b.enemy.initial);
  if (eShare.cavalry >= 0.3) enemyStrengths.push(`Strong cavalry (${pct(eShare.cavalry)} of their strength).`);
  if (eShare.ranged >= 0.35) enemyStrengths.push(`Many missile troops (${pct(eShare.ranged)} of their strength).`);
  if (b.enemy.initial.heavy > 0) enemyStrengths.push(`${b.enemy.initial.heavy} heavy infantry anchored their line.`);
  if (b.enemy.fortified) enemyStrengths.push('A fortified position made them hard to dislodge.');
  if (b.enemy.trait === 'cunning') enemyStrengths.push(`${b.enemy.commander} was cunning and read your manoeuvres.`);
  if (b.enemy.trait === 'cautious') enemyStrengths.push(`${b.enemy.commander} was cautious and would not be baited.`);
  if (b.enemy.trait === 'impetuous') enemyStrengths.push(`${b.enemy.commander} attacked recklessly, which can be exploited.`);
  if (sumUnits(b.enemy.initial) > sumUnits(b.player.initial)) enemyStrengths.push('They outnumbered you.');
  if (enemyStrengths.length === 0) enemyStrengths.push('No particular strength stood out.');

  // Exploited weaknesses
  const exploited: string[] = [];
  const doctrines: string[] = [];
  for (const r of b.rounds) {
    if (r.success === true) {
      exploited.push(`Round ${r.round}: ${getOrder(r.order).name} worked. ${r.notes[0]}`);
      doctrines.push(getOrder(r.order).name);
    }
  }
  const usedScorch = b.rounds.some((r) => r.order === 'scorch');
  const starvedRound = usedScorch ? b.rounds.findIndex((_, i) => scorchSupplyOut(b, i)) : -1;
  if (starvedRound >= 0) exploited.push(`The enemy ran short of supplies by round ${starvedRound + 1}.`);
  if (b.enemy.morale <= 0) exploited.push('You broke the enemy’s will to fight.');
  if (exploited.length === 0) exploited.push('No decisive weakness was exploited.');

  // Terrain and weather
  const terrainWeather = `Fought on ${TERRAIN_TEXT[b.terrain]}. Weather: ${WEATHER_TEXT[b.weather]}.`;

  // Logistics
  const ranOut = b.player.supply < 0;
  const outRound = ranOut ? b.rounds.length + b.player.supply + 1 : null;
  const logistics =
    `Provisions: ${b.player.provisions}. ` +
    (outRound
      ? `Your army ran out of supplies in round ${outRound}, cutting its attack by 25% and sapping morale.`
      : 'Supplies held for the whole battle.');

  // Lessons
  const lessons: string[] = [];
  for (const r of b.rounds) {
    if (r.success === false) lessons.push(`${getOrder(r.order).name} failed in round ${r.round}. ${r.notes[0]}`);
  }
  const reserveRound = b.rounds.find((r, i) => r.stance === 'reserve' && i >= 2);
  if (reserveRound) lessons.push('Repeating the same order let the enemy commander adapt and guard against it. Vary your orders.');
  if (outRound) lessons.push('Provision more heavily for long fights, or end them sooner.');
  if (result === 'defeat') lessons.push('A lost battle is not a lost war. Retreating earlier preserves soldiers, and studying more doctrines opens new options.');
  if (result === 'victory' && pLost / pStart > 0.5) lessons.push('The victory cost more than half your army. Scouting and better orders would have saved lives.');
  if (b.intel === 0 && result !== 'victory') lessons.push('You fought on rumour alone. Scouts reveal the enemy’s composition before you commit.');
  const unusedDoctrine = Object.entries(state.knowledge).find(([id, stage]) => stage >= 2 && ['cannae', 'buffalo-horns', 'feigned-retreat', 'russia-1812'].includes(id) && !b.rounds.some((r) => getOrder(r.order).doctrine === id));
  if (unusedDoctrine && lessons.length < 4) lessons.push('You have studied doctrines you did not use here. Check whether the ground and enemy suited one of them.');
  if (lessons.length === 0) lessons.push('A clean, well-judged battle. Keep scouting and keep varying your orders.');

  return {
    id: b.id,
    at: now,
    scenarioId: b.scenarioId,
    scenarioName: scenario.name,
    result,
    terrain: b.terrain,
    weather: b.weather,
    delegated: b.delegated,
    leader: { name: leader.name, isPlayer: leader.isPlayer, performance },
    enemyName: b.enemy.name,
    playerInitial: b.player.initial,
    playerFinal: b.player.units,
    enemyInitial: b.enemy.initial,
    enemyFinal: b.enemy.units,
    rounds: b.rounds,
    rewards: { gold: 0, food: 0, wood: 0, stone: 0, reputation: 0 },
    decisions,
    enemyStrengths,
    exploited,
    terrainWeather,
    logistics,
    lessons: lessons.slice(0, 5),
    doctrinesPracticed: doctrines,
  };
}

/** Whether the enemy was already out of supplies at the start of round index i. */
function scorchSupplyOut(b: Battle, i: number): boolean {
  const scenario = getScenario(b.scenarioId);
  let supply = scenario.enemy.supply;
  for (let k = 0; k < i; k++) supply -= 1 + (b.rounds[k].order === 'scorch' ? 2 : 0);
  return supply <= 0 && i >= 1;
}

export function describeUnits(u: Record<string, number>): string {
  const parts = UNIT_IDS.filter((id) => u[id] > 0).map((id) => `${u[id]} ${getUnitType(id).name.toLowerCase()}`);
  return parts.length ? parts.join(', ') : 'none';
}
