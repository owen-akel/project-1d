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

const { width, height } = Dimensions.get('window');
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

        </MapView>

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
              {currentCityUsersCount} Connections
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
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
    top: 20,
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
    top: 20,
    left: 20,
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

