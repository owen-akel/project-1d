import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import { USERS_BY_ID } from '../src/mock/users';
import { FRIENDS_BY_USER_ID } from '../src/mock/graph';
import { canViewUser } from '../src/social/visibility';
import { getMutualFriendCount, getConnectorFriends } from '../src/social/connections';
import useOpenChat from '../src/hooks/useOpenChat';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  Chip,
  Avatar,
  StatTile,
  EmptyState,
  PersonRow,
} from '../src/ui';

export default function FriendProfileScreen() {
  const { colors, spacing, typography } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const {
    friends,
    removeFriend,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    incomingRequests,
    getRelationship,
  } = useFriends();

  const { openDirectMessage } = useOpenChat();

  const { userId } = route.params || {};
  const person = userId ? USERS_BY_ID.get(userId) : null;

  const relationship = getRelationship(userId);

  const theirFriends = useMemo(() => {
    if (!userId) return [];
    return (FRIENDS_BY_USER_ID.get(userId) || [])
      .filter((friendId) => canViewUser(friendId, friends))
      .map((friendId) => USERS_BY_ID.get(friendId))
      .filter(Boolean)
      .map((friend) => ({ ...friend, connectors: getConnectorFriends(friend.id, friends) }));
  }, [userId, friends]);

  const mutualCount = useMemo(
    () => (userId ? getMutualFriendCount(userId, friends) : 0),
    [userId, friends]
  );

  // Which of your direct friends link you to this person (empty if they are one).
  const connectors = useMemo(
    () => (userId ? getConnectorFriends(userId, friends) : []),
    [userId, friends]
  );

  const totalFriendCount = userId ? (FRIENDS_BY_USER_ID.get(userId) || []).length : 0;

  if (!person) {
    return (
      <Screen>
        <ScreenHeader title="Profile" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="🤷"
          title="User not found"
          message="This profile is no longer available."
        />
      </Screen>
    );
  }

  const confirmRemove = () => {
    Alert.alert('Remove friend', `Remove ${person.name} from your friends?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFriend(userId) },
    ]);
  };

  const renderAction = () => {
    switch (relationship) {
      case 'friend':
        return <Button label="Friends ✓" variant="secondary" onPress={confirmRemove} fullWidth />;
      case 'outgoing':
        return (
          <Button
            label="Requested — tap to cancel"
            variant="secondary"
            onPress={() => cancelFriendRequest(userId)}
            fullWidth
          />
        );
      case 'incoming': {
        const request = incomingRequests.find((item) => item.userId === userId);
        return (
          <Button
            label="Accept request"
            onPress={() => request && acceptFriendRequest(request.id)}
            fullWidth
          />
        );
      }
      case 'self':
        return null;
      default:
        return <Button label="Add friend" onPress={() => sendFriendRequest(userId)} fullWidth />;
    }
  };

  return (
    <Screen>
      <ScreenHeader title={person.name} subtitle={person.city} onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.identityCard}>
          <Avatar name={person.name} size="xl" connectors={connectors} />
          <Text style={[typography.title, { color: colors.textPrimary, marginTop: spacing.md }]}>
            {person.name}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            📍 {person.city}
            {mutualCount > 0
              ? ` · ${mutualCount} mutual ${mutualCount === 1 ? 'friend' : 'friends'}`
              : ''}
          </Text>
          {connectors.length > 0 ? (
            <Text
              style={[
                typography.caption,
                { color: colors.textTertiary, marginTop: 4, textAlign: 'center' },
              ]}
            >
              Connected through {connectors.map((c) => c.name.split(' ')[0]).join(', ')}
            </Text>
          ) : null}
          <View style={[styles.identityActions, { width: '100%', marginTop: spacing.lg, gap: spacing.sm }]}>
            <View style={{ flex: 1 }}>{renderAction()}</View>
            <Button
              label="💬  Message"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => openDirectMessage(userId)}
            />
          </View>
        </Card>

        <View style={[styles.statRow, { gap: spacing.md, marginTop: spacing.lg }]}>
          <StatTile value={totalFriendCount} label="Friends" />
          <StatTile value={mutualCount} label="Mutual with you" emphasis={mutualCount > 0} />
          <StatTile value={person.interests?.length || 0} label="Interests" />
        </View>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>Interests</Text>
          {person.interests?.length > 0 ? (
            <View style={[styles.chipWrap, { marginTop: spacing.md }]}>
              {person.interests.map((interest) => (
                <Chip key={interest} label={interest} />
              ))}
            </View>
          ) : (
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              No interests listed.
            </Text>
          )}
        </Card>

        <Text
          style={[
            typography.heading,
            { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
          ]}
        >
          Their connections you can see · {theirFriends.length}
        </Text>

        {theirFriends.length > 0 ? (
          <Card padded={false} style={{ paddingVertical: spacing.xs }}>
            {theirFriends.map((friend, index) => (
              <View key={friend.id}>
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
                  name={friend.name}
                  subtitle={friend.city}
                  connectors={friend.connectors}
                  onPress={() => navigation.push('FriendProfile', { userId: friend.id })}
                  onMessage={() => openDirectMessage(friend.id)}
                />
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="🔒"
              title="Nothing to show"
              message={`You'll see ${person.name.split(' ')[0]}'s connections once you share more of the network.`}
            />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  identityCard: {
    alignItems: 'center',
  },
  identityActions: {
    flexDirection: 'row',
  },
  statRow: {
    flexDirection: 'row',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
