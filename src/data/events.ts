export type EventEffects = { gold?: number; food?: number; wood?: number; stone?: number; rep?: number };

export type EventOutcome = { weight: number; text: string } & EventEffects;

export type EventChoice = {
  label: string;
  /** What the player is told before choosing (never the dice). */
  hint: string;
  /** Resources that must be on hand to pick this option. */
  needs?: EventEffects;
  outcomes: EventOutcome[];
};

export type GameEventDef = {
  id: string;
  title: string;
  story: string;
  /** Own at least this many businesses before this can happen. */
  minBusinesses?: number;
  choices: EventChoice[];
};

export const EVENTS: GameEventDef[] = [
  {
    id: 'bad-harvest',
    title: 'A Poor Harvest',
    story: 'Rain failed in the planting season and the granaries are thin. Merchants whisper that bread will cost double by winter.',
    choices: [
      {
        label: 'Open the granary to the people',
        hint: 'Costs food. Wins loyalty.',
        needs: { food: 40 },
        outcomes: [{ weight: 1, text: 'The poor eat, and they remember who fed them.', food: -40, rep: 3 }],
      },
      {
        label: 'Buy grain from distant traders',
        hint: 'Costs gold. Safe.',
        needs: { gold: 80 },
        outcomes: [{ weight: 1, text: 'Caravans bring grain at a fair price. Order holds.', gold: -80, food: 30, rep: 1 }],
      },
      {
        label: 'Say nothing and wait it out',
        hint: 'Free, but risky.',
        outcomes: [
          { weight: 1, text: 'The rains return and the fuss passes.', rep: 0 },
          { weight: 1, text: 'Hunger spreads. People grumble about their ruler.', food: -20, rep: -2 },
        ],
      },
    ],
  },
  {
    id: 'caravan',
    title: 'A Caravan Arrives',
    story: 'A long caravan halts at your gates. The master of the caravan offers rare goods, but a ruler must decide whether to trust strangers.',
    minBusinesses: 1,
    choices: [
      {
        label: 'Trade generously',
        hint: 'Spend gold for a likely profit.',
        needs: { gold: 100 },
        outcomes: [
          { weight: 3, text: 'Spices and cloth sell quickly in your market.', gold: 60, rep: 1 },
          { weight: 1, text: 'Some of the goods were counterfeit. You lose money.', gold: -100 },
        ],
      },
      {
        label: 'Tax them and send them on',
        hint: 'A small, certain fee.',
        outcomes: [{ weight: 1, text: 'The caravan pays the toll and moves on, grumbling.', gold: 30 }],
      },
      {
        label: 'Invite the master to dine and listen',
        hint: 'Costs a little food. Merchants carry news.',
        needs: { food: 15 },
        outcomes: [{ weight: 1, text: 'The master tells of roads, rivals and rumours. Your name travels with the caravan.', food: -15, rep: 2 }],
      },
    ],
  },
  {
    id: 'stonecutters',
    title: 'Quarrymen Quarrel',
    story: 'Two crews of stonecutters claim the same seam of good rock, and tools have already been drawn.',
    choices: [
      {
        label: 'Judge it yourself, in public',
        hint: 'Costs time and wins respect.',
        outcomes: [
          { weight: 2, text: 'Your fair ruling is praised in the market.', rep: 2, stone: 10 },
          { weight: 1, text: 'One crew leaves insulted, taking tools with them.', stone: -5, rep: -1 },
        ],
      },
      {
        label: 'Pay both crews to share the seam',
        hint: 'Costs gold. Calm.',
        needs: { gold: 60 },
        outcomes: [{ weight: 1, text: 'Both crews work on, and the stone piles up.', gold: -60, stone: 25 }],
      },
      {
        label: 'Send soldiers to keep order',
        hint: 'Quick, a little harsh.',
        outcomes: [{ weight: 1, text: 'Order is restored. Nobody loves you for it.', stone: 5, rep: -1 }],
      },
    ],
  },
  {
    id: 'scholar',
    title: 'A Wandering Scholar',
    story: 'A scholar who has walked three seas asks for a place to teach. They speak of old campaigns and how armies once won.',
    choices: [
      {
        label: 'Give them a house and a stipend',
        hint: 'Costs gold, grows your name.',
        needs: { gold: 70 },
        outcomes: [{ weight: 1, text: 'Their lessons draw students from far away.', gold: -70, rep: 4 }],
      },
      {
        label: 'Ask for one lecture, then thank them',
        hint: 'Cheap and modest.',
        outcomes: [{ weight: 1, text: 'You learn something, and the scholar moves on.', rep: 1 }],
      },
      {
        label: 'Send them away',
        hint: 'Free.',
        outcomes: [{ weight: 1, text: 'They walk on to a kinder court.', rep: -1 }],
      },
    ],
  },
  {
    id: 'bandits',
    title: 'Bandits on the Road',
    story: 'Merchants report armed men robbing travellers on the road to your market. Trade is thinning.',
    minBusinesses: 2,
    choices: [
      {
        label: 'Hire guards for the road',
        hint: 'Costs gold. Works most of the time.',
        needs: { gold: 90 },
        outcomes: [
          { weight: 3, text: 'The bandits scatter and traders return.', gold: -90, rep: 2 },
          { weight: 1, text: 'The guards are bought off. You paid for nothing.', gold: -90 },
        ],
      },
      {
        label: 'Pay the bandits to leave',
        hint: 'Costs gold. Shameful but quiet.',
        needs: { gold: 50 },
        outcomes: [{ weight: 1, text: 'They take your coin and promise to move on.', gold: -50, rep: -1 }],
      },
      {
        label: 'Do nothing',
        hint: 'Free, but the road stays dangerous.',
        outcomes: [{ weight: 1, text: 'Merchants lose goods. Your treasury feels it.', gold: -40, rep: -1 }],
      },
    ],
  },
  {
    id: 'festival',
    title: 'The Harvest Festival',
    story: 'The people ask to hold the old festival. It would cost food and a day of work, but festivals are how rulers become loved.',
    choices: [
      {
        label: 'Hold a grand festival',
        hint: 'Costs food and gold.',
        needs: { food: 30, gold: 40 },
        outcomes: [{ weight: 1, text: 'Drums, dancing and stories until dawn. Your people sing your name.', food: -30, gold: -40, rep: 5 }],
      },
      {
        label: 'Allow a small gathering',
        hint: 'Cheap.',
        needs: { food: 10 },
        outcomes: [{ weight: 1, text: 'A modest feast. People are content.', food: -10, rep: 2 }],
      },
      {
        label: 'Refuse, work comes first',
        hint: 'Saves resources.',
        outcomes: [{ weight: 1, text: 'The fields are tended, and tempers sour.', rep: -2, wood: 10 }],
      },
    ],
  },
  {
    id: 'storm',
    title: 'Storm Damage',
    story: 'A violent storm tore roofs and snapped beams across the town. Wood and stone are needed in a hurry.',
    minBusinesses: 1,
    choices: [
      {
        label: 'Repair everything at once',
        hint: 'Costs wood and stone.',
        needs: { wood: 30, stone: 15 },
        outcomes: [{ weight: 1, text: 'By week’s end the town looks better than before.', wood: -30, stone: -15, rep: 3 }],
      },
      {
        label: 'Patch only what is vital',
        hint: 'A smaller cost.',
        needs: { wood: 12 },
        outcomes: [{ weight: 1, text: 'The worst is fixed, the rest will wait.', wood: -12, rep: 1 }],
      },
      {
        label: 'Let people fix their own homes',
        hint: 'Free, but unfair.',
        outcomes: [
          { weight: 1, text: 'Neighbours help each other, and little is lost.' },
          { weight: 1, text: 'Some are left homeless and angry.', rep: -3 },
        ],
      },
    ],
  },
  {
    id: 'envoy-gift',
    title: 'A Gift from Afar',
    story: 'An envoy from a distant court brings a gift and polite words. No one is sure what it truly means.',
    choices: [
      {
        label: 'Accept graciously and send a gift back',
        hint: 'Costs gold. Builds a friendship.',
        needs: { gold: 50 },
        outcomes: [{ weight: 1, text: 'Gifts cross the sea in both directions. Your name is known abroad.', gold: -50, rep: 3 }],
      },
      {
        label: 'Accept and say little',
        hint: 'Free, slightly rude.',
        outcomes: [
          { weight: 2, text: 'The gift is yours. Nothing more is asked.', gold: 40 },
          { weight: 1, text: 'The envoy leaves offended.', gold: 40, rep: -2 },
        ],
      },
      {
        label: 'Politely refuse',
        hint: 'Avoids obligations.',
        outcomes: [{ weight: 1, text: 'You owe nothing to anyone.', rep: 0 }],
      },
    ],
  },
  {
    id: 'plague-rumour',
    title: 'Sickness in the Lower Town',
    story: 'A fever has appeared among the dockworkers. Healers beg for clean water, herbs and a place to keep the sick apart.',
    minBusinesses: 2,
    choices: [
      {
        label: 'Quarantine and fund the healers',
        hint: 'Costs gold and food. Best chance to stop it.',
        needs: { gold: 80, food: 20 },
        outcomes: [
          { weight: 4, text: 'The fever is contained. Your caution saves many lives.', gold: -80, food: -20, rep: 4 },
          { weight: 1, text: 'It spreads a little before dying out.', gold: -80, food: -20, rep: 1 },
        ],
      },
      {
        label: 'Send the sick out of the walls',
        hint: 'Free and cruel.',
        outcomes: [{ weight: 1, text: 'The fever leaves with them. People remember your cruelty.', rep: -4 }],
      },
      {
        label: 'Leave it to the healers',
        hint: 'Small cost, uncertain.',
        outcomes: [
          { weight: 1, text: 'The healers manage, barely.', gold: -20, rep: 1 },
          { weight: 1, text: 'The fever spreads. Work stops for days.', gold: -60, rep: -2 },
        ],
      },
    ],
  },
  {
    id: 'old-soldier',
    title: 'An Old Soldier Visits',
    story: 'A veteran with a limp sits at your door. He fought in a war you only read about, and says he can tell you why it was lost.',
    choices: [
      {
        label: 'Feed him and listen all evening',
        hint: 'Costs a little food. Wisdom is free.',
        needs: { food: 10 },
        outcomes: [{ weight: 1, text: 'He talks of supply lines, bad ground and proud generals. You take notes.', food: -10, rep: 2 }],
      },
      {
        label: 'Offer him a pension',
        hint: 'Costs gold.',
        needs: { gold: 40 },
        outcomes: [{ weight: 1, text: 'Old soldiers drink to your name for years.', gold: -40, rep: 3 }],
      },
      {
        label: 'Give him a coin and move on',
        hint: 'Cheap.',
        outcomes: [{ weight: 1, text: 'He nods and limps away.', gold: -3 }],
      },
    ],
  },
];

export function getEventDef(id: string): GameEventDef | undefined {
  return EVENTS.find((e) => e.id === id);
}
