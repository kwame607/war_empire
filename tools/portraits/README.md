# Portraits

The shipped portraits are rendered from code (`tools/render/portraits.js`). To swap in AI-generated paintings:

1. Open `PROMPTS.md`, generate one image per prompt in any image generator (Midjourney, DALL·E / ChatGPT, Leonardo, Bing Image Creator, Adobe Firefly…). Use the same style line for the whole set.
2. Save them as `sikaman_1.png … serene_6.png` in one folder.
3. `python3 tools/portraits/install.py /path/to/that/folder`
4. `npx expo start -c`, reload, done. You can replace a few at a time; the rest keep the rendered ones.

Check the licence of the generator you use allows use in a game you may publish.
