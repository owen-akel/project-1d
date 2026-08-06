import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import BottomSheet from './BottomSheet';
import Button from './Button';

const formatOccurrence = (occurrence) => {
  if (occurrence?.startAt) {
    const parsed = new Date(occurrence.startAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }
  return occurrence?.date || 'TBD';
};

/**
 * The event detail sheet, shared by the local list and the map so tapping a pin
 * gives you exactly what tapping a card does.
 *
 * `countAttendees` resolves how many visible people are on a given occurrence;
 * `onToggleGoing` is omitted on surfaces that are read-only.
 */
export default function EventDetailsSheet({
  visible,
  onClose,
  event,
  countAttendees = () => 0,
  isGoing = () => false,
  onToggleGoing,
}) {
  const { colors, spacing, typography } = useTheme();

  const occurrences =
    event?.occurrences?.length > 0
      ? event.occurrences
      : [{ id: event?.id, date: event?.date || 'TBD', attendeeIds: event?.attendeeIds || [] }];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={event?.title || 'Event'}
      subtitle={event?.location}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: spacing.xl }}>
        {event?.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={[styles.image, { backgroundColor: colors.backgroundSecondary }]}
            resizeMode="cover"
          />
        ) : null}

        <Text style={[typography.heading, { color: colors.textPrimary, marginBottom: spacing.xs }]}>
          About
        </Text>
        <Text
          style={[typography.body, { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.lg }]}
        >
          {event?.description || 'No description available.'}
        </Text>

        <Text style={[typography.heading, { color: colors.textPrimary }]}>
          Dates &amp; times · {occurrences.length}
        </Text>

        {occurrences.map((occurrence, index) => {
          const going = isGoing(occurrence);
          const count = countAttendees(occurrence);

          return (
            <View
              key={`${occurrence.id || index}-${occurrence.startAt || occurrence.date}`}
              style={[styles.row, { borderBottomColor: colors.border, paddingVertical: spacing.md }]}
            >
              <View style={styles.rowTop}>
                <Text style={[typography.body, { color: colors.textPrimary, flex: 1, fontWeight: '600' }]}>
                  {formatOccurrence(occurrence)}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {count} going
                </Text>
              </View>

              {onToggleGoing ? (
                <Button
                  label={going ? "I'm going ✓" : "I'm going"}
                  variant={going ? 'primary' : 'secondary'}
                  size="sm"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                  onPress={() => onToggleGoing(event, occurrence)}
                />
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
