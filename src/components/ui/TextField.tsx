import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, fonts, radius } from '@/theme';

export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.bronze} selectionColor={colors.gold} {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.bronze,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 14,
    color: colors.parchment,
    fontFamily: fonts.serif,
    fontSize: 18,
  },
});
