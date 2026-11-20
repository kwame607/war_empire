import type { ImageSourcePropType } from 'react-native';

/** Wide 3D-rendered banners that open each main screen (see tools/render/hero.html, b_* scenes). */
export const BANNERS = {
  overview: require('../../assets/banners/overview.jpg'),
  economy: require('../../assets/banners/economy.jpg'),
  knowledge: require('../../assets/banners/knowledge.jpg'),
  military: require('../../assets/banners/military.jpg'),
  map: require('../../assets/banners/map.jpg'),
  navy: require('../../assets/banners/navy.jpg'),
  sea: require('../../assets/banners/sea.jpg'),
} satisfies Record<string, ImageSourcePropType>;
export type BannerKey = keyof typeof BANNERS;
