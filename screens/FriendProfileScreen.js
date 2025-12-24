import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { USERS_BY_ID } from '../src/mock/users';
import { FRIENDS_BY_USER_ID } from '../src/mock/graph';
import { useFriends } from '../context/FriendsContext';

// Helper to check if a user can be viewed
// Main users are only visible if they're in the friends list
// Friend users (e.g., "rod-friend-5") are only visible if their parent main user is in friends list
function canViewUser(targetUserId, currentUserFriends) {
  // Main users are only visible if they're in the friends list
  if (targetUserId.startsWith('main-user-')) {
    return currentUserFriends.includes(targetUserId);
  }
  
  // Extract parent main user from friend ID (e.g., "rod-friend-5" -> "rod")
  // Friend IDs follow pattern: "{firstName}-friend-{number}"
  const parts = targetUserId.split('-');
  if (parts.length >= 2 && parts[1] === 'friend') {
    const firstName = parts[0];
    // Find the main user with this first name
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

export default function FriendProfileScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { friends } = useFriends();
  const { userId } = route.params || {};
  
  if (!userId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>User not found</Text>
      </View>
    );
  }
  
  const user = USERS_BY_ID.get(userId);
  
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>User not found</Text>
      </View>
    );
  }
  
  const userFriends = FRIENDS_BY_USER_ID.get(userId) || [];
  const visibleFriends = userFriends.filter(friendId => canViewUser(friendId, friends));
  
  const handleFriendPress = (friendId) => {
    navigation.push('FriendProfile', { userId: friendId });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header with back button */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={[styles.photoContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.photoPlaceholder}>
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={styles.nameSection}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user.name}</Text>
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>📍 City</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.city}</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.interestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Interests</Text>
          </View>
          {user.interests && user.interests.length > 0 ? (
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, index) => (
                <View
                  key={index}
                  style={[
                    styles.interestTag,
                    { backgroundColor: 'rgba(20, 184, 166, 0.15)' },
                  ]}
                >
                  <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noInterestsText, { color: colors.textSecondary }]}>
              No interests listed
            </Text>
          )}
        </View>

        {/* Their Friends */}
        <View style={styles.interestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Their Friends</Text>
          </View>
          {visibleFriends.length > 0 ? (
            <View style={styles.friendsContainer}>
              {visibleFriends.map((friendId) => {
                const friend = USERS_BY_ID.get(friendId);
                if (!friend) return null;
                return (
                  <TouchableOpacity
                    key={friendId}
                    style={[
                      styles.friendItem,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleFriendPress(friendId)}
                  >
                    <View style={[styles.friendAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.friendAvatarText}>
                        {friend.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: colors.textPrimary }]}>
                        {friend.name}
                      </Text>
                      <Text style={[styles.friendCity, { color: colors.textSecondary }]}>
                        {friend.city}
                      </Text>
                    </View>
                    <Text style={[styles.arrowText, { color: colors.textTertiary }]}>→</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.noInterestsText, { color: colors.textSecondary }]}>
              {userFriends.length > 0 
                ? 'You don\'t have access to view their friends. Add them as a friend to see their connections!'
                : 'No friends listed'}
            </Text>
          )}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  photoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  interestsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
  },
  noInterestsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    color: '#64748b',
  },
  friendsContainer: {
    gap: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  friendCity: {
    fontSize: 14,
    color: '#64748b',
  },
  arrowText: {
    fontSize: 20,
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

