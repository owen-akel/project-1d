import React, { createContext, useState, useContext } from 'react';

const FriendsContext = createContext();

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

export const FriendsProvider = ({ children }) => {
  // Current user ID (fixed mock)
  const CURRENT_USER_ID = 'current-user-1';
    // Default friends: the 12 main users
  const DEFAULT_FRIENDS = [
    'main-user-1',  // Rod Oskouian
    'main-user-2',  // Sam Haskel
    'main-user-3',  // Clay Socas
    'main-user-4',  // Harry Dahl
    'main-user-5',  // John Jerro
    'main-user-6',  // Pete McKenna
    'main-user-7',  // Liam Tassiello
    'main-user-8',  // Warren Klein
    'main-user-9',  // Jackson George
    'main-user-10', // Eric Deekan
    'main-user-11', // Simon Sloane
    'main-user-12', // Greg Kosmowski
  ];
  
  // Friends list (array of user IDs) - initialized with default friends
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);
  
  const addFriend = (userId) => {
    if (userId === CURRENT_USER_ID) return; // Can't add self
    setFriends(prev => {
      if (prev.includes(userId)) return prev; // Already a friend
      return [...prev, userId];
    });
  };
  
  const removeFriend = (userId) => {
    setFriends(prev => prev.filter(id => id !== userId));
  };
  
  const isFriend = (userId) => {
    return friends.includes(userId);
  };
  
  return (
    <FriendsContext.Provider
      value={{
        friends,
        addFriend,
        removeFriend,
        isFriend,
        currentUserId: CURRENT_USER_ID,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

