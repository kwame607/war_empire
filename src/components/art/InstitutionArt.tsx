import { Image, View } from 'react-native';

import { Illustration } from '@/components/art/Illustration';
import { INSTITUTION_ART } from '@/data/institutionArt';

/** The rendered picture of an institution; `dim` greys it for buildings you cannot raise yet. Falls back to the flat illustration. */
export function InstitutionArt({ id, dim }: { id: string; dim?: boolean }) {
  const src = INSTITUTION_ART[id];
  if (!src) return <Illustration id={id} />;
  return (
    <View style={{ width: '100%', aspectRatio: 800 / 447, borderRadius: 8, overflow: 'hidden', marginBottom: 8, backgroundColor: '#1f2a3a' }}>
      <Image source={src} accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%', opacity: dim ? 0.55 : 1 }} resizeMode="cover" />
    </View>
  );
}
