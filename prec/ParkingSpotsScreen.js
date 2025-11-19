import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { openSpotInMaps } from '../utils/navigationUtils';
import { useUserLocation } from '../hooks/useUserLocation';
import { useSettings } from '../context/SettingsContext';

export default function ParkingSpotsScreen({ navigation }) {
  const { colors } = useTheme();
  const { shareLocation: isLocationSharingEnabled } = useSettings();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const mapRef = useRef(null);
  const hasCenteredOnUser = useRef(false);

  const {
    location,
    hasPermission,
    permissionStatus,
    canAskAgain,
    requestPermission,
    isRequesting,
  } = useUserLocation({ enabled: isLocationSharingEnabled });

  const userCoords = location?.coords;

  useEffect(() => {
    if (!userCoords || !mapRef.current) {
      return;
    }

    if (!hasCenteredOnUser.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          },
          zoom: 15,
        },
        { duration: 600 }
      );
      hasCenteredOnUser.current = true;
    }
  }, [userCoords]);

  // Hanover / Dartmouth sample data to keep the dedicated map focused on campus
  const parkingSpots = [
    {
      id: 1,
      name: 'G-Lot (Dewey Field)',
      latitude: 43.70889,
      longitude: -72.28286,
      available: 35,
      total: 120,
      price: '$1.75/hr',
    },
    {
      id: 2,
      name: 'Anderson Garage',
      latitude: 43.7058,
      longitude: -72.2845,
      available: 45,
      total: 150,
      price: '$15/day',
    },
    {
      id: 3,
      name: 'Lebanon St Garage',
      latitude: 43.7019,
      longitude: -72.2883,
      available: 28,
      total: 100,
      price: '$12/day',
    },
    {
      id: 4,
      name: 'Mass Row Lot',
      latitude: 43.7038,
      longitude: -72.2891,
      available: 18,
      total: 60,
      price: '$4/hr',
    },
  ];

  const getMarkerColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return '#14b8a6';
    if (percentage > 20) return '#f59e0b';
    return '#ef4444';
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        mapRef.current.animateCamera(
          {
            center: camera.center,
            zoom: (camera.zoom || 14) + 1,
          },
          { duration: 250 }
        );
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        mapRef.current.animateCamera(
          {
            center: camera.center,
            zoom: (camera.zoom || 14) - 1,
          },
          { duration: 250 }
        );
      });
    }
  };

  const handleNavigateToSpot = async () => {
    if (!selectedSpot) {
      return;
    }

    await openSpotInMaps(selectedSpot.latitude, selectedSpot.longitude, selectedSpot.name);
  };

  const handleCenterOnUser = async () => {
    if (!isLocationSharingEnabled) {
      return;
    }

    if (userCoords && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          },
          zoom: 16,
        },
        { duration: 400 }
      );
      return;
    }

    if (permissionStatus !== 'granted') {
      await requestPermission();
    }
  };

  const handleLocationPermissionAction = async () => {
    if (permissionStatus === 'denied' && !canAskAgain && Linking.openSettings) {
      await Linking.openSettings();
      return;
    }

    await requestPermission();
  };

  const initialRegion = userCoords
    ? {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 43.7030,
        longitude: -72.2870,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  const shouldShowPermissionBanner =
    isLocationSharingEnabled &&
    permissionStatus &&
    permissionStatus !== 'granted';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Parking Map</Text>
        <View style={styles.placeholder} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={hasPermission && isLocationSharingEnabled}
        showsMyLocationButton={false}
      >
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            onPress={() => setSelectedSpot(spot)}
            pinColor={getMarkerColor(spot.available, spot.total)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={[
          styles.locationButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
          (!isLocationSharingEnabled || isRequesting) && styles.locationButtonDisabled,
        ]}
        onPress={handleCenterOnUser}
        activeOpacity={0.7}
        disabled={!isLocationSharingEnabled || isRequesting}
      >
        <Text style={[styles.locationButtonText, { color: colors.primary }]}>◎</Text>
      </TouchableOpacity>

      {/* Zoom Controls */}
      <View style={[styles.zoomControls, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: colors.card }]}
          onPress={handleZoomIn}
          activeOpacity={0.7}
        >
          <Text style={[styles.zoomButtonText, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
        <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: colors.card }]}
          onPress={handleZoomOut}
          activeOpacity={0.7}
        >
          <Text style={[styles.zoomButtonText, { color: colors.primary }]}>−</Text>
        </TouchableOpacity>
      </View>

      {selectedSpot && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>{selectedSpot.name}</Text>
              <View style={styles.infoRow}>
                <View
                  style={[
                    styles.availabilityDot,
                    {
                      backgroundColor: getMarkerColor(
                        selectedSpot.available,
                        selectedSpot.total
                      ),
                    },
                  ]}
                />
                <Text style={[styles.infoAvailable, { color: colors.textSecondary }]}>
                  {selectedSpot.available}/{selectedSpot.total} spots available
                </Text>
              </View>
            </View>
            <Text style={[styles.infoPrice, { color: colors.primary }]}>{selectedSpot.price}</Text>
          </View>

          <View style={styles.infoActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={handleNavigateToSpot}
            >
              <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.reserveButton]}>
              <Text style={[styles.actionButtonText, styles.reserveButtonText]}>
                Reserve Spot
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => setSelectedSpot(null)}
          >
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {shouldShowPermissionBanner && (
        <View style={[styles.permissionBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
            Enable location to show your position on the map.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={handleLocationPermissionAction}
            disabled={isRequesting}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>
              {permissionStatus === 'denied' && !canAskAgain ? 'Open Settings' : 'Enable'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#14b8a6' }]} />
          <Text style={[styles.legendText, { color: colors.textPrimary }]}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={[styles.legendText, { color: colors.textPrimary }]}>Limited</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: colors.textPrimary }]}>Full</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  backButtonText: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: 180,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  zoomButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#14b8a6',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoAvailable: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14b8a6',
    letterSpacing: -1,
  },
  infoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  reserveButton: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reserveButtonText: {
    color: '#ffffff',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeButtonText: {
    color: '#64748b',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  legend: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationButton: {
    position: 'absolute',
    right: 20,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 6,
  },
  locationButtonDisabled: {
    opacity: 0.4,
  },
  locationButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14b8a6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  permissionBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 90,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 6,
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 12,
  },
  permissionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#14b8a6',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
