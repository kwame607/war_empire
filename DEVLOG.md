# WAR EMPIRE Development Log

## Version 0.3: Intelligence and Fog of Knowledge (complete, pending phone testing)

Intelligence Bureau (Economy, Institutions; needs a Library and reputation 15):
- Recruit agents (spy cap = bureau level + 1). Each has a skill rating and a track record (sound / unsound reports).
- Military tab, new "Intel" segment: send an agent to watch a rival on one topic (Strength, Commander, Plans, Defences). Costs 80 gold, takes 90 seconds, and finishes even while you are away.
- Agents can be caught and lost (chance falls with agent skill and bureau level).

Reports can be wrong:
- Each report is accurate, incomplete, outdated, misleading or fabricated. The quality is hidden; only clues are visible (confidence, "gathered weeks ago", ranges).
- Better agents and a higher-level Bureau raise the odds of an honest report.
- Independent reports from different agents are compared: "agree" / "conflict" chips help you spot lies.
- Before battle, pick which reports to rely on. They shape the enemy estimate and the doctrine checklists (so a false report can mislead you).
- After the battle the truth is revealed: reports are marked checked, agents' track records update, and the battle report gains an Intelligence section and lessons.
- Counter-intelligence: the enemy may learn of your army beforehand (45% with no bureau, less per Bureau level, 0 at level 3), making cunning/cautious commanders always read your manoeuvres.

Technical:
- Save version 3 (migration adds the intel state and patches battles in progress).
- New modules: intelCore.ts (pure rules), intel.ts (actions); 10 new tests (43 total).

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
- Pacing (tuned in v0.3): military unlocks at reputation 10 (was 15) and business gold income is x1.4 (`GOLD_INCOME_MULT` in economy.ts). A first army now takes roughly 20 game hours with greedy spending (was ~40).

Not built yet:
- Delegated operations that run on a timer while you are offline.
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
