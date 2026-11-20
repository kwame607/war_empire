import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Illustration } from '@/components/art/Illustration';
import { INSTITUTION_ART } from '@/data/institutionArt';
import { colors, fonts } from '@/theme';

type Props = {
  id: string;
  /** Name drawn over the picture, like the title of a game card. */
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shown at the top-right corner of the picture (a level medal, a lock...). */
  badge?: ReactNode;
  /** Greys the picture for things you cannot build yet. */
  dim?: boolean;
};

/** The rendered picture of a building, with its name on a dark fade across the bottom. Falls back to the flat illustration. */
export function InstitutionArt({ id, title, icon, badge, dim }: Props) {
  const src = INSTITUTION_ART[id];
  if (!src) return <Illustration id={id} />;
  return (
    <View style={styles.frame}>
      <Image source={src} accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%', opacity: dim ? 0.5 : 1 }} resizeMode="cover" />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" pointerEvents="none">
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.45" stopColor="#0B1220" stopOpacity="0" />
            <Stop offset="1" stopColor="#0B1220" stopOpacity="0.92" />
          </LinearGradient>
          <LinearGradient id="top" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B1220" stopOpacity="0.45" />
            <Stop offset="0.3" stopColor="#0B1220" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#top)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#fade)" />
      </Svg>
      {badge ? <View style={styles.badge}>{badge}</View> : null}
      {title ? (
        <View style={styles.titleRow} pointerEvents="none">
          {icon ? <Ionicons name={icon} size={20} color={colors.gold} /> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 800 / 447, borderRadius: 8, overflow: 'hidden', marginBottom: 8, backgroundColor: '#1f2a3a', borderWidth: 1, borderColor: 'rgba(212,172,79,0.45)' },
  badge: { position: 'absolute', top: 8, right: 8 },
  titleRow: { position: 'absolute', left: 10, right: 10, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '800', color: '#F3E7C8', textShadowColor: '#000', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
});
