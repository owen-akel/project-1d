import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const SIZES = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 104,
};

// How many connector bubbles fit before we collapse the rest into "+N".
const MAX_VISIBLE_BADGES = 2;

/**
 * `connectors` are the direct friends a second-degree person is linked through.
 * They render as small overlapping bubbles on the bottom edge, so you can see
 * at a glance *how* you know someone.
 */
export default function Avatar({
  name,
  uri,
  size = 'md',
  tone = 'primary',
  style,
  ring = false,
  connectors = [],
}) {
  const { colors, typography } = useTheme();
  const dimension = SIZES[size] || SIZES.md;

  const background = tone === 'muted' ? colors.primaryMuted : colors.primary;
  const foreground = tone === 'muted' ? colors.primary : colors.onPrimary;

  // Bubbles would be illegible below ~36pt, so skip them on the smallest avatar.
  const showBadges = connectors.length > 0 && dimension >= SIZES.sm;
  const badgeSize = Math.max(15, Math.round(dimension * 0.36));
  const visible = connectors.slice(0, MAX_VISIBLE_BADGES);
  const overflow = connectors.length - visible.length;

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      <View
        style={[
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: background,
            alignItems: 'center',
            justifyContent: 'center',
          },
          ring && { borderWidth: 2, borderColor: colors.background },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
          />
        ) : (
          <Text
            style={[
              typography.label,
              {
                color: foreground,
                fontSize: Math.max(11, Math.round(dimension * 0.34)),
                letterSpacing: 0.3,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      {showBadges ? (
        <View
          style={styles.badgeRow}
          accessibilityLabel={`Connected through ${connectors.map((c) => c.name).join(', ')}`}
        >
          {visible.map((connector, index) => (
            <View
              key={connector.id}
              style={[
                styles.badge,
                {
                  width: badgeSize,
                  height: badgeSize,
                  borderRadius: badgeSize / 2,
                  backgroundColor: colors.primary,
                  borderColor: colors.background,
                  marginLeft: index === 0 ? 0 : -badgeSize * 0.32,
                  zIndex: MAX_VISIBLE_BADGES - index,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: colors.onPrimary, fontSize: Math.max(7, Math.round(badgeSize * 0.44)) },
                ]}
                numberOfLines={1}
              >
                {getInitials(connector.name)}
              </Text>
            </View>
          ))}

          {overflow > 0 ? (
            <View
              style={[
                styles.badge,
                {
                  width: badgeSize,
                  height: badgeSize,
                  borderRadius: badgeSize / 2,
                  backgroundColor: colors.textTertiary,
                  borderColor: colors.background,
                  marginLeft: -badgeSize * 0.32,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: colors.onPrimary, fontSize: Math.max(7, Math.round(badgeSize * 0.42)) },
                ]}
              >
                +{overflow}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    // Pinned inside the container's bounds — the square corner around a round
    // avatar is empty anyway, and overflowing here gets clipped on Android.
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
});
