import { useState } from 'react';
import { View } from 'react-native';

import { ShapeSvg } from '@/components/art/ShapeSvg';
import { ART_H, ART_W, getIllustration } from '@/data/illustrations';

/** A small illustrated banner for a business or institution, sized to fill its container. */
export function Illustration({ id }: { id: string }) {
  const [width, setWidth] = useState(0);
  const shapes = getIllustration(id);
  if (!shapes) return null;
  return (
    <View style={{ width: '100%', aspectRatio: ART_W / ART_H, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? <ShapeSvg shapes={shapes} w={ART_W} h={ART_H} width={width} /> : null}
    </View>
  );
}
