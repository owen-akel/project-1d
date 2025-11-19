import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LaunchScreen({ navigation }) {
  const carPosition = useRef(new Animated.Value(-100)).current;
  const carRotation = useRef(new Animated.Value(0)).current;
  const parkingLineOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show logo first
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Show parking lines
    setTimeout(() => {
      Animated.timing(parkingLineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Animate car movement and parking
    setTimeout(() => {
      Animated.sequence([
        // Move car from left to center
        Animated.timing(carPosition, {
          toValue: width / 2 - 40,
          duration: 1200,
          useNativeDriver: true,
        }),
        // Rotate car slightly (turning into parking spot)
        Animated.parallel([
          Animated.timing(carRotation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(carPosition, {
            toValue: width / 2 - 30,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Straighten car (parked)
        Animated.timing(carRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate to intro screen after animation completes
        setTimeout(() => {
          navigation.replace('Intro');
        }, 500);
      });
    }, 800);
  }, []);

  const rotation = carRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Parker</Text>
        <Text style={styles.tagline}>Smart Parking Solutions</Text>
      </Animated.View>

      {/* Parking Animation Area */}
      <View style={styles.animationArea}>
        {/* Parking Lines */}
        <Animated.View
          style={[styles.parkingLinesContainer, { opacity: parkingLineOpacity }]}
        >
          <View style={styles.parkingSpot}>
            <View style={styles.parkingLine} />
            <View style={styles.parkingLine} />
          </View>
          <View style={styles.parkingSpot}>
            <View style={styles.parkingLine} />
            <View style={styles.parkingLine} />
          </View>
          <View style={[styles.parkingSpot, styles.targetSpot]}>
            <View style={[styles.parkingLine, styles.targetLine]} />
            <View style={[styles.parkingLine, styles.targetLine]} />
            <View style={styles.parkingLabel}>
              <Text style={styles.parkingLabelText}>Your Spot</Text>
            </View>
          </View>
        </Animated.View>

        {/* Animated Car */}
        <Animated.View
          style={[
            styles.car,
            {
              transform: [
                { translateX: carPosition },
                { rotate: rotation },
              ],
            },
          ]}
        >
          {/* Car Body */}
          <View style={styles.carBody}>
            <View style={styles.carTop} />
            <View style={styles.carMain} />
          </View>
          {/* Car Wheels */}
          <View style={styles.wheelsContainer}>
            <View style={styles.wheel} />
            <View style={styles.wheel} />
          </View>
        </Animated.View>
      </View>

      {/* Loading Text */}
      <Animated.Text style={[styles.loadingText, { opacity: logoOpacity }]}>
        Finding the perfect spot...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  animationArea: {
    width: width - 40,
    height: 200,
    justifyContent: 'center',
    position: 'relative',
  },
  parkingLinesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  parkingSpot: {
    width: 70,
    height: 100,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  targetSpot: {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa',
  },
  parkingLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  targetLine: {
    backgroundColor: '#14b8a6',
  },
  parkingLabel: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  parkingLabelText: {
    fontSize: 11,
    color: '#14b8a6',
    fontWeight: '700',
  },
  car: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 80,
    height: 50,
  },
  carBody: {
    position: 'relative',
  },
  carTop: {
    width: 40,
    height: 20,
    backgroundColor: '#14b8a6',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginLeft: 15,
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  carMain: {
    width: 80,
    height: 35,
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    marginTop: -2,
    borderWidth: 2,
    borderColor: '#0f766e',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  wheelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: -8,
  },
  wheel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  loadingText: {
    marginTop: 80,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
