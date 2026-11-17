# WAR EMPIRE

*The business of becoming a master strategist.*

A mobile strategy, business and empire-management game built with React Native, Expo and TypeScript.

## Requirements

- Linux (or any OS) with **Node.js 20+** and npm (check with `node -v` and `npm -v`)
- An iPhone with the **Expo Go** app (App Store)
- Your computer and iPhone on the **same Wi-Fi network**

No Mac, Xcode or Android tools are needed.

## Install

```bash
cd war-empire
npm install
```

## Run on your iPhone

```bash
npx expo start
```

A QR code appears in the terminal. Open the iPhone **Camera** app, point it at the QR code and tap the banner to open it in Expo Go.

If your phone cannot connect (some Wi-Fi networks block device-to-device traffic), use tunnel mode:

```bash
npx expo start --tunnel
```

(Expo will offer to install `@expo/ngrok` the first time; say yes.)

## Run in the browser (optional preview)

```bash
npx expo start --web
```

## Quality checks

```bash
npm run typecheck    # TypeScript type check
npx expo lint        # code style / bug check
npm test             # game engine tests (economy, timers, offline progression, knowledge)
npx expo-doctor      # project and dependency health
```

## Updating to a newer version

If a new zip only changes files, unzip it over your `war-empire` folder and reload the app
(shake the phone, tap Reload). Run `npm install` again only when the update says
`package.json` changed. Your saved game lives on the phone and is not touched.

## Project structure

```
src/
  app/          Screens and navigation (Expo Router: each file is a route)
    (game)/     The five main tabs (overview, economy, knowledge, military, map) and profile
    record/     Historical record detail page
  components/   Reusable UI (ui/, map/, brand/, BusinessCard)
  theme/        Colours, fonts, spacing: the single source of design tokens
  data/         Game content: civilisations, backgrounds, businesses, world, knowledge
  game/         Pure game rules (no UI): types, economy, engine, selectors, tests
  store/        GameProvider: live state, ticking, autosave, offline catch-up
  storage/      SQLite save/load
assets/         Images and icons
DEVLOG.md       What is done and what remains
```

## Rules of the codebase

- Game rules live apart from visual components.
- Game content (civilisations, businesses, history) lives in data files, not inside screens.
- Install packages with `npx expo install <package>` so versions match the Expo SDK.
