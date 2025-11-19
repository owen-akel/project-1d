import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function IntroScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={1500} style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Parker</Text>
        <Text style={styles.subtitle}>Smart Parking Solutions</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500} duration={1500} style={styles.content}>
        <View style={styles.featureCard}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Find nearby parking spots instantly</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Real-time availability updates</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>Save time with smart recommendations</Text>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={1000} duration={1500} style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('Auth')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Your parking made simple</Text>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginTop: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#14b8a6',
    marginRight: 18,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
    lineHeight: 24,
  },
  footer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#14b8a6',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 16,
    fontWeight: '500',
  },
});
