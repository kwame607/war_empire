const SK = { ebony: 0x4a2f20, deep: 0x5e3b27, brown: 0x7a4e33, warm: 0x95623f, tan: 0xb98763, olive: 0xc79a72, fair: 0xe3bf9d, pale: 0xefd3b8 };
const BG = { sikaman: ['#7a5a1a', '#1d1608'], niani: ['#244a78', '#0d1a2e'], fjordlands: ['#5a6e86', '#161d28'], aurelia: ['#7a2430', '#220a10'], serene: ['#2a5a78', '#0c1c2a'] };
const mk = (civ, o) => ({ bg: BG[civ], o });
export const PORTRAITS = {
  // Sikaman: gold, green and woven cloth
  sikaman_1: mk('sikaman', { skin: SK.deep, hair: 0x0d0a08, hairStyle: 'short', beard: 'short', gender: 'm', age: 0, headType: 'circlet', cloak: 0x1f6a46, trim: 0xd4ac4f, collar: 'gold', gem: 0xd9a23a, sash: 0xd4ac4f }),
  sikaman_2: mk('sikaman', { skin: SK.ebony, hair: 0x0d0a08, hairStyle: 'none', beard: 'full', gender: 'm', age: 1, headType: 'cap', headColor: 0xd4ac4f, cloak: 0x8a2a2a, trim: 0xd4ac4f, collar: 'gold', stern: 1, sash: 0x1f6a46 }),
  sikaman_3: mk('sikaman', { skin: SK.brown, hair: 0xcfcfcf, hairStyle: 'none', beard: 'short', gender: 'm', age: 2, headType: 'wrap', headColor: 0xe8d9a8, cloak: 0xd4ac4f, trim: 0x1f6a46, collar: 'gold' }),
  sikaman_4: mk('sikaman', { skin: SK.warm, hair: 0x0d0a08, hairStyle: 'braid', gender: 'f', age: 0, headType: 'wrap', headColor: 0xd4ac4f, cloak: 0x1f6a46, trim: 0xd4ac4f, collar: 'gold', gem: 0x2f8a5a }),
  sikaman_5: mk('sikaman', { skin: SK.deep, hair: 0x0d0a08, hairStyle: 'bun', gender: 'f', age: 1, headType: 'circlet', cloak: 0x8a2a2a, trim: 0xd4ac4f, collar: 'gold', stern: 1 }),
  sikaman_6: mk('sikaman', { skin: SK.ebony, hair: 0xd8d8d8, hairStyle: 'short', gender: 'f', age: 2, headType: 'wrap', headColor: 0x1f6a46, cloak: 0xd4ac4f, trim: 0x8a2a2a, collar: 'gold' }),
  // Niani: indigo, white turbans
  niani_1: mk('niani', { skin: SK.brown, hair: 0x0d0a08, beard: 'short', gender: 'm', age: 0, headType: 'turban', headColor: 0xf0ead8, cloak: 0x1f3f7a, trim: 0xd4ac4f, collar: 'gold', gem: 0x2f6a8a }),
  niani_2: mk('niani', { skin: SK.deep, hair: 0x0d0a08, beard: 'full', gender: 'm', age: 1, headType: 'turban', headColor: 0x1f3f7a, cloak: 0xe8e0c8, trim: 0x1f3f7a, collar: 'gold', stern: 1, sash: 0xd4ac4f }),
  niani_3: mk('niani', { skin: SK.ebony, hair: 0xd8d8d8, beard: 'full', gender: 'm', age: 2, headType: 'turban', headColor: 0xe8e0c8, cloak: 0x2a3f6a, trim: 0xd4ac4f, collar: 'gold' }),
  niani_4: mk('niani', { skin: SK.warm, hair: 0x0d0a08, hairStyle: 'none', gender: 'f', age: 0, headType: 'wrap', headColor: 0x1f3f7a, cloak: 0xe8e0c8, trim: 0xd4ac4f, collar: 'gold', gem: 0x2f6a8a }),
  niani_5: mk('niani', { skin: SK.brown, hair: 0x0d0a08, hairStyle: 'none', gender: 'f', age: 1, headType: 'turban', headColor: 0xf0ead8, cloak: 0x1f3f7a, trim: 0xd4ac4f, collar: 'gold', stern: 1 }),
  niani_6: mk('niani', { skin: SK.deep, hair: 0xd8d8d8, hairStyle: 'none', gender: 'f', age: 2, headType: 'wrap', headColor: 0xe8e0c8, cloak: 0x2a3f6a, trim: 0xd4ac4f, collar: 'gold' }),
  // Fjordlands: fur, steel, braids
  fjordlands_1: mk('fjordlands', { skin: SK.fair, hair: 0xc8a050, hairStyle: 'braid', beard: 'braids', gender: 'm', age: 0, headType: 'nasal', cloak: 0x34508a, trim: 0xb0b4ba, collar: 'fur', armor: 1, eye: 0x4a7aa0 }),
  fjordlands_2: mk('fjordlands', { skin: SK.pale, hair: 0x6a3a1a, hairStyle: 'long', beard: 'full', gender: 'm', age: 1, headType: 'none', cloak: 0x5a2a2a, trim: 0xb0b4ba, collar: 'fur', stern: 1, eye: 0x6a8a6a }),
  fjordlands_3: mk('fjordlands', { skin: SK.fair, hair: 0xe0e0e0, hairStyle: 'long', beard: 'full', gender: 'm', age: 2, headType: 'nasal', cloak: 0x34508a, trim: 0xb0b4ba, collar: 'fur', armor: 1, eye: 0x6a8aa0 }),
  fjordlands_4: mk('fjordlands', { skin: SK.pale, hair: 0xd8b060, hairStyle: 'braid', gender: 'f', age: 0, headType: 'none', cloak: 0x34508a, trim: 0xb0b4ba, collar: 'fur', eye: 0x4a7aa0 }),
  fjordlands_5: mk('fjordlands', { skin: SK.fair, hair: 0x8a4a1a, hairStyle: 'long', gender: 'f', age: 1, headType: 'nasal', cloak: 0x2f6a4a, trim: 0xb0b4ba, collar: 'fur', armor: 1, stern: 1, eye: 0x5a8a6a }),
  fjordlands_6: mk('fjordlands', { skin: SK.pale, hair: 0xe8e8e8, hairStyle: 'bun', gender: 'f', age: 2, headType: 'none', cloak: 0x5a2a2a, trim: 0xb0b4ba, collar: 'fur', eye: 0x6a8aa0 }),
  // Aurelia: crimson, bronze, laurels
  aurelia_1: mk('aurelia', { skin: SK.olive, hair: 0x2a1a10, hairStyle: 'short', gender: 'm', age: 0, headType: 'laurel', cloak: 0xa33440, trim: 0xd4ac4f, collar: 'gold', gem: 0xd4ac4f, armor: 1 }),
  aurelia_2: mk('aurelia', { skin: SK.tan, hair: 0x1a120c, hairStyle: 'short', beard: 'short', gender: 'm', age: 1, headType: 'crest', cloak: 0xa33440, trim: 0xd4ac4f, collar: 'gold', stern: 1, armor: 1 }),
  aurelia_3: mk('aurelia', { skin: SK.olive, hair: 0xd0d0d0, hairStyle: 'short', gender: 'm', age: 2, headType: 'laurel', cloak: 0xeee6d2, trim: 0xa33440, collar: 'gold', sash: 0xa33440 }),
  aurelia_4: mk('aurelia', { skin: SK.tan, hair: 0x2a1a10, hairStyle: 'bun', gender: 'f', age: 0, headType: 'laurel', cloak: 0xa33440, trim: 0xd4ac4f, collar: 'gold', gem: 0xd4ac4f }),
  aurelia_5: mk('aurelia', { skin: SK.warm, hair: 0x1a120c, hairStyle: 'braid', gender: 'f', age: 1, headType: 'crest', cloak: 0x6a1f2a, trim: 0xd4ac4f, collar: 'gold', stern: 1, armor: 1 }),
  aurelia_6: mk('aurelia', { skin: SK.olive, hair: 0xd8d8d8, hairStyle: 'bun', gender: 'f', age: 2, headType: 'none', cloak: 0xeee6d2, trim: 0xa33440, collar: 'gold' }),
  // Serene: blue, gold, berets
  serene_1: mk('serene', { skin: SK.fair, hair: 0x3a2412, hairStyle: 'long', beard: 'short', gender: 'm', age: 0, headType: 'beret', headColor: 0x7a1f2a, cloak: 0x1f4a7a, trim: 0xd4ac4f, collar: 'ruff', sash: 0xd4ac4f }),
  serene_2: mk('serene', { skin: SK.olive, hair: 0x1a120c, hairStyle: 'short', beard: 'full', gender: 'm', age: 1, headType: 'beret', headColor: 0x1f4a7a, cloak: 0x7a1f2a, trim: 0xd4ac4f, collar: 'ruff', stern: 1 }),
  serene_3: mk('serene', { skin: SK.fair, hair: 0xd8d8d8, hairStyle: 'long', beard: 'full', gender: 'm', age: 2, headType: 'cap', headColor: 0x1a1a22, cloak: 0x1a1a22, trim: 0xd4ac4f, collar: 'ruff' }),
  serene_4: mk('serene', { skin: SK.pale, hair: 0xb8782a, hairStyle: 'long', gender: 'f', age: 0, headType: 'beret', headColor: 0x1f4a7a, cloak: 0x7a1f2a, trim: 0xd4ac4f, collar: 'ruff', gem: 0xf0ead8 }),
  serene_5: mk('serene', { skin: SK.olive, hair: 0x1a120c, hairStyle: 'bun', gender: 'f', age: 1, headType: 'circlet', cloak: 0x1f4a7a, trim: 0xd4ac4f, collar: 'ruff', stern: 1 }),
  serene_6: mk('serene', { skin: SK.fair, hair: 0xe0e0e0, hairStyle: 'bun', gender: 'f', age: 2, headType: 'cap', headColor: 0xf0ead8, cloak: 0x2a2a3a, trim: 0xd4ac4f, collar: 'ruff' }),
};
