import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import { USERS_BY_ID } from '../src/mock/users';
import {
  getMutualFriendCount,
  getSuggestedPeople,
  getConnectorFriends,
} from '../src/social/connections';
import useOpenChat from '../src/hooks/useOpenChat';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  SegmentedControl,
  EmptyState,
  SearchInput,
  PersonRow,
} from '../src/ui';

const formatAge = (timestamp) => {
  if (!timestamp) return '';
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export default function FriendRequestsScreen() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    sendFriendRequest,
    cancelFriendRequest,
  } = useFriends();

  const { openDirectMessage } = useOpenChat();

  const [activeTab, setActiveTab] = useState(route.params?.tab || 'incoming');
  const [query, setQuery] = useState('');

  const openProfile = (userId) => navigation.navigate('FriendProfile', { userId });

  const incoming = useMemo(
    () =>
      incomingRequests
        .map((request) => {
          const user = USERS_BY_ID.get(request.userId);
          if (!user) return null;
          const via = request.viaId ? USERS_BY_ID.get(request.viaId) : null;
          return {
            ...request,
            user,
            mutualCount: getMutualFriendCount(request.userId, friends),
            connectors: getConnectorFriends(request.userId, friends),
            viaName: via?.name || null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.createdAt - a.createdAt),
    [incomingRequests, friends]
  );

  const outgoing = useMemo(
    () =>
      outgoingRequests
        .map((request) => {
          const user = USERS_BY_ID.get(request.userId);
          return user ? { ...request, user } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.createdAt - a.createdAt),
    [outgoingRequests]
  );

  const suggestions = useMemo(() => {
    const pendingIds = [
      ...incomingRequests.map((request) => request.userId),
      ...outgoingRequests.map((request) => request.userId),
    ];
    const people = getSuggestedPeople(friends, pendingIds);

    const search = query.trim().toLowerCase();
    const matched = search
      ? people.filter(
          (person) =>
            person.name.toLowerCase().includes(search) ||
            (person.city || '').toLowerCase().includes(search)
        )
      : people;

    return matched.slice(0, 40).map((person) => ({
      ...person,
      mutualCount: getMutualFriendCount(person.id, friends),
      connectors: getConnectorFriends(person.id, friends),
    }));
  }, [friends, incomingRequests, outgoingRequests, query]);

  const mutualLabel = (count) =>
    count > 0 ? `${count} mutual ${count === 1 ? 'friend' : 'friends'}` : 'No mutual friends';

  const renderIncoming = () => {
    if (incoming.length === 0) {
      return (
        <Card>
          <EmptyState
            icon="📭"
            title="No pending requests"
            message="When someone asks to connect, they'll show up here."
            actionLabel="Find people"
            onAction={() => setActiveTab('discover')}
          />
        </Card>
      );
    }

    return incoming.map((request) => (
      <Card key={request.id} style={{ marginBottom: spacing.md }}>
        <PersonRow
          name={request.user.name}
          subtitle={request.user.city}
          meta={`${mutualLabel(request.mutualCount)} · ${formatAge(request.createdAt)}`}
          connectors={request.connectors}
          onPress={() => openProfile(request.user.id)}
          onMessage={() => openDirectMessage(request.user.id)}
          style={{ paddingHorizontal: 0, paddingVertical: 0 }}
        />
        {request.message ? (
          <Text
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                marginTop: spacing.md,
                fontStyle: 'italic',
                lineHeight: 20,
              },
            ]}
          >
            “{request.message}”
          </Text>
        ) : null}
        <View style={[styles.actions, { marginTop: spacing.lg, gap: spacing.sm }]}>
          <Button
            label="Accept"
            onPress={() => acceptFriendRequest(request.id)}
            style={styles.action}
          />
          <Button
            label="Decline"
            variant="secondary"
            onPress={() => declineFriendRequest(request.id)}
            style={styles.action}
          />
        </View>
      </Card>
    ));
  };

  const renderOutgoing = () => {
    if (outgoing.length === 0) {
      return (
        <Card>
          <EmptyState
            icon="✈️"
            title="Nothing sent yet"
            message="Requests you send will sit here until they're accepted."
            actionLabel="Find people"
            onAction={() => setActiveTab('discover')}
          />
        </Card>
      );
    }

    return (
      <Card padded={false} style={{ paddingVertical: spacing.xs }}>
        {outgoing.map((request, index) => (
          <View key={request.id}>
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
              name={request.user.name}
              subtitle={request.user.city}
              meta={`Sent ${formatAge(request.createdAt)}`}
              onPress={() => openProfile(request.user.id)}
              onMessage={() => openDirectMessage(request.user.id)}
              right={
                <Button
                  label="Cancel"
                  variant="secondary"
                  size="sm"
                  onPress={() => cancelFriendRequest(request.userId)}
                />
              }
            />
          </View>
        ))}
      </Card>
    );
  };

  const renderDiscover = () => (
    <>
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or city"
        style={{ marginBottom: spacing.lg }}
      />
      {suggestions.length === 0 ? (
        <Card>
          <EmptyState
            icon="🔍"
            title="No one found"
            message={
              query
                ? `Nobody matches “${query}”.`
                : "You've already connected with everyone here."
            }
          />
        </Card>
      ) : (
        <Card padded={false} style={{ paddingVertical: spacing.xs }}>
          {suggestions.map((person, index) => (
            <View key={person.id}>
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
                name={person.name}
                subtitle={person.city}
                meta={mutualLabel(person.mutualCount)}
                connectors={person.connectors}
                onPress={() => openProfile(person.id)}
                onMessage={() => openDirectMessage(person.id)}
                right={
                  <Button
                    label="Add"
                    size="sm"
                    onPress={() => sendFriendRequest(person.id)}
                  />
                }
              />
            </View>
          ))}
        </Card>
      )}
    </>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Friend requests"
        subtitle={`${friends.length} friends · ${incoming.length} pending`}
        onBack={() => navigation.goBack()}
      >
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          segments={[
            { key: 'incoming', label: 'Received', badge: incoming.length || undefined },
            { key: 'outgoing', label: 'Sent', badge: outgoing.length || undefined },
            { key: 'discover', label: 'Discover' },
          ]}
        />
      </ScreenHeader>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'incoming' ? renderIncoming() : null}
        {activeTab === 'outgoing' ? renderOutgoing() : null}
        {activeTab === 'discover' ? renderDiscover() : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  action: {
    flex: 1,
  },
});
