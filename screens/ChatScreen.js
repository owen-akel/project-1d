import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { USERS_BY_ID } from '../src/mock/users';
import { CURRENT_USER_ID } from '../src/social/visibility';
import { Screen, ScreenHeader, Button, Avatar, EmptyState } from '../src/ui';

const formatAge = (timestamp) => {
  if (!timestamp) return '';
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.round(days / 7)}w`;
};

export default function ChatScreen() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation();
  const { conversations } = useChat();

  const renderConversation = ({ item }) => {
    const isGroup = item.type === 'group';
    const other = isGroup ? null : USERS_BY_ID.get(item.participantIds[0]);
    const preview = item.lastMessage
      ? `${item.lastMessage.senderId === CURRENT_USER_ID ? 'You: ' : ''}${item.lastMessage.text}`
      : 'No messages yet';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}
      >
        {isGroup ? (
          <View style={[styles.groupAvatar, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[styles.groupIcon, { color: colors.primary }]}>
              {item.participantIds.length + 1}
            </Text>
          </View>
        ) : (
          <Avatar name={other?.name} size="md" tone="muted" />
        )}

        <View style={[styles.conversationContent, { marginLeft: spacing.md }]}>
          <View style={styles.conversationHeader}>
            <Text
              style={[typography.body, { color: colors.textPrimary, fontWeight: '600', flex: 1 }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 12 }]}>
              {formatAge(item.lastActivityAt)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                typography.caption,
                styles.preview,
                {
                  color: item.unread > 0 ? colors.textPrimary : colors.textSecondary,
                  fontWeight: item.unread > 0 ? '600' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {preview}
            </Text>
            {item.unread > 0 ? (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.unreadText, { color: colors.onPrimary }]}>{item.unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title="Messages"
        subtitle={`${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}`}
        right={
          <Button
            label="+ New"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate('NewChat')}
          />
        }
      />

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: colors.background }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title="No conversations"
            message="Start a direct message or spin up a group with your connections."
            actionLabel="New chat"
            onAction={() => navigation.navigate('NewChat')}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 74,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIcon: {
    fontSize: 15,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
