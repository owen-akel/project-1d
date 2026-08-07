import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * variants: primary | secondary | ghost | danger
 * sizes: sm | md
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) {
  const { colors, spacing, radius, typography } = useTheme();

  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.backgroundSecondary, fg: colors.textPrimary, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
    danger: { bg: colors.errorMuted, fg: colors.error, border: 'transparent' },
  }[variant] || {};

  const paddingVertical = size === 'sm' ? spacing.sm : spacing.md;
  const paddingHorizontal = size === 'sm' ? spacing.md : spacing.lg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: radius.md,
          paddingVertical,
          paddingHorizontal,
          opacity: disabled ? 0.45 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <Text style={[size === 'sm' ? typography.caption : typography.label, { color: palette.fg }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
