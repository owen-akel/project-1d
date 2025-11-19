import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const {
    shareLocation,
    setShareLocation,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
  } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Receive alerts for parking updates</Text>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={setPushNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={pushNotificationsEnabled ? '#14b8a6' : '#f1f5f9'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Location Services</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Find nearby parking spots</Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={shareLocation ? '#14b8a6' : '#f1f5f9'}
            />
          </View>

        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Switch to dark theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={isDarkMode ? '#14b8a6' : '#f1f5f9'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>App Version</Text>
            <Text style={[styles.versionText, { color: colors.textTertiary }]}>1.0.0</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    width: 44,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  versionText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
