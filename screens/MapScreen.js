import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const { colors } = useTheme();
  const mapRef = useRef(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Sample connections
  const [connections] = useState([
    {
      id: 1,
      userId: 'user1',
      username: 'Alex',
      latitude: 40.7128,
      longitude: -74.0060,
      avatar: '👤',
      type: 'connection',
    },
    {
      id: 2,
      userId: 'user2',
      username: 'Sam',
      latitude: 40.7580,
      longitude: -73.9855,
      avatar: '👤',
      type: 'connection',
    },
    {
      id: 3,
      userId: 'user3',
      username: 'Jordan',
      latitude: 40.7505,
      longitude: -73.9934,
      avatar: '👤',
      type: 'connection',
    },
  ]);

  // Sample local events
  const [localEvents] = useState([
    {
      id: 'le1',
      title: 'Music Festival',
      latitude: 40.7829,
      longitude: -73.9654,
      date: 'Today, 6:00 PM',
      type: 'local',
    },
    {
      id: 'le2',
      title: 'Art Gallery',
      latitude: 40.7448,
      longitude: -74.0018,
      date: 'Tomorrow, 7:00 PM',
      type: 'local',
    },
  ]);

  // Sample connections events
  const [connectionEvents] = useState([
    {
      id: 'ce1',
      title: 'Study Group',
      host: 'Sarah',
      latitude: 40.7282,
      longitude: -73.9942,
      date: 'Today, 4:00 PM',
      type: 'connection_event',
    },
    {
      id: 'ce2',
      title: 'Game Night',
      host: 'Mike',
      latitude: 40.7614,
      longitude: -73.9776,
      date: 'Friday, 7:00 PM',
      type: 'connection_event',
    },
  ]);

  useEffect(() => {
    requestLocationPermission();
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
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } else {
      requestLocationPermission();
    }
  };

  const handleMarkerPress = (item) => {
    if (item.type === 'connection') {
      Alert.alert(item.username, 'Connection nearby');
    } else if (item.type === 'local') {
      Alert.alert(item.title, `Local Event\n${item.date}`);
    } else if (item.type === 'connection_event') {
      Alert.alert(item.title, `Event by ${item.host}\n${item.date}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Map</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Explore nearby</Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={hasPermission}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {/* Connection markers */}
          {connections.map((connection) => (
            <Marker
              key={connection.id}
              coordinate={{
                latitude: connection.latitude,
                longitude: connection.longitude,
              }}
              onPress={() => handleMarkerPress(connection)}
            >
              <View style={[styles.markerContainer, { backgroundColor: '#0ea5e9' }]}>
                <Text style={styles.markerText}>{connection.avatar}</Text>
              </View>
            </Marker>
          ))}
          {/* Local events markers */}
          {localEvents.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              onPress={() => handleMarkerPress(event)}
            >
              <View style={[styles.markerContainer, { backgroundColor: '#10b981' }]}>
                <Text style={styles.markerText}>📅</Text>
              </View>
            </Marker>
          ))}
          {/* Connection events markers */}
          {connectionEvents.map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              onPress={() => handleMarkerPress(event)}
            >
              <View style={[styles.markerContainer, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.markerText}>🎉</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Location Button */}
        <TouchableOpacity
          style={[
            styles.locationButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
            },
            loading && styles.locationButtonDisabled,
          ]}
          onPress={handleCenterOnUser}
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.locationButtonText, { color: colors.primary }]}>◎</Text>
          )}
        </TouchableOpacity>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Connections</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Local Events</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Connections Events</Text>
          </View>
        </View>
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
  locationButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 3,
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14b8a6',
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
  legend: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});

