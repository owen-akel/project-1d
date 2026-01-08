import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ALL_USERS } from '../src/mock/users';

export default function ChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // Sample messages for each main character (deterministic)
  const sampleMessages = [
    'Hey! How are you doing?',
    'Meet me at the park?',
    'Thanks for the recommendation!',
    'See you there!',
    'That sounds great!',
    'Can\'t wait!',
    'What time works for you?',
    'Sounds like a plan!',
    'Let me know when you\'re free',
    'Looking forward to it!',
    'Thanks for organizing this!',
    'Count me in!',
  ];

  const sampleTimestamps = [
    '2m', '15m', '1h', '2h', '3h', '5h', '1d', '2d', '3d', '1w', '2w', '3w',
  ];

  // Generate conversations from the 12 main characters
  const conversations = useMemo(() => {
    const mainUsers = ALL_USERS.filter(user => user.id.startsWith('main-user-'));
    
    return mainUsers.map((user, index) => {
      // Generate avatar initials from name
      const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      
      // Deterministic online status based on user ID
      const isOnline = (parseInt(user.id.split('-').pop()) % 3) !== 0;
      
      // Deterministic unread count (0-3)
      const unread = parseInt(user.id.split('-').pop()) % 4;
      
      // Deterministic message and timestamp based on index
      const lastMessage = sampleMessages[index % sampleMessages.length];
      const timestamp = sampleTimestamps[index % sampleTimestamps.length];
      
      return {
        id: user.id,
        username: user.name,
        avatar: initials,
        lastMessage: lastMessage,
        timestamp: timestamp,
        unread: unread,
        isOnline: isOnline,
      };
    });
  }, []);

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.background }]}
      activeOpacity={0.7}
      onPress={() => {
        console.log('Open chat with:', item.username);
      }}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        {item.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: '#10b981' }]} />}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationUsername, { color: colors.textPrimary }]}>
            {item.username}
          </Text>
          <Text style={[styles.conversationTimestamp, { color: colors.textTertiary }]}>
            {item.timestamp}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.conversationMessage,
              { color: item.unread > 0 ? colors.textPrimary : colors.textSecondary },
              item.unread > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageIcon}
          onPress={() => navigation.navigate('NewChat')}
        >
          <Text style={[styles.newMessageIconText, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List - Instagram/iOS style */}
      <FlatList
        ref={flatListRef}
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  newMessageIcon: {
    padding: 4,
  },
  newMessageIconText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
  listContent: {
    paddingTop: 4,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  conversationTimestamp: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '400',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    flex: 1,
    fontSize: 15,
    color: '#666666',
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#000000',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
