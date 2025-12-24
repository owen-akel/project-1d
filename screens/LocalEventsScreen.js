import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { getMajorEventsByCity, getVisibleUsersByCity } from '../src/mock/events';
import { USERS_BY_ID, getUsersByCity } from '../src/mock/users';

export default function LocalEventsScreen() {
  const { colors } = useTheme();
  const { user } = useUser();
  const { friends } = useFriends();

  // Current user ID
  const CURRENT_USER_ID = 'current-user-1';

  // Map city names from UserContext to mock data city codes
  const mapCityNameToMockCity = (cityName) => {
    const cityMap = {
      'New York': 'NYC',
      'Los Angeles': 'LA',
      'San Francisco': 'SF',
    };
    return cityMap[cityName] || cityName;
  };

  // Filter major events by user's residence
  const filteredEvents = useMemo(() => {
    if (!user?.residence) {
      return [];
    }
    const mockCityName = mapCityNameToMockCity(user.residence);
    return getMajorEventsByCity(mockCityName, friends);
  }, [user?.residence, friends]);

  // Track event attendee modifications (eventId -> attendeeIds array)
  const [eventAttendees, setEventAttendees] = useState(new Map());
  
  // Track which events the user is interested in (using event IDs)
  const [interestedEvents, setInterestedEvents] = useState(new Set());

  // Get events with current attendee state
  const events = useMemo(() => {
    return filteredEvents.map(event => {
      const modifiedAttendees = eventAttendees.get(event.id);
      const attendeeIds = modifiedAttendees !== undefined ? modifiedAttendees : (event.attendeeIds || []);
      return {
        ...event,
        attendeeIds: attendeeIds || [],
      };
    });
  }, [filteredEvents, eventAttendees]);

  // Update interestedEvents when events change (to sync with attendeeIds)
  useEffect(() => {
    const newSet = new Set();
    events.forEach(event => {
      if (event.attendeeIds.includes(CURRENT_USER_ID)) {
        newSet.add(event.id);
      }
    });
    setInterestedEvents(newSet);
  }, [events]);

  // Track which modal is open (eventId or null)
  const [modalVisible, setModalVisible] = useState(null);

  const openAttendeesModal = (eventId) => {
    setModalVisible(eventId);
  };

  const closeAttendeesModal = () => {
    setModalVisible(null);
  };

  const getCurrentEvent = () => {
    return events.find((event) => event.id === modalVisible);
  };

  const toggleInterest = (eventId) => {
    setInterestedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
        // Remove user from attendee list
        setEventAttendees((prevMap) => {
          const newMap = new Map(prevMap);
          const currentAttendees = newMap.get(eventId) || filteredEvents.find(e => e.id === eventId)?.attendeeIds || [];
          newMap.set(eventId, currentAttendees.filter(id => id !== CURRENT_USER_ID));
          return newMap;
        });
      } else {
        newSet.add(eventId);
        // Add user to attendee list
        setEventAttendees((prevMap) => {
          const newMap = new Map(prevMap);
          const currentAttendees = newMap.get(eventId) || filteredEvents.find(e => e.id === eventId)?.attendeeIds || [];
          if (!currentAttendees.includes(CURRENT_USER_ID)) {
            newMap.set(eventId, [...currentAttendees, CURRENT_USER_ID]);
          }
          return newMap;
        });
      }
      return newSet;
    });
  };

  // Get visible attendees for an event (only those who live in the city and are visible, plus current user)
  const getVisibleAttendees = (event) => {
    if (!event || !user?.residence) return [];
    const mockCityName = mapCityNameToMockCity(user.residence);
    const cityUsers = getUsersByCity(mockCityName);
    const cityUserIds = new Set(cityUsers.map(u => u.id));
    
    // Helper to check if a user can be viewed
    const canViewUser = (targetUserId) => {
      // Current user is always visible
      if (targetUserId === CURRENT_USER_ID) return true;
      if (targetUserId.startsWith('main-user-')) {
        return friends.includes(targetUserId);
      }
      const parts = targetUserId.split('-');
      if (parts.length >= 2 && parts[1] === 'friend') {
        const firstName = parts[0];
        const mainUserIndex = [
          'rod', 'sam', 'clay', 'harry', 'john', 'pete',
          'liam', 'warren', 'jackson', 'eric', 'simon', 'greg'
        ].indexOf(firstName);
        if (mainUserIndex !== -1) {
          const parentMainUserId = `main-user-${mainUserIndex + 1}`;
          return friends.includes(parentMainUserId);
        }
      }
      return false;
    };
    
    return event.attendeeIds
      .filter(attendeeId => {
        // Current user is always shown, others must live in the city
        if (attendeeId === CURRENT_USER_ID) return true;
        return cityUserIds.has(attendeeId);
      })
      .filter(attendeeId => canViewUser(attendeeId)) // Must be visible
      .map(attendeeId => {
        if (attendeeId === CURRENT_USER_ID) {
          return {
            id: CURRENT_USER_ID,
            name: user?.name || 'You',
            avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('') : '👤',
          };
        }
        const user = USERS_BY_ID.get(attendeeId);
        return {
          id: attendeeId,
          name: user?.name || 'Unknown',
          avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('') : '👤',
        };
      });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'concerts':
        return '🎵';
      case 'comedy':
        return '😂';
      case 'festivals':
        return '🎪';
      case 'sports':
        return '⚽';
      case 'theater':
        return '🎭';
      case 'music-festival':
        return '🎶';
      case 'golf':
        return '⛳';
      case 'lifting':
        return '💪';
      case 'running':
        return '🏃';
      case 'beer':
        return '🍺';
      case 'movies':
        return '🎬';
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
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Events in {user?.residence || 'your city'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {events.length > 0 ? (
          events.map((event) => {
            return (
              <View
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={styles.eventCardTop}>
                  <View style={styles.eventIconContainer}>
                    <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                    <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>📍 {event.location}</Text>
                    <View style={styles.eventDetails}>
                      <Text style={[styles.eventDate, { color: colors.textSecondary }]}>🕐 {event.date}</Text>
                      <TouchableOpacity 
                        onPress={() => openAttendeesModal(event.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.eventAttendees, { color: colors.textSecondary }]}>
                          👥 {getVisibleAttendees(event).length} going
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.interestedButton,
                    {
                      backgroundColor: interestedEvents.has(event.id) ? colors.primary : colors.backgroundSecondary,
                      borderColor: interestedEvents.has(event.id) ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleInterest(event.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.interestedButtonText,
                      {
                        color: interestedEvents.has(event.id) ? '#ffffff' : colors.textPrimary,
                      },
                    ]}
                  >
                    {interestedEvents.has(event.id) ? 'Interested ✓' : 'Interested?'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No events found in {user?.residence || 'your city'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Attendees Modal */}
      <Modal
        visible={modalVisible !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAttendeesModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeAttendeesModal}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {getCurrentEvent()?.title}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                People Going
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeAttendeesModal}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.attendeesList} 
              contentContainerStyle={styles.attendeesListContent}
              showsVerticalScrollIndicator={true}
            >
              {(() => {
                const currentEvent = getCurrentEvent();
                const visibleAttendees = currentEvent ? getVisibleAttendees(currentEvent) : [];
                return visibleAttendees.length > 0 ? (
                  visibleAttendees.map((attendee) => (
                    <View key={attendee.id} style={[styles.attendeeItem, { borderBottomColor: colors.border }]}>
                      <View style={[styles.attendeeAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.attendeeAvatarText}>{attendee.avatar}</Text>
                      </View>
                      <Text style={[styles.attendeeName, { color: colors.textPrimary }]}>
                        {attendee.name}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                      No attendees yet
                    </Text>
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  eventCardTop: {
    flexDirection: 'row',
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
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    maxHeight: '80%',
    minHeight: '40%',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    position: 'relative',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  attendeesList: {
    flex: 1,
    flexGrow: 1,
  },
  attendeesListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  attendeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attendeeAvatarText: {
    fontSize: 20,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  interestedButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  interestedButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


