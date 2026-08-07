import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Card({ children, style, onPress, padded = true, elevation = 'sm' }) {
  const { colors, spacing, radius, shadows } = useTheme();

  const cardStyle = [
    {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.cardBorder,
      padding: padded ? spacing.lg : 0,
    },
    shadows[elevation] || shadows.sm,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.75}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
