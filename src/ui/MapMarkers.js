import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '../../context/ThemeContext';
import Avatar from './Avatar';
import CategoryIcon from './categoryIcons';

/**
 * Markers with custom children have to keep `tracksViewChanges` on until the
 * child has actually laid out. Turning it off from the first render makes the
 * native side snapshot an unmeasured view, which corrupts the bridge batch and
 * throws "Malformed calls from JS: field sizes are different".
 *
 * So: track until mounted, then stop — leaving it on forever pegs the CPU once
 * there are more than a handful of markers.
 */
function useSettledTracking(delay = 600) {
  const [tracks, setTracks] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracks(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return tracks;
}

/** A person on the map, Snap Maps style. */
export function PersonMarker({ person, onPress }) {
  const { colors } = useTheme();
  const tracksViewChanges = useSettledTracking();

  return (
    <Marker
      coordinate={person.coordinate}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={[styles.person, { borderColor: colors.background }]}>
        <Avatar name={person.name} size="sm" />
      </View>
    </Marker>
  );
}

/** An event, pinned at its venue and carrying its category icon. */
export function EventMarker({ event, onPress }) {
  const { colors } = useTheme();
  const tracksViewChanges = useSettledTracking();
  const goingCount = (event.attendeeIds || []).length;

  return (
    <Marker
      coordinate={event.coordinate}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.event}>
        <View style={[styles.eventBody, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <CategoryIcon event={event} color={colors.primary} size={18} />
        </View>
        {goingCount > 0 ? (
          <View style={[styles.eventCount, { backgroundColor: colors.primary }]}>
            <Text style={[styles.eventCountText, { color: colors.onPrimary }]}>{goingCount}</Text>
          </View>
        ) : null}
        <View style={[styles.eventStem, { backgroundColor: colors.primary }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  person: {
    borderRadius: 22,
    borderWidth: 2,
  },
  event: {
    alignItems: 'center',
  },
  eventBody: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventStem: {
    width: 2,
    height: 7,
    marginTop: -1,
  },
  eventCount: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
