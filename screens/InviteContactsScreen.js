import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  EmptyState,
  SearchInput,
  PersonRow,
} from '../src/ui';

const DEFAULT_MESSAGE =
  "Hey! I'm using 1D — it shows what friends and friends-of-friends are up to around town. Come join me on it.";

/** Flatten the contact records we care about: a name plus one reachable number. */
const toInvitee = (contact) => {
  const number = contact.phoneNumbers?.find((entry) => entry?.number)?.number;
  if (!number) return null;

  const name =
    contact.name ||
    [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
  if (!name) return null;

  return { id: contact.id, name, number };
};

export default function InviteContactsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();

  const isOnboarding = Boolean(route.params?.onboarding);

  const [permission, setPermission] = useState('undetermined'); // undetermined | granted | denied
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const finish = useCallback(() => {
    if (isOnboarding) {
      navigation.replace('Main');
    } else {
      navigation.goBack();
    }
  }, [isOnboarding, navigation]);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }

      setPermission('granted');
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers],
      });

      const seenNumbers = new Set();
      const invitees = (data || [])
        .map(toInvitee)
        .filter(Boolean)
        .filter((invitee) => {
          const key = invitee.number.replace(/\D/g, '');
          if (!key || seenNumbers.has(key)) return false;
          seenNumbers.add(key);
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setContacts(invitees);
    } catch (error) {
      Alert.alert('Could not open contacts', error?.message || 'Please try again.');
      setPermission('denied');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(search) || contact.number.includes(search)
    );
  }, [contacts, query]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /**
   * Opens the OS message composer with the recipients and text prefilled.
   * The user still has to press send — nothing goes out from here on its own.
   */
  const sendInvites = async () => {
    const recipients = contacts
      .filter((contact) => selectedIds.has(contact.id))
      .map((contact) => contact.number);

    if (recipients.length === 0) return;

    const available = await SMS.isAvailableAsync();
    if (!available) {
      Alert.alert(
        'Messaging unavailable',
        'This device can\'t send text messages. Try again from a phone.'
      );
      return;
    }

    try {
      const { result } = await SMS.sendSMSAsync(recipients, message);
      if (result === 'sent') {
        setSelectedIds(new Set());
      }
    } catch (error) {
      Alert.alert('Could not open Messages', error?.message || 'Please try again.');
    }
  };

  const selectedCount = selectedIds.size;

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            Reading your contacts…
          </Text>
        </View>
      );
    }

    if (permission === 'granted' && contacts.length === 0) {
      return (
        <Card>
          <EmptyState
            icon="📇"
            title="No contacts with phone numbers"
            message="We only show contacts we can text. Add a number to a contact and try again."
          />
        </Card>
      );
    }

    if (permission !== 'granted') {
      return (
        <Card>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>
            Find friends already using 1D
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 21 },
            ]}
          >
            1D reads your contacts on this device so you can pick who to invite. Nothing is uploaded,
            and no message is sent until you press send in your own Messages app.
          </Text>
          {permission === 'denied' ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: spacing.md }]}>
              Contacts access is off. You can turn it on in Settings, or skip for now.
            </Text>
          ) : null}
          <Button
            label={permission === 'denied' ? 'Try again' : 'Choose contacts'}
            onPress={loadContacts}
            fullWidth
            style={{ marginTop: spacing.lg }}
          />
          <Button
            label={isOnboarding ? 'Skip for now' : 'Not now'}
            variant="ghost"
            onPress={finish}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      );
    }

    return (
      <>
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.label, { color: colors.textPrimary }]}>Your invite</Text>
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
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.sm }]}>
            Opens in your Messages app — you press send.
          </Text>
        </Card>

        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search contacts"
          style={{ marginBottom: spacing.lg }}
        />

        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon="🔍" title="No matches" message={`Nobody matches “${query}”.`} />
          </Card>
        ) : (
          <Card padded={false} style={{ paddingVertical: spacing.xs }}>
            {filtered.map((contact, index) => {
              const selected = selectedIds.has(contact.id);
              return (
                <View key={contact.id}>
                  {index > 0 ? (
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: colors.border,
                        marginLeft: spacing.md * 2 + 48,
                      }}
                    />
                  ) : null}
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
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title="Invite contacts"
        subtitle={
          permission === 'granted'
            ? `${selectedCount} selected`
            : `Grow your circle in ${user?.residence || 'your city'}`
        }
        onBack={isOnboarding ? undefined : () => navigation.goBack()}
        right={<Button label={isOnboarding ? 'Skip' : 'Done'} variant="ghost" size="sm" onPress={finish} />}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderBody()}
      </ScrollView>

      {permission === 'granted' && selectedCount > 0 ? (
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
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
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
