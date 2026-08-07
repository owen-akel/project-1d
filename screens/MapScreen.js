import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getUsersByCity, ALL_USERS } from '../src/mock/users';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { canViewUser, toMockCityName } from '../src/social/visibility';
import { MAJOR_US_CITIES, findClosestCity } from '../src/data/cities';
import useCityEvents from '../src/hooks/useCityEvents';
import { eventCoordinate, personCoordinate } from '../src/social/placement';
import {
  Avatar,
  Button,
  BottomSheet,
  Chip,
  EventDetailsSheet,
  SegmentedControl,
  CategoryIcon,
} from '../src/ui';

const { width, height } = Dimensions.get('window');

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** "Today", "Tomorrow", then weekday + date for the rest of the week. */
function buildDayOptions(days) {
  return Array.from({ length: days }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    let label;
    if (offset === 0) label = 'Today';
    else if (offset === 1) label = 'Tomorrow';
    else label = date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });

    return { value: toYmd(date), label };
  });
}
/** Label for a chosen day, matching the wording in the picker. */
function dayLabel(value) {
  const today = toYmd(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (value === today) return 'Today';
  if (value === toYmd(tomorrow)) return 'Tomorrow';

  const parsed = new Date(`${value}T00:00:00`);
  return parsed.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const { user } = useUser();
  const { friends } = useFriends();
  const mapRef = useRef(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentCity, setCurrentCity] = useState('Loading...');
  const [currentCityCoords, setCurrentCityCoords] = useState(null);
  const geocodeTimeoutRef = useRef(null);

  // Events for one day at a time, so the map stays readable.
  const [selectedDay, setSelectedDay] = useState(() => toYmd(new Date()));
  const [openEventId, setOpenEventId] = useState(null);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  // What the map is showing: people, events, or both.
  const [viewMode, setViewMode] = useState('both');
  const showEvents = viewMode === 'events' || viewMode === 'both';
  const showPeople = viewMode === 'people' || viewMode === 'both';

  const dayOptions = useMemo(() => buildDayOptions(7), []);

  const { events: dayEvents } = useCityEvents({
    city: currentCity !== 'Loading...' ? currentCity : null,
    startDate: selectedDay,
    endDate: selectedDay,
    friends,
  });

  // Ticketmaster gives real venue coordinates; anything without them gets a
  // stable invented spot near the city centre.
  const mappedEvents = useMemo(
    () =>
      dayEvents
        .map((event) => {
          const { coordinate, precise } = eventCoordinate(event, currentCity);
          return coordinate ? { ...event, coordinate, precise } : null;
        })
        .filter(Boolean),
    [dayEvents, currentCity]
  );

  // People you can see in this city, placed around it like a Snap Map.
  const mappedPeople = useMemo(() => {
    if (!currentCity || currentCity === 'Loading...') return [];

    return getUsersByCity(toMockCityName(currentCity))
      .filter((cityUser) => canViewUser(cityUser.id, friends))
      .map((cityUser) => {
        const coordinate = personCoordinate(cityUser);
        return coordinate ? { ...cityUser, coordinate } : null;
      })
      .filter(Boolean);
  }, [currentCity, friends]);

  const openEvent = useMemo(
    () => mappedEvents.find((event) => event.id === openEventId) || null,
    [mappedEvents, openEventId]
  );

  // Count only the people in this city the current user is allowed to see
  // (friends + friends of friends).
  const currentCityUsersCount = useMemo(() => {
    if (!currentCity || currentCity === 'Loading...') {
      return 0;
    }
    return getUsersByCity(toMockCityName(currentCity)).filter((cityUser) =>
      canViewUser(cityUser.id, friends)
    ).length;
  }, [currentCity, friends]);


  const updateCityName = useCallback(async (regionToGeocode) => {
    if (!regionToGeocode || !regionToGeocode.latitude || !regionToGeocode.longitude) {
      return;
    }

    // Clear any pending geocode requests
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // Debounce the geocoding to avoid too many API calls
    geocodeTimeoutRef.current = setTimeout(() => {
      // Find the closest major US city
      const closestCity = findClosestCity(regionToGeocode.latitude, regionToGeocode.longitude);
      setCurrentCity(closestCity.name);
      setCurrentCityCoords({
        latitude: closestCity.lat,
        longitude: closestCity.lng,
      });
    }, 300); // 300ms debounce
  }, []);


  // Center map on user's residence when it changes
  const centerOnResidence = useCallback((residenceCity) => {
    if (!residenceCity) return;
    
    const cityData = MAJOR_US_CITIES.find((city) => city.name === residenceCity);
    if (cityData && mapRef.current) {
      const newRegion = {
        latitude: cityData.lat,
        longitude: cityData.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      setCurrentCity(cityData.name);
      setCurrentCityCoords({
        latitude: cityData.lat,
        longitude: cityData.lng,
      });
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, []);

  // Listen for residence changes
  useFocusEffect(
    useCallback(() => {
      if (user?.residence) {
        centerOnResidence(user.residence);
      }
    }, [user?.residence, centerOnResidence])
  );

  useEffect(() => {
    // On initial load, center on residence if available, otherwise request location
    if (user?.residence) {
      centerOnResidence(user.residence);
    } else {
      requestLocationPermission();
      // Get initial city name
      updateCityName(region);
    }

    // Cleanup timeout on unmount
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        getCurrentLocation();
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setUserLocation({ latitude, longitude });
      setRegion(newRegion);
      updateCityName(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      updateCityName(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } else {
      requestLocationPermission();
    }
  };


  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 0.5,
      longitudeDelta: region.longitudeDelta * 0.5,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: Math.min(region.latitudeDelta * 2, 180),
      longitudeDelta: Math.min(region.longitudeDelta * 2, 360),
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Home</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Explore Your City</Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          // Keep the map surface in step with the app's theme.
          userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
          region={region}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
            updateCityName(newRegion);
          }}
          showsUserLocation={hasPermission}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {/* City Region Highlight */}
          {currentCityCoords && (
            <Circle
              center={{
                latitude: currentCityCoords.latitude,
                longitude: currentCityCoords.longitude,
              }}
              radius={25000} // 25km radius
              strokeColor="rgba(20, 184, 166, 0.8)"
              fillColor="transparent"
              strokeWidth={3}
            />
          )}

          {showPeople &&
            mappedPeople.map((person) => (
              <Marker
                key={`person-${person.id}`}
                coordinate={person.coordinate}
                onPress={() => navigation.navigate('FriendProfile', { userId: person.id })}
                tracksViewChanges={false}
              >
                <View style={[styles.personMarker, { borderColor: colors.background }]}>
                  <Avatar name={person.name} size="sm" />
                </View>
              </Marker>
            ))}

          {showEvents &&
            mappedEvents.map((event) => (
              <Marker
                key={`event-${event.id}`}
                coordinate={event.coordinate}
                onPress={() => setOpenEventId(event.id)}
                tracksViewChanges={false}
              >
                <View style={styles.eventMarker}>
                  <View
                    style={[
                      styles.eventMarkerBody,
                      { backgroundColor: colors.card, borderColor: colors.primary },
                    ]}
                  >
                    <CategoryIcon type={event.type} color={colors.primary} size={18} />
                    {(event.attendeeIds || []).length > 0 ? (
                      <View style={[styles.eventMarkerCount, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.eventMarkerCountText, { color: colors.onPrimary }]}>
                          {event.attendeeIds.length}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.eventMarkerStem, { backgroundColor: colors.primary }]} />
                </View>
              </Marker>
            ))}
        </MapView>

        {/* Controls */}
        <View style={styles.controls} pointerEvents="box-none">
          <Button
            label={`${dayLabel(selectedDay)}  ▾`}
            variant="secondary"
            size="sm"
            onPress={() => setDateSheetOpen(true)}
            style={[styles.dateButton, { backgroundColor: colors.card }]}
          />

          <SegmentedControl
            style={[styles.viewToggle, { backgroundColor: colors.card }]}
            value={viewMode}
            onChange={setViewMode}
            segments={[
              { key: 'people', label: 'People' },
              { key: 'events', label: 'Events' },
              { key: 'both', label: 'Both' },
            ]}
          />
        </View>

        {/* Zoom Controls */}
        <View style={[styles.zoomControls, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[
              styles.zoomButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={handleZoomIn}
            activeOpacity={0.7}
          >
            <Text style={[styles.zoomButtonText, { color: colors.textPrimary }]}>+</Text>
          </TouchableOpacity>
          <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={[
              styles.zoomButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
            onPress={handleZoomOut}
            activeOpacity={0.7}
          >
            <Text style={[styles.zoomButtonText, { color: colors.textPrimary }]}>−</Text>
          </TouchableOpacity>
        </View>

        {/* Floating City Info Button */}
        {currentCity !== 'Loading...' && (
          <TouchableOpacity
            style={[styles.floatingCityButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => {
              navigation.navigate('CityUsers', { cityName: currentCity });
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.floatingCityName, { color: colors.textPrimary }]}>{currentCity}</Text>
            <Text style={[styles.floatingCityConnections, { color: colors.primary }]}>
              {showPeople ? `${mappedPeople.length} connections` : ''}
              {showPeople && showEvents ? ' · ' : ''}
              {showEvents ? `${mappedEvents.length} events` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomSheet
        visible={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        title="Pick a day"
        subtitle="Events happening on this date show on the map"
      >
        <ScrollView style={styles.dateSheet} contentContainerStyle={styles.dateSheetContent}>
          {dayOptions.map((option) => {
            const selected = option.value === selectedDay;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSelectedDay(option.value);
                  setDateSheetOpen(false);
                }}
                style={[
                  styles.dateRow,
                  { backgroundColor: selected ? colors.primaryMuted : 'transparent' },
                ]}
              >
                <Text
                  style={[
                    styles.dateRowText,
                    {
                      color: selected ? colors.primary : colors.textPrimary,
                      fontWeight: selected ? '700' : '500',
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <Text style={[styles.dateRowText, { color: colors.primary }]}>✓</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>

      <EventDetailsSheet
        visible={Boolean(openEvent)}
        onClose={() => setOpenEventId(null)}
        event={openEvent}
        countAttendees={(occurrence) =>
          (occurrence?.attendeeIds || openEvent?.attendeeIds || []).length
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dayFilter: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  dayFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: 72,
    width: 50,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 3,
  },
  zoomButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 28,
  },
  postsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  postsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  postCard: {
    width: 200,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    fontSize: 20,
  },
  floatingCityButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  floatingCityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  floatingCityConnections: {
    fontSize: 11,
    fontWeight: '600',
    color: '#14b8a6',
  },
});

