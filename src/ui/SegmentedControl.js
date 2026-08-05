import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * segments: [{ key, label, badge? }]
 */
export default function SegmentedControl({ segments, value, onChange, style }) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderRadius: radius.md,
          padding: 3,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {segments.map((segment) => {
        const active = segment.key === value;
        return (
          <TouchableOpacity
            key={segment.key}
            onPress={() => onChange(segment.key)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.segment,
              {
                borderRadius: radius.sm + 1,
                paddingVertical: spacing.sm,
                backgroundColor: active ? colors.card : 'transparent',
              },
              active && {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
                elevation: 1,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                { color: active ? colors.textPrimary : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {segment.label}
            </Text>
            {segment.badge ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary, marginLeft: spacing.xs + 2 },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{segment.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
