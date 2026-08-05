import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function StatTile({ value, label, hint, onPress, emphasis = false, style }) {
  const { colors, spacing, radius, typography } = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.tile,
        {
          backgroundColor: emphasis ? colors.primaryMuted : colors.card,
          borderColor: emphasis ? 'transparent' : colors.cardBorder,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.display,
          { color: emphasis ? colors.primary : colors.textPrimary, fontSize: 26 },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
        numberOfLines={2}
      >
        {label}
      </Text>
      {hint ? (
        <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 11, marginTop: 4 }]}>
          {hint}
        </Text>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 92,
    justifyContent: 'center',
  },
});
