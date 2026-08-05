import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { USERS_BY_ID } from '../src/mock/users';
import { FRIENDS_BY_USER_ID } from '../src/mock/graph';
import { CURRENT_USER_ID } from '../src/social/visibility';

const FriendsContext = createContext();

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

// Default friends: the 12 main users.
const DEFAULT_FRIENDS = Array.from({ length: 12 }, (_, index) => `main-user-${index + 1}`);

/**
 * Seed a handful of pending incoming requests so the feature has something to
 * show on first run. They're drawn from friends-of-friends, which is who would
 * realistically be knocking.
 */
function buildSeedIncomingRequests(friendIds) {
  const directSet = new Set(friendIds);
  const candidates = [];

  friendIds.forEach((friendId) => {
    (FRIENDS_BY_USER_ID.get(friendId) || []).forEach((candidateId) => {
      if (directSet.has(candidateId) || candidateId === CURRENT_USER_ID) return;
      if (candidates.some((item) => item.userId === candidateId)) return;
      if (!USERS_BY_ID.has(candidateId)) return;
      candidates.push({ userId: candidateId, viaId: friendId });
    });
  });

  const messages = [
    'We met at the show last weekend!',
    null,
    'Saw we have a few friends in common.',
    null,
    'Hey — Rod said I should add you.',
  ];

  return candidates.slice(0, 5).map((candidate, index) => ({
    id: `seed-request-${index + 1}`,
    userId: candidate.userId,
    viaId: candidate.viaId,
    message: messages[index % messages.length],
    // Staggered so the list has a believable ordering, newest first.
    createdAt: Date.now() - (index + 1) * 1000 * 60 * 60 * 7,
  }));
}

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);
  const [incomingRequests, setIncomingRequests] = useState(() =>
    buildSeedIncomingRequests(DEFAULT_FRIENDS)
  );
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const isFriend = useCallback((userId) => friends.includes(userId), [friends]);

  const addFriend = useCallback((userId) => {
    if (!userId || userId === CURRENT_USER_ID) return;
    setFriends((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
  }, []);

  const removeFriend = useCallback((userId) => {
    setFriends((prev) => prev.filter((id) => id !== userId));
  }, []);

  /** Ask to connect. No-op if they're already a friend or a request is in flight. */
  const sendFriendRequest = useCallback(
    (userId, message = null) => {
      if (!userId || userId === CURRENT_USER_ID) return;
      if (friends.includes(userId)) return;

      // If they already asked us, sending back is the same as accepting.
      const incoming = incomingRequests.find((request) => request.userId === userId);
      if (incoming) {
        setIncomingRequests((prev) => prev.filter((request) => request.id !== incoming.id));
        addFriend(userId);
        return;
      }

      setOutgoingRequests((prev) => {
        if (prev.some((request) => request.userId === userId)) return prev;
        return [
          { id: `outgoing-${userId}-${Date.now()}`, userId, message, createdAt: Date.now() },
          ...prev,
        ];
      });
    },
    [friends, incomingRequests, addFriend]
  );

  const cancelFriendRequest = useCallback((userId) => {
    setOutgoingRequests((prev) => prev.filter((request) => request.userId !== userId));
  }, []);

  const acceptFriendRequest = useCallback(
    (requestId) => {
      const request = incomingRequests.find((item) => item.id === requestId);
      if (!request) return;
      setIncomingRequests((prev) => prev.filter((item) => item.id !== requestId));
      addFriend(request.userId);
    },
    [incomingRequests, addFriend]
  );

  const declineFriendRequest = useCallback((requestId) => {
    setIncomingRequests((prev) => prev.filter((item) => item.id !== requestId));
  }, []);

  /** 'self' | 'friend' | 'incoming' | 'outgoing' | 'none' */
  const getRelationship = useCallback(
    (userId) => {
      if (!userId || userId === CURRENT_USER_ID) return 'self';
      if (friends.includes(userId)) return 'friend';
      if (incomingRequests.some((request) => request.userId === userId)) return 'incoming';
      if (outgoingRequests.some((request) => request.userId === userId)) return 'outgoing';
      return 'none';
    },
    [friends, incomingRequests, outgoingRequests]
  );

  const value = useMemo(
    () => ({
      friends,
      incomingRequests,
      outgoingRequests,
      pendingRequestCount: incomingRequests.length,
      addFriend,
      removeFriend,
      isFriend,
      sendFriendRequest,
      cancelFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      getRelationship,
      currentUserId: CURRENT_USER_ID,
    }),
    [
      friends,
      incomingRequests,
      outgoingRequests,
      addFriend,
      removeFriend,
      isFriend,
      sendFriendRequest,
      cancelFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      getRelationship,
    ]
  );

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};
