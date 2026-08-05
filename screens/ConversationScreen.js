import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useChat, parseDirectConversationId } from '../context/ChatContext';
import { USERS_BY_ID } from '../src/mock/users';
import { CURRENT_USER_ID } from '../src/social/visibility';
import { Screen, ScreenHeader, Avatar, EmptyState } from '../src/ui';

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function ConversationScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { getConversation, sendMessage, markRead } = useChat();

  const { conversationId } = route.params || {};
  const stored = getConversation(conversationId);

  // A brand-new DM may arrive here in the same commit that creates it. The id
  // already encodes the participant, so render the empty thread either way
  // rather than flashing "not found".
  const pendingDirectUserId = stored ? null : parseDirectConversationId(conversationId);
  const conversation = useMemo(() => {
    if (stored) return stored;
    if (!pendingDirectUserId || !USERS_BY_ID.has(pendingDirectUserId)) return null;
    return {
      id: conversationId,
      type: 'direct',
      title: null,
      participantIds: [pendingDirectUserId],
      messages: [],
      unread: 0,
    };
  }, [stored, pendingDirectUserId, conversationId]);

  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (conversationId) markRead(conversationId);
  }, [conversationId, markRead]);

  const participants = useMemo(
    () => (conversation?.participantIds || []).map((id) => USERS_BY_ID.get(id)).filter(Boolean),
    [conversation]
  );

  const subtitle = useMemo(() => {
    if (!conversation) return '';
    if (conversation.type === 'direct') return participants[0]?.city || '';
    return `${participants.length + 1} people`;
  }, [conversation, participants]);

  const title = useMemo(() => {
    if (!conversation) return 'Chat';
    if (conversation.type === 'direct') return participants[0]?.name || 'Chat';
    return conversation.title;
  }, [conversation, participants]);

  if (!conversation) {
    return (
      <Screen>
        <ScreenHeader title="Chat" onBack={() => navigation.goBack()} />
        <EmptyState icon="💬" title="Conversation not found" message="This thread is no longer available." />
      </Screen>
    );
  }

  const handleSend = () => {
    const body = draft.trim();
    if (!body) return;
    sendMessage(conversation.id, body);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const renderMessage = ({ item, index }) => {
    const mine = item.senderId === CURRENT_USER_ID;
    const sender = mine ? null : USERS_BY_ID.get(item.senderId);
    const previous = conversation.messages[index - 1];
    const showSender =
      !mine && conversation.type === 'group' && previous?.senderId !== item.senderId;

    return (
      <View style={[styles.messageRow, mine ? styles.mineRow : styles.theirsRow]}>
        {!mine && conversation.type === 'group' ? (
          <View style={styles.messageAvatar}>
            {showSender ? <Avatar name={sender?.name} size="xs" tone="muted" /> : null}
          </View>
        ) : null}

        <View style={styles.messageColumn}>
          {showSender ? (
            <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: 3 }]}>
              {sender?.name?.split(' ')[0]}
            </Text>
          ) : null}
          <View
            style={[
              styles.bubble,
              {
                borderRadius: radius.lg,
                paddingHorizontal: spacing.md + 2,
                paddingVertical: spacing.sm + 2,
                backgroundColor: mine ? colors.primary : colors.card,
                borderColor: mine ? colors.primary : colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                typography.body,
                { color: mine ? colors.onPrimary : colors.textPrimary, lineHeight: 20 },
              ]}
            >
              {item.text}
            </Text>
          </View>
          <Text
            style={[
              typography.caption,
              { color: colors.textTertiary, fontSize: 11, marginTop: 3, textAlign: mine ? 'right' : 'left' },
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        onBack={() => navigation.goBack()}
        right={
          conversation.type === 'direct' && participants[0] ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('FriendProfile', { userId: participants[0].id })}
              accessibilityRole="button"
              accessibilityLabel={`Open ${participants[0].name}'s profile`}
            >
              <Avatar name={participants[0].name} size="sm" tone="muted" />
            </TouchableOpacity>
          ) : null
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {conversation.messages.length === 0 ? (
          <View style={styles.flex}>
            <EmptyState
              icon="👋"
              title={`Say hi to ${conversation.type === 'direct' ? title.split(' ')[0] : title}`}
              message="No messages yet — start the conversation."
            />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={conversation.messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing.xl,
              gap: spacing.sm,
            },
          ]}
        >
          <TextInput
            style={[
              typography.body,
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
                borderRadius: radius.xl,
              },
            ]}
            placeholder="Message…"
            placeholderTextColor={colors.textTertiary}
            value={draft}
            onChangeText={setDraft}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!draft.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: draft.trim() ? colors.primary : colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={[styles.sendIcon, { color: draft.trim() ? colors.onPrimary : colors.textTertiary }]}>
              ↑
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '100%',
  },
  mineRow: {
    justifyContent: 'flex-end',
  },
  theirsRow: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    marginRight: 8,
    justifyContent: 'flex-end',
  },
  messageColumn: {
    maxWidth: '78%',
  },
  bubble: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: -2,
  },
});
