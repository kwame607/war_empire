# WAR EMPIRE Development Log

## Version 0.2: Institutions and Military (complete, pending phone testing)

Institutions (Economy tab, "Institutions" segment):
- Library (faster study), Barracks (army capacity, training speed), Military Academy (commanders), Armoury (better arms, unlocks cavalry and heavy infantry).
- They create capabilities, not money, and some need more than gold: the Academy needs a historical record studied to Understanding; the Armoury needs a Barracks.
- They share the two builder slots with businesses and cost upkeep per hour.

Army:
- Four unit types (spearmen, archers, cavalry, heavy infantry) with costs, upkeep, training time.
- Army size is limited by barracks capacity AND by manpower (population of your lands), so economy growth matters.
- Commanders (hired at the Academy, with tactics/logistics/leadership and a trait, gain experience). With no commander the player leads in person.

Battles (Military tab, Operations):
- Four scenarios (Roadside Raiders, Rival Warband, The Hill Camp, Steppe Riders). Up to 6 rounds. Fought on terrain and weather that change how each unit class performs.
- Fog of knowledge: rumour gives only a wide estimate of the enemy; scouting (60 gold) narrows it and reveals fortifications; a spy (120 gold) gives exact numbers.
- Provisions: light/standard/ample cost food; running out of supplies cuts attack and morale.
- Command window every round: 5 ordinary orders plus 4 doctrine orders unlocked by studying records (Cannae -> double envelopment, Horns of the Buffalo, Feigned retreat, Russian campaign -> strategic withdrawal). Doctrines have real conditions (terrain, cavalry share, enemy stance, fortification) shown as a checklist.
- Enemy commanders have traits (impetuous, cautious, cunning), choose a stance each round, and adapt if you repeat an order.
- Delegation: hand the rest of the battle to your commander (ordinary orders only, with a chance of error).
- Losing is not the end: survivors return, small reputation loss, no game over. Retreat saves most of the army.
- After every battle: a detailed report (casualties, decisions, commander performance, enemy strengths, exploited weaknesses, terrain and weather, logistics, lessons).
- A successful doctrine order earns Practical Experience (knowledge stage 3), making that doctrine 15% stronger.
- Battles are deterministic from a seed and saved mid-battle, so closing the app never loses a battle.

Technical:
- Save format is now version 2 with an automatic migration from version 1 (existing saves keep working).
- New game modules: battle.ts (simulation), military.ts (actions), report.ts (reports), migrate.ts.
- 33 automated tests, including balance guard-rails (e.g. envelopment must clearly beat plain orders against the warband when you have cavalry; starving the hill camp must beat assaulting it).

Balance notes:
- Army size dominates (as in real wars); doctrine matters most when forces are close to even, around the "recommended army" shown for each operation.
- Reaching reputation 15 (Military unlock) takes roughly 40 hours of game time with greedy spending. Settings has a testing shortcut. Pacing may need tuning.

Not built yet:
- Delegated operations that run on a timer while you are offline.
- Intelligence Bureau, spies, counter-intelligence, false reports.
- Capital and siege mechanics, formations beyond orders, naval warfare.
- Diplomacy and the living world (AI kingdoms).
- Mastery (knowledge stage 4), simulations, combining doctrines.
- Landscape layout and map zoom.

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
