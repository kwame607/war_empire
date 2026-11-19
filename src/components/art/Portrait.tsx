import { Image, StyleSheet, View } from 'react-native';

import { portraitSource } from '@/data/portraits';
import { colors } from '@/theme';

type Props = { civId: string; name: string; size?: number };

/** Commander bust. The same name always shows the same face. */
export function Portrait({ civId, name, size = 56 }: Props) {
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size / 6 }]}>
      <Image source={portraitSource(civId, name)} style={{ width: size, height: size }} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderWidth: 1.5, borderColor: colors.gold },
});
