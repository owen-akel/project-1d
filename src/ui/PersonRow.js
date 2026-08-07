import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Avatar from './Avatar';

const viaLabel = (connectors) => {
  if (!connectors || connectors.length === 0) return null;
  const names = connectors.map((connector) => connector.name.split(' ')[0]);
  if (names.length <= 2) return `via ${names.join(' & ')}`;
  return `via ${names.slice(0, 2).join(', ')} +${names.length - 2}`;
};

/**
 * One person in a list: avatar, name, supporting line, an optional message
 * shortcut, and an optional action slot.
 *
 * `connectors` are the direct friends this person is linked through; they show
 * as bubbles on the avatar and, unless `meta` overrides it, as a "via …" line.
 */
export default function PersonRow({
  name,
  subtitle,
  meta,
  avatarUri,
  onPress,
  onMessage,
  right,
  connectors = [],
  selected = false,
  style,
}) {
  const { colors, spacing, radius, typography } = useTheme();

  const Container = onPress ? TouchableOpacity : View;
  const metaLine = meta !== undefined ? meta : viaLabel(connectors);

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.row,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          backgroundColor: selected ? colors.primaryMuted : 'transparent',
        },
        style,
      ]}
    >
      <Avatar
        name={name}
        uri={avatarUri}
        size="md"
        tone={selected ? 'primary' : 'muted'}
        connectors={connectors}
      />

      <View style={[styles.body, { marginLeft: spacing.md }]}>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {metaLine ? (
          <Text
            style={[typography.caption, { color: colors.textTertiary, fontSize: 11, marginTop: 2 }]}
            numberOfLines={1}
          >
            {metaLine}
          </Text>
        ) : null}
      </View>

      {onMessage ? (
        <TouchableOpacity
          onPress={onMessage}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Message ${name}`}
          style={[
            styles.messageButton,
            {
              marginLeft: spacing.sm,
              backgroundColor: colors.primaryMuted,
              borderRadius: radius.pill,
            },
          ]}
        >
          <Text style={styles.messageIcon}>💬</Text>
        </TouchableOpacity>
      ) : null}

      {right ? <View style={{ marginLeft: spacing.sm }}>{right}</View> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  messageButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIcon: {
    fontSize: 15,
  },
});
