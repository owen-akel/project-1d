import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LocalEventsScreen() {
  const { colors } = useTheme();

  // Sample local events feed
  const [events] = useState([
    {
      id: 1,
      title: 'Central Park Music Festival',
      location: 'Central Park, NYC',
      date: 'Today, 6:00 PM',
      host: 'NYC Events',
      attendees: 234,
      type: 'music',
    },
    {
      id: 2,
      title: 'Art Gallery Opening',
      location: 'Chelsea, Manhattan',
      date: 'Tomorrow, 7:00 PM',
      host: 'Art Collective',
      attendees: 89,
      type: 'art',
    },
    {
      id: 3,
      title: 'Food Truck Festival',
      location: 'Brooklyn Bridge Park',
      date: 'Saturday, 12:00 PM',
      host: 'Brooklyn Eats',
      attendees: 456,
      type: 'food',
    },
    {
      id: 4,
      title: 'Yoga in the Park',
      location: 'Prospect Park',
      date: 'Sunday, 9:00 AM',
      host: 'Wellness NYC',
      attendees: 67,
      type: 'fitness',
    },
    {
      id: 5,
      title: 'Jazz Night',
      location: 'Greenwich Village',
      date: 'Friday, 8:00 PM',
      host: 'Jazz Club NYC',
      attendees: 123,
      type: 'music',
    },
  ]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'music':
        return '🎵';
      case 'art':
        return '🎨';
      case 'food':
        return '🍔';
      case 'fitness':
        return '🧘';
      default:
        return '📅';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Local Events</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Discover what's happening near you</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.8}
          >
            <View style={styles.eventIconContainer}>
              <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
              <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>📍 {event.location}</Text>
              <View style={styles.eventDetails}>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>🕐 {event.date}</Text>
                <Text style={[styles.eventAttendees, { color: colors.textSecondary }]}>👥 {event.attendees} going</Text>
              </View>
              <Text style={[styles.eventHost, { color: colors.textTertiary }]}>Hosted by {event.host}</Text>
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
  eventIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventIcon: {
    fontSize: 32,
  },
  eventContent: {
    flex: 1,
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
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 13,
    color: '#64748b',
  },
  eventAttendees: {
    fontSize: 13,
    color: '#64748b',
  },
  eventHost: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});


