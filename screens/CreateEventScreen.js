import React, { useState } from 'react';
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

export default function CreateEventScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  // Sample connections - in a real app, this would come from a backend
  const [connections] = useState([
    {
      id: 1,
      userId: 'user1',
      username: 'Alex',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 2,
      userId: 'user2',
      username: 'Sam',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 3,
      userId: 'user3',
      username: 'Jordan',
      avatar: '👤',
      isOnline: false,
    },
    {
      id: 4,
      userId: 'user4',
      username: 'Casey',
      avatar: '👤',
      isOnline: true,
    },
    {
      id: 5,
      userId: 'user5',
      username: 'Morgan',
      avatar: '👤',
      isOnline: false,
    },
    {
      id: 6,
      userId: 'user6',
      username: 'Taylor',
      avatar: '👤',
      isOnline: false,
    },
  ]);

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

    const eventData = {
      title,
      time,
      destination,
      description,
      collaborators: selectedCollaborators,
    };

    console.log('Creating event:', eventData);
    // In a real app, this would save to a backend
    alert('Event created successfully!');
    navigation.goBack();
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
          {item.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: '#10b981' }]} />}
        </View>
        <View style={styles.collaboratorContent}>
          <Text style={[styles.collaboratorUsername, { color: colors.textPrimary }]}>
            {item.username}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>

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
            data={connections}
            renderItem={renderCollaborator}
            keyExtractor={(item) => item.id.toString()}
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
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
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
