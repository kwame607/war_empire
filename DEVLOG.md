# WAR EMPIRE Development Log

## Phase 2: Navigation and design system (complete, pending phone confirmation)

Done:
- Bottom tab navigation (Overview, Economy, Knowledge, Military, Map) in `src/app/(game)/`. Profile opens from the header icon; Businesses will live inside Economy.
- Reusable UI: GameScreen, ResourceBar, Panel, SectionHeader, StatTile, LockedNotice, GameButton.
- Sample data in `src/data/previewState.ts` (temporary, replaced in Phases 3 to 6).
- Start Game now opens the dashboard preview. Continue and Settings still show a "coming in Phase 6" message.
- Added `@expo/vector-icons` for tab icons.
- Passing: `tsc --noEmit`, `expo lint`, iOS bundle export.

## Phase 1: Foundation (complete, confirmed on iPhone)

Done:
- Expo SDK 58 project created in `war-empire/` (TypeScript strict, Expo Router).
- Removed the template's demo content (tabs, explore screen, logos, animated splash, light/dark theme helpers). None of it was part of the game.
- Created `src/theme` design tokens (charcoal, navy, antique gold, bronze, parchment, burgundy).
- Built title screen: heraldic crest (plain Views), WAR EMPIRE wordmark, tagline, fade-in animation.
- Start / Continue / Settings buttons show a "coming in Phase N" message (not yet functional by design).
- Passing: `tsc --noEmit`, `expo lint`, iOS bundle export.

Remaining phases:
3. Character creation and civilisations
4. World map and starting location
5. Economy and businesses
6. Local saving (SQLite) and offline progression
7. Knowledge library (Cannae and others)

Known notes:
- `npm audit` reports 3 moderate advisories in dev tooling; not a runtime concern for now.
