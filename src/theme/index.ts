/**
 * WAR EMPIRE design tokens.
 * Every colour, font size and spacing value used in the UI should come from here,
 * so the whole game can be restyled from one place.
 */
import { Platform } from 'react-native';

export const colors = {
  charcoal: '#14161A',
  navy: '#0B1220',
  navyLight: '#16223A',
  gold: '#C9A227',
  goldBright: '#E6C65C',
  bronze: '#8C6A3B',
  parchment: '#EADBB8',
  parchmentDim: '#B9AB8A',
  burgundy: '#6E1F2B',
  burgundyBright: '#9B2D3E',
  earth: '#4A3B2A',
  line: 'rgba(201, 162, 39, 0.35)',
} as const;

export const fonts = {
  // iOS has a built-in serif ("New York") that looks great for a historical feel.
  serif: Platform.select({ ios: 'ui-serif', android: 'serif', default: 'Georgia, serif' }) as string,
  sans: Platform.select({ ios: 'system-ui', android: 'sans-serif', default: 'system-ui, sans-serif' }) as string,
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

export const radius = { sm: 6, md: 12, pill: 999 } as const;

/** Widest the content column grows on large or landscape screens. */
export const MAX_CONTENT_WIDTH = 760;
