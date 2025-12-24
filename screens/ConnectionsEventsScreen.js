import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { getConnectionEventsByCity } from '../src/mock/events';
import { USERS_BY_ID, getUsersByCity } from '../src/mock/users';

// Helper to check if a user can be viewed
function canViewUser(targetUserId, currentUserFriends) {
  // Main users are only visible if they're in the friends list
  if (targetUserId.startsWith('main-user-')) {
    return currentUserFriends.includes(targetUserId);
  }
  
  // Extract parent main user from friend ID (e.g., "rod-friend-5" -> "rod")
  const parts = targetUserId.split('-');
  if (parts.length >= 2 && parts[1] === 'friend') {
    const firstName = parts[0];
    const mainUserIndex = [
      'rod', 'sam', 'clay', 'harry', 'john', 'pete',
      'liam', 'warren', 'jackson', 'eric', 'simon', 'greg'
    ].indexOf(firstName);
    
    if (mainUserIndex !== -1) {
      const parentMainUserId = `main-user-${mainUserIndex + 1}`;
      // Only visible if parent main user is in friends list
      return currentUserFriends.includes(parentMainUserId);
    }
  }
  
  // Default: not visible
  return false;
}

export default function ConnectionsEventsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();
  const { friends } = useFriends();

  // Current user ID
  const CURRENT_USER_ID = 'current-user-1';

  // Store user-created events
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);

  // Map city names from UserContext to mock data city codes
  const mapCityNameToMockCity = (cityName) => {
    const cityMap = {
      'New York': 'NYC',
      'Los Angeles': 'LA',
      'San Francisco': 'SF',
    };
    return cityMap[cityName] || cityName;
  };

  // Filter events by residence and friend visibility
  const filteredEvents = useMemo(() => {
    if (!user?.residence) {
      return [];
    }
    const mockCityName = mapCityNameToMockCity(user.residence);
    const cityEvents = getConnectionEventsByCity(mockCityName, friends);
    
    // Filter to only show events from visible hosts (friends + their friends)
    return cityEvents.filter(event => canViewUser(event.hostId, friends));
  }, [user?.residence, friends]);

  // Track event attendee modifications (eventId -> attendeeIds array)
  const [eventAttendees, setEventAttendees] = useState(new Map());
  
  // Track which events the user is interested in (using event IDs)
  const [interestedEvents, setInterestedEvents] = useState(new Set());
  
  // Track which modal is open (eventId or null)
  const [modalVisible, setModalVisible] = useState(null);
  
  // Track which event is being edited (eventId or null)
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Listen for new events from CreateEventScreen (both on focus and when params change)
  useEffect(() => {
    if (route.params?.newEvent) {
      const newEvent = route.params.newEvent;
      setUserCreatedEvents(prev => {
        // Check if event already exists (avoid duplicates)
        if (prev.find(e => e.id === newEvent.id)) {
          return prev;
        }
        return [newEvent, ...prev];
      });
      // Clear the param to avoid re-adding on subsequent renders
      navigation.setParams({ newEvent: undefined });
    }
  }, [route.params?.newEvent, navigation]);

  // Also listen on focus in case params were set before component mounted
  useFocusEffect(
    useCallback(() => {
      if (route.params?.newEvent) {
        const newEvent = route.params.newEvent;
        setUserCreatedEvents(prev => {
          // Check if event already exists (avoid duplicates)
          if (prev.find(e => e.id === newEvent.id)) {
            return prev;
          }
          return [newEvent, ...prev];
        });
        // Clear the param to avoid re-adding on subsequent focuses
        navigation.setParams({ newEvent: undefined });
      }
    }, [route.params?.newEvent, navigation])
  );

  // Add navigation listener as backup to catch params
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.newEvent) {
        const newEvent = route.params.newEvent;
        setUserCreatedEvents(prev => {
          if (prev.find(e => e.id === newEvent.id)) {
            return prev;
          }
          return [newEvent, ...prev];
        });
        navigation.setParams({ newEvent: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.newEvent]);

  // Get events with current attendee state, with user-created events first
  const events = useMemo(() => {
    // Process user-created events
    const processedUserEvents = userCreatedEvents.map(event => {
      const modifiedAttendees = eventAttendees.get(event.id);
      const attendeeIds = modifiedAttendees !== undefined ? modifiedAttendees : (event.attendeeIds || []);
      return {
        ...event,
        attendeeIds: attendeeIds || [],
      };
    });

    // Process filtered events
    const processedFilteredEvents = filteredEvents.map(event => {
      const modifiedAttendees = eventAttendees.get(event.id);
      const attendeeIds = modifiedAttendees !== undefined ? modifiedAttendees : (event.attendeeIds || []);
      return {
        ...event,
        attendeeIds: attendeeIds || [],
      };
    });

    // Return user-created events first, then filtered events
    return [...processedUserEvents, ...processedFilteredEvents];
  }, [userCreatedEvents, filteredEvents, eventAttendees]);

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

  const openAttendeesModal = (eventId) => {
    setModalVisible(eventId);
  };

  const closeAttendeesModal = () => {
    setModalVisible(null);
  };

  const getCurrentEvent = () => {
    return events.find((event) => event.id === modalVisible);
  };

  const openEditModal = (event) => {
    setEditingEvent(event.id);
    setEditTitle(event.title);
    setEditTime(event.date);
    setEditDestination(event.location);
    setEditDescription(event.description || '');
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    setEditTitle('');
    setEditTime('');
    setEditDestination('');
    setEditDescription('');
  };

  const handleUpdateEvent = () => {
    if (!editTitle.trim() || !editTime.trim() || !editDestination.trim()) {
      alert('Please fill in all required fields (Title, Time, and Destination)');
      return;
    }

    setUserCreatedEvents(prev => {
      return prev.map(event => {
        if (event.id === editingEvent) {
          return {
            ...event,
            title: editTitle.trim(),
            date: editTime.trim(),
            location: editDestination.trim(),
            description: editDescription.trim(),
          };
        }
        return event;
      });
    });
    closeEditModal();
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUserCreatedEvents(prev => prev.filter(event => event.id !== eventId));
            // Also remove from interested events if user was interested
            setInterestedEvents(prev => {
              const newSet = new Set(prev);
              newSet.delete(eventId);
              return newSet;
            });
            // Remove from event attendees
            setEventAttendees(prev => {
              const newMap = new Map(prev);
              newMap.delete(eventId);
              return newMap;
            });
          },
        },
      ]
    );
  };

  // Get visible attendees for an event (only those who live in the city and are visible)
  // Note: attendeeIds are already filtered by visibility when populated, but we still need to
  // filter by city and ensure they're still visible (in case friends list changed)
  const getVisibleAttendees = (event) => {
    if (!event || !user?.residence || !event.attendeeIds || event.attendeeIds.length === 0) return [];
    const mockCityName = mapCityNameToMockCity(user.residence);
    const cityUsers = getUsersByCity(mockCityName);
    const cityUserIds = new Set(cityUsers.map(u => u.id));
    
    return event.attendeeIds
      .filter(attendeeId => cityUserIds.has(attendeeId)) // Must live in the city
      .filter(attendeeId => canViewUser(attendeeId, friends)) // Must be visible
      .map(attendeeId => {
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
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Connections Events</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Events in {user?.residence || 'your city'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newEventButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Text style={[styles.newEventButtonText, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {events.length > 0 ? (
          events.map((event) => {
            const isInterested = interestedEvents.has(event.id);
            // Check if the host is the current user
            let hostName, hostInitials;
            if (event.hostId === CURRENT_USER_ID) {
              hostName = user?.name || 'You';
              hostInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : '👤';
            } else {
              const host = USERS_BY_ID.get(event.hostId);
              hostName = host?.name || 'Unknown';
              hostInitials = host?.name ? host.name.split(' ').map(n => n[0]).join('') : '👤';
            }
            const visibleAttendees = getVisibleAttendees(event);
            
            const isUserEvent = event.hostId === CURRENT_USER_ID;
            
            return (
              <View
                key={event.id}
                style={[
                  styles.eventCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  isUserEvent && styles.userEventCard,
                ]}
              >
                <View style={styles.eventCardContent}>
                  <View style={[styles.hostAvatarContainer, { backgroundColor: colors.primary }]}>
                    <Text style={styles.hostAvatar}>{hostInitials}</Text>
                  </View>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventHost, { color: colors.textPrimary }]}>{hostName}</Text>
                      <Text style={styles.eventTypeIcon}>{getEventIcon(event.type)}</Text>
                    </View>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                    <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>📍 {event.location}</Text>
                    <View style={styles.eventDetails}>
                      <Text style={[styles.eventDate, { color: colors.textSecondary }]}>🕐 {event.date}</Text>
                      <TouchableOpacity onPress={() => openAttendeesModal(event.id)}>
                        <Text style={[styles.eventAttendees, { color: colors.textSecondary }]}>👥 {visibleAttendees.length} going</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {isUserEvent ? (
                  <View style={styles.userEventActions}>
                    <TouchableOpacity
                      style={[styles.editButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                      onPress={() => openEditModal(event)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: 'transparent', borderColor: '#ef4444' }]}
                      onPress={() => handleDeleteEvent(event.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.removeButtonText, { color: '#ef4444' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.interestedButton,
                      isInterested && { backgroundColor: '#10b981' },
                      !isInterested && { backgroundColor: colors.cardBorder },
                    ]}
                    onPress={() => toggleInterest(event.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.interestedButtonText,
                      { color: isInterested ? '#ffffff' : colors.textSecondary }
                    ]}>
                      {isInterested ? '✓ Interested' : 'Interested?'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No events found from your connections in {user?.residence || 'your city'}
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

      {/* Edit Event Modal */}
      <Modal
        visible={editingEvent !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeEditModal}
          />
          <View style={[styles.editModalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.editModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.editModalTitle, { color: colors.textPrimary }]}>Edit Event</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeEditModal}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.editModalBody}
              contentContainerStyle={styles.editModalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.editInputSection}>
                <Text style={[styles.editInputLabel, { color: colors.textPrimary }]}>Title *</Text>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Event title"
                  placeholderTextColor={colors.textTertiary}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              <View style={styles.editInputSection}>
                <Text style={[styles.editInputLabel, { color: colors.textPrimary }]}>Time *</Text>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="e.g., Today, 4:00 PM"
                  placeholderTextColor={colors.textTertiary}
                  value={editTime}
                  onChangeText={setEditTime}
                />
              </View>

              <View style={styles.editInputSection}>
                <Text style={[styles.editInputLabel, { color: colors.textPrimary }]}>Destination *</Text>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Location"
                  placeholderTextColor={colors.textTertiary}
                  value={editDestination}
                  onChangeText={setEditDestination}
                />
              </View>

              <View style={styles.editInputSection}>
                <Text style={[styles.editInputLabel, { color: colors.textPrimary }]}>Description</Text>
                <TextInput
                  style={[
                    styles.editTextArea,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Add details about your event..."
                  placeholderTextColor={colors.textTertiary}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.updateButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateEvent}
                activeOpacity={0.8}
              >
                <Text style={styles.updateButtonText}>Update Event</Text>
              </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  newEventButton: {
    padding: 4,
  },
  newEventButtonText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
    color: '#14b8a6',
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
  userEventCard: {
    borderWidth: 3,
  },
  eventCardContent: {
    flexDirection: 'row',
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
  interestedButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  userEventActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
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
  eventHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    fontSize: 18,
  },
  editModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    maxHeight: '85%',
    minHeight: '50%',
    flexDirection: 'column',
  },
  editModalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    position: 'relative',
    flexShrink: 0,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  editModalBody: {
    flex: 1,
    flexGrow: 1,
  },
  editModalBodyContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  editInputSection: {
    marginBottom: 20,
  },
  editInputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editTextArea: {
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
  updateButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});


