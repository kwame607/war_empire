/** The seven stages of a player's rise, in order, with the reputation needed to reach each. */
export const PROGRESSION_STAGES = [
  { name: 'Ordinary Citizen', reputation: 0 },
  { name: 'Building a Foundation', reputation: 4 },
  { name: 'Rising to Influence', reputation: 15 },
  { name: 'Becoming a Power Broker', reputation: 40 },
  { name: 'Establishing Independent Power', reputation: 100 },
  { name: 'Building an Empire', reputation: 250 },
  { name: 'Becoming a Major World Power', reputation: 600 },
] as const;

/** The stage index at which the Military section opens. */
export const MILITARY_UNLOCK_STAGE = 2;

export const ATTRIBUTE_LABELS = {
  intelligence: 'Intelligence',
  leadership: 'Leadership',
  negotiation: 'Negotiation',
  military: 'Military Knowledge',
  administration: 'Administration',
} as const;
