import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { USERS_BY_ID, ALL_USERS } from '../src/mock/users';
import { CURRENT_USER_ID } from '../src/social/visibility';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

/**
 * Direct conversation ids are derived from the other participant so that
 * "message this person" is idempotent — you always land in the same thread
 * without having to search for it first.
 */
export const directConversationId = (userId) => `direct:${userId}`;

/** Inverse of `directConversationId`; null for group ids. */
export const parseDirectConversationId = (conversationId) =>
  typeof conversationId === 'string' && conversationId.startsWith('direct:')
    ? conversationId.slice('direct:'.length)
    : null;

const SEED_MESSAGES = [
  'Hey! How are you doing?',
  'Meet me at the park?',
  'Thanks for the recommendation!',
  'See you there!',
  'That sounds great!',
  "Can't wait!",
  'What time works for you?',
  'Sounds like a plan!',
  "Let me know when you're free",
  'Looking forward to it!',
  'Thanks for organizing this!',
  'Count me in!',
];

const MINUTE = 60 * 1000;

/** A few existing DM threads so the Chat tab isn't empty on first run. */
function buildSeedConversations() {
  const mainUsers = ALL_USERS.filter((user) => user.id.startsWith('main-user-'));

  return mainUsers.map((user, index) => {
    const seedIndex = Number(user.id.split('-').pop());
    const createdAt = Date.now() - (index + 1) * 37 * MINUTE;

    return {
      id: directConversationId(user.id),
      type: 'direct',
      title: null,
      participantIds: [user.id],
      createdAt,
      unread: seedIndex % 4,
      messages: [
        {
          id: `${user.id}-seed-1`,
          senderId: user.id,
          text: SEED_MESSAGES[index % SEED_MESSAGES.length],
          createdAt,
        },
      ],
    };
  });
}

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(buildSeedConversations);

  const getConversation = useCallback(
    (conversationId) => conversations.find((item) => item.id === conversationId) || null,
    [conversations]
  );

  /**
   * Returns the id of the DM with `userId`, creating the thread if it's new.
   * Safe to call during a press handler and navigate with the result straight
   * away — the id doesn't depend on the state update landing first.
   */
  /**
   * `context` describes what prompted the chat, e.g.
   * `{ kind: 'event', label: 'going to', eventTitle: 'Hamilton' }`.
   * Starting a DM from an event carries one; starting it from a profile doesn't.
   * The newest context wins so the banner reflects why you're here right now.
   */
  const openDirectConversation = useCallback((userId, context = null) => {
    const id = directConversationId(userId);

    setConversations((prev) => {
      const existing = prev.find((item) => item.id === id);

      if (existing) {
        if (!context) return prev;
        return prev.map((item) => (item.id === id ? { ...item, context } : item));
      }

      return [
        {
          id,
          type: 'direct',
          title: null,
          participantIds: [userId],
          createdAt: Date.now(),
          unread: 0,
          messages: [],
          context,
        },
        ...prev,
      ];
    });

    return id;
  }, []);

  const createGroupConversation = useCallback((title, participantIds) => {
    const id = `group:${Date.now()}`;
    const cleanParticipants = Array.from(
      new Set((participantIds || []).filter((userId) => userId && userId !== CURRENT_USER_ID))
    );

    setConversations((prev) => [
      {
        id,
        type: 'group',
        title: (title || '').trim() || defaultGroupTitle(cleanParticipants),
        participantIds: cleanParticipants,
        createdAt: Date.now(),
        unread: 0,
        messages: [],
      },
      ...prev,
    ]);

    return id;
  }, []);

  const sendMessage = useCallback((conversationId, text) => {
    const body = (text || '').trim();
    if (!body) return;

    const message = {
      id: `${conversationId}-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      text: body,
      createdAt: Date.now(),
    };

    setConversations((prev) => {
      const exists = prev.some((conversation) => conversation.id === conversationId);

      // First message in a DM that was opened but never committed — create it
      // here rather than dropping the text on the floor.
      if (!exists) {
        const userId = parseDirectConversationId(conversationId);
        if (!userId) return prev;
        return [
          {
            id: conversationId,
            type: 'direct',
            title: null,
            participantIds: [userId],
            createdAt: message.createdAt,
            unread: 0,
            messages: [message],
          },
          ...prev,
        ];
      }

      return prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation
      );
    });
  }, []);

  const markRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId && conversation.unread
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId));
  }, []);

  /** Conversations newest-activity-first, with display fields resolved. */
  const orderedConversations = useMemo(() => {
    return [...conversations]
      .map((conversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1] || null;
        return {
          ...conversation,
          lastMessage,
          lastActivityAt: lastMessage?.createdAt || conversation.createdAt,
          title: conversation.title || conversationTitle(conversation),
        };
      })
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }, [conversations]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unread || 0), 0),
    [conversations]
  );

  const value = useMemo(
    () => ({
      conversations: orderedConversations,
      totalUnread,
      getConversation,
      openDirectConversation,
      createGroupConversation,
      sendMessage,
      markRead,
      leaveConversation,
    }),
    [
      orderedConversations,
      totalUnread,
      getConversation,
      openDirectConversation,
      createGroupConversation,
      sendMessage,
      markRead,
      leaveConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const nameFor = (userId) => USERS_BY_ID.get(userId)?.name || 'Unknown';

function defaultGroupTitle(participantIds) {
  if (participantIds.length === 0) return 'New group';

  // Prefer first names, but fall back to the full name for anyone whose first
  // name collides — otherwise a group reads "Clay, Greg, Clay".
  const fullNames = participantIds.map(nameFor);
  const firstNameCounts = fullNames.reduce((counts, name) => {
    const first = name.split(' ')[0];
    counts.set(first, (counts.get(first) || 0) + 1);
    return counts;
  }, new Map());

  const labels = fullNames.map((name) => {
    const first = name.split(' ')[0];
    return firstNameCounts.get(first) > 1 ? name : first;
  });

  if (labels.length <= 3) return labels.join(', ');
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
}

export function conversationTitle(conversation) {
  if (!conversation) return '';
  if (conversation.title) return conversation.title;
  if (conversation.type === 'direct') return nameFor(conversation.participantIds[0]);
  return defaultGroupTitle(conversation.participantIds);
}
