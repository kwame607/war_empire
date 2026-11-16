# WAR EMPIRE Development Log

## Phase 1: Foundation (complete, pending phone confirmation)

Done:
- Expo SDK 58 project created in `war-empire/` (TypeScript strict, Expo Router).
- Removed the template's demo content (tabs, explore screen, logos, animated splash, light/dark theme helpers). None of it was part of the game.
- Created `src/theme` design tokens (charcoal, navy, antique gold, bronze, parchment, burgundy).
- Built title screen: heraldic crest (plain Views), WAR EMPIRE wordmark, tagline, fade-in animation.
- Start / Continue / Settings buttons show a "coming in Phase N" message (not yet functional by design).
- Passing: `tsc --noEmit`, `expo lint`, iOS bundle export.

Remaining phases:
2. Navigation and design system
3. Character creation and civilisations
4. World map and starting location
5. Economy and businesses
6. Local saving (SQLite) and offline progression
7. Knowledge library (Cannae and others)

Known notes:
- `npm audit` reports 3 moderate advisories in dev tooling; not a runtime concern for now.
