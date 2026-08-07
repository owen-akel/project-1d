import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * The "you're replying to this" card that sits above your reply in a chat,
 * the way a story reply looks in Instagram.
 *
 * `attached` draws the elbow connector down into the message bubble below it;
 * without it the card stands alone (used before any reply has been sent).
 */
export default function ReplyContext({ context, attached = false, align = 'right' }) {
  const { colors, spacing, radius, typography } = useTheme();

  if (!context?.eventTitle) return null;

  const alignSelf = align === 'right' ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.wrapper, { alignSelf, maxWidth: '78%' }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.sm,
            gap: spacing.sm,
          },
        ]}
      >
        {context.imageUrl ? (
          <Image
            source={{ uri: context.imageUrl }}
            style={[styles.thumb, { borderRadius: radius.sm }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.thumb,
              styles.thumbFallback,
              { backgroundColor: colors.primaryMuted, borderRadius: radius.sm },
            ]}
          >
            <Text style={styles.thumbIcon}>🎟️</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 11 }]}>
            Replying to you {context.label || 'going to'}
          </Text>
          <Text
            style={[typography.caption, { color: colors.textPrimary, fontWeight: '600', marginTop: 1 }]}
            numberOfLines={2}
          >
            {context.eventTitle}
          </Text>
        </View>
      </View>

      {/* The |_ elbow linking the event down into the reply bubble. */}
      {attached ? (
        <View
          style={[
            styles.connector,
            { borderColor: colors.borderStrong },
            align === 'right'
              ? {
                  alignSelf: 'flex-end',
                  marginRight: 22,
                  borderRightWidth: 1.5,
                  borderBottomRightRadius: 9,
                }
              : {
                  alignSelf: 'flex-start',
                  marginLeft: 22,
                  borderLeftWidth: 1.5,
                  borderBottomLeftRadius: 9,
                },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 34,
    height: 34,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: {
    fontSize: 16,
  },
  body: {
    flexShrink: 1,
  },
  connector: {
    height: 14,
    width: 14,
    borderBottomWidth: 1.5,
  },
});
