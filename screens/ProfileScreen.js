import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isProfileEditModalVisible, setIsProfileEditModalVisible] = useState(false);
  const [interestSearchQuery, setInterestSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    photo: null, // In real app, this would be an image URL
    hometown: 'San Francisco, CA',
    college: 'Stanford University',
    age: 2024,
    interests: [],
  });
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    hometown: '',
    college: '',
    age: '',
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
    setUser((prevUser) => {
      const currentInterests = prevUser.interests || [];
      if (currentInterests.includes(interest)) {
        return {
          ...prevUser,
          interests: currentInterests.filter((i) => i !== interest),
        };
      } else {
        return {
          ...prevUser,
          interests: [...currentInterests, interest],
        };
      }
    });
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
    setUser((prevUser) => ({
      ...prevUser,
      name: profileFormData.name || prevUser.name,
      hometown: profileFormData.hometown || prevUser.hometown,
      college: profileFormData.college || prevUser.college,
      age: profileFormData.age ? parseInt(profileFormData.age) || prevUser.age : prevUser.age,
    }));
    setIsProfileEditModalVisible(false);
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
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user.name}</Text>
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
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    flex: 1,
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
