import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function NewChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample connections - in a real app, this would come from a backend
  const [connections] = useState([
    {
      id: 1,
      userId: 'user1',
      username: 'Alex',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 2,
      userId: 'user2',
      username: 'Sam',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 3,
      userId: 'user3',
      username: 'Jordan',
      avatar: '👤',
      isOnline: false,
    },
    {
      id: 4,
      userId: 'user4',
      username: 'Casey',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 5,
      userId: 'user5',
      username: 'Morgan',
      avatar: '👤',
      isOnline: false,
    },
    {
      id: 6,
      userId: 'user6',
      username: 'Taylor',
      avatar: '👤',
      isOnline: false,
    },
    {
      id: 7,
      userId: 'user7',
      username: 'Riley',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 8,
      userId: 'user8',
      username: 'Avery',
      avatar: '👤',
      isOnline: false,
    },
  ]);

  const filteredConnections = connections.filter((connection) =>
    connection.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConnection = (connection) => {
    // In a real app, this would navigate to the chat with this connection
    console.log('Start chat with:', connection.username);
    // For now, just go back to the chat screen
    // In the future, you could navigate to a specific chat screen
    navigation.goBack();
  };

  const renderConnection = ({ item }) => (
    <TouchableOpacity
      style={[styles.connectionItem, { backgroundColor: colors.background }]}
      activeOpacity={0.7}
      onPress={() => handleSelectConnection(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        {item.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: '#10b981' }]} />}
      </View>
      <View style={styles.connectionContent}>
        <Text style={[styles.connectionUsername, { color: colors.textPrimary }]}>
          {item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>New Chat</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Search connections..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Connections List */}
      <FlatList
        data={filteredConnections}
        renderItem={renderConnection}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No connections found
            </Text>
          </View>
        }
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listContent: {
    paddingTop: 4,
  },
  connectionItem: {
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
  connectionContent: {
    flex: 1,
  },
  connectionUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});
