import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Chip({ label, selected = false, onPress, style }) {
  const { colors, spacing, radius, typography } = useTheme();

  const content = (
    <Text
      style={[
        typography.caption,
        { color: selected ? colors.onPrimary : colors.textSecondary },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );

  const chipStyle = [
    styles.chip,
    {
      backgroundColor: selected ? colors.primary : colors.backgroundSecondary,
      borderColor: selected ? colors.primary : colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 1,
    },
    style,
  ];

  if (!onPress) {
    return <View style={chipStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
});
