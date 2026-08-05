import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ALL_USERS } from '../src/mock/users';
import { useUser } from '../context/UserContext';
import { toMockCityName, CURRENT_USER_ID } from '../src/social/visibility';
import { Screen, ScreenHeader } from '../src/ui';

export default function CreateEventScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useUser();
  
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  // Get the 12 main characters for collaboration
  const mainCharacters = useMemo(() => {
    return ALL_USERS
      .filter(user => user.id.startsWith('main-user-'))
      .map((user, index) => {
        // Generate avatar initials from name
        const initials = user.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();
        
        // Deterministic online status based on user ID
        const isOnline = (parseInt(user.id.split('-').pop()) % 3) !== 0;
        
        return {
          id: user.id,
          userId: user.id,
          username: user.name,
          avatar: initials,
          isOnline: isOnline,
        };
      });
  }, []);

  const toggleCollaborator = (connection) => {
    setSelectedCollaborators((prev) => {
      if (prev.find((c) => c.id === connection.id)) {
        return prev.filter((c) => c.id !== connection.id);
      } else {
        return [...prev, connection];
      }
    });
  };

  const handleCreateEvent = () => {
    if (!title.trim() || !time.trim() || !destination.trim()) {
      alert('Please fill in all required fields (Title, Time, and Destination)');
      return;
    }

    const mockCityName = user?.residence ? toMockCityName(user.residence) : 'NYC';
    
    // Generate a unique event ID
    const eventId = `user-event-${Date.now()}`;
    
    const eventData = {
      id: eventId,
      title: title.trim(),
      location: destination.trim(),
      date: time.trim(),
      hostId: CURRENT_USER_ID,
      city: mockCityName,
      type: 'social', // Default type for user-created events
      attendeeIds: [], // Start with empty array
      description: description.trim(),
      collaborators: selectedCollaborators.map(c => c.userId),
      isUserCreated: true,
    };

    // Pass event data back via navigation params and navigate back
    navigation.navigate('ConnectionsEventsList', { newEvent: eventData });
  };

  const renderCollaborator = ({ item }) => {
    const isSelected = selectedCollaborators.find((c) => c.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.collaboratorItem,
          {
            backgroundColor: isSelected ? colors.primary + '20' : colors.background,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => toggleCollaborator(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>
          {item.isOnline ? (
            <View
              style={[
                styles.onlineIndicator,
                { backgroundColor: colors.success, borderColor: colors.card },
              ]}
            />
          ) : null}
        </View>
        <View style={styles.collaboratorContent}>
          <Text style={[styles.collaboratorUsername, { color: colors.textPrimary }]}>
            {item.username}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <Text style={[styles.checkmarkText, { color: colors.onPrimary }]}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Create event" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Title */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="e.g., Study Group Session"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Time */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Time *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="e.g., Today, 4:00 PM"
            placeholderTextColor={colors.textTertiary}
            value={time}
            onChangeText={setTime}
          />
        </View>

        {/* Destination */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Destination *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="e.g., Coffee Shop Downtown"
            placeholderTextColor={colors.textTertiary}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Add details about your event..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Collaborators Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
            Collaborate With {selectedCollaborators.length > 0 && `(${selectedCollaborators.length} selected)`}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Select connections to co-host this event
          </Text>
          <FlatList
            data={mainCharacters}
            renderItem={renderCollaborator}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.collaboratorsList}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateEvent}
          activeOpacity={0.8}
        >
          <Text style={[styles.createButtonText, { color: colors.onPrimary }]}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
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
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
  },
  collaboratorsList: {
    marginTop: 8,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  collaboratorContent: {
    flex: 1,
  },
  collaboratorUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
