import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../services/favorites';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { logout, user, isGuest } = useAuth();
  const isAuthenticated = !!user && !isGuest;
  const displayName = isGuest ? 'Guest' : formatNameFromEmail(user?.email);
  const displayEmail = isGuest
    ? 'You are browsing as a guest'
    : user?.email || 'driver@parker.app';
  const initials = isGuest ? 'GU' : getInitials(displayName);
  const headerSubtitle = isGuest
    ? 'Sign in to sync your preferences and history'
    : 'Thanks for being part of Parker';

  const handleLogout = () => {
    const title = isGuest ? 'Exit Guest Mode' : 'Logout';
    const message = isGuest
      ? 'Are you sure you want to exit guest mode?'
      : 'Are you sure you want to logout?';
    const buttonText = isGuest ? 'Exit' : 'Logout';

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: buttonText,
          onPress: async () => {
            await logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              })
            );
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAuthRedirect = (target) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Auth', params: { mode: target } },
        ],
      })
    );
  };

  const menuItems = [
    { id: 1, label: 'My Vehicles', iconType: 'car' },
    { id: 2, label: 'Favorites', iconType: 'star' },
    { id: 3, label: 'Settings', iconType: 'settings' },
    { id: 4, label: 'Help & Support', iconType: 'help' },
  ];

  const [favorites, setFavorites] = useState([]);

  const loadFavorites = useCallback(async () => {
    const data = await getFavorites(!isGuest ? user?.id : null);
    setFavorites(data);
  }, [isGuest, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'car':
        return (
          <View style={styles.iconSvg}>
            <View style={styles.carBody} />
            <View style={styles.carWheel1} />
            <View style={styles.carWheel2} />
          </View>
        );
      case 'star':
        return <Text style={styles.favoriteIcon}>★</Text>;
      case 'settings':
        return (
          <View style={styles.iconSvg}>
            <View style={styles.settingsIcon} />
          </View>
        );
      case 'help':
        return <Text style={styles.helpIcon}>?</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileImageText}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{displayEmail}</Text>
        <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>{headerSubtitle}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.7}
      onPress={() => {
        switch(item.label) {
          case 'My Vehicles':
            navigation.getParent().navigate('MyVehicles');
            break;
          case 'Favorites':
            navigation.getParent().navigate('Favorites');
            break;
          case 'Settings':
            navigation.getParent().navigate('Settings');
            break;
          case 'Help & Support':
            navigation.getParent().navigate('HelpSupport');
                    break;
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  {renderIcon(item.iconType)}
                </View>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textTertiary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isGuest && (
          <View style={[styles.guestCTAContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.guestCTATitle, { color: colors.textPrimary }]}>Ready for more?</Text>
            <Text style={[styles.guestCTADescription, { color: colors.textSecondary }]}>
              Sign in to sync favorites, manage vehicles, and track your parking history.
            </Text>
            <TouchableOpacity
              style={[styles.guestPrimaryButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => handleAuthRedirect('login')}
            >
              <Text style={styles.guestPrimaryButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.guestSecondaryButton, { borderColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => handleAuthRedirect('signup')}
            >
              <Text style={[styles.guestSecondaryButtonText, { color: colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {(isAuthenticated || isGuest) && (
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>{isGuest ? 'Exit Guest Mode' : 'Logout'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const formatNameFromEmail = (email) => {
  if (!email) {
    return 'Parker Driver';
  }
  const username = email.split('@')[0];
  const parts = username
    .replace(/[\._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  const formatted = parts.join(' ');
  return formatted || 'Parker Driver';
};

const getInitials = (name) => {
  if (!name) {
    return 'PD';
  }
  const letters = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('');
  return letters ? letters.toUpperCase() : 'PD';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  content: {
    flex: 1,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    paddingLeft: 4,
    letterSpacing: -0.3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconSvg: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carBody: {
    width: 18,
    height: 10,
    backgroundColor: '#14b8a6',
    borderRadius: 3,
  },
  carWheel1: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#14b8a6',
    bottom: -1,
    left: 2,
  },
  carWheel2: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#14b8a6',
    bottom: -1,
    right: 2,
  },
  settingsIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  helpIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14b8a6',
  },
  menuLabel: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 28,
    color: '#94a3b8',
    fontWeight: '300',
  },
  guestCTAContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  guestCTATitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  guestCTADescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  guestPrimaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  guestPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  guestSecondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  guestSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  logoutButton: {
    margin: 20,
    marginTop: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favoriteIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  favoriteMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
});
