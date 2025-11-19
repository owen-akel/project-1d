import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ConnectionsEventsScreen() {
  const { colors } = useTheme();

  // Sample connections events feed
  const [events] = useState([
    {
      id: 1,
      title: 'Study Group Session',
      location: 'Coffee Shop Downtown',
      date: 'Today, 4:00 PM',
      host: 'Sarah M.',
      hostAvatar: '👩',
      attendees: 5,
      type: 'academic',
    },
    {
      id: 2,
      title: 'Weekend Hiking Trip',
      location: 'Blue Mountain Trail',
      date: 'Saturday, 8:00 AM',
      host: 'Mike T.',
      hostAvatar: '👨',
      attendees: 8,
      type: 'outdoor',
    },
    {
      id: 3,
      title: 'Game Night',
      location: 'Mike\'s Apartment',
      date: 'Friday, 7:00 PM',
      host: 'Alex J.',
      hostAvatar: '👤',
      attendees: 12,
      type: 'social',
    },
    {
      id: 4,
      title: 'Photography Walk',
      location: 'Brooklyn Bridge',
      date: 'Sunday, 2:00 PM',
      host: 'Emma L.',
      hostAvatar: '👩',
      attendees: 6,
      type: 'creative',
    },
    {
      id: 5,
      title: 'Book Club Discussion',
      location: 'Local Library',
      date: 'Wednesday, 6:00 PM',
      host: 'Jordan K.',
      hostAvatar: '👤',
      attendees: 10,
      type: 'academic',
    },
  ]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'academic':
        return '📚';
      case 'outdoor':
        return '⛰️';
      case 'social':
        return '🎮';
      case 'creative':
        return '📸';
      default:
        return '📅';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Connections Events</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Events from your connections</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.8}
          >
            <View style={[styles.hostAvatarContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.hostAvatar}>{event.hostAvatar}</Text>
            </View>
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={[styles.eventHost, { color: colors.textPrimary }]}>{event.host}</Text>
                <Text style={styles.eventTypeIcon}>{getEventIcon(event.type)}</Text>
              </View>
              <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
              <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>📍 {event.location}</Text>
              <View style={styles.eventDetails}>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>🕐 {event.date}</Text>
                <Text style={[styles.eventAttendees, { color: colors.textSecondary }]}>👥 {event.attendees} going</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  hostAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hostAvatar: {
    fontSize: 24,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventHost: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  eventTypeIcon: {
    fontSize: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  eventLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  eventDate: {
    fontSize: 13,
    color: '#64748b',
  },
  eventAttendees: {
    fontSize: 13,
    color: '#64748b',
  },
});


