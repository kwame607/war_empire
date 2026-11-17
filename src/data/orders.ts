import type { OrderId } from '../game/types';

export type OrderDef = {
  id: OrderId;
  name: string;
  summary: string;
  /** If set, the order is only available once this historical record is understood. */
  doctrine?: string;
  /** What the order needs in order to work (shown to the player as a checklist). */
  needs?: string;
  /** Two-step manoeuvres take one round to set up and a second to spring. */
  twoStep?: boolean;
};

export const ORDERS: OrderDef[] = [
  { id: 'hold', name: 'Hold the line', summary: 'Stand firm and let them come. Strong defence, ordinary attack.' },
  { id: 'advance', name: 'Advance in force', summary: 'Press forward. Hits harder, but you take more in return.' },
  {
    id: 'concentrate',
    name: 'Concentrate force',
    summary: 'Mass everything on one point. Strong attack, weak defence, and vulnerable to enemy reserves.',
  },
  {
    id: 'fortify',
    name: 'Fortify',
    summary: 'Dig in and shelter behind obstacles. Very strong defence, almost no attack. Best on hills or in forest.',
  },
  {
    id: 'envelop',
    name: 'Double envelopment',
    doctrine: 'cannae',
    twoStep: true,
    needs: 'Open ground · cavalry at least a sixth of your strength and not outmatched · an enemy that commits to the centre',
    summary: 'Let the centre give ground, then close both flanks. Order it twice in a row: first to draw the enemy in, then to spring the trap.',
  },
  {
    id: 'horns',
    name: 'Horns of the buffalo',
    doctrine: 'buffalo-horns',
    needs: 'Mostly infantry · not a river crossing · an enemy that is neither fortified, dug in nor holding reserves',
    summary: 'The chest pins the enemy while two fast horns sweep round. Devastating against a stretched, unfortified foe.',
  },
  {
    id: 'feint',
    name: 'Feigned retreat',
    doctrine: 'feigned-retreat',
    twoStep: true,
    needs: 'Fast troops (cavalry and archers at least 40%) · open ground · an enemy that gives chase',
    summary: 'Pretend to flee, then turn on the strung-out pursuers. Order it twice in a row: first the retreat, then the turn.',
  },
  {
    id: 'scorch',
    name: 'Strategic withdrawal',
    doctrine: 'russia-1812',
    needs: 'Time: works through enemy hunger, not blows. Weak at damaging the enemy directly.',
    summary: 'Fall back and strip the land of supplies. The pursuing enemy starves and loses heart while you preserve your army.',
  },
  {
    id: 'retreat',
    name: 'Retreat',
    summary: 'Break off and save the army. You lose the rear guard, and more if the enemy has fast horse. Losing a battle is not losing the war.',
  },
];

export function getOrder(id: OrderId): OrderDef {
  const o = ORDERS.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown order: ${id}`);
  return o;
}
