import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { ALL_USERS, USERS_BY_ID } from '../src/mock/users';
import { useFriends } from '../context/FriendsContext';
import { useUser } from '../context/UserContext';

// Major US cities list (same as MapScreen)
const MAJOR_US_CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', lat: 29.7604, lng: -95.3698 },
  { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
  { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
  { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
  { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
  { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
  { name: 'San Jose', lat: 37.3382, lng: -121.8863 },
  { name: 'Austin', lat: 30.2672, lng: -97.7431 },
  { name: 'Jacksonville', lat: 30.3322, lng: -81.6557 },
  { name: 'Fort Worth', lat: 32.7555, lng: -97.3308 },
  { name: 'Columbus', lat: 39.9612, lng: -82.9988 },
  { name: 'Charlotte', lat: 35.2271, lng: -80.8431 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Indianapolis', lat: 39.7684, lng: -86.1581 },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { name: 'Denver', lat: 39.7392, lng: -104.9903 },
  { name: 'Washington', lat: 38.9072, lng: -77.0369 },
  { name: 'Boston', lat: 42.3601, lng: -71.0589 },
  { name: 'El Paso', lat: 31.7619, lng: -106.4850 },
  { name: 'Nashville', lat: 36.1627, lng: -86.7816 },
  { name: 'Detroit', lat: 42.3314, lng: -83.0458 },
  { name: 'Oklahoma City', lat: 35.4676, lng: -97.5164 },
  { name: 'Portland', lat: 45.5152, lng: -122.6784 },
  { name: 'Las Vegas', lat: 36.1699, lng: -115.1398 },
  { name: 'Memphis', lat: 35.1495, lng: -90.0490 },
  { name: 'Louisville', lat: 38.2527, lng: -85.7585 },
  { name: 'Baltimore', lat: 39.2904, lng: -76.6122 },
  { name: 'Milwaukee', lat: 43.0389, lng: -87.9065 },
  { name: 'Albuquerque', lat: 35.0844, lng: -106.6504 },
  { name: 'Tucson', lat: 32.2226, lng: -110.9747 },
  { name: 'Fresno', lat: 36.7378, lng: -119.7871 },
  { name: 'Sacramento', lat: 38.5816, lng: -121.4944 },
  { name: 'Kansas City', lat: 39.0997, lng: -94.5786 },
  { name: 'Mesa', lat: 33.4152, lng: -111.8315 },
  { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
  { name: 'Omaha', lat: 41.2565, lng: -95.9345 },
  { name: 'Colorado Springs', lat: 38.8339, lng: -104.8214 },
  { name: 'Raleigh', lat: 35.7796, lng: -78.6382 },
  { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  { name: 'Virginia Beach', lat: 36.8529, lng: -75.9780 },
  { name: 'Oakland', lat: 37.8044, lng: -122.2712 },
  { name: 'Minneapolis', lat: 44.9778, lng: -93.2650 },
  { name: 'Tulsa', lat: 36.1540, lng: -95.9928 },
  { name: 'Cleveland', lat: 41.4993, lng: -81.6944 },
  { name: 'Wichita', lat: 37.6872, lng: -97.3301 },
  { name: 'Arlington', lat: 32.7357, lng: -97.1081 },
  { name: 'Tampa', lat: 27.9506, lng: -82.4572 },
  { name: 'New Orleans', lat: 29.9511, lng: -90.0715 },
];

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

const CATEGORY_ICONS = {
  'Sports & Fitness': '⚽',
  'Music & Arts': '🎨',
  'Social & Entertainment': '🍻',
  'Intellectual & Creative': '📚',
  'Outdoor & Nature': '🌲',
  'Social Activities': '🤝',
  'Other Hobbies': '🎯',
};

// Flatten all interests for search functionality
const ALL_INTERESTS = Object.values(INTERESTS_BY_CATEGORY).flat();

export default function ProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { friends, addFriend, removeFriend, isFriend } = useFriends();
  const { user, updateUser, setResidence } = useUser();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isProfileEditModalVisible, setIsProfileEditModalVisible] = useState(false);
  const [isResidenceSelectorVisible, setIsResidenceSelectorVisible] = useState(false);
  const [isFriendsModalVisible, setIsFriendsModalVisible] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [interestSearchQuery, setInterestSearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [profileFormData, setProfileFormData] = useState({
    name: user.name || '',
    hometown: user.hometown || '',
    college: user.college || '',
    age: user.age ? user.age.toString() : '',
  });

  const getFilteredCategories = () => {
    const categories = {};
    Object.keys(INTERESTS_BY_CATEGORY).forEach((categoryName) => {
      const filtered = INTERESTS_BY_CATEGORY[categoryName].filter((interest) =>
        interest.toLowerCase().includes(interestSearchQuery.toLowerCase())
      );
      if (filtered.length > 0 || interestSearchQuery === '') {
        categories[categoryName] = filtered;
      }
    });
    return categories;
  };

  const getFilteredCities = () => {
    if (!citySearchQuery || !citySearchQuery.trim()) {
      return MAJOR_US_CITIES;
    }
    const searchQuery = citySearchQuery.toLowerCase();
    return MAJOR_US_CITIES.filter((city) =>
      city.name.toLowerCase().includes(searchQuery)
    );
  };

  const filteredCategories = getFilteredCategories();

  // For search functionality, still maintain flat list
  const filteredInterests = interestSearchQuery
    ? ALL_INTERESTS.filter((interest) =>
        interest.toLowerCase().includes(interestSearchQuery.toLowerCase())
      )
    : [];

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleInterest = (interest) => {
    const currentInterests = user.interests || [];
    if (currentInterests.includes(interest)) {
      updateUser({
        interests: currentInterests.filter((i) => i !== interest),
      });
    } else {
      updateUser({
        interests: [...currentInterests, interest],
      });
    }
  };

  const handleSave = () => {
    setIsEditModalVisible(false);
    setInterestSearchQuery(''); // Clear search when closing
    setExpandedCategories({}); // Reset expanded categories
  };

  const handleProfileEditOpen = () => {
    setProfileFormData({
      name: user.name || '',
      hometown: user.hometown || '',
      college: user.college || '',
      age: user.age ? user.age.toString() : '',
    });
    setIsProfileEditModalVisible(true);
  };

  const handleProfileSave = () => {
    updateUser({
      name: profileFormData.name || user.name,
      hometown: profileFormData.hometown || user.hometown,
      college: profileFormData.college || user.college,
      age: profileFormData.age ? parseInt(profileFormData.age) || user.age : user.age,
    });
    setIsProfileEditModalVisible(false);
  };

  const handleCitySelect = (cityName) => {
    setResidence(cityName);
    setIsResidenceSelectorVisible(false);
    setCitySearchQuery('');
  };

  const getFilteredUsers = () => {
    if (!friendSearchQuery || !friendSearchQuery.trim()) {
      return ALL_USERS;
    }
    const searchQuery = friendSearchQuery.toLowerCase();
    return ALL_USERS.filter((user) =>
      user.name.toLowerCase().includes(searchQuery)
    );
  };

  const handleFriendToggle = (userId) => {
    if (isFriend(userId)) {
      removeFriend(userId);
    } else {
      addFriend(userId);
    }
  };

  const handleFriendPress = (userId) => {
    navigation.navigate('FriendProfile', { userId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={[styles.photoContainer, { backgroundColor: colors.primary }]}>
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            )}
          </View>
        </View>

        {/* Name */}
        <View style={styles.nameSection}>
          <View style={styles.nameAndResidence}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{user.name}</Text>
            <TouchableOpacity 
              onPress={() => setIsResidenceSelectorVisible(true)}
              style={styles.residenceButton}
            >
              <Text style={[styles.residenceButtonText, { color: colors.textSecondary }]}>
                {user.residence || 'Set residence'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleProfileEditOpen}
            style={[styles.topEditButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.topEditButtonIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          {user.hometown && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>📍 Hometown</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.hometown}</Text>
            </View>
          )}

          {user.college && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>🎓 College</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.college}</Text>
            </View>
          )}

          {user.age && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>📅 Grad Year</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.age}</Text>
            </View>
          )}
        </View>

        {/* Interests */}
        <View style={styles.interestsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Interests</Text>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(true)}
              style={[styles.editButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.editButtonIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          {user.interests && user.interests.length > 0 ? (
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, index) => (
                <View
                  key={index}
                  style={[
                    styles.interestTag,
                    { backgroundColor: 'rgba(20, 184, 166, 0.15)' },
                  ]}
                >
                  <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noInterestsText, { color: colors.textSecondary }]}>
              No Interests Selected Yet!
            </Text>
          )}
        </View>

        {/* My Friends */}
        <View style={[styles.interestsSection, styles.friendsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Friends</Text>
            <TouchableOpacity
              onPress={() => setIsFriendsModalVisible(true)}
              style={[styles.editButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.editButtonIcon}>+</Text>
            </TouchableOpacity>
          </View>
          {friends && friends.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsContainer}
            >
              {friends.map((friendId) => {
                const friend = USERS_BY_ID.get(friendId);
                if (!friend) return null;
                return (
                  <View
                    key={friendId}
                    style={[
                      styles.friendItem,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.friendItemContent}
                      onPress={() => handleFriendPress(friendId)}
                    >
                      <View style={[styles.friendAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.friendAvatarText}>
                          {friend.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Text>
                      </View>
                      <Text style={[styles.friendName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {friend.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Remove Friend',
                          `Are you sure you want to remove ${friend.name} as a friend?`,
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => removeFriend(friendId),
                            },
                          ]
                        );
                      }}
                      style={styles.removeFriendButton}
                    >
                      <Text style={[styles.removeFriendButtonText, { color: colors.error }]}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={[styles.noInterestsText, { color: colors.textSecondary }]}>
              No friends yet. Tap + to add friends!
            </Text>
          )}
        </View>

        {/* Edit Interests Modal */}
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Interests</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditModalVisible(false);
                    setInterestSearchQuery('');
                    setExpandedCategories({});
                  }}
                  style={styles.closeButton}
                >
                  <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Search interests..."
                  placeholderTextColor={colors.textTertiary}
                  value={interestSearchQuery}
                  onChangeText={setInterestSearchQuery}
                />
              </View>
              <ScrollView 
                style={styles.modalBody} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.modalBodyContent}
              >
                {interestSearchQuery ? (
                  // Search mode: show flat list
                  <View style={styles.interestsGrid}>
                    {filteredInterests.map((interest) => {
                      const isSelected = user.interests?.includes(interest);
                      return (
                        <TouchableOpacity
                          key={interest}
                          style={[
                            styles.interestTagSmall,
                            {
                              backgroundColor: isSelected
                                ? 'rgba(20, 184, 166, 0.15)'
                                : colors.backgroundSecondary,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => toggleInterest(interest)}
                        >
                          <Text
                            style={[
                              styles.interestTagTextSmall,
                              {
                                color: isSelected ? colors.primary : colors.textPrimary,
                                fontWeight: isSelected ? '600' : '400',
                              },
                            ]}
                          >
                            {interest}
                          </Text>
                          {isSelected && (
                            <Text style={[styles.checkmarkSmall, { color: colors.primary }]}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  // Category mode: show categorized
                  Object.keys(filteredCategories).map((categoryName) => {
                    const isExpanded = expandedCategories[categoryName];
                    const interests = filteredCategories[categoryName];
                    const categoryIcon = CATEGORY_ICONS[categoryName] || '📌';
                    
                    return (
                      <View key={categoryName} style={styles.categorySection}>
                        <TouchableOpacity
                          style={styles.categoryHeader}
                          onPress={() => toggleCategory(categoryName)}
                        >
                          <View style={styles.categoryTitleContainer}>
                            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
                            <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>
                              {categoryName}
                            </Text>
                          </View>
                          <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>
                            {isExpanded ? '▼' : '▶'}
                          </Text>
                        </TouchableOpacity>
                        {isExpanded && (
                          <View style={styles.interestsGrid}>
                            {interests.map((interest) => {
                              const isSelected = user.interests?.includes(interest);
                              return (
                                <TouchableOpacity
                                  key={interest}
                                  style={[
                                    styles.interestTagSmall,
                                    {
                                      backgroundColor: isSelected
                                        ? 'rgba(20, 184, 166, 0.15)'
                                        : colors.backgroundSecondary,
                                      borderColor: isSelected ? colors.primary : colors.border,
                                    },
                                  ]}
                                  onPress={() => toggleInterest(interest)}
                                >
                                  <Text
                                    style={[
                                      styles.interestTagTextSmall,
                                      {
                                        color: isSelected ? colors.primary : colors.textPrimary,
                                        fontWeight: isSelected ? '600' : '400',
                                      },
                                    ]}
                                  >
                                    {interest}
                                  </Text>
                                  {isSelected && (
                                    <Text style={[styles.checkmarkSmall, { color: colors.primary }]}>✓</Text>
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* City Selector Modal */}
        <Modal
          visible={isResidenceSelectorVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setIsResidenceSelectorVisible(false);
            setCitySearchQuery('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select City</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsResidenceSelectorVisible(false);
                    setCitySearchQuery('');
                  }}
                  style={styles.closeButton}
                >
                  <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Search cities..."
                  placeholderTextColor={colors.textTertiary}
                  value={citySearchQuery}
                  onChangeText={setCitySearchQuery}
                  autoFocus={true}
                />
              </View>
              <ScrollView 
                style={styles.modalBody} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.modalBodyContent}
              >
                {getFilteredCities().map((city) => (
                  <TouchableOpacity
                    key={city.name}
                    style={[
                      styles.cityItem,
                      {
                        backgroundColor: user.residence === city.name
                          ? 'rgba(20, 184, 166, 0.15)'
                          : colors.backgroundSecondary,
                        borderColor: user.residence === city.name
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => handleCitySelect(city.name)}
                  >
                    <Text style={[
                      styles.cityItemText,
                      { 
                        color: user.residence === city.name 
                          ? colors.primary 
                          : colors.textPrimary,
                        fontWeight: user.residence === city.name ? '700' : '400',
                      },
                    ]}>
                      {city.name}
                    </Text>
                    {user.residence === city.name && (
                      <Text style={[styles.cityItemCheck, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
                {getFilteredCities().length === 0 && (
                  <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                    No cities found
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Friends Modal */}
        <Modal
          visible={isFriendsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setIsFriendsModalVisible(false);
            setFriendSearchQuery('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Friends</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsFriendsModalVisible(false);
                    setFriendSearchQuery('');
                  }}
                  style={styles.closeButton}
                >
                  <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Search users..."
                  placeholderTextColor={colors.textTertiary}
                  value={friendSearchQuery}
                  onChangeText={setFriendSearchQuery}
                  autoFocus={true}
                />
              </View>
              <ScrollView 
                style={styles.modalBody} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.modalBodyContent}
              >
                {getFilteredUsers().map((user) => {
                  const isAlreadyFriend = isFriend(user.id);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.modalFriendItem,
                        {
                          backgroundColor: isAlreadyFriend
                            ? 'rgba(20, 184, 166, 0.15)'
                            : colors.backgroundSecondary,
                          borderColor: isAlreadyFriend
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => handleFriendToggle(user.id)}
                    >
                      <View style={[styles.modalFriendAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.modalFriendAvatarText}>
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Text>
                      </View>
                      <View style={styles.modalFriendInfo}>
                        <Text style={[
                          styles.modalFriendName,
                          { 
                            color: isAlreadyFriend 
                              ? colors.primary 
                              : colors.textPrimary,
                            fontWeight: isAlreadyFriend ? '700' : '400',
                          },
                        ]}>
                          {user.name}
                        </Text>
                        <Text style={[styles.modalFriendCity, { color: colors.textSecondary }]}>
                          {user.city}
                        </Text>
                      </View>
                      {isAlreadyFriend && (
                        <Text style={[styles.cityItemCheck, { color: colors.primary }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
                {getFilteredUsers().length === 0 && (
                  <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                    No users found
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Profile Info Modal */}
        <Modal
          visible={isProfileEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsProfileEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={() => setIsProfileEditModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="e.g., Alex Johnson"
                    placeholderTextColor={colors.textTertiary}
                    value={profileFormData.name}
                    onChangeText={(text) => setProfileFormData({ ...profileFormData, name: text })}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>📍 Hometown</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="e.g., San Francisco, CA"
                    placeholderTextColor={colors.textTertiary}
                    value={profileFormData.hometown}
                    onChangeText={(text) => setProfileFormData({ ...profileFormData, hometown: text })}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>🎓 College</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="e.g., Stanford University"
                    placeholderTextColor={colors.textTertiary}
                    value={profileFormData.college}
                    onChangeText={(text) => setProfileFormData({ ...profileFormData, college: text })}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>📅 Grad Year</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="e.g., 2024"
                    placeholderTextColor={colors.textTertiary}
                    value={profileFormData.age}
                    onChangeText={(text) => setProfileFormData({ ...profileFormData, age: text })}
                    keyboardType="numeric"
                  />
                </View>
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleProfileSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  photoSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  nameSection: {
    width: '100%',
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  nameAndResidence: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  residenceButton: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  residenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  topEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#14b8a6',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topEditButtonIcon: {
    fontSize: 18,
  },
  infoSection: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  interestsSection: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  friendsSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonIcon: {
    fontSize: 18,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
  },
  noInterestsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  friendsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  friendItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
    maxWidth: 80,
    position: 'relative',
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  friendAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  friendName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0f172a',
    textAlign: 'center',
  },
  friendItemContent: {
    alignItems: 'center',
    width: '100%',
  },
  removeFriendButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFriendButtonText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '700',
  },
  modalFriendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalFriendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalFriendAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalFriendInfo: {
    flex: 1,
  },
  modalFriendName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  modalFriendCity: {
    fontSize: 11,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748b',
  },
  modalBody: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  modalBodyContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  modalBodyContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  interestOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    backgroundColor: '#f8fafc',
  },
  interestOptionText: {
    fontSize: 16,
    color: '#0f172a',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14b8a6',
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
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
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#64748b',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
    gap: 6,
  },
  interestTagSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interestTagTextSmall: {
    fontSize: 12,
    fontWeight: '400',
  },
  checkmarkSmall: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  cityItemText: {
    fontSize: 16,
    flex: 1,
  },
  cityItemCheck: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 40,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
