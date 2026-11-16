/** Core game types. Pure data shapes: no UI code lives here. */

export type Resources = {
  gold: number;
  food: number;
  wood: number;
  stone: number;
  population: number;
};

export type PlayerSummary = {
  name: string;
  status: string; // e.g. "Ordinary Citizen"
  location: string;
  reputation: number;
  dateLabel: string;
  resources: Resources;
};
