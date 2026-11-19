// Generated from tools/render/portraits — do not edit by hand.

import { portraitKey } from './portraitKeys';

const PORTRAITS: Record<string, number> = {
  sikaman_1: require('../../assets/portraits/sikaman_1.jpg'),
  sikaman_2: require('../../assets/portraits/sikaman_2.jpg'),
  sikaman_3: require('../../assets/portraits/sikaman_3.jpg'),
  sikaman_4: require('../../assets/portraits/sikaman_4.jpg'),
  sikaman_5: require('../../assets/portraits/sikaman_5.jpg'),
  sikaman_6: require('../../assets/portraits/sikaman_6.jpg'),
  niani_1: require('../../assets/portraits/niani_1.jpg'),
  niani_2: require('../../assets/portraits/niani_2.jpg'),
  niani_3: require('../../assets/portraits/niani_3.jpg'),
  niani_4: require('../../assets/portraits/niani_4.jpg'),
  niani_5: require('../../assets/portraits/niani_5.jpg'),
  niani_6: require('../../assets/portraits/niani_6.jpg'),
  fjordlands_1: require('../../assets/portraits/fjordlands_1.jpg'),
  fjordlands_2: require('../../assets/portraits/fjordlands_2.jpg'),
  fjordlands_3: require('../../assets/portraits/fjordlands_3.jpg'),
  fjordlands_4: require('../../assets/portraits/fjordlands_4.jpg'),
  fjordlands_5: require('../../assets/portraits/fjordlands_5.jpg'),
  fjordlands_6: require('../../assets/portraits/fjordlands_6.jpg'),
  aurelia_1: require('../../assets/portraits/aurelia_1.jpg'),
  aurelia_2: require('../../assets/portraits/aurelia_2.jpg'),
  aurelia_3: require('../../assets/portraits/aurelia_3.jpg'),
  aurelia_4: require('../../assets/portraits/aurelia_4.jpg'),
  aurelia_5: require('../../assets/portraits/aurelia_5.jpg'),
  aurelia_6: require('../../assets/portraits/aurelia_6.jpg'),
  serene_1: require('../../assets/portraits/serene_1.jpg'),
  serene_2: require('../../assets/portraits/serene_2.jpg'),
  serene_3: require('../../assets/portraits/serene_3.jpg'),
  serene_4: require('../../assets/portraits/serene_4.jpg'),
  serene_5: require('../../assets/portraits/serene_5.jpg'),
  serene_6: require('../../assets/portraits/serene_6.jpg'),
};

export function portraitSource(civId: string, name: string): number {
  return PORTRAITS[portraitKey(civId, name)];
}
