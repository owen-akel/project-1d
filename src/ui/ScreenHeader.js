import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Consistent screen header: optional back button, title, subtitle, and a right slot.
 * `children` renders below the title row (filter chips, segmented controls, etc).
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  children,
  bordered = true,
}) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.md,
          paddingBottom: spacing.lg,
        },
        bordered && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, { marginRight: spacing.md, backgroundColor: colors.backgroundSecondary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backIcon, { color: colors.textPrimary }]}>‹</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleBlock}>
          <Text style={[typography.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ? <View style={styles.right}>{right}</View> : null}
      </View>

      {children ? <View style={{ marginTop: spacing.lg }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '600',
    marginTop: -2,
  },
  right: {
    marginLeft: 12,
  },
});
