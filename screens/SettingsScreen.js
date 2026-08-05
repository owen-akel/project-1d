import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { Screen, ScreenHeader, Card, Button, Avatar } from '../src/ui';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { colors, spacing, radius, typography, isDarkMode, toggleDarkMode } = useTheme();
  const navigation = useNavigation();
  const { user } = useUser();
  const { friends, pendingRequestCount } = useFriends();

  // Local-only for now — there's no backend to persist preferences to yet.
  const [pushEnabled, setPushEnabled] = useState(true);
  const [requestAlerts, setRequestAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [eventReminders, setEventReminders] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [fofVisible, setFofVisible] = useState(true);

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
            description="Master switch for everything below"
            right={toggle(pushEnabled, setPushEnabled)}
          />
          <Row
            label="Friend requests"
            description={
              pendingRequestCount > 0 ? `${pendingRequestCount} waiting on you` : 'When someone adds you'
            }
            right={toggle(requestAlerts && pushEnabled, (v) => setRequestAlerts(v))}
          />
          <Row
            label="Messages"
            description="New direct messages and group chats"
            right={toggle(messageAlerts && pushEnabled, (v) => setMessageAlerts(v))}
          />
          <Row
            label="Event reminders"
            description="An hour before something you're going to"
            right={toggle(eventReminders && pushEnabled, (v) => setEventReminders(v))}
            last
          />
        </Section>

        <Section title="Privacy">
          <Row
            label="Discoverable"
            description="Let friends of friends find you in search"
            right={toggle(discoverable, setDiscoverable)}
          />
          <Row
            label="Show my city"
            description="Display your city on your profile"
            right={toggle(showCity, setShowCity)}
          />
          <Row
            label="Show friends of friends"
            description="Let your friends see who you're connected to"
            right={toggle(fofVisible, setFofVisible)}
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
          label="Sign out"
          variant="danger"
          fullWidth
          style={{ marginTop: spacing.xl }}
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
          Preferences are kept in memory for now and reset when the app reloads.
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
