import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SMS from 'expo-sms';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { getDemoContacts } from '../src/mock/contacts';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  Chip,
  EmptyState,
  SearchInput,
  PersonRow,
} from '../src/ui';

const DEFAULT_MESSAGE =
  "Hey! I'm using 1D — it shows what friends and friends-of-friends are up to around town. Come join me on it.";

export default function InviteContactsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();
  const { friends, addFriend, isFriend } = useFriends();

  const isOnboarding = Boolean(route.params?.onboarding);

  const contacts = useMemo(() => getDemoContacts(), []);
  const onApp = useMemo(() => contacts.filter((contact) => contact.onApp), [contacts]);
  const offApp = useMemo(() => contacts.filter((contact) => !contact.onApp), [contacts]);

  // Everyone off-app starts checked — the whole point of the step is inviting them.
  const [selectedIds, setSelectedIds] = useState(() => new Set(offApp.map((c) => c.id)));
  const [addedOnApp, setAddedOnApp] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('invite');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const finish = useCallback(() => {
    if (isOnboarding) navigation.replace('Main');
    else navigation.goBack();
  }, [isOnboarding, navigation]);

  const visible = useMemo(() => {
    const list = tab === 'invite' ? offApp : onApp;
    const search = query.trim().toLowerCase();
    if (!search) return list;
    return list.filter(
      (contact) =>
        contact.name.toLowerCase().includes(search) || contact.number.includes(search)
    );
  }, [tab, offApp, onApp, query]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const connectOnApp = (contact) => {
    addFriend(contact.userId);
    setAddedOnApp((prev) => new Set(prev).add(contact.id));
  };

  /**
   * Opens the OS message composer with the recipients and text prefilled.
   * The user still has to press send — nothing goes out from here on its own.
   */
  const sendInvites = async () => {
    const recipients = offApp
      .filter((contact) => selectedIds.has(contact.id))
      .map((contact) => contact.number);

    if (recipients.length === 0) return;

    const available = await SMS.isAvailableAsync();
    if (!available) {
      Alert.alert(
        'Messaging unavailable',
        "This device can't send text messages, so the invite can't be composed here. Try from a phone."
      );
      return;
    }

    try {
      const { result } = await SMS.sendSMSAsync(recipients, message);
      if (result === 'sent') setSelectedIds(new Set());
    } catch (error) {
      Alert.alert('Could not open Messages', error?.message || 'Please try again.');
    }
  };

  const selectedCount = selectedIds.size;
  const alreadyFriendsCount = onApp.filter((contact) => isFriend(contact.userId)).length;

  const rowDivider = (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginLeft: spacing.md * 2 + 48,
      }}
    />
  );

  return (
    <Screen>
      <ScreenHeader
        title="Your contacts"
        subtitle={`${contacts.length} contacts · ${offApp.length} not on 1D yet`}
        onBack={isOnboarding ? undefined : () => navigation.goBack()}
        right={
          <Button
            label={isOnboarding ? 'Skip' : 'Done'}
            variant="ghost"
            size="sm"
            onPress={finish}
          />
        }
      >
        <View style={styles.chipRow}>
          <Chip
            label={`Invite · ${offApp.length}`}
            selected={tab === 'invite'}
            onPress={() => setTab('invite')}
          />
          <Chip
            label={`Already on 1D · ${onApp.length}`}
            selected={tab === 'onApp'}
            onPress={() => setTab('onApp')}
          />
        </View>
      </ScreenHeader>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'invite' ? (
          <>
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.heading, { color: colors.textPrimary }]}>
                {offApp.length} {offApp.length === 1 ? 'contact isn’t' : 'contacts aren’t'} on 1D
                yet
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 21 },
                ]}
              >
                Pick who to invite and we’ll open your Messages app with the text ready. Nothing
                sends until you press send.
              </Text>

              <Text style={[typography.label, { color: colors.textPrimary, marginTop: spacing.lg }]}>
                Your invite
              </Text>
              <TextInput
                style={[
                  typography.body,
                  styles.messageInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    borderRadius: radius.md,
                    marginTop: spacing.sm,
                  },
                ]}
                value={message}
                onChangeText={setMessage}
                multiline
                placeholder="Write your invite…"
                placeholderTextColor={colors.textTertiary}
              />
            </Card>

            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search contacts"
              style={{ marginBottom: spacing.lg }}
            />

            {visible.length === 0 ? (
              <Card>
                <EmptyState
                  icon="🔍"
                  title="No matches"
                  message={query ? `Nobody matches “${query}”.` : 'Everyone here is already on 1D.'}
                />
              </Card>
            ) : (
              <Card padded={false} style={{ paddingVertical: spacing.xs }}>
                {visible.map((contact, index) => {
                  const selected = selectedIds.has(contact.id);
                  return (
                    <View key={contact.id}>
                      {index > 0 ? rowDivider : null}
                      <PersonRow
                        name={contact.name}
                        subtitle={contact.number}
                        selected={selected}
                        onPress={() => toggle(contact.id)}
                        right={
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: selected ? colors.primary : colors.borderStrong,
                                backgroundColor: selected ? colors.primary : 'transparent',
                              },
                            ]}
                          >
                            {selected ? (
                              <Text style={[styles.checkmark, { color: colors.onPrimary }]}>✓</Text>
                            ) : null}
                          </View>
                        }
                      />
                    </View>
                  );
                })}
              </Card>
            )}
          </>
        ) : (
          <>
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.heading, { color: colors.textPrimary }]}>
                {onApp.length} contacts already here
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 21 },
                ]}
              >
                {alreadyFriendsCount === onApp.length
                  ? 'You’re already connected to all of them.'
                  : `You're connected to ${alreadyFriendsCount}. Add the rest to grow your web in ${
                      user?.residence || 'your city'
                    }.`}
              </Text>
            </Card>

            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search contacts"
              style={{ marginBottom: spacing.lg }}
            />

            <Card padded={false} style={{ paddingVertical: spacing.xs }}>
              {visible.map((contact, index) => {
                const connected = isFriend(contact.userId) || addedOnApp.has(contact.id);
                return (
                  <View key={contact.id}>
                    {index > 0 ? rowDivider : null}
                    <PersonRow
                      name={contact.name}
                      subtitle={contact.city}
                      meta={contact.number}
                      right={
                        connected ? (
                          <Text style={[typography.caption, { color: colors.textTertiary }]}>
                            Friends ✓
                          </Text>
                        ) : (
                          <Button label="Add" size="sm" onPress={() => connectOnApp(contact)} />
                        )
                      }
                    />
                  </View>
                );
              })}
            </Card>
          </>
        )}
      </ScrollView>

      {tab === 'invite' && selectedCount > 0 ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          <Button
            label={`Invite ${selectedCount} ${selectedCount === 1 ? 'contact' : 'contacts'}`}
            onPress={sendInvites}
            fullWidth
          />
          {isOnboarding ? (
            <Button
              label="Maybe later"
              variant="ghost"
              onPress={finish}
              fullWidth
              style={{ marginTop: spacing.xs }}
            />
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  messageInput: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
