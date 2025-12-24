// Friend relationship graph
// Maps each user ID to an array of their friend user IDs

import { ALL_USERS } from './users';

// Initialize FRIENDS_BY_USER_ID map
const FRIENDS_BY_USER_ID = new Map();

// Initialize all users with empty friend arrays
ALL_USERS.forEach(user => {
  FRIENDS_BY_USER_ID.set(user.id, []);
});

// Link main users to their 12 friends (bidirectional)
const mainUserIds = ALL_USERS
  .filter(user => user.id.startsWith('main-user-'))
  .map(user => user.id);

mainUserIds.forEach((mainUserId, mainIndex) => {
  const firstName = ALL_USERS.find(u => u.id === mainUserId).name.split(' ')[0].toLowerCase();
  const friendIds = [];
  
  // Get all 12 friends for this main user
  for (let i = 1; i <= 12; i++) {
    const friendId = `${firstName}-friend-${i}`;
    friendIds.push(friendId);
  }
  
  // Add friends to main user's friend list
  FRIENDS_BY_USER_ID.set(mainUserId, friendIds);
  
  // Add main user to each friend's friend list (bidirectional)
  friendIds.forEach(friendId => {
    const currentFriends = FRIENDS_BY_USER_ID.get(friendId) || [];
    FRIENDS_BY_USER_ID.set(friendId, [...currentFriends, mainUserId]);
  });
});

// Optionally: Add 0-3 friends for each friend user (deterministic)
// This creates some depth in the graph
ALL_USERS.forEach(user => {
  // Skip main users (they already have their 12 friends)
  if (user.id.startsWith('main-user-')) return;
  
  // Skip if already has friends (from main user relationship)
  const currentFriends = FRIENDS_BY_USER_ID.get(user.id) || [];
  if (currentFriends.length > 0) {
    // Add 0-3 additional friends deterministically based on user ID
    const hash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const numAdditionalFriends = hash % 4; // 0-3 friends
    
    if (numAdditionalFriends > 0) {
      // Find other friend users (not main users, not self, not already friends)
      const potentialFriends = ALL_USERS.filter(
        u => !u.id.startsWith('main-user-') && 
             u.id !== user.id && 
             !currentFriends.includes(u.id)
      );
      
      // Select friends deterministically based on hash
      const selectedFriends = [];
      for (let i = 0; i < numAdditionalFriends && i < potentialFriends.length; i++) {
        const friendIndex = (hash + i * 7) % potentialFriends.length;
        const selectedFriend = potentialFriends[friendIndex];
        if (!selectedFriends.includes(selectedFriend.id)) {
          selectedFriends.push(selectedFriend.id);
        }
      }
      
      // Add bidirectional friendships
      selectedFriends.forEach(friendId => {
        const updatedFriends = [...currentFriends, friendId];
        FRIENDS_BY_USER_ID.set(user.id, updatedFriends);
        
        // Add this user to the friend's friend list
        const friendCurrentFriends = FRIENDS_BY_USER_ID.get(friendId) || [];
        if (!friendCurrentFriends.includes(user.id)) {
          FRIENDS_BY_USER_ID.set(friendId, [...friendCurrentFriends, user.id]);
        }
      });
    }
  }
});

export { FRIENDS_BY_USER_ID };

