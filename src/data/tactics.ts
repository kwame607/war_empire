import type { Battle, OrderId } from '@/game/types';

import type { Regiment } from './battleLayout';

export type Arrow = { pts: [number, number][]; tone: 'you' | 'foe' | 'retreat' };
export type TacticView = {
  mine: Regiment[];
  theirs: Regiment[];
  arrows: Arrow[];
  caption: { title: string; text: string } | null;
  /** Burning ground between the lines (strategic withdrawal). */
  fire: boolean;
  /** Ring around the enemy block when it has been encircled. */
  surround: boolean;
};

const kind = (r: Regiment) => r.key.split('-')[1];
const isInfantry = (r: Regiment) => kind(r) === 'spearmen' || kind(r) === 'heavy';
const isCav = (r: Regiment) => kind(r) === 'cavalry';
const isArch = (r: Regiment) => kind(r) === 'archers';
const side = (r: Regiment) => r.key[0] as 'p' | 'e';
/** Moves a regiment toward the enemy by d units (negative = back). */
const fwd = (r: Regiment, d: number) => (side(r) === 'p' ? r.sd - d : r.sd + d);
const map = (rs: Regiment[], f: (r: Regiment, i: number) => Partial<Regiment>) => rs.map((r, i) => ({ ...r, ...f(r, i) }));
const clampField = (rs: Regiment[]) => rs.map((r) => ({ ...r, sx: Math.max(-18.5, Math.min(18.5, r.sx)), sd: Math.max(-17, Math.min(17, r.sd)) }));

const PHASE_TEXT: Partial<Record<OrderId, [string, string]>> = {
  hold: ['Hold the line', 'The army stands firm and lets the enemy come to it.'],
  advance: ['Advance in force', 'Every regiment presses forward together.'],
  concentrate: ['Concentrate force', 'The army closes up and drives at one point.'],
  fortify: ['Fortify', 'Troops dig in behind stakes and shields.'],
  retreat: ['Retreat', 'The army breaks off and falls back, covering its rear.'],
  scorch: ['Strategic withdrawal', 'The army falls back and burns what it leaves behind.'],
};

/** Works out how both armies are arranged, which arrows to draw and what to say for the last order given. */
export function tacticView(battle: Battle, mine0: Regiment[], theirs0: Regiment[], front: number): TacticView {
  const last = battle.rounds[battle.rounds.length - 1];
  const view: TacticView = { mine: mine0, theirs: theirs0, arrows: [], caption: null, fire: false, surround: false };
  if (!last) return view;
  const order = last.order;
  const trap = order === 'envelop' || order === 'feint';
  const settingUp = trap && battle.setup?.kind === order;
  const worked = last.success === true;
  let mine = mine0;
  let theirs = theirs0;
  const arrows: Arrow[] = [];
  const front3 = mine0.filter(isInfantry);
  const cavs = mine0.filter(isCav);
  const wings = front3.filter((r) => Math.abs(r.sx) >= 5);
  const centre = front3.filter((r) => Math.abs(r.sx) < 5);
  const f = front;

  switch (order) {
    case 'advance':
      mine = map(mine0, (r) => ({ sd: fwd(r, 1.3) }));
      front3.forEach((r) => arrows.push({ tone: 'you', pts: [[r.sx, f - 0.5], [r.sx, -f + 3]] }));
      view.caption = { title: PHASE_TEXT.advance![0], text: PHASE_TEXT.advance![1] };
      break;
    case 'concentrate':
      mine = map(mine0, (r) => (isCav(r) ? { sd: fwd(r, 0.5) } : { sx: r.sx * 0.55, sd: fwd(r, 1) }));
      front3.forEach((r) => arrows.push({ tone: 'you', pts: [[r.sx, f - 0.5], [r.sx * 0.3, 0], [0, -f + 2]] }));
      view.caption = { title: PHASE_TEXT.concentrate![0], text: PHASE_TEXT.concentrate![1] };
      break;
    case 'fortify':
      mine = map(mine0, (r) => (isCav(r) ? {} : { sx: r.sx * 0.85 }));
      view.caption = { title: PHASE_TEXT.fortify![0], text: PHASE_TEXT.fortify![1] };
      break;
    case 'hold':
      view.caption = { title: PHASE_TEXT.hold![0], text: PHASE_TEXT.hold![1] };
      break;
    case 'retreat':
      mine = map(mine0, (r) => ({ sd: fwd(r, -4) }));
      front3.forEach((r) => arrows.push({ tone: 'retreat', pts: [[r.sx, f + 0.5], [r.sx, f + 4.5]] }));
      view.caption = { title: PHASE_TEXT.retreat![0], text: PHASE_TEXT.retreat![1] };
      break;
    case 'scorch':
      mine = map(mine0, (r) => ({ sd: fwd(r, -3.5) }));
      front3.forEach((r) => arrows.push({ tone: 'retreat', pts: [[r.sx, f + 0.5], [r.sx, f + 4.5]] }));
      view.fire = true;
      view.caption = { title: PHASE_TEXT.scorch![0], text: PHASE_TEXT.scorch![1] };
      break;
    case 'envelop':
      if (settingUp) {
        mine = map(mine0, (r) => (centre.includes(r) ? { sd: fwd(r, -2.4) } : wings.includes(r) ? { sd: fwd(r, 0.8) } : {}));
        theirs = map(theirs0, (r) => (isInfantry(r) && Math.abs(r.sx) < 5 ? { sd: fwd(r, 1.6) } : {}));
        arrows.push({ tone: 'retreat', pts: [[0, f + 0.5], [0, f + 3.8]] }, { tone: 'foe', pts: [[0, -f - 1.5], [0, -f + 2.6]] });
        view.caption = { title: 'Double envelopment · step 1 of 2', text: 'The centre gives ground and draws the enemy in. Order it again to close the trap.' };
      } else if (worked) {
        mine = map(mine0, (r) => (isCav(r) ? { sx: Math.sign(r.sx) * 11, sd: -(f + 3.2) } : isInfantry(r) && wings.includes(r) ? { sx: Math.sign(r.sx) * 6, sd: -(f - 1.4) } : isInfantry(r) ? { sd: fwd(r, 0.8) } : {}));
        theirs = map(theirs0, (r) => ({ sx: r.sx * 0.6 }));
        wings.forEach((r) => arrows.push({ tone: 'you', pts: [[Math.sign(r.sx) * 10, f], [Math.sign(r.sx) * 15.5, 0], [Math.sign(r.sx) * 6.5, -f + 1.4]] }));
        cavs.forEach((r) => arrows.push({ tone: 'you', pts: [[Math.sign(r.sx) * 16.5, f + 3], [Math.sign(r.sx) * 19, -1], [Math.sign(r.sx) * 11, -f - 3.2]] }));
        view.surround = true;
        view.caption = { title: 'The trap closes', text: 'Both flanks close behind the enemy line. Cannae, again.' };
      } else {
        mine = map(mine0, (r) => ({ sd: fwd(r, 0.6) }));
        front3.forEach((r) => arrows.push({ tone: 'you', pts: [[r.sx, f - 0.5], [r.sx, -f + 3]] }));
        view.caption = { title: 'The trap fails', text: last.notes[0] ?? 'The flanks could not close in time.' };
      }
      break;
    case 'horns': {
      const horns = cavs.length > 0 ? cavs : wings;
      if (worked) {
        mine = map(mine0, (r) => (horns.includes(r) ? { sx: Math.sign(r.sx || 1) * 16, sd: -(f - 1.2) } : isInfantry(r) ? { sd: fwd(r, 0.6) } : {}));
        theirs = map(theirs0, (r) => ({ sx: r.sx * 0.8 }));
        horns.forEach((r) => arrows.push({ tone: 'you', pts: [[Math.sign(r.sx || 1) * 16.5, f + 2], [Math.sign(r.sx || 1) * 19, 0], [Math.sign(r.sx || 1) * 11.5, -f + 1.5]] }));
        centre.forEach((r) => arrows.push({ tone: 'you', pts: [[r.sx, f - 0.5], [r.sx, -f + 2.2]] }));
        view.surround = true;
        view.caption = { title: 'Horns of the buffalo', text: 'The chest pins them while both horns sweep round the flanks.' };
      } else {
        mine = map(mine0, (r) => ({ sd: fwd(r, 0.6) }));
        front3.forEach((r) => arrows.push({ tone: 'you', pts: [[r.sx, f - 0.5], [r.sx, -f + 3]] }));
        view.caption = { title: 'The horns fail', text: last.notes[0] ?? 'The enemy was ready for the sweep.' };
      }
      break;
    }
    case 'feint':
      if (settingUp) {
        mine = map(mine0, (r) => ({ sd: fwd(r, -2.6) }));
        theirs = map(theirs0, (r) => ({ sd: fwd(r, isCav(r) ? 4 : isArch(r) ? 1.4 : 2.6) }));
        arrows.push({ tone: 'retreat', pts: [[0, f + 0.5], [0, f + 4.5]] }, { tone: 'foe', pts: [[0, -f - 0.5], [0, -f + 3.2]] });
        view.caption = { title: 'Feigned retreat · step 1 of 2', text: 'Pretend to flee and let the pursuers string out. Order it again to turn on them.' };
      } else if (worked) {
        mine = map(mine0, (r) => (isCav(r) ? { sx: Math.sign(r.sx) * 13.5, sd: -(f - 1.2) } : { sd: fwd(r, 1.2) }));
        theirs = map(theirs0, (r, i) => ({ sd: fwd(r, i % 2 === 0 ? 2.4 : 1.2), sx: r.sx * 1.15 }));
        front3.forEach((r) => arrows.push({ tone: 'you', pts: [[r.sx, f + 1.5], [r.sx, -f + 2.5]] }));
        cavs.forEach((r) => arrows.push({ tone: 'you', pts: [[Math.sign(r.sx) * 16.5, f + 3], [Math.sign(r.sx) * 19, 0], [Math.sign(r.sx) * 13, -f + 1.2]] }));
        view.caption = { title: 'The turn', text: 'The pursuers are strung out and caught. The whole army turns on them.' };
      } else {
        mine = map(mine0, (r) => ({ sd: fwd(r, -1) }));
        view.caption = { title: 'The feint fails', text: last.notes[0] ?? 'The enemy did not give chase.' };
      }
      break;
  }
  return { ...view, mine: clampField(mine), theirs: clampField(theirs), arrows };
}
