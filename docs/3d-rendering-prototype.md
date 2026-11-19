# WAR EMPIRE 3D Rendering Prototype

## Goal

Develop an optional hybrid-3D presentation layer for settlements and battlefields while preserving the current game systems and the existing 2D rendered-art presentation as a fallback.

This work lives on the `3d-rendering-prototype` branch. Do not merge it into `main` until the prototype is tested and reviewed.

## Current implementation (inspected on 2026-11-19)

- The app is Expo SDK 58 / React Native 0.88 / React 19 / TypeScript.
- `tools/render/buildings.js` and the `tools/render` pipeline use Three.js in headless Chromium to render building and terrain artwork to PNG/JPG assets.
- `SettlementScene.tsx` composes a terrain image, transparent building sprites and SVG hit areas. The buildings are not live 3D objects at runtime.
- `BattleField.tsx` composes a pre-rendered terrain image and animated 2D unit sprites. Battle state and tactical calculations are separate from the presentation.
- The existing generated asset data lives in `src/data/townAssets.ts` and `src/data/battleAssets.ts`.

## Visual direction

Use a stylised, low-poly, isometric hybrid-3D style. Prioritise readability, strong silhouettes, warm historical materials and stable performance on iPhone.

The prototype should support:
- A perspective or orthographic camera with pan, zoom and controlled rotation.
- Individual 3D building meshes placed in a settlement scene.
- Reusable terrain tiles/meshes and simple environmental props.
- A battlefield scene that can display terrain features and unit formations.
- Simple animation (water/flags/smoke and unit movement) only after stable rendering is proven.
- Existing React Native HUD, game state, navigation and battle rules remain authoritative.

## Non-goals for the first spike

- Replacing the whole game engine.
- Rewriting game state, combat resolution, economy or save systems.
- Implementing multiplayer.
- Creating a large asset library before proving the renderer.
- Removing the existing sprite-based scenes.

## iPhone testing constraint (verified 2026-11-19)

This repository uses Expo SDK 58. The Expo Go build currently distributed through the iOS App Store does not support SDK 58; Expo's current guidance for SDK 55+ on a physical iPhone is to build a compatible Expo Go app with `eas go` and distribute it through TestFlight, or preferably use a project-specific development build through EAS. TestFlight distribution to a physical iPhone requires Apple Developer Program membership. We must explain this before asking the owner to pay or enroll.

A Linux machine can use EAS cloud builds for iOS without installing Xcode locally. The owner should not be told that a local iOS Simulator is available on Linux.

Official references:
- https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/
- https://docs.expo.dev/develop/development-builds/introduction/
- https://docs.expo.dev/versions/latest/sdk/gl-view/

## Candidate rendering path

Expo SDK 58 documents `expo-gl` (~58.0.4) as a GLView/WebGL render target. The prototype uses Three.js directly with the Expo GL context rather than `expo-three`, whose transitive browser polyfill declares an obsolete React Native peer range. This direct renderer adapter is a candidate, not yet a proven combination for this repository. Validate on SDK 58 / React Native 0.88 / React 19.3 before committing to it.

## Technical investigation before dependency changes

The app currently targets Expo SDK 58 and React Native 0.88. Before installing or upgrading any graphics dependency, verify compatibility with this exact Expo / React Native version and the intended iOS deployment route.

Evaluate:
1. Three.js with Expo GL / a React Native renderer integration.
2. Whether the selected integration supports the current React Native architecture and Expo SDK.
3. Whether it can be used in a custom iOS development build without requiring a local Mac.
4. Web preview support and the differences from actual iPhone rendering.
5. Memory, draw-call, texture-size and frame-rate implications.

Do not assume that a package compatible with an older Expo SDK will work with SDK 58. Do not upgrade Expo or React Native merely to make a graphics library fit without documenting the trade-offs.

## Prototype sequence

### P0 — Baseline and compatibility
- Record the current main-branch commit used to create this branch.
- Confirm current typecheck, lint and test commands and record any pre-existing failures.
- Verify renderer/package compatibility before changing app dependencies.
- Keep the current app buildable.

### P1 — Single 3D building
- Add an isolated prototype screen/route, not a replacement for the production settlement.
- Render one low-poly building with visible roof, walls, openings and basic lighting.
- Add camera orbit (limited rotation), pan and pinch zoom.
- Include a fallback/error state so a renderer failure does not crash the rest of the app.
- Confirm the scene is interactive on a physical iPhone.

### P2 — Small settlement
- Place a keep, a few houses, a market and trees on a compact terrain.
- Use reusable geometry/materials and shared assets.
- Add tap selection for buildings and connect selection to existing game data only after the visual prototype is stable.
- Compare frame rate and memory use against the existing SettlementScene.

### P3 — 3D battlefield
- Build a small terrain test map with at least two terrain features (e.g. hill and river).
- Render unit formations as simple low-poly models or instanced meshes.
- Drive unit positions from existing battle state; do not duplicate or rewrite battle rules.
- Add one test movement/engagement animation.
- Preserve the current BattleField as a fallback.

### P4 — Polish and decision
- Test on an actual iPhone at more than one screen size where possible.
- Check touch controls, orientation, frame stability, loading time and memory.
- Document limitations and decide whether to expand, optimise or retain the sprite renderer for some devices.

## Acceptance criteria

The first useful milestone is P1:
- The normal game still launches.
- The existing settlement and battlefield still work.
- A separate 3D prototype route displays one real-time 3D building.
- Camera interaction works without blocking normal UI navigation.
- TypeScript checks pass, and existing tests remain passing (or any pre-existing failures are documented).
- iPhone testing instructions are documented.

## Safety and collaboration rules

- Never commit secrets, signing credentials, provisioning profiles or `.env` files.
- Do not force-push or rewrite shared history.
- Do not modify `main`.
- Keep commits small and explain each change.
- Prefer additive changes and preserve the existing render pipeline until the replacement is proven.

## Implemented prototype files

- `src/components/3d/BuildingPreview.tsx`: isolated GLView + Three.js procedural building scene with drag rotation and zoom controls.
- `src/app/(game)/3d-lab.tsx`: dedicated experimental screen.
- `src/app/(game)/_layout.tsx`: hides the lab from the normal tab bar.
- `src/app/settings.tsx`: entry point under Experimental.
- `package.json`: uses Expo GL and Three.js directly. `expo-three` was removed because its transitive `@expo/browser-polyfill` declares a React Native 0.64 peer range, which conflicts with this app's React Native 0.88 runtime.

The GLView prototype now creates a Three.js `WebGLRenderer` directly using Expo's GL context and a minimal canvas shim. This removes the incompatible wrapper dependency, but it remains an unverified integration until it is run on web and a native development build.

The current implementation is a first code spike, not yet verified on device. It intentionally does not replace `SettlementScene` or `BattleField`.

## Local validation required

From a clone of this branch:
```bash
npm install
npx expo install --check
npm run typecheck
npm test
npm run lint
npx expo start --web
```
Web preview is a useful first check but does not prove iOS GL compatibility. Physical iPhone validation requires a compatible iOS development build. Do not merge until TypeScript, tests, lint and device checks are reviewed.
