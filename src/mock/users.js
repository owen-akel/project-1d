// Mock user database with 156 users: 12 main users + 144 friends

const INTERESTS_BY_CATEGORY = {
  'Sports & Fitness': [
    'Running', 'Lifting', 'Soccer', 'Basketball', 'Tennis', 'Pickleball', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Swimming', 'Cycling', 'Yoga', 'Pilates',
    'CrossFit', 'Martial Arts', 'Boxing', 'Rock Climbing', 'Hiking', 'Surfing',
    'Snowboarding', 'Skiing', 'Ice Skating', 'Skateboarding', 'Mountain Biking',
    'Rowing', 'Cricket', 'Rugby', 'Badminton', 'Table Tennis', 'Archery',
  ],
  'Music & Arts': [
    'Live Music', 'Concerts', 'Playing Guitar', 'Playing Piano', 'DJing', 
    'Singing', 'Songwriting', 'Photography', 'Art', 'Painting', 'Drawing',
    'Sculpting', 'Digital Art', 'Pottery', 'Calligraphy', 'Dance', 'Ballet',
    'Theater', 'Acting', 'Stand-up Comedy', 'Writing', 'Poetry',
  ],
  'Social & Entertainment': [
    'Drinking', 'Wine Tasting', 'Cocktail Making', 'Breweries', 'Nightlife',
    'Parties', 'Festivals', 'Food & Dining', 'Cooking', 'Baking', 'Foodie',
    'Travel', 'Adventure Travel', 'Backpacking', 'Camping', 'Beach',
  ],
  'Intellectual & Creative': [
    'Reading', 'Book Clubs', 'Podcasts', 'Learning Languages', 'Chess',
    'Board Games', 'Video Games', 'Gaming', 'Puzzles', 'Crossword Puzzles',
    'Trivia', 'Debate', 'Philosophy', 'History', 'Astronomy', 'Science',
  ],
  'Outdoor & Nature': [
    'Gardening', 'Bird Watching', 'Fishing', 'Hunting', 'Boating', 'Sailing',
    'Kayaking', 'Paddleboarding', 'Snorkeling', 'Scuba Diving', 'Wildlife',
    'Nature Photography', 'Stargazing', 'Outdoor Adventure',
  ],
  'Social Activities': [
    'Networking', 'Meetups', 'Volunteering', 'Community Service', 'Mentoring',
    'Ball Games', 'Team Sports', 'Social Sports',
  ],
  'Other Hobbies': [
    'Collecting', 'Antiques', 'Fashion', 'Styling', 'Fitness Modeling',
    'Meditation', 'Mindfulness', 'Wellness', 'Self-Care', 'Spa',
    'Shopping', 'Thrifting', 'Flea Markets', 'Markets', 'Crafting',
    'Sewing', 'Knitting', 'Crocheting', 'Woodworking', 'DIY Projects',
    'Home Improvement', 'Interior Design', 'Real Estate', 'Investing',
    'Cryptocurrency', 'Trading', 'Stocks', 'Entrepreneurship', 'Startups',
    'Tech', 'Programming', 'Coding', 'Design', 'Fashion Design',
    'Film', 'Movies', 'Cinema', 'Documentaries', 'TV Shows', 'Binge Watching',
    'Streaming', 'Anime', 'Manga', 'Comics', 'Graphic Novels',
    'Cars', 'Motorcycles', 'Racing', 'Car Shows', 'Auto Mechanics',
    'Dogs', 'Cats', 'Pets', 'Animal Rescue', 'Horseback Riding',
    'Motorcycling', 'ATV', 'Dirt Biking', 'Flying', 'Aviation',
    'Magic', 'Card Tricks', 'Juggling', 'Circus Arts',
  ],
};

// Flatten all interests
const ALL_INTERESTS = Object.values(INTERESTS_BY_CATEGORY).flat();

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

