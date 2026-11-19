# Town art pipeline

The settlement pictures are 3D models (three.js) rendered to PNG with headless Chromium, so artwork can be
changed without a 3D app. Not shipped in the app; only `assets/town/*` and `src/data/town*.ts` are.

1. `npm i three@0.160.0` here, then serve this folder (`run.js` does it) and render with Playwright:
   `NODE_PATH=$(npm root -g) OUT=bake node run.js "farm@w=1500&h=1500&ppu=40&oy=0.8" "terrain@w=3500&h=1800&ppu=40&oy=0.56"`
2. Edit `lib.js` (materials, helpers) and `buildings.js` (one function per building) to change the look.
3. `python3 process.py` trims and shrinks sprites into `assets/town` and writes `manifest.json`.
4. Edit `layout.py` for slot positions, then `python3 gen_ts.py` to regenerate `src/data/townAssets.ts` and `townLayout.ts`.
