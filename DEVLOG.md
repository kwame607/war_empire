# WAR EMPIRE Development Log

## Version 0.13: Balance and Polish (complete, pending phone testing)

- Overview: new "Next steps" panel that reads your situation and suggests up to three things to do (build a farm, study a record, raise an army, answer a kingdom, garrison provinces...) with a Go button. The rules live in advisor.ts and are tested.
- Overview "In progress" now also shows expeditions, shipbuilding, spy missions and envoys.
- Economy rebalanced. The blanket x2.5 income boost made the mid game too rich, while early buildings were starved of wood and stone. Now: early businesses pay more (farm 60/h, timber 28, quarry 36; workshop 85, market 130), the global multiplier is x1.2, and timber and stone camps produce twice as much raw material (30 wood/h, 24 stone/h). In a scripted greedy playthrough the first Barracks is possible at about 7 hours and the first battle follows shortly after. Late game with everything at level 5 nets roughly 1,000 gold/hour, which is the budget for armies, fleets and spies.
- 99 tests (3 new).

## Version 0.12: Landscape and Map Zoom (complete, pending phone testing)

- The app now rotates (app.json orientation "default"). Screens keep a centred content column (max 760 wide) with safe-area margins, so landscape on a phone or tablet reads well and nothing stretches edge to edge.
- World map: pinch to zoom (1x to 4x), drag to pan, or use the + / - / reset buttons in the corner. Taps on settlements still work. The map is sized to fit the screen in either orientation (never taller than about 70% of the screen).
- Built with React Native's own PanResponder and SVG viewBox (no new packages). Gestures cannot be tested in this workspace, so please check pinch and drag on your phone; the buttons are the fallback.
- Note: changing app.json may need Expo Go to be fully reloaded (shake, Reload) or restarted before rotation works.

## Version 0.11: Naval Mastery (complete, pending phone testing)

- Salamis and Lepanto now have the same path as land doctrines: Understanding, Practical Experience (a won engagement in which the doctrine worked), then Mastery (+28% effect).
- Mastery needs 2 real sea engagements where the doctrine worked, 3 successful war-room naval exercises, and success against 2 different kingdoms.
- War room (Military tab) has a "Naval exercise": choose a doctrine and a kingdom's fleet, 40 gold, needs a Military Academy and at least 2 warships; no ships are lost. Mastery progress for naval doctrines is listed alongside the land ones, and the record page shows the path and the Claim button.
- 96 tests (3 new).

## Version 0.10: Naval Doctrines (complete, pending phone testing)

- Two new historical records in the Knowledge library: Themistocles and the Narrows of Salamis (480 BC) and The Galleasses of Lepanto (1571), with the same Discovery / Understanding stages. Casualty and fleet figures are given as contested estimates.
- Understanding a record unlocks a naval tactic in Military → Navy:
  - Lure into the narrows (Salamis): only works against a clearly larger fleet (their attack is cut sharply); against an equal fleet it wastes the round.
  - Galleass guns (Lepanto): a heavy salvo, strongest against a fleet about your size.
- Winning an engagement in which the doctrine worked earns Practical Experience (+15% effect).
- Naval doctrines have no Mastery path yet (the record page says so).
- 93 tests (4 new).

## Version 0.9: Naval Warfare (complete, pending phone testing)

- New institution: Shipyard (Economy → Institutions; needs a Barracks and reputation 10). Levels raise fleet capacity (4 / 12 / 20) and shipbuilding speed.
- Military → Navy: build warships (120 gold + 40 wood each, 1.5 gold/h upkeep). Ships finish while you are away. A fleet of 3 or more halves raids on your coasts.
- Island kingdoms (the Serene Republic) cannot be reached by land: during a war with them you must first win command of the sea. You choose a tactic for each of three rounds (line beats boarding, boarding beats screens, screens beat the line). Their fleet size is only a rumour, and their habits are hidden until you have dealt with them (envoy). Losing costs ships, and you can try again.
- Winning the sea unlocks the land campaign for the rest of that war.
- Save version 9; navalCore.ts / naval.ts; 8 new tests (89 total).
- Not yet: naval raids and blockades on your own ports, sea trade routes, ship types, naval doctrines in the knowledge library (Salamis, Lepanto and others).

## Version 0.8: Conquest and Territory (complete, pending phone testing)

- Each kingdom now holds real settlements from the world map (a capital plus provinces; e.g. the Aurelian Republic holds Aurelia, Veridian Fields and Port Calder).
- After winning at least 2 battles of a war (and being ahead), "Sue for peace" offers a choice: take reparations in gold, or take one of their provinces instead. Capitals can never be taken, and a kingdom with only a capital (the Serene Republic) can only pay reparations.
- Provinces pay income by kind (cities and ports gold, farmland food, villages wood, mines stone; minus 3 gold/h garrison cost), visible in your rates and in Map → Your provinces.
- The price: each province needs 18 soldiers in your army. If your army is too thin, a province may rise in revolt on a world turn and return to its former owner. The former owner's relations drop and its strength falls 10%.
- Save version 8; territoryCore.ts; 6 new tests (81 total).
- Not yet: kingdoms retaking land, allies joining wars, unowned settlements to colonise, naval warfare.

## Version 0.7: War and Consequences (complete, pending phone testing)

- Map → Diplomacy: "Declare war" on a rival kingdom (needs the Military stage, soldiers ready, and no pact with them). Only one war at a time.
- The war appears as a campaign at the top of Military → Operations, built from the rival's current strength (their army, commander temperament, terrain and weather are generated). Fight it in person or send an expedition; Intel and the War room work against it too.
- Victories shrink the rival's strength (-15%), defeats embolden it (+5%). The war score (wins minus losses) decides the peace terms: reparations if you are ahead, a white peace if even, tribute if behind. "Sue for peace" ends the war.
- Consequences: relations with the rival fall sharply; honourable kingdoms dislike an aggressor, expansionist ones respect it; the enemy raids your gold more often during a war (a larger army deters them).
- Save version 7; war.ts / warCore.ts; 7 new tests (75 total).
- Not yet: conquering territory, other kingdoms joining wars, naval warfare.

## Version 0.6: Mastery and Simulations (complete, pending phone testing)

- New knowledge stage 4, Mastery. A doctrine at Practical Experience can be mastered by proving it: 2 successful uses in real battles, 3 successful war-room practice runs, and success on at least 2 different terrains. Claim it on the record page: the doctrine becomes 28% stronger (Practical Experience is 15%), plus reputation +3 and small attribute gains.
- War room (Military tab, needs a Military Academy): rehearse any understood doctrine against any open operation with your current army, for 40 gold. No soldiers are lost, no cooldowns; each run uses a fresh seed and shows round-by-round results and a lesson about why it worked or failed. Successes count toward Mastery.
- Real battles also count (once per doctrine per battle) and remember the terrain.
- Save version 6; masteryCore.ts / mastery.ts; 6 new tests (68 total).
- Not yet: combining mastered doctrines into new ones.

## Version 0.5: Offline Expeditions (complete, pending phone testing)

- On the battle preparation screen you can now "Send on expedition" instead of fighting in person. Your army, led by its commander (or you), marches out and the battle is resolved automatically with ordinary orders when the timer ends (Easy 5 min, Medium 15 min, Hard 30 min), even if the app is closed.
- Intelligence (scouts, spies, spy reports) and provisions still matter: they are chosen before the army leaves. Doctrines are not used on expeditions.
- Results arrive as a normal battle report; survivors come home, rewards are paid, the cooldown starts. Military tab shows a banner while the army is away. Only one battle or expedition at a time.
- Save version 5; expedition.ts; 5 new tests (62 total). Testing time-travel in Settings also brings armies home.
- Pacing: gold income x2.5 so military unlocks in roughly 4 hours of play.

## Version 0.4: Living World and Diplomacy (complete, pending phone testing)

Four rival kingdoms (the other civilisations) now act on their own, even while you are away:
- The world takes a turn every 30 real minutes (half a game day); long absences replay at most 24 turns.
- Each kingdom has a hidden temperament (Expansionist, Mercantile, Honourable, Treacherous), shuffled per game so it is not tied to any culture. You learn it by sending an envoy (or seeing its behaviour).
- Rival power grows over time; you only see a rumour ("stronger than you"), or a rough range if you own an Intelligence Bureau.
- Relations (-100 to +100) drift, and respond to your choices.

Map tab, new "Diplomacy" segment:
- Envoys (2 minutes): send gifts (+relations), propose a trade pact (needs relations 15), propose an alliance (relations 45, reputation 25). Success depends on relations, your Negotiation attribute and their temperament.
- Pacts pay gold per hour (trade 18, alliance 10) and each ally adds +3 morale at the start of your battles. You can break a pact, at a cost to relations and reputation.
- Messages from kingdoms: trade and alliance offers, tribute demands from stronger expansionists. Ignoring or refusing a demand sours relations; hostile, stronger kingdoms may raid your gold (a larger army deters them). Treacherous kingdoms may break pacts without warning.
- Overview shows a notice when messages await.

Technical: save version 4 (migration adds the world); worldCore.ts (pure rules), diplomacy.ts (actions); 14 new tests (57 total).
Not yet: war between you and a kingdom, diplomatic consequences of battles, kingdoms fighting each other.

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
- Pacing (tuned in v0.3): military unlocks at reputation 10 (was 15) and business gold income is x1.2 (with higher early business payouts) (`GOLD_INCOME_MULT` in economy.ts). Military (reputation 10) is reached in roughly 4 hours of play with greedy spending (was ~40 originally).

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
