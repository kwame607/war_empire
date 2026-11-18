import type { Shape } from '../utils/shapes';

/** Data shapes for the animated battle diagrams on historical record pages. */
export const DIAGRAM_W = 160;
export const DIAGRAM_H = 100;

export type UnitKind = 'infantry' | 'heavy' | 'cavalry' | 'ranged' | 'fleet' | 'galleass';
export type Side = 'a' | 'b';

export type DUnit = {
  id: string;
  side: Side;
  kind: UnitKind;
  /** Short label drawn above the unit. */
  label?: string;
};

export type DPose = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** Degrees. */
  rot?: number;
  /** 0 hides the unit, 1 shows it. */
  o?: number;
  /** Ships drawn in a fleet block. */
  count?: number;
};

export type DArrow = { from: [number, number]; to: [number, number]; side: Side | 'n' };
export type DMark = { x: number; y: number; text: string; color?: string };

export type DScene = {
  caption: string;
  /** Knowledge stage needed to watch this scene (1 = Discovery, 2 = Understanding). */
  unlocksAtStage: 1 | 2;
  /** Units not listed keep their previous pose. */
  poses: Record<string, DPose>;
  arrows?: DArrow[];
  marks?: DMark[];
};

export type Diagram = {
  /** Background colour and static scenery (land, river, coast) drawn under the units. */
  bg: string;
  decor: Shape[];
  sideA: string;
  sideB: string;
  units: DUnit[];
  scenes: DScene[];
};
