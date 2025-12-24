import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getUsersByCity } from '../src/mock/users';
import { useFriends } from '../context/FriendsContext';

// Helper to check if a user can be viewed
function canViewUser(targetUserId, currentUserFriends) {
  // Main users are only visible if they're in the friends list
  if (targetUserId.startsWith('main-user-')) {
    return currentUserFriends.includes(targetUserId);
  }
  
  // Extract parent main user from friend ID (e.g., "rod-friend-5" -> "rod")
  const parts = targetUserId.split('-');
  if (parts.length >= 2 && parts[1] === 'friend') {
    const firstName = parts[0];
    const mainUserIndex = [
      'rod', 'sam', 'clay', 'harry', 'john', 'pete',
      'liam', 'warren', 'jackson', 'eric', 'simon', 'greg'
    ].indexOf(firstName);
    
    if (mainUserIndex !== -1) {
      const parentMainUserId = `main-user-${mainUserIndex + 1}`;
      // Only visible if parent main user is in friends list
      return currentUserFriends.includes(parentMainUserId);
    }
  }
  
  // Default: not visible
  return false;
}

export default function CityUsersScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { friends } = useFriends();
  const { cityName } = route.params || {};

  // Map city names from majorUSCities to mock data city names
  const mapCityNameToMockCity = (cityName) => {
    const cityMap = {
      'New York': 'NYC',
      'Los Angeles': 'LA',
      'Chicago': 'Chicago',
      'San Francisco': 'SF',
      'Boston': 'Boston',
      'Austin': 'Austin',
    };
    return cityMap[cityName] || cityName;
  };

  const cityUsers = useMemo(() => {
    if (!cityName) {
      return [];
    }
    const mockCityName = mapCityNameToMockCity(cityName);
    const allUsersInCity = getUsersByCity(mockCityName);
    // Filter to only show visible users (friends + their friends)
    return allUsersInCity.filter(user => canViewUser(user.id, friends));
  }, [cityName, friends]);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          People in {cityName}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.contentContainer}
      >
        {cityUsers.length > 0 ? (
          cityUsers.map((user) => (
            <View
              key={user.id}
              style={[
                styles.userItem,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
                <Text style={[styles.userCity, { color: colors.textSecondary }]}>{user.city}</Text>
                {user.interests && user.interests.length > 0 && (
                  <View style={styles.interestsContainer}>
                    {user.interests.slice(0, 5).map((interest, idx) => (
                      <View
                        key={`${user.id}-interest-${idx}`}
                        style={[
                          styles.interestTag,
                          {
                            backgroundColor: colors.primary + '20',
                            borderColor: colors.primary + '40',
                          },
                        ]}
                      >
                        <Text style={[styles.interestTagText, { color: colors.primary }]}>
                          {interest}
                        </Text>
                      </View>
                    ))}
                    {user.interests.length > 5 && (
                      <Text style={[styles.moreInterests, { color: colors.textTertiary }]}>
                        +{user.interests.length - 5} more
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyState, { color: colors.textSecondary }]}>
            No people found in this city
          </Text>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  userCity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: 12,
    alignSelf: 'center',
    marginLeft: 4,
  },
  emptyState: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748b',
    marginTop: 40,
  },
});

