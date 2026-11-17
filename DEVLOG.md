# WAR EMPIRE Development Log

## MVP (Phases 1 to 7): complete, pending full phone testing of phases 3 to 7

Phase 1: Foundation (confirmed on iPhone)
- Expo SDK 58, TypeScript strict, Expo Router. Title screen with crest and tagline.

Phase 2: Navigation and design system (confirmed on iPhone)
- Bottom tabs: Overview, Economy, Knowledge, Military, Map. Profile from the header icon.
- Reusable UI: GameScreen, ResourceBar, Panel, StatTile, LockedNotice, GameButton and more.

Phase 3: Character creation
- Name, 5 civilisations (Sikaman/Ashanti-inspired, Niani/Mali-inspired, Fjordlands, Aurelian Republic, Serene Republic), 6 backgrounds, 3 difficulties.
- Civilisation modifiers, background resources and attributes are applied in the engine.

Phase 4: World map
- SVG illustrated map: five continents, islands, 16 settlements, fog ("?") until scouted.
- Home marker, settlement detail panel, scouting missions (40 gold, 45 s).

Phase 5: Economy
- 5 businesses (farm, timber camp, quarry, textile workshop, market hall), build/upgrade timers, 2 builder slots.
- Income, running costs, resource output, reputation gating, finance report with per-business bars.

Phase 6: Saving and offline progression
- SQLite save (one JSON document per slot), autosave every 15 s, on actions and on leaving the app.
- Offline catch-up: production counts up to 12 hours; construction, study and scouting always finish. "Welcome back" report.
- Settings: save now, delete save, testing tools (+1h / +8h).

Phase 7: Knowledge library
- 4 historical entries: Cannae, Horns of the Buffalo, Feigned Retreat (Kalka River), Russian campaign of 1812.
- Stages: Discovery (free, reveals the record), Understanding (paid study timer, reveals analysis and game use).
- Practical Experience and Mastery are shown as locked until the military milestone.

Quality checks: `npm run typecheck`, `npx expo lint`, `npm test` (11 engine tests), iOS bundle export all pass.

Design decisions to know about:
- 1 real hour = 1 game day. Offline production cap 12 h. Gold never goes below 0; unpaid costs are simply skipped.
- One of each business type for now; each upgrades to level 5.
- Components read the game clock (`state.lastTickAt`), not `Date.now()`, so rendering stays pure.
- Removed the template demo files in Phase 1; replaced the sample preview data with the real game state.

Not yet built (next milestones):
- Landscape layout for the map; pinch-zoom.
- Institutions, military (commanders, armies, battles), intelligence, diplomacy, naval warfare, living world AI.
- Practical Experience and Mastery knowledge stages, simulations, combining doctrines.
- More civilisations (Aksum, Great Zimbabwe, Benin, Kanem-Bornu, Highland, Eastern dynasties) and historical scenarios.
- Cloud saves and multiplayer (storage and state are already separated to allow this).

Known notes:
- `npm audit` reports a few moderate advisories in dev tooling; not a runtime concern.
- Web preview has no SQLite; it falls back to memory (no persistence).
