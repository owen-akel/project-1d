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

const { width, height } = Dimensions.get('window');
const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Helper to check if a user can be viewed
function canViewUser(targetUserId, currentUserFriends) {
  // Main users are only visible if they're in the friends list
  if (targetUserId.startsWith('main-user-')) {
    return currentUserFriends.includes(targetUserId);
  }
  
  // Extract parent main user from friend ID (e.g., "rod-friend-5" -> "rod")
  const parts = targetUserId.split('-');
  if (parts.length >= 2 && parts[1] === 'friend') {
    const firstName = parts[0];
    const mainUserIndex = [
      'rod', 'sam', 'clay', 'harry', 'john', 'pete',
      'liam', 'warren', 'jackson', 'eric', 'simon', 'greg'
    ].indexOf(firstName);
    
    if (mainUserIndex !== -1) {
      const parentMainUserId = `main-user-${mainUserIndex + 1}`;
      // Only visible if parent main user is in friends list
      return currentUserFriends.includes(parentMainUserId);
    }
  }
  
  // Default: not visible
  return false;
}

export default function MapScreen() {
  const { colors } = useTheme();
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

  // Major US cities with coordinates
  const majorUSCities = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
    { name: 'Austin', lat: 30.2672, lng: -97.7431 },
    { name: 'Jacksonville', lat: 30.3322, lng: -81.6557 },
    { name: 'Fort Worth', lat: 32.7555, lng: -97.3308 },
    { name: 'Columbus', lat: 39.9612, lng: -82.9988 },
    { name: 'Charlotte', lat: 35.2271, lng: -80.8431 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Indianapolis', lat: 39.7684, lng: -86.1581 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver', lat: 39.7392, lng: -104.9903 },
    { name: 'Washington', lat: 38.9072, lng: -77.0369 },
    { name: 'Boston', lat: 42.3601, lng: -71.0589 },
    { name: 'El Paso', lat: 31.7619, lng: -106.4850 },
    { name: 'Nashville', lat: 36.1627, lng: -86.7816 },
    { name: 'Detroit', lat: 42.3314, lng: -83.0458 },
    { name: 'Oklahoma City', lat: 35.4676, lng: -97.5164 },
    { name: 'Portland', lat: 45.5152, lng: -122.6784 },
    { name: 'Las Vegas', lat: 36.1699, lng: -115.1398 },
    { name: 'Memphis', lat: 35.1495, lng: -90.0490 },
    { name: 'Louisville', lat: 38.2527, lng: -85.7585 },
    { name: 'Baltimore', lat: 39.2904, lng: -76.6122 },
    { name: 'Milwaukee', lat: 43.0389, lng: -87.9065 },
    { name: 'Albuquerque', lat: 35.0844, lng: -106.6504 },
    { name: 'Tucson', lat: 32.2226, lng: -110.9747 },
    { name: 'Fresno', lat: 36.7378, lng: -119.7871 },
    { name: 'Sacramento', lat: 38.5816, lng: -121.4944 },
    { name: 'Kansas City', lat: 39.0997, lng: -94.5786 },
    { name: 'Mesa', lat: 33.4152, lng: -111.8315 },
    { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
    { name: 'Omaha', lat: 41.2565, lng: -95.9345 },
    { name: 'Colorado Springs', lat: 38.8339, lng: -104.8214 },
    { name: 'Raleigh', lat: 35.7796, lng: -78.6382 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Virginia Beach', lat: 36.8529, lng: -75.9780 },
    { name: 'Oakland', lat: 37.8044, lng: -122.2712 },
    { name: 'Minneapolis', lat: 44.9778, lng: -93.2650 },
    { name: 'Tulsa', lat: 36.1540, lng: -95.9928 },
    { name: 'Cleveland', lat: 41.4993, lng: -81.6944 },
    { name: 'Wichita', lat: 37.6872, lng: -97.3301 },
    { name: 'Arlington', lat: 32.7357, lng: -97.1081 },
    { name: 'Tampa', lat: 27.9506, lng: -82.4572 },
    { name: 'New Orleans', lat: 29.9511, lng: -90.0715 },
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Map city names from majorUSCities to mock data city names
  const mapCityNameToMockCity = (cityName) => {
    const cityMap = {
      'New York': 'NYC',
      'Los Angeles': 'LA',
      'Chicago': 'Chicago',
      'San Francisco': 'SF',
      'Boston': 'Boston',
      'Austin': 'Austin',
    };
    return cityMap[cityName] || cityName;
  };

  // Find the closest major US city
  const findClosestMajorCity = (latitude, longitude) => {
    let closestCity = majorUSCities[0];
    let minDistance = calculateDistance(latitude, longitude, closestCity.lat, closestCity.lng);

    for (const city of majorUSCities) {
      const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return closestCity;
  };

  // Get users count in the current city (mapped to mock data city name)
  // Only count visible users (friends + their friends)
  const currentCityUsersCount = useMemo(() => {
    if (!currentCity || currentCity === 'Loading...') {
      return 0;
    }
    const mockCityName = mapCityNameToMockCity(currentCity);
    const allUsersInCity = getUsersByCity(mockCityName);
    // Filter to only show visible users (friends + their friends)
    const visibleUsers = allUsersInCity.filter(user => canViewUser(user.id, friends));
    return visibleUsers.length;
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
      const closestCity = findClosestMajorCity(regionToGeocode.latitude, regionToGeocode.longitude);
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
    
    // Find the city in majorUSCities
    const cityData = majorUSCities.find(city => city.name === residenceCity);
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

