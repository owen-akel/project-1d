import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();

  const [user] = useState({
    name: 'Alex Johnson',
    photo: null, // In real app, this would be an image URL
    hometown: 'San Francisco, CA',
    college: 'Stanford University',
    age: 23,
    interests: ['Photography', 'Travel', 'Music', 'Hiking', 'Technology'],
  });

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
        <Text style={[styles.name, { color: colors.textPrimary }]}>{user.name}</Text>

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
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>🎂 Age</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.age}</Text>
            </View>
          )}
        </View>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Interests</Text>
            <View style={styles.interestsContainer}>
              {user.interests.map((interest, index) => (
                <View
                  key={index}
                  style={[
                    styles.interestTag,
                    { backgroundColor: colors.primary, opacity: 0.15 },
                  ]}
                >
                  <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 32,
    letterSpacing: -0.5,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    letterSpacing: -0.3,
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
});
