import type { ImageSourcePropType } from 'react-native';

/** 3D-rendered banner pictures for each institution and business (see tools/render/hero.html). */
export const INSTITUTION_ART: Record<string, ImageSourcePropType> = {
  barracks: require('../../assets/institutions/barracks.jpg'),
  library: require('../../assets/institutions/library.jpg'),
  academy: require('../../assets/institutions/academy.jpg'),
  armoury: require('../../assets/institutions/armoury.jpg'),
  bureau: require('../../assets/institutions/bureau.jpg'),
  shipyard: require('../../assets/institutions/shipyard.jpg'),
  farm: require('../../assets/institutions/farm.jpg'),
  timber: require('../../assets/institutions/timber.jpg'),
  quarry: require('../../assets/institutions/quarry.jpg'),
  workshop: require('../../assets/institutions/workshop.jpg'),
  market: require('../../assets/institutions/market.jpg'),
};
