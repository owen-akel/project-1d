import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFriends } from '../context/FriendsContext';
import { getVisibleUsersByCity, toMockCityName } from '../src/social/visibility';
import { getConnectorFriends } from '../src/social/connections';
import useOpenChat from '../src/hooks/useOpenChat';
import { Screen, ScreenHeader, Card, EmptyState, PersonRow } from '../src/ui';

export default function CityUsersScreen() {
  const { colors, spacing } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { friends } = useFriends();
  const { openDirectMessage } = useOpenChat();
  const { cityName } = route.params || {};

  const cityUsers = useMemo(() => {
    if (!cityName) return [];
    return getVisibleUsersByCity(toMockCityName(cityName), friends).map((user) => ({
      ...user,
      isDirectFriend: friends.includes(user.id),
      connectors: getConnectorFriends(user.id, friends),
    }));
  }, [cityName, friends]);

  return (
    <Screen>
      <ScreenHeader
        title={cityName || 'City'}
        subtitle={`${cityUsers.length} ${cityUsers.length === 1 ? 'person' : 'people'} in your network`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {cityUsers.length > 0 ? (
          <Card padded={false} style={{ paddingVertical: spacing.xs }}>
            {cityUsers.map((user, index) => (
              <View key={user.id}>
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
                  name={user.name}
                  avatarUri={user.photoUrl}
                  subtitle={(user.interests || []).slice(0, 3).join(' · ')}
                  meta={user.isDirectFriend ? 'Friend' : undefined}
                  connectors={user.connectors}
                  onPress={() => navigation.navigate('FriendProfile', { userId: user.id })}
                  onMessage={() => openDirectMessage(user.id)}
                />
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="🗺️"
              title={`Nobody here yet`}
              message={`None of your connections are in ${cityName || 'this city'}. Add friends to widen your map.`}
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
});
