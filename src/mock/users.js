// Mock user database with 156 users: 12 main users + 144 friends

import { ALL_INTERESTS } from '../data/interests';

// Fixed list of cities
const CITIES = ['Boston', 'NYC', 'Chicago', 'LA', 'SF', 'Austin'];

// Helper to get random interests (3-6 per user)
function getRandomInterests(count = null) {
  const numInterests = count || Math.floor(Math.random() * 4) + 3; // 3-6 interests
  const shuffled = [...ALL_INTERESTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numInterests);
}

// Helper to get city for user index (distribute evenly)
function getCityForUserIndex(index) {
  return CITIES[index % CITIES.length];
}

// Main users
const MAIN_USER_NAMES = [
  'Rod Oskouian',
  'Sam Haskel',
  'Clay Socas',
  'Harry Dahl',
  'John Jerro',
  'Pete McKenna',
  'Liam Tassiello',
  'Warren Klein',
  'Jackson George',
  'Eric Deekan',
  'Simon Sloane',
  'Greg Kosmowski',
];

// Generate main users
const mainUsers = MAIN_USER_NAMES.map((name, index) => {
  const firstName = name.split(' ')[0].toLowerCase();
  return {
    id: `main-user-${index + 1}`,
    name,
    city: getCityForUserIndex(index),
    interests: getRandomInterests(),
  };
});

// Generate friend users (12 per main user)
const friendUsers = [];
mainUsers.forEach((mainUser, mainIndex) => {
  const firstName = mainUser.name.split(' ')[0].toLowerCase();
  for (let i = 1; i <= 12; i++) {
    const friendIndex = mainIndex * 12 + i - 1;
    friendUsers.push({
      id: `${firstName}-friend-${i}`,
      name: `${mainUser.name.split(' ')[0]} Friend ${i}`,
      city: getCityForUserIndex(friendIndex + 12), // Offset to distribute cities
      interests: getRandomInterests(),
    });
  }
});

// Combine all users
const ALL_USERS = [...mainUsers, ...friendUsers];

// Create USERS_BY_ID map
const USERS_BY_ID = new Map();
ALL_USERS.forEach(user => {
  USERS_BY_ID.set(user.id, user);
});

// Helper function to get users by city
function getUsersByCity(city) {
  return ALL_USERS.filter(user => user.city === city);
}

export { USERS_BY_ID, ALL_USERS, CITIES, getUsersByCity };

