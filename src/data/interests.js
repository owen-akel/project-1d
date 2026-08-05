// Interest taxonomy shared by the profile editor and the mock user generator.
// Previously duplicated verbatim in ProfileScreen.js and src/mock/users.js.

export const INTERESTS_BY_CATEGORY = {
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

export const CATEGORY_ICONS = {
  'Sports & Fitness': '⚽',
  'Music & Arts': '🎨',
  'Social & Entertainment': '🍻',
  'Intellectual & Creative': '📚',
  'Outdoor & Nature': '🌲',
  'Social Activities': '🤝',
  'Other Hobbies': '🎯',
};

export const ALL_INTERESTS = Object.values(INTERESTS_BY_CATEGORY).flat();
