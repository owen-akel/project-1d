import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { useSettings } from '../context/SettingsContext';
import { Screen, ScreenHeader, Card, Button, Avatar } from '../src/ui';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { colors, spacing, radius, typography, isDarkMode, toggleDarkMode } = useTheme();
  const navigation = useNavigation();
  const { user } = useUser();
  const { friends, pendingRequestCount } = useFriends();
  const { settings, setSetting, resetSettings } = useSettings();

  const notImplemented = (label) =>
    Alert.alert(label, 'Not wired up yet — this is a placeholder while there’s no backend.');

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You’ll be returned to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => navigation.getParent()?.replace?.('Auth') ?? navigation.navigate('Auth'),
      },
    ]);
  };

  const Section = ({ title, children, style }) => (
    <View style={[{ marginTop: spacing.lg }, style]}>
      <Text
        style={[
          typography.caption,
          {
            color: colors.textTertiary,
            marginBottom: spacing.sm,
            marginLeft: spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          },
        ]}
      >
        {title}
      </Text>
      <Card padded={false} style={{ paddingVertical: spacing.xs }}>
        {children}
      </Card>
    </View>
  );

  const Row = ({ label, description, right, onPress, last }) => (
    <>
      <TouchableOpacity
        disabled={!onPress}
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.row, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}
      >
        <View style={styles.rowText}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
            {label}
          </Text>
          {description ? (
            <Text
              style={[typography.caption, { color: colors.textSecondary, marginTop: 2, lineHeight: 17 }]}
            >
              {description}
            </Text>
          ) : null}
        </View>
        {right !== undefined ? (
          right
        ) : onPress ? (
          <Text style={[typography.body, { color: colors.textTertiary }]}>›</Text>
        ) : null}
      </TouchableOpacity>
      {last ? null : (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
            marginLeft: spacing.lg,
          }}
        />
      )}
    </>
  );

  const toggle = (value, onValueChange) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: colors.primary, false: colors.borderStrong }}
      thumbColor={colors.card}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={styles.accountRow}>
            <Avatar name={user.name} uri={user.photo} size="md" />
            <View style={[styles.rowText, { marginLeft: spacing.md }]}>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                {user.name}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {friends.length} friends · {user.residence || 'No city set'}
              </Text>
            </View>
            <Button
              label="Edit profile"
              variant="secondary"
              size="sm"
              onPress={() => navigation.goBack()}
            />
          </View>
        </Card>

        <Section title="Appearance">
          <Row
            label="Dark mode"
            description={isDarkMode ? 'On' : 'Off'}
            right={toggle(isDarkMode, toggleDarkMode)}
            last
          />
        </Section>

        <Section title="Notifications">
          <Row
            label="Push notifications"
            description="Master switch — turning this off clears every badge"
            right={toggle(settings.pushEnabled, (value) => setSetting('pushEnabled', value))}
          />
          <Row
            label="Friend request badges"
            description={
              pendingRequestCount > 0
                ? `${pendingRequestCount} waiting on you`
                : 'Badge the profile tab when someone adds you'
            }
            right={toggle(settings.pushEnabled && settings.requestBadges, (value) =>
              setSetting('requestBadges', value)
            )}
          />
          <Row
            label="Message badges"
            description="Badge the chat tab for unread messages"
            right={toggle(settings.pushEnabled && settings.messageBadges, (value) =>
              setSetting('messageBadges', value)
            )}
            last
          />
        </Section>

        <Section title="Privacy">
          <Row
            label="Discoverable"
            description="Appear in Discover when people look for someone to add"
            right={toggle(settings.discoverable, (value) => setSetting('discoverable', value))}
          />
          <Row
            label="Show my city"
            description="Display your city on your profile and in lists"
            right={toggle(settings.showCity, (value) => setSetting('showCity', value))}
          />
          <Row
            label="Show my connections"
            description="Let others see who you're connected to"
            right={toggle(settings.showConnections, (value) => setSetting('showConnections', value))}
            last
          />
        </Section>

        <Section title="Content">
          <Row
            label="Event artwork"
            description="Show artwork behind event cards"
            right={toggle(settings.showEventBackdrops, (value) =>
              setSetting('showEventBackdrops', value)
            )}
            last
          />
        </Section>

        <Section title="Account">
          <Row label="Change password" onPress={() => notImplemented('Change password')} />
          <Row label="Blocked accounts" onPress={() => notImplemented('Blocked accounts')} />
          <Row
            label="Download my data"
            description="Export your profile, connections and messages"
            onPress={() => notImplemented('Download my data')}
            last
          />
        </Section>

        <Section title="About">
          <Row label="Help & support" onPress={() => notImplemented('Help & support')} />
          <Row label="Terms of service" onPress={() => notImplemented('Terms of service')} />
          <Row label="Privacy policy" onPress={() => notImplemented('Privacy policy')} />
          <Row
            label="Version"
            right={
              <Text style={[typography.caption, { color: colors.textTertiary }]}>{APP_VERSION}</Text>
            }
            last
          />
        </Section>

        <Button
          label="Reset preferences"
          variant="secondary"
          fullWidth
          style={{ marginTop: spacing.xl }}
          onPress={resetSettings}
        />

        <Button
          label="Sign out"
          variant="danger"
          fullWidth
          style={{ marginTop: spacing.sm }}
          onPress={confirmSignOut}
        />

        <Text
          style={[
            typography.caption,
            {
              color: colors.textTertiary,
              textAlign: 'center',
              marginTop: spacing.lg,
              lineHeight: 17,
            },
          ]}
        >
          Appearance, notification and content settings take effect immediately.
          Everything is kept in memory and resets when the app reloads.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
