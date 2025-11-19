import { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useParkingZones } from '../hooks/useParkingZones';

const DEFAULT_RADIUS_MILES = 0.2;
const METERS_PER_MILE = 1609.34;
const OPENCAGE_KEY = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY;

export default function SearchScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const { zones, loading: zonesLoading, error: zonesError } = useParkingZones();

  const toRadians = (deg) => (deg * Math.PI) / 180;
  const distanceMeters = (a, b) => {
    if (!a || !b) return Infinity;
    const R = 6371000;
    const dLat = toRadians((b.latitude ?? 0) - (a.latitude ?? 0));
    const dLon = toRadians((b.longitude ?? 0) - (a.longitude ?? 0));
    const lat1 = toRadians(a.latitude ?? 0);
    const lat2 = toRadians(b.latitude ?? 0);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  const nearbyZones = useMemo(() => {
    if (!selectedPoint) return [];
    const origin = { latitude: selectedPoint.lat, longitude: selectedPoint.lng };
    return (zones ?? [])
      .map((zone) => {
        const anchor =
          zone?.centroid ||
          zone?.firstCoordinate ||
          (Array.isArray(zone?.coordinates) && zone.coordinates.length ? zone.coordinates[0] : null);
        const dist = distanceMeters(origin, anchor);
        return { zone, dist };
      })
      .filter(({ dist }) => Number.isFinite(dist) && dist <= DEFAULT_RADIUS_MILES * METERS_PER_MILE)
      .sort((a, b) => a.dist - b.dist);
  }, [selectedPoint, zones]);

  const geocodeQuery = async ({ autocomplete = false, forceSelectFirst = false } = {}) => {
    const query = searchQuery.trim();
    if (!query) return;

    if (!OPENCAGE_KEY || OPENCAGE_KEY === 'YOUR_OPENCAGE_API_KEY') {
      setSearchError('Add EXPO_PUBLIC_OPENCAGE_API_KEY to your .env to search.');
      return;
    }

    if (autocomplete) {
      setSuggestionsLoading(true);
    } else {
      setSearching(true);
      setResults([]);
    }
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        key: OPENCAGE_KEY,
        limit: '5',
        no_annotations: '1',
        autocomplete: autocomplete ? '1' : '0',
      });
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Geocode failed: ${response.status}`);
      }
      const payload = await response.json();
      const formatted = (payload?.results ?? [])
        .map((item) => ({
          formatted: item.formatted,
          lat: item.geometry?.lat,
          lng: item.geometry?.lng,
        }))
        .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
      setResults(formatted);
      if (formatted[0] && (forceSelectFirst || (!autocomplete && !selectedPoint))) {
        setSelectedPoint(formatted[0]);
      }
      return formatted[0];
    } catch (error) {
      setSearchError(error.message || 'Unable to geocode location.');
    } finally {
      if (autocomplete) {
        setSuggestionsLoading(false);
      } else {
        setSearching(false);
      }
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      if (searchQuery.trim().length === 0) {
        setSelectedPoint(null);
        setSearchError(null);
      }
      return;
    }
    const timer = setTimeout(() => {
      geocodeQuery({ autocomplete: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    setSelectedPoint(result);
    setSearchQuery(result.formatted ?? '');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Search</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <View style={styles.searchIconContainer}>
            <View style={[styles.searchIcon, { borderColor: colors.textSecondary }]} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search for parking spots..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={geocodeQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedPoint(null);
                setResults([]);
                setSearchError(null);
              }}
              style={styles.clearButton}
            >
              <Text style={[styles.clearText, { color: colors.textSecondary }]}>×</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={async () => {
              const picked = await geocodeQuery({ forceSelectFirst: true });
              const target = picked || selectedPoint || results[0];
              if (target) {
                navigation.navigate('Home', {
                  searchAnchor: {
                    latitude: target.lat,
                    longitude: target.lng,
                    label: target.formatted,
                  },
                });
              }
            }}
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Go</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchError && (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, { color: colors.error ?? '#ef4444' }]}>{searchError}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Locations</Text>
          {results.length === 0 && !searching && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>Start a search</Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                Enter a destination or address above to find parking nearby.
              </Text>
            </View>
          )}
          {results.map((result, idx) => {
            const isSelected = selectedPoint?.lat === result.lat && selectedPoint?.lng === result.lng;
            return (
              <TouchableOpacity
                key={`${result.lat}-${result.lng}-${idx}`}
                style={[
                  styles.resultItem,
                  {
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                    backgroundColor: isSelected ? colors.backgroundSecondary : colors.card,
                  },
                ]}
                onPress={() => handleSelectResult(result)}
                activeOpacity={0.85}
              >
                <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{result.formatted}</Text>
                <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                  {result.lat.toFixed(5)}, {result.lng.toFixed(5)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedPoint && (
          <View style={styles.section}>
            {zonesLoading && (
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>Loading zones…</Text>
            )}
            {zonesError && (
              <Text style={[styles.errorText, { color: colors.error ?? '#ef4444' }]}>
                {zonesError.message || 'Unable to load zones.'}
              </Text>
            )}
            {selectedPoint && nearbyZones.length === 0 && !searching && !zonesLoading && (
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                No parking zones within 0.2 miles.
              </Text>
            )}
            {nearbyZones.map(({ zone, dist }) => (
              <View
                key={`zone-${zone.id}`}
                style={[styles.zoneItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
              >
                <View style={styles.zoneHeader}>
                  <Text style={[styles.zoneTitle, { color: colors.textPrimary }]}>
                    {zone.label ?? zone.segmentCode ?? 'Parking Zone'}
                  </Text>
                  <Text style={[styles.zoneDistance, { color: colors.textSecondary }]}>
                    {(dist / METERS_PER_MILE).toFixed(2)} mi
                  </Text>
                </View>
                <Text style={[styles.zoneSubtitle, { color: colors.textSecondary }]}>
                  {zone.availableSpots ?? 0} open / {zone.totalSpots ?? 0} total
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: -1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  searchIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  clearText: {
    fontSize: 24,
    lineHeight: 24,
  },
  searchButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  errorBox: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
  },
  resultItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  zoneItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  zoneDistance: {
    fontSize: 13,
  },
  zoneSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});
