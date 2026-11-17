import { getScenario } from '../data/scenarios';
import { getUnitType, UNIT_IDS } from '../data/units';
import { mulberry32 } from './battle';
import { MAX_INTEL_REPORTS } from './constants';
import { addLog } from './log';
import { bureauLevel } from './selectors';
import type {
  Battle,
  EnemyStance,
  EnemyTrait,
  GameState,
  IntelClaims,
  IntelQuality,
  IntelReport,
  IntelTopic,
  Spy,
  SpyMission,
  UnitClass,
} from './types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const TOPIC_LABEL: Record<IntelTopic, string> = {
  strength: 'Strength',
  commander: 'Commander',
  plans: 'Plans',
  defences: 'Defences',
};

export const TOPIC_HELP: Record<IntelTopic, string> = {
  strength: 'How many soldiers, and of what kind.',
  commander: 'What the enemy leader is like.',
  plans: 'How the enemy means to open the fight.',
  defences: 'Fortifications and supplies.',
};

export const QUALITY_TEXT: Record<IntelQuality, string> = {
  accurate: 'accurate',
  incomplete: 'accurate but incomplete',
  outdated: 'out of date',
  misleading: 'misleading',
  fabricated: 'fabricated',
};

const TRAIT_DESC: Record<EnemyTrait, string> = {
  impetuous: 'rash and quick to attack',
  cautious: 'careful and unwilling to be baited',
  cunning: 'sly and quick to read an opponent’s plans',
};

const STANCE_DESC: Record<EnemyStance, string> = {
  aggressive: 'to attack in force',
  steady: 'to hold a steady line',
  defensive: 'to stay behind his defences',
  reserve: 'to hold back reserves and guard his flanks',
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// The truth about a rival (only the game knows this)
// ---------------------------------------------------------------------------

export type FactionTruth = {
  name: string;
  commander: string;
  trait: EnemyTrait;
  classes: Record<UnitClass, number>;
  total: number;
  fortified: boolean;
  supply: number;
  opening: EnemyStance;
};

export function factionTruth(factionId: string): FactionTruth {
  const e = getScenario(factionId).enemy;
  const classes: Record<UnitClass, number> = { infantry: 0, ranged: 0, cavalry: 0 };
  for (const id of UNIT_IDS) classes[getUnitType(id).unitClass] += e.units[id];
  return {
    name: e.name,
    commander: e.commander,
    trait: e.trait,
    classes,
    total: classes.infantry + classes.ranged + classes.cavalry,
    fortified: e.fortified,
    supply: e.supply,
    opening: e.basePosture ?? (e.trait === 'impetuous' ? 'aggressive' : 'steady'),
  };
}

// ---------------------------------------------------------------------------
// How good is a report? (Skill and the Bureau raise the odds of an honest one.)
// ---------------------------------------------------------------------------

export function accurateChance(skill: number, bureau: number): number {
  return clamp(0.35 + 0.06 * skill + 0.04 * Math.max(0, bureau - 1), 0.2, 0.92);
}

export function rollQuality(skill: number, bureau: number, rng: () => number): IntelQuality {
  const pAcc = accurateChance(skill, bureau);
  const r = rng();
  if (r < pAcc) return 'accurate';
  const rest = (r - pAcc) / (1 - pAcc);
  if (rest < 0.35) return 'incomplete';
  if (rest < 0.6) return 'outdated';
  if (rest < 0.85) return 'misleading';
  return 'fabricated';
}

export function caughtChance(skill: number, bureau: number): number {
  return clamp(0.3 - 0.04 * skill - 0.04 * bureau, 0.04, 0.4);
}

// ---------------------------------------------------------------------------
// Writing the report
// ---------------------------------------------------------------------------

type Counts = Record<UnitClass, number>;

function sizeClaim(counts: Counts, scale: number, rng: () => number): { claims: IntelClaims; desc: string } {
  const pt = (n: number) => Math.round(n * scale * (0.93 + rng() * 0.14));
  const p: Counts = { infantry: pt(counts.infantry), ranged: pt(counts.ranged), cavalry: pt(counts.cavalry) };
  const range = (n: number): [number, number] => [Math.max(0, Math.floor(n * 0.9)), Math.ceil(n * 1.1)];
  const classes: Record<UnitClass, [number, number]> = {
    infantry: range(p.infantry),
    ranged: range(p.ranged),
    cavalry: range(p.cavalry),
  };
  const total: [number, number] = [
    classes.infantry[0] + classes.ranged[0] + classes.cavalry[0],
    classes.infantry[1] + classes.ranged[1] + classes.cavalry[1],
  ];
  const desc = `about ${p.infantry} foot soldiers, ${p.ranged} archers and ${p.cavalry > 0 ? `${p.cavalry} horsemen` : 'no horsemen'}`;
  return { claims: { size: { total, classes } }, desc };
}

const pick = <T>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

export function generateReport(
  state: GameState,
  spy: Spy,
  mission: SpyMission,
  quality: IntelQuality,
  rng: () => number,
  at: number,
): IntelReport {
  const t = factionTruth(mission.factionId);
  const topic = mission.topic;
  let claims: IntelClaims = {};
  let text = '';
  let ageLabel: string | null = null;
  const who = spy.name;
  const STALE = 'Gathered several weeks ago';

  const otherTraits = (['impetuous', 'cautious', 'cunning'] as EnemyTrait[]).filter((x) => x !== t.trait);
  const allStances: EnemyStance[] = ['aggressive', 'steady', 'defensive', 'reserve'];
  const otherStances = allStances.filter((x) => x !== t.opening);

  if (topic === 'strength') {
    if (quality === 'accurate') {
      const c = sizeClaim(t.classes, 1, rng);
      claims = c.claims;
      text = `${who} counted the camp: ${c.desc}.`;
    } else if (quality === 'incomplete') {
      const lo = Math.floor(t.total * 0.65);
      const hi = Math.ceil(t.total * 1.35);
      claims = { size: { total: [lo, hi] } };
      text = `${who} saw the main camp but could not count the horse lines or the archers. Perhaps ${lo} to ${hi} men in all.`;
    } else if (quality === 'outdated') {
      const c = sizeClaim(t.classes, 0.7, rng);
      claims = c.claims;
      ageLabel = STALE;
      text = `Counted some weeks ago: ${c.desc}. The camp may have changed since.`;
    } else if (quality === 'misleading') {
      const c = sizeClaim(t.classes, rng() < 0.5 ? 0.55 : 1.7, rng);
      claims = c.claims;
      text = `${who} counted the camp: ${c.desc}.`;
    } else {
      const fake: Counts = { infantry: 4 + Math.floor(rng() * 16), ranged: Math.floor(rng() * 10), cavalry: Math.floor(rng() * 10) };
      const c = sizeClaim(fake, 1, rng);
      claims = c.claims;
      text = `${who} counted the camp: ${c.desc}.`;
    }
  } else if (topic === 'commander') {
    if (quality === 'accurate') {
      claims = { traits: [t.trait] };
      text = `${t.commander} is ${TRAIT_DESC[t.trait]}.`;
    } else if (quality === 'incomplete') {
      const o = pick(otherTraits, rng);
      claims = { traits: rng() < 0.5 ? [t.trait, o] : [o, t.trait] };
      text = `${t.commander} is hard to read. ${who} could say only that he is either ${TRAIT_DESC[claims.traits![0]]} or ${TRAIT_DESC[claims.traits![1]]}.`;
    } else if (quality === 'outdated') {
      const o = pick(otherTraits, rng);
      claims = { traits: [o] };
      ageLabel = STALE;
      text = `Last season ${t.commander} was ${TRAIT_DESC[o]}. Command may have changed.`;
    } else {
      const o = pick(otherTraits, rng);
      claims = { traits: [o] };
      text = `${t.commander} is ${TRAIT_DESC[o]}.`;
    }
  } else if (topic === 'plans') {
    const opposite: Record<EnemyStance, EnemyStance> = {
      aggressive: 'defensive',
      defensive: 'aggressive',
      steady: 'reserve',
      reserve: 'aggressive',
    };
    if (quality === 'accurate') {
      claims = { stance: t.opening };
      text = `${t.commander} intends ${STANCE_DESC[t.opening]}.`;
    } else if (quality === 'incomplete') {
      claims = {};
      text = `${t.commander} is preparing to move, but ${who} could not learn how he means to fight.`;
    } else if (quality === 'outdated') {
      const o = pick(otherStances, rng);
      claims = { stance: o };
      ageLabel = STALE;
      text = `Some weeks ago ${t.commander} meant ${STANCE_DESC[o]}. His plans may have changed.`;
    } else if (quality === 'misleading') {
      const o = opposite[t.opening];
      claims = { stance: o };
      text = `${t.commander} intends ${STANCE_DESC[o]}.`;
    } else {
      const o = pick(otherStances, rng);
      claims = { stance: o };
      text = `${t.commander} intends ${STANCE_DESC[o]}.`;
    }
  } else {
    const fortText = (f: boolean) => (f ? 'are dug in behind ditches and palisades' : 'have no real fortifications');
    if (quality === 'accurate') {
      claims = { fortified: t.fortified, supply: t.supply };
      text = `The ${t.name} ${fortText(t.fortified)}, with supplies for about ${t.supply} rounds of fighting.`;
    } else if (quality === 'incomplete') {
      claims = { fortified: t.fortified };
      text = `The ${t.name} ${fortText(t.fortified)}. ${who} could not get into the supply stores.`;
    } else if (quality === 'outdated') {
      const s = Math.max(1, t.supply + (rng() < 0.5 ? -2 : 2));
      claims = { fortified: t.fortified, supply: s };
      ageLabel = STALE;
      text = `The ${t.name} ${fortText(t.fortified)}, with supplies for about ${s} rounds (as of some weeks ago).`;
    } else if (quality === 'misleading') {
      claims = { fortified: !t.fortified, supply: t.supply };
      text = `The ${t.name} ${fortText(!t.fortified)}, with supplies for about ${t.supply} rounds of fighting.`;
    } else {
      const f = rng() < 0.5;
      const s = 1 + Math.floor(rng() * 8);
      claims = { fortified: f, supply: s };
      text = `The ${t.name} ${fortText(f)}, with supplies for about ${s} rounds of fighting.`;
    }
  }

  const confidence: IntelReport['confidence'] =
    quality === 'accurate'
      ? rng() < 0.6
        ? 'high'
        : 'medium'
      : quality === 'incomplete'
        ? 'low'
        : quality === 'outdated'
          ? 'medium'
          : quality === 'misleading'
            ? rng() < 0.7
              ? 'high'
              : 'medium'
            : 'high';

  void state;
  return {
    id: `r-${mission.id}`,
    at,
    factionId: mission.factionId,
    topic,
    spyId: spy.id,
    spyName: spy.name,
    quality,
    verified: false,
    ageLabel,
    confidence,
    text,
    claims,
  };
}

// ---------------------------------------------------------------------------
// Missions finish on their own, even while the player is away.
// ---------------------------------------------------------------------------

export function resolveMissions(state: GameState, now: number): GameState {
  const due = state.intel.missions.filter((m) => m.completesAt <= now).sort((a, b) => a.completesAt - b.completesAt);
  if (due.length === 0) return state;

  let spies = [...state.intel.spies];
  let reports = [...state.intel.reports];
  let log = state.log;
  const missions = state.intel.missions.filter((m) => m.completesAt > now);
  const level = bureauLevel(state);

  for (const m of due) {
    const spy = spies.find((s) => s.id === m.spyId);
    if (!spy) continue;
    const rng = mulberry32((hashString(m.id) + state.rngSeed) >>> 0);
    const target = getScenario(m.factionId).enemy.name;
    if (rng() < caughtChance(spy.skill, level)) {
      spies = spies.filter((s) => s.id !== spy.id);
      log = addLog(log, m.completesAt, `${spy.name} was caught spying on the ${target} and is lost to you.`);
      continue;
    }
    const quality = rollQuality(spy.skill, level, rng);
    const report = generateReport(state, spy, m, quality, rng, m.completesAt);
    reports = [report, ...reports].slice(0, MAX_INTEL_REPORTS);
    spies = spies.map((s) => (s.id === spy.id ? { ...s, missions: s.missions + 1 } : s));
    log = addLog(log, m.completesAt, `${spy.name} has returned with a report on the ${target}.`);
  }

  return { ...state, log, intel: { spies, missions, reports } };
}

// ---------------------------------------------------------------------------
// Corroboration: do independent reports agree?
// ---------------------------------------------------------------------------

export type Agreement = 'agree' | 'conflict' | 'unclear';

export function compareReports(a: IntelReport, b: IntelReport): Agreement {
  if (a.factionId !== b.factionId || a.topic !== b.topic) return 'unclear';
  const mid = (r: [number, number]) => (r[0] + r[1]) / 2;
  switch (a.topic) {
    case 'strength': {
      if (!a.claims.size || !b.claims.size) return 'unclear';
      const x = mid(a.claims.size.total);
      const y = mid(b.claims.size.total);
      if (Math.max(x, y) === 0) return 'agree';
      return Math.min(x, y) / Math.max(x, y) >= 0.75 ? 'agree' : 'conflict';
    }
    case 'commander': {
      if (!a.claims.traits || !b.claims.traits) return 'unclear';
      return a.claims.traits.some((t) => b.claims.traits!.includes(t)) ? 'agree' : 'conflict';
    }
    case 'plans':
      if (!a.claims.stance || !b.claims.stance) return 'unclear';
      return a.claims.stance === b.claims.stance ? 'agree' : 'conflict';
    case 'defences':
      if (a.claims.fortified === undefined || b.claims.fortified === undefined) return 'unclear';
      return a.claims.fortified === b.claims.fortified ? 'agree' : 'conflict';
  }
}

/** How many other reports on the same rival and topic agree or conflict with this one. */
export function corroboration(state: GameState, report: IntelReport): { agree: number; conflict: number } {
  let agree = 0;
  let conflict = 0;
  for (const other of state.intel.reports) {
    if (other.id === report.id || other.factionId !== report.factionId || other.topic !== report.topic) continue;
    if (other.spyId === report.spyId) continue; // independence: a second report from the same spy proves little
    const c = compareReports(report, other);
    if (c === 'agree') agree++;
    else if (c === 'conflict') conflict++;
  }
  return { agree, conflict };
}

// ---------------------------------------------------------------------------
// Using reports in battle
// ---------------------------------------------------------------------------

/** Builds what the player believes from the chosen reports. Later reports override earlier ones per topic. */
export function beliefFromReports(reports: IntelReport[]): { belief: IntelClaims; sources: Battle['beliefSources'] } {
  const belief: IntelClaims = {};
  const sources: Battle['beliefSources'] = [];
  for (const r of [...reports].sort((a, b) => a.at - b.at)) {
    Object.assign(belief, r.claims);
    sources.push({ reportId: r.id, spyName: r.spyName, topic: r.topic });
  }
  return { belief, sources };
}

function claimIsRight(r: IntelReport, t: FactionTruth): { right: boolean; detail: string } {
  const c = r.claims;
  switch (r.topic) {
    case 'strength': {
      if (!c.size) return { right: true, detail: '' };
      const claimed = (c.size.total[0] + c.size.total[1]) / 2;
      const ratio = claimed / Math.max(1, t.total);
      return {
        right: ratio >= 0.7 && ratio <= 1.4,
        detail: `it put them at about ${Math.round(claimed)}; there were ${t.total}`,
      };
    }
    case 'commander':
      return {
        right: !c.traits || c.traits.includes(t.trait),
        detail: `it called him ${c.traits?.join(' or ')}; he was ${t.trait}`,
      };
    case 'plans':
      return { right: !c.stance || c.stance === t.opening, detail: `it expected a ${c.stance} stance; he opened ${t.opening}` };
    case 'defences':
      return {
        right: (c.fortified === undefined || c.fortified === t.fortified) && (c.supply === undefined || Math.abs(c.supply - t.supply) <= 1),
        detail: `it said ${c.fortified ? 'fortified' : 'not fortified'}${c.supply !== undefined ? ` with ${c.supply} rounds of supplies` : ''}; the truth was ${t.fortified ? 'fortified' : 'not fortified'} with ${t.supply}`,
      };
  }
}

/** Lines for the battle report: how good was your intelligence? */
export function assessIntelligence(state: GameState, b: Battle): { lines: string[]; lessons: string[] } {
  const t = factionTruth(b.scenarioId);
  const lines: string[] = [];
  const lessons: string[] = [];
  const used = new Set(b.beliefSources.map((s) => s.reportId));
  const pending = state.intel.reports.filter((r) => r.factionId === b.scenarioId && !r.verified);

  for (const r of pending) {
    const reliedOn = used.has(r.id);
    const verdict = reliedOn ? claimIsRight(r, t) : null;
    let line = `${r.spyName}'s ${TOPIC_LABEL[r.topic].toLowerCase()} report was ${QUALITY_TEXT[r.quality]}.`;
    if (reliedOn) line += verdict && !verdict.right ? ` You relied on it, but ${verdict.detail}.` : ' You relied on it.';
    lines.push(line);
    if (reliedOn && (r.quality === 'misleading' || r.quality === 'fabricated')) {
      lessons.push('A spy report you relied on was false. Corroborate important claims with a second, independent report before acting.');
    }
    if (reliedOn && r.quality === 'outdated') {
      lessons.push('A report you relied on was out of date. Treat reports marked as old with caution.');
    }
  }
  if (b.enemyInformed) {
    lines.push('Enemy agents had learned of your army before the battle, so their commander was harder to surprise. A stronger Intelligence Bureau lowers this risk.');
    lessons.push('The enemy knew you were coming. Counter-intelligence (a higher-level Bureau) makes it harder for them to learn your plans.');
  }
  if (pending.length === 0 && b.beliefSources.length === 0) {
    lines.push(bureauLevel(state) > 0 ? 'You went in without any spy reports on this enemy.' : 'You had no intelligence service. Only scouts and rumour informed you.');
  }
  return { lines, lessons: Array.from(new Set(lessons)) };
}

/** After a battle the truth is known: mark reports verified and update each spy's record. */
export function verifyReports(state: GameState, factionId: string): GameState {
  const spies = state.intel.spies.map((s) => ({ ...s }));
  const reports = state.intel.reports.map((r) => {
    if (r.factionId !== factionId || r.verified) return r;
    const spy = spies.find((s) => s.id === r.spyId);
    if (spy) {
      if (r.quality === 'misleading' || r.quality === 'fabricated') spy.unsound++;
      else spy.sound++;
    }
    return { ...r, verified: true };
  });
  return { ...state, intel: { ...state.intel, spies, reports } };
}
