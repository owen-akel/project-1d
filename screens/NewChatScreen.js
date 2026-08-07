import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import { useChat } from '../context/ChatContext';
import { getReachablePeople } from '../src/social/connections';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  Chip,
  Avatar,
  EmptyState,
  SearchInput,
  PersonRow,
} from '../src/ui';

const DEGREE_FILTERS = [
  { key: 'all', label: 'Everyone' },
  { key: 'friends', label: 'Friends' },
  { key: 'fof', label: 'Friends of friends' },
];

export default function NewChatScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const { friends } = useFriends();
  const { openDirectConversation, createGroupConversation } = useChat();

  const [query, setQuery] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');

  // Everyone one or two hops out, each carrying the friends they're linked through.
  const people = useMemo(() => getReachablePeople(friends), [friends]);
  const peopleById = useMemo(
    () => new Map(people.map((entry) => [entry.user.id, entry])),
    [people]
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return people
      .filter((entry) => {
        if (degreeFilter === 'friends' && entry.degree !== 1) return false;
        if (degreeFilter === 'fof' && entry.degree !== 2) return false;
        if (!search) return true;
        return (
          entry.user.name.toLowerCase().includes(search) ||
          (entry.user.city || '').toLowerCase().includes(search) ||
          entry.connectors.some((connector) => connector.name.toLowerCase().includes(search))
        );
      })
      .sort((a, b) => {
        if (a.degree !== b.degree) return a.degree - b.degree;
        return a.user.name.localeCompare(b.user.name);
      })
      .slice(0, 60);
  }, [people, query, degreeFilter]);

  const toggle = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const isGroup = selectedIds.length > 1;

  const handleCreate = () => {
    if (selectedIds.length === 0) return;

    const conversationId = isGroup
      ? createGroupConversation(groupName, selectedIds)
      : openDirectConversation(selectedIds[0]);

    // Replace so backing out of the thread returns to the conversation list,
    // not to this picker.
    navigation.replace('Conversation', { conversationId });
  };

  const selectedPeople = selectedIds
    .map((id) => peopleById.get(id))
    .filter(Boolean);

  return (
    <Screen>
      <ScreenHeader
        title="New chat"
        subtitle={
          selectedIds.length === 0
            ? 'Pick one person, or several for a group'
            : isGroup
            ? `Group · ${selectedIds.length} people`
            : 'Direct message'
        }
        onBack={() => navigation.goBack()}
      >
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search friends and friends of friends"
        />
        <View style={[styles.filterRow, { marginTop: spacing.md }]}>
          {DEGREE_FILTERS.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              selected={degreeFilter === filter.key}
              onPress={() => setDegreeFilter(filter.key)}
            />
          ))}
        </View>
      </ScreenHeader>

      {/* Selected participants stay pinned so you can see who's in the group */}
      {selectedPeople.length > 0 ? (
        <View
          style={[
            styles.selectedTray,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}
          >
            {selectedPeople.map((entry) => (
              <TouchableOpacity
                key={entry.user.id}
                style={styles.selectedItem}
                onPress={() => toggle(entry.user.id)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${entry.user.name}`}
              >
                <Avatar name={entry.user.name} uri={entry.user.photoUrl} size="sm" connectors={entry.connectors} />
                <View style={[styles.removeDot, { backgroundColor: colors.textTertiary, borderColor: colors.background }]}>
                  <Text style={[styles.removeDotText, { color: colors.background }]}>✕</Text>
                </View>
                <Text
                  style={[typography.caption, { color: colors.textSecondary, fontSize: 11, marginTop: 4 }]}
                  numberOfLines={1}
                >
                  {entry.user.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isGroup ? (
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.label, { color: colors.textPrimary }]}>Group name</Text>
            <TextInput
              style={[
                typography.body,
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: radius.md,
                  marginTop: spacing.sm,
                },
              ]}
              placeholder="Optional — we'll name it after the members"
              placeholderTextColor={colors.textTertiary}
              value={groupName}
              onChangeText={setGroupName}
            />
          </Card>
        ) : null}

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon="🔍"
              title="No one found"
              message={
                query
                  ? `Nobody in your network matches “${query}”.`
                  : 'Add friends to start building your network.'
              }
            />
          </Card>
        ) : (
          <Card padded={false} style={{ paddingVertical: spacing.xs }}>
            {filtered.map((entry, index) => {
              const selected = selectedIds.includes(entry.user.id);
              return (
                <View key={entry.user.id}>
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
                    name={entry.user.name}
                    avatarUri={entry.user.photoUrl}
                    subtitle={entry.user.city}
                    meta={entry.degree === 1 ? 'Friend' : undefined}
                    connectors={entry.connectors}
                    selected={selected}
                    onPress={() => toggle(entry.user.id)}
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
      </ScrollView>

      {selectedIds.length > 0 ? (
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
            label={isGroup ? `Create group · ${selectedIds.length}` : 'Start chat'}
            onPress={handleCreate}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTray: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedItem: {
    width: 52,
    alignItems: 'center',
  },
  removeDot: {
    position: 'absolute',
    top: -2,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeDotText: {
    fontSize: 8,
    fontWeight: '700',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
