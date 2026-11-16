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
npx tsc --noEmit     # TypeScript type check
npx expo lint        # code style / bug check
npx expo-doctor      # project and dependency health
```

## Project structure

```
src/
  app/          Screens and navigation (Expo Router: each file is a route)
  components/   Reusable UI (brand/, ui/)
  theme/        Colours, fonts, spacing: the single source of design tokens
  data/         (coming) civilisations, businesses, knowledge entries
  game/         (coming) pure game rules, no UI code
  store/        (coming) game state
  storage/      (coming) SQLite saves
assets/         Images and icons
DEVLOG.md       What is done and what remains
```

## Rules of the codebase

- Game rules live apart from visual components.
- Game content (civilisations, businesses, history) lives in data files, not inside screens.
- Install packages with `npx expo install <package>` so versions match the Expo SDK.
