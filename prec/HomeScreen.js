import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Modal, KeyboardAvoidingView, Platform, Linking, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, Polygon } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { generateParkingLine, getStrokeWidthForZoom, shouldShowParkingLines, getOffsetForZoom } from '../utils/mapUtils';
import { useTheme } from '../context/ThemeContext';
import { openSpotInMaps } from '../utils/navigationUtils';
import { useUserLocation } from '../hooks/useUserLocation';
import { useSettings } from '../context/SettingsContext';
import { useParkingZones } from '../hooks/useParkingZones';
import { addFavorite, getFavorites, removeFavorite } from '../services/favorites';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');
const MAX_ZOOM = 20;
const MIN_ZOOM = 3;
const HANOVER_REGION = {
  latitude: 43.7030,
  longitude: -72.2870,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

export default function HomeScreen({ navigation }) {
  const tabNavigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { user, isGuest } = useAuth();
  const { shareLocation: isLocationSharingEnabled } = useSettings();
  const [selectedParkingSpace, setSelectedParkingSpace] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(17);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedBookingSpot, setSelectedBookingSpot] = useState(null);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [nearbyVisible, setNearbyVisible] = useState(false);
  const [allVisible, setAllVisible] = useState(false);
  const [searchPin, setSearchPin] = useState(null);
  const [anchorCityId, setAnchorCityId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const mapRef = useRef(null);
  const lastRegionRef = useRef(HANOVER_REGION);
  const bookingModalSlide = useRef(new Animated.Value(height)).current;
  const [anchorOverride, setAnchorOverride] = useState(null);

  const loadFavorites = useCallback(async () => {
    const data = await getFavorites(!isGuest ? user?.id : null);
    setFavoriteIds(data.map((f) => f.id));
  }, [isGuest, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const {
    location,
    hasPermission: hasLocationPermission,
    permissionStatus,
    canAskAgain,
    requestPermission,
    isRequesting: isRequestingLocation,
  } = useUserLocation({ enabled: isLocationSharingEnabled });

  const {
    zones,
    loading: zonesLoading,
    error: zonesError,
    refetch: refetchZones,
  } = useParkingZones();

  const userCoords = location?.coords;
  const hasCenteredOnUser = useRef(false);

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

  // Street parking spaces along North Main Street (near Baker-Berry Library)
  // These are actual road centerline coordinates traced from North Main Street
  const streetParkingData = [
    // East side parking (Baker-Berry Library side)
    {
      id: 's1',
      name: 'N Main St (Section 1)',
      centerLine: [
        { latitude: 43.70260, longitude: -72.28675 },
        { latitude: 43.70285, longitude: -72.28680 },
      ],
      available: true,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'east',
    },
    {
      id: 's2',
      name: 'N Main St (Section 2)',
      centerLine: [
        { latitude: 43.70285, longitude: -72.28680 },
        { latitude: 43.70310, longitude: -72.28685 },
      ],
      available: false,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'east',
    },
    {
      id: 's3',
      name: 'N Main St (Section 3)',
      centerLine: [
        { latitude: 43.70310, longitude: -72.28685 },
        { latitude: 43.70335, longitude: -72.28690 },
      ],
      available: true,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'east',
    },
    {
      id: 's4',
      name: 'N Main St (Section 4)',
      centerLine: [
        { latitude: 43.70335, longitude: -72.28690 },
        { latitude: 43.70360, longitude: -72.28695 },
      ],
      available: true,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'east',
    },
    // West side parking
    {
      id: 's5',
      name: 'N Main St (Section 5)',
      centerLine: [
        { latitude: 43.70260, longitude: -72.28675 },
        { latitude: 43.70285, longitude: -72.28680 },
      ],
      available: true,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'west',
    },
    {
      id: 's6',
      name: 'N Main St (Section 6)',
      centerLine: [
        { latitude: 43.70285, longitude: -72.28680 },
        { latitude: 43.70310, longitude: -72.28685 },
      ],
      available: false,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'west',
    },
    {
      id: 's7',
      name: 'N Main St (Section 7)',
      centerLine: [
        { latitude: 43.70310, longitude: -72.28685 },
        { latitude: 43.70335, longitude: -72.28690 },
      ],
      available: true,
      price: '$2/hr',
      timeLimit: '2 hours',
      rules: 'Mon-Sat 8AM-6PM',
      side: 'west',
    },
  ];

  // Calculate parking line coordinates with proper offsets based on zoom
  const streetParkingSpaces = useMemo(() => {
    const offset = getOffsetForZoom(currentZoom);
    return streetParkingData.map(space => ({
      ...space,
      coordinates: generateParkingLine(
        space.centerLine[0],
        space.centerLine[1],
        space.side,
        offset
      ),
    }));
  }, [currentZoom]);

  // Parking Lots in Hanover, NH / Dartmouth College Area
  const parkingSpots = [
    {
      id: 1,
      name: 'G-Lot (Dewey Field)',
      latitude: 43.70889,
      longitude: -72.28286,
      distance: '0.9 mi',
      available: 35,
      total: 120,
      price: '$1.75/hr',
      type: 'lot',
    },
    {
      id: 2,
      name: 'Anderson Garage',
      latitude: 43.7058,
      longitude: -72.2845,
      distance: '0.5 mi',
      available: 45,
      total: 150,
      price: '$15/day',
      type: 'garage',
    },
    {
      id: 3,
      name: 'Lebanon St Garage',
      latitude: 43.7019,
      longitude: -72.2883,
      distance: '0.3 mi',
      available: 28,
      total: 100,
      price: '$12/day',
      type: 'garage',
    },
    {
      id: 4,
      name: 'Mass Row Lot',
      latitude: 43.7038,
      longitude: -72.2891,
      distance: '0.2 mi',
      available: 18,
      total: 60,
      price: '$4/hr',
      type: 'lot',
    },
    {
      id: 5,
      name: 'Observatory Lot',
      latitude: 43.7055,
      longitude: -72.2865,
      distance: '0.6 mi',
      available: 22,
      total: 80,
      price: '$3/hr',
      type: 'lot',
    },
    {
      id: 6,
      name: 'Maynard Lot',
      latitude: 43.7047,
      longitude: -72.2912,
      distance: '0.4 mi',
      available: 12,
      total: 50,
      price: '$4/hr',
      type: 'lot',
    },
    {
      id: 7,
      name: 'Hopkins Center Parking',
      latitude: 43.7028,
      longitude: -72.2850,
      distance: '0.3 mi',
      available: 8,
      total: 30,
      price: '$2/hr',
      type: 'lot',
    },
  ];

  const totalStreetSections = streetParkingSpaces.length;
  const availableStreetSections = streetParkingSpaces.filter((space) => space.available).length;

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return '#10b981';
    if (percentage > 20) return '#f59e0b';
    return '#ef4444';
  };

  const handleParkingSpacePress = (space) => {
    setSelectedParkingSpace(space);
    setModalVisible(true);
  };

  const getZonePoint = (zone) =>
    zone?.centroid ||
    zone?.firstCoordinate ||
    (Array.isArray(zone?.coordinates) && zone.coordinates.length ? zone.coordinates[0] : null);

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

  const NEARBY_RADIUS_METERS = 0.2 * 1609.34;
  const nearbyZones = useMemo(() => {
    const anchor = anchorOverride || userCoords;
    if (!anchor) return [];
    const origin = { latitude: anchor.latitude, longitude: anchor.longitude };
    return zones
      .map((zone) => {
        const point = getZonePoint(zone);
        const dist = distanceMeters(origin, point);
        return { zone, dist };
      })
      .filter(({ dist }) => Number.isFinite(dist) && dist <= NEARBY_RADIUS_METERS)
      .sort((a, b) => a.dist - b.dist);
  }, [anchorOverride, userCoords, zones]);

  const visibleZones = useMemo(() => {
    if (anchorCityId === 'none') {
      return [];
    }
    if (anchorCityId) {
      return zones.filter((zone) => zone.cityId === anchorCityId);
    }
    return zones;
  }, [anchorCityId, zones]);

  const handleZonePress = (zone) => {
    if (!zone?.coordinates?.length) {
      return;
    }
    setActiveZoneId(zone.id);
    const bookingSpot = buildZoneBookingSpot(zone);
    if (bookingSpot) {
      setSelectedBookingSpot(bookingSpot);
      openBookingModal(bookingSpot);
    }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const handleZoomChange = (delta) => {
    const region = lastRegionRef.current || HANOVER_REGION;
    const currentZoomLevel = Math.log2(360 / (region.latitudeDelta || 0.01));
    const nextZoomLevel = clamp(currentZoomLevel + delta, MIN_ZOOM, MAX_ZOOM);

    // Adjust deltas by power of 2 to keep scale
    const scale = Math.pow(2, currentZoomLevel - nextZoomLevel);
    const nextLatDelta = clamp(region.latitudeDelta * scale, 0.0005, 1.5);
    const aspectRatio =
      region.longitudeDelta && region.latitudeDelta
        ? region.longitudeDelta / region.latitudeDelta
        : 1;
    const nextLonDelta = clamp(nextLatDelta * aspectRatio, 0.0005, 1.5);

    lastRegionRef.current = {
      ...region,
      latitudeDelta: nextLatDelta,
      longitudeDelta: nextLonDelta,
    };
    setCurrentZoom(nextZoomLevel);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: nextLatDelta,
          longitudeDelta: nextLonDelta,
        },
        220
      );
    }
  };

  const handleZoomIn = () => handleZoomChange(1);
  const handleZoomOut = () => handleZoomChange(-1);

  const handleRegionChange = (region) => {
    if (!region) return;
    lastRegionRef.current = region;
    if (region.latitudeDelta) {
      const zoomEstimate = Math.log2(360 / region.latitudeDelta);
      setCurrentZoom(zoomEstimate);
    }
  };

  const detectAnchorCity = (anchor, isOverride = false) => {
    if (!anchor) {
      setAnchorCityId(null);
      return;
    }
    const origin = { latitude: anchor.latitude, longitude: anchor.longitude };
    const nearest = zones
      .map((zone) => {
        const point = getZonePoint(zone);
        const dist = distanceMeters(origin, point);
        return { zone, dist };
      })
      .filter(({ dist }) => Number.isFinite(dist))
      .sort((a, b) => a.dist - b.dist)[0];
    if (isOverride) {
      setAnchorCityId(nearest?.zone?.cityId ?? 'none');
    } else {
      setAnchorCityId(nearest?.zone?.cityId ?? null);
    }
  };

  // Respond to search navigation params
  useEffect(() => {
    const searchAnchor = route?.params?.searchAnchor;
    const favoriteSegmentId = route?.params?.favoriteSegmentId;
    if (searchAnchor?.latitude && searchAnchor?.longitude) {
      const center = {
        latitude: searchAnchor.latitude,
        longitude: searchAnchor.longitude,
      };
      setAnchorOverride(center);
      setSearchPin(center);
      detectAnchorCity(center, true);
      if (mapRef.current) {
        mapRef.current.animateCamera(
          {
            center,
            zoom: 16,
          },
          { duration: 400 }
        );
      }
      lastRegionRef.current = {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: HANOVER_REGION.latitudeDelta,
        longitudeDelta: HANOVER_REGION.longitudeDelta,
      };
      tabNavigation.setParams({ searchAnchor: null });
    }
    if (favoriteSegmentId) {
      const zone = zones.find((z) => z.id === favoriteSegmentId);
      if (zone && zone.coordinates?.length) {
        const center = zone.centroid || zone.firstCoordinate || zone.coordinates[0];
        setAnchorOverride(center);
        setSearchPin(center);
        detectAnchorCity(center, true);
        if (mapRef.current) {
          mapRef.current.animateCamera(
            {
              center,
              zoom: 16,
            },
            { duration: 400 }
          );
        }
        setTimeout(() => handleZonePress(zone), 200);
        tabNavigation.setParams({ favoriteSegmentId: null });
        return;
      }

      const lot = parkingSpots.find((p) => String(p.id) === String(favoriteSegmentId));
      if (lot) {
        const center = { latitude: lot.latitude, longitude: lot.longitude };
        setAnchorOverride(center);
        setSearchPin(center);
        detectAnchorCity(center, true);
        if (mapRef.current) {
          mapRef.current.animateCamera(
            {
              center,
              zoom: 16,
            },
            { duration: 400 }
          );
        }
        openBookingModal(lot);
        tabNavigation.setParams({ favoriteSegmentId: null });
      }
    }
  }, [route?.params?.searchAnchor, route?.params?.favoriteSegmentId, tabNavigation, zones]);

  // Keep city scoped to anchor or user
  useEffect(() => {
    if (anchorOverride) {
      detectAnchorCity(anchorOverride, true);
    } else if (userCoords) {
      detectAnchorCity(userCoords, false);
    } else {
      setAnchorCityId(null);
    }
  }, [anchorOverride, userCoords, zones]);

  const openBookingModal = (spot) => {
    setSelectedBookingSpot(spot);
    setBookingModalVisible(true);
    Animated.spring(bookingModalSlide, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeBookingModal = () => {
    Animated.timing(bookingModalSlide, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setBookingModalVisible(false);
      setSelectedBookingSpot(null);
      setActiveZoneId(null);
    });
  };

  const handleNavigateFromBooking = async () => {
    if (!selectedBookingSpot) {
      return;
    }

    const { latitude, longitude, name } = selectedBookingSpot;
    closeBookingModal();
    await openSpotInMaps(latitude, longitude, name);
  };

  const handleAddFavorite = async () => {
    if (!selectedBookingSpot) {
      return;
    }
    const updated = await addFavorite(selectedBookingSpot, !isGuest ? user?.id : null);
    setFavoriteIds(updated.map((f) => f.id));
  };

  const handleRemoveFavorite = async () => {
    if (!selectedBookingSpot) {
      return;
    }
    const updated = await removeFavorite(selectedBookingSpot.id, !isGuest ? user?.id : null);
    setFavoriteIds(updated.map((f) => f.id));
  };

  const isFavorite = selectedBookingSpot ? favoriteIds.includes(selectedBookingSpot.id) : false;

  const canZoomIn = currentZoom < MAX_ZOOM;
  const canZoomOut = currentZoom > MIN_ZOOM;

  const initialRegion = userCoords
    ? {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }
    : HANOVER_REGION;

  const buildZoneBookingSpot = (zone) => {
    if (!zone) {
      return null;
    }

    const anchor =
      zone.centroid ||
      zone.firstCoordinate ||
      zone.coordinates?.[0] || {
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
      };

    if (!anchor?.latitude || !anchor?.longitude) {
      return null;
    }

    return {
      id: zone.id,
      name: zone.label ?? zone.segmentCode ?? 'Parking Zone',
      latitude: anchor.latitude,
      longitude: anchor.longitude,
      available: (zone.availableSpots ?? 0) > 0,
      availableSpots: zone.availableSpots ?? 0,
      totalSpots: zone.totalSpots ?? zone.coordinates?.length ?? 0,
      price: zone.price ?? '$2/hr',
      timeLimit: zone.timeLimit ?? 'Check signage',
      rules: zone.rules ?? 'Hanover regulations apply.',
      distance: zone.distance ?? null,
    };
  };

  const handleCenterOnUser = async () => {
    if (!isLocationSharingEnabled) {
      return;
    }

    if (userCoords && mapRef.current) {
      setAnchorOverride(null);
      setAnchorCityId(null);
      setSearchPin(null);
      const targetZoom = Math.max(Math.min(currentZoom, 17), 15);
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          },
          zoom: targetZoom,
        },
        { duration: 400 }
      );
      lastRegionRef.current = {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: lastRegionRef.current?.latitudeDelta ?? HANOVER_REGION.latitudeDelta,
        longitudeDelta: lastRegionRef.current?.longitudeDelta ?? HANOVER_REGION.longitudeDelta,
      };
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

  const zoneColors = useMemo(
    () => ({
      stroke: 'rgba(34, 197, 94, 0.85)',
      fill: 'rgba(16, 185, 129, 0.22)',
      selectedStroke: '#0ea5e9',
      selectedFill: 'rgba(14, 165, 233, 0.28)',
    }),
    []
  );

  const shouldShowPermissionBanner =
    isLocationSharingEnabled &&
    permissionStatus &&
    permissionStatus !== 'granted';

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header with gradient */}
      <View style={[styles.headerGradient, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Find Parking</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Hanover, NH</Text>
          </View>
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={hasLocationPermission && isLocationSharingEnabled}
        showsMyLocationButton={false}
        onRegionChangeComplete={handleRegionChange}
      >
        {searchPin && (
          <Marker
            key="search-pin"
            coordinate={{
              latitude: searchPin.latitude,
              longitude: searchPin.longitude,
            }}
            pinColor="#0ea5e9"
          />
        )}

        {/* Supabase parking zone polygons */}
        {zones
          .filter((zone) => zone.coordinates.length >= 3)
          .map((zone) => {
            const isSelected = activeZoneId === zone.id;
              const strokeColor = isSelected ? zoneColors.selectedStroke : zoneColors.stroke;
              const fillColor = isSelected ? zoneColors.selectedFill : zoneColors.fill;
              const zoneKey = zone.id ?? zone.segmentCode;
              return (
                <Polygon
                  key={`zone-${zoneKey}`}
                  coordinates={zone.coordinates}
                  strokeColor={strokeColor}
                  fillColor={fillColor}
                  strokeWidth={2}
                  tappable
                  onPress={() => handleZonePress(zone)}
                />
              );
            })}

          {/* Parking Lot Markers */}
          {parkingSpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              onPress={() => openBookingModal(spot)}
              pinColor={getAvailabilityColor(spot.available, spot.total)}
            />
          ))}
        </MapView>

        <TouchableOpacity
          style={[
            styles.locationButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow ?? '#000',
            },
            (!isLocationSharingEnabled || isRequestingLocation) && styles.locationButtonDisabled,
          ]}
          onPress={handleCenterOnUser}
          activeOpacity={0.7}
          disabled={!isLocationSharingEnabled || isRequestingLocation}
        >
          <Text style={[styles.locationButtonText, { color: colors.primary }]}>◎</Text>
        </TouchableOpacity>

        {shouldShowPermissionBanner && (
          <View
            style={[
              styles.permissionBanner,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow ?? '#000',
              },
            ]}
          >
            <Text style={[styles.permissionText, { color: colors.textPrimary }]}>
              Enable location to show your position on the map.
            </Text>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
              onPress={handleLocationPermissionAction}
              activeOpacity={0.8}
              disabled={isRequestingLocation}
            >
              <Text style={styles.permissionButtonText}>
                {permissionStatus === 'denied' && !canAskAgain ? 'Open Settings' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats Overlay */}
        <View style={styles.statsOverlay}>
          <TouchableOpacity
            style={styles.statBadge}
            activeOpacity={0.8}
            onPress={() => setNearbyVisible(true)}
          >
            <Text style={styles.statNumber}>{nearbyZones.length}</Text>
            <Text style={styles.statLabel}>Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBadge}
            activeOpacity={0.8}
            onPress={() => setAllVisible(true)}
          >
            <Text style={styles.statNumber}>{visibleZones.length}</Text>
            <Text style={styles.statLabel}>All Spots</Text>
          </TouchableOpacity>
        </View>

        {/* Zoom Controls */}
        <View
          style={[
            styles.zoomControls,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow ?? '#000',
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.zoomButton,
              { backgroundColor: colors.card },
              !canZoomIn && styles.zoomButtonDisabled,
            ]}
            onPress={handleZoomIn}
            disabled={!canZoomIn}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.zoomButtonText,
                { color: colors.primary },
                !canZoomIn && styles.zoomButtonTextDisabled,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
          <View
            style={[
              styles.zoomDivider,
              { backgroundColor: colors.cardBorder },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.zoomButton,
              { backgroundColor: colors.card },
              !canZoomOut && styles.zoomButtonDisabled,
            ]}
            onPress={handleZoomOut}
            disabled={!canZoomOut}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.zoomButtonText,
                { color: colors.primary },
                !canZoomOut && styles.zoomButtonTextDisabled,
              ]}
            >
              -
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Parking Space Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {selectedParkingSpace?.name || 'Parking Space'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Status:</Text>
                <View
                  style={[
                    styles.modalStatusBadge,
                    {
                      backgroundColor: selectedParkingSpace?.available
                        ? '#10b981'
                        : '#ef4444',
                    },
                  ]}
                >
                  <Text style={styles.modalStatusText}>
                    {selectedParkingSpace?.available ? 'Available' : 'Occupied'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Price:</Text>
                <Text style={[styles.modalValue, { color: colors.textPrimary }]}>{selectedParkingSpace?.price}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Time Limit:</Text>
                <Text style={[styles.modalValue, { color: colors.textPrimary }]}>{selectedParkingSpace?.timeLimit}</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Rules:</Text>
                <Text style={[styles.modalValue, { color: colors.textPrimary }]}>{selectedParkingSpace?.rules}</Text>
              </View>

              {selectedParkingSpace?.available && (
                <TouchableOpacity
                  style={[styles.modalReserveButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setModalVisible(false);
                    openBookingModal(selectedParkingSpace);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalReserveButtonText}>Reserve This Spot</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Nearby zones modal */}
      <Modal
        animationType="slide"
        transparent
        visible={nearbyVisible}
        onRequestClose={() => setNearbyVisible(false)}
      >
        <TouchableOpacity
          style={styles.nearbyOverlay}
          activeOpacity={1}
          onPressOut={() => setNearbyVisible(false)}
        />
        <View style={[styles.nearbySheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.nearbyHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.nearbyTitle, { color: colors.textPrimary }]}>Nearby (0.2 mi)</Text>
            <TouchableOpacity
              onPress={() => setNearbyVisible(false)}
              style={[styles.nearbyClose, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            >
              <Text style={[styles.nearbyCloseText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.nearbyList} contentContainerStyle={styles.nearbyListContent}>
            {!userCoords && (
              <Text style={[styles.nearbyEmpty, { color: colors.textSecondary }]}>
                Turn on location to see nearby spots.
              </Text>
            )}
            {userCoords && nearbyZones.length === 0 && (
              <Text style={[styles.nearbyEmpty, { color: colors.textSecondary }]}>
                No spots within 0.2 miles.
              </Text>
            )}
            {nearbyZones.map(({ zone, dist }) => (
              <TouchableOpacity
                key={`nearby-${zone.id}`}
                style={[styles.nearbyItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                activeOpacity={0.85}
                onPress={() => {
                  setNearbyVisible(false);
                  const point = getZonePoint(zone);
                  setActiveZoneId(zone.id);
                  if (point && mapRef.current) {
                    mapRef.current.animateCamera(
                      {
                        center: {
                          latitude: point.latitude,
                          longitude: point.longitude,
                        },
                        zoom: 16,
                      },
                      { duration: 400 }
                    );
                  }
                  handleZonePress(zone);
                }}
              >
                <View>
                  <Text style={[styles.nearbyItemTitle, { color: colors.textPrimary }]}>
                    {zone.label ?? zone.segmentCode ?? 'Parking Zone'}
                  </Text>
                  <Text style={[styles.nearbyItemSubtitle, { color: colors.textSecondary }]}>
                    {(dist / 1609.34).toFixed(2)} mi away • {zone.availableSpots ?? 0} open / {zone.totalSpots ?? 0} total
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* All spots modal */}
      <Modal
        animationType="slide"
        transparent
        visible={allVisible}
        onRequestClose={() => setAllVisible(false)}
      >
        <TouchableOpacity
          style={styles.nearbyOverlay}
          activeOpacity={1}
          onPressOut={() => setAllVisible(false)}
        />
        <View style={[styles.nearbySheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.nearbyHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.nearbyTitle, { color: colors.textPrimary }]}>All Spots</Text>
            <TouchableOpacity
              onPress={() => setAllVisible(false)}
              style={[styles.nearbyClose, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            >
              <Text style={[styles.nearbyCloseText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.nearbyList} contentContainerStyle={styles.nearbyListContent}>
            {zones.length === 0 && (
              <Text style={[styles.nearbyEmpty, { color: colors.textSecondary }]}>
                No spots available for this city.
              </Text>
            )}
            {visibleZones.map((zone) => (
              <TouchableOpacity
                key={`all-${zone.id}`}
                style={[styles.nearbyItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                activeOpacity={0.85}
                onPress={() => {
                  setAllVisible(false);
                  const point = getZonePoint(zone);
                  setActiveZoneId(zone.id);
                  if (point && mapRef.current) {
                    mapRef.current.animateCamera(
                      {
                        center: {
                          latitude: point.latitude,
                          longitude: point.longitude,
                        },
                        zoom: 16,
                      },
                      { duration: 400 }
                    );
                  }
                  handleZonePress(zone);
                }}
              >
                <View>
                  <Text style={[styles.nearbyItemTitle, { color: colors.textPrimary }]}>
                    {zone.label ?? zone.segmentCode ?? 'Parking Zone'}
                  </Text>
                  <Text style={[styles.nearbyItemSubtitle, { color: colors.textSecondary }]}>
                    {zone.availableSpots ?? 0} open / {zone.totalSpots ?? 0} total
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeBookingModal}
        presentationStyle="overFullScreen"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bookingModalOverlay}
        >
          <TouchableOpacity
            style={styles.bookingModalBackdrop}
            activeOpacity={1}
            onPress={closeBookingModal}
          />
          <Animated.View
            style={[
              styles.bookingModalContent,
              { backgroundColor: colors.background },
              { transform: [{ translateY: bookingModalSlide }] }
            ]}
          >
            {/* Header */}
            <View style={[styles.bookingModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.bookingModalTitle, { color: colors.textPrimary }]}>
                {selectedBookingSpot?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setBookingModalVisible(false)}
                style={[styles.bookingModalCloseButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.bookingModalCloseText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.bookingModalBody}
              contentContainerStyle={styles.bookingModalBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Mini Map */}
              <View style={[styles.miniMapContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <MapView
                  style={styles.miniMap}
                  region={{
                    latitude: selectedBookingSpot?.latitude || 43.7030,
                    longitude: selectedBookingSpot?.longitude || -72.2870,
                    latitudeDelta: 0.003,
                    longitudeDelta: 0.003,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {selectedBookingSpot && (
                    <Marker
                      coordinate={{
                        latitude: selectedBookingSpot.latitude,
                        longitude: selectedBookingSpot.longitude,
                      }}
                      pinColor={colors.primary}
                    />
                  )}
                </MapView>
                <View style={[styles.miniMapLabel, { backgroundColor: colors.primary }]}>
                  <Text style={styles.miniMapLabelText}>Your Parking Spot</Text>
                </View>
              </View>

              {/* Spot Details */}
              <View style={[styles.bookingSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.bookingSectionTitle, { color: colors.textPrimary }]}>Spot Details</Text>

                <View style={styles.bookingDetailRow}>
                  <Text style={[styles.bookingDetailLabel, { color: colors.textSecondary }]}>Status</Text>
                  <View style={[styles.bookingStatusBadge, { backgroundColor: selectedBookingSpot?.available ? '#10b981' : '#ef4444' }]}>
                    <Text style={styles.bookingStatusText}>
                      {selectedBookingSpot?.available ? 'Available' : 'Occupied'}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetailRow}>
                  <Text style={[styles.bookingDetailLabel, { color: colors.textSecondary }]}>Price</Text>
                  <Text style={[styles.bookingDetailValue, { color: colors.textPrimary }]}>{selectedBookingSpot?.price}</Text>
                </View>

                {selectedBookingSpot?.timeLimit && (
                  <View style={styles.bookingDetailRow}>
                    <Text style={[styles.bookingDetailLabel, { color: colors.textSecondary }]}>Time Limit</Text>
                    <Text style={[styles.bookingDetailValue, { color: colors.textPrimary }]}>{selectedBookingSpot.timeLimit}</Text>
                  </View>
                )}

                {selectedBookingSpot?.distance && (
                  <View style={styles.bookingDetailRow}>
                    <Text style={[styles.bookingDetailLabel, { color: colors.textSecondary }]}>Distance</Text>
                    <Text style={[styles.bookingDetailValue, { color: colors.textPrimary }]}>{selectedBookingSpot.distance}</Text>
                  </View>
                )}

                {selectedBookingSpot?.rules && (
                  <View style={styles.bookingDetailRow}>
                    <Text style={[styles.bookingDetailLabel, { color: colors.textSecondary }]}>Rules</Text>
                    <Text style={[styles.bookingDetailValue, { color: colors.textPrimary }]}>{selectedBookingSpot.rules}</Text>
                  </View>
                )}
              </View>

              {/* Payment Method */}
              <View style={[styles.bookingSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.bookingSectionTitle, { color: colors.textPrimary }]}>Payment Method</Text>

                <TouchableOpacity style={[styles.paymentMethodCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                  <View style={[styles.paymentMethodIcon, { backgroundColor: colors.primary }]}>
                    <Text style={styles.paymentMethodIconText}>💳</Text>
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.paymentMethodTitle, { color: colors.textPrimary }]}>Visa •••• 4242</Text>
                    <Text style={[styles.paymentMethodSubtitle, { color: colors.textSecondary }]}>Default payment</Text>
                  </View>
                  <Text style={[styles.paymentMethodArrow, { color: colors.textTertiary }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.changePaymentButton, { borderColor: colors.border }]}
                  onPress={() => {
                    setBookingModalVisible(false);
                    navigation.navigate('Profile', { screen: 'PaymentMethods' });
                  }}
                >
                  <Text style={[styles.changePaymentButtonText, { color: colors.primary }]}>Change Payment Method</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={[
                    styles.bookingActionButton,
                    styles.saveButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: isFavorite ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={async () => {
                    if (isFavorite) {
                      await handleRemoveFavorite();
                    } else {
                      await handleAddFavorite();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.saveButtonText, { color: isFavorite ? colors.primary : colors.textPrimary }]}>
                    {isFavorite ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bookingActionButton, styles.navigateButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                  onPress={handleNavigateFromBooking}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.navigateButtonText, { color: colors.textPrimary }]}>Reserve Spot</Text>
                </TouchableOpacity>
              </View>

              {selectedBookingSpot && (
                <TouchableOpacity
                  style={[styles.bookingReserveButton, { backgroundColor: colors.primary }]}
                  onPress={handleNavigateFromBooking}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookingReserveButtonText}>Navigate</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
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
  statsOverlay: {
    position: 'absolute',
    top: 16,
    left: 20,
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
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
    opacity: 0.4,
  },
  locationButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14b8a6',
  },
  permissionBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 80,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 3,
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 12,
    color: '#0f172a',
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
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    fontSize: 28,
    fontWeight: '600',
  },
  zoomButtonDisabled: {
    opacity: 0.4,
  },
  zoomButtonTextDisabled: {
    opacity: 0.6,
  },
  zoomDivider: {
    height: 1,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    minWidth: 88,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '600',
  },
  modalBody: {
    gap: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalStatusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalReserveButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalReserveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Booking Modal Styles
  bookingModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bookingModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bookingModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bookingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  bookingModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 1,
  },
  bookingModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingModalCloseText: {
    fontSize: 22,
    fontWeight: '400',
  },
  bookingModalBody: {
    flex: 1,
  },
  bookingModalBodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  miniMapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    borderWidth: 1,
  },
  miniMap: {
    flex: 1,
  },
  miniMapLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  miniMapLabelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  bookingSection: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  bookingSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingDetailLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  bookingDetailValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bookingStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookingStatusText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  paymentMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodIconText: {
    fontSize: 20,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  paymentMethodArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  changePaymentButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  changePaymentButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bookingActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  saveButton: {
    // Additional styles can be added here
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  navigateButton: {
    // Additional styles can be added here
  },
  navigateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bookingReserveButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookingReserveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nearbyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  nearbySheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    paddingTop: 12,
    borderWidth: 1,
    maxHeight: '55%',
  },
  nearbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  nearbyClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  nearbyCloseText: {
    fontSize: 18,
    fontWeight: '700',
  },
  nearbyList: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  nearbyListContent: {
    paddingBottom: 12,
    gap: 10,
  },
  nearbyItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  nearbyItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  nearbyItemSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  nearbyEmpty: {
    fontSize: 14,
    paddingVertical: 10,
  },
});
