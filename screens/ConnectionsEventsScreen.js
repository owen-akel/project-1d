import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { getConnectionEventsByCity } from '../src/mock/events';
import { USERS_BY_ID, getUsersByCity } from '../src/mock/users';
import { canViewUser, toMockCityName, CURRENT_USER_ID } from '../src/social/visibility';
import { getConnectorFriends } from '../src/social/connections';
import useOpenChat from '../src/hooks/useOpenChat';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  Avatar,
  EmptyState,
  PersonRow,
  BottomSheet,
  EventBackdrop,
  CategoryIcon,
  getInitials,
} from '../src/ui';

export default function ConnectionsEventsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();
  const { friends } = useFriends();
  const { openDirectMessage } = useOpenChat();

  // Store user-created events
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);

  // Filter events by residence and friend visibility
  const filteredEvents = useMemo(() => {
    if (!user?.residence) {
      return [];
    }
    const cityEvents = getConnectionEventsByCity(toMockCityName(user.residence), friends);
    
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
    const cityUserIds = new Set(
      getUsersByCity(toMockCityName(user.residence)).map((cityUser) => cityUser.id)
    );

    return event.attendeeIds
      .filter((attendeeId) => cityUserIds.has(attendeeId)) // Must live in the city
      .filter((attendeeId) => canViewUser(attendeeId, friends)) // Must be visible
      .map((attendeeId) => {
        const attendee = USERS_BY_ID.get(attendeeId);
        const name = attendee?.name || 'Unknown';
        return {
          id: attendeeId,
          name,
          avatar: getInitials(name),
          photoUrl: attendee?.photoUrl || null,
          city: attendee?.city,
          connectors: getConnectorFriends(attendeeId, friends),
        };
      });
  };

  return (
    <Screen>
      <ScreenHeader
        title="Connections"
        subtitle={`What friends are doing in ${user?.residence || 'your city'}`}
        right={
          <Button
            label="+ New"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate('CreateEvent')}
          />
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {events.length > 0 ? (
          events.map((event) => {
            const isInterested = interestedEvents.has(event.id);
            // Check if the host is the current user
            let hostName, hostPhoto;
            if (event.hostId === CURRENT_USER_ID) {
              hostName = user?.name || 'You';
              hostPhoto = user?.photo || null;
            } else {
              const host = USERS_BY_ID.get(event.hostId);
              hostName = host?.name || 'Unknown';
              hostPhoto = host?.photoUrl || null;
            }
            const visibleAttendees = getVisibleAttendees(event);
            
            const isUserEvent = event.hostId === CURRENT_USER_ID;
            
            return (
              <Card
                key={event.id}
                style={[
                  styles.eventCard,
                  isUserEvent && { borderColor: colors.primary, borderWidth: 1 },
                ]}
              >
                <EventBackdrop event={event} height={180} width={340} />
                <View style={styles.eventCardContent}>
                  <Avatar name={hostName} uri={hostPhoto} size="md" />
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventHost, { color: colors.textSecondary }]} numberOfLines={1}>
                        {isUserEvent ? 'You' : hostName}
                      </Text>
                      {!isUserEvent ? (
                        <TouchableOpacity
                          onPress={() =>
                            openDirectMessage(event.hostId, {
                              kind: 'event',
                              label: 'posting',
                              eventTitle: event.title,
                              imageUrl: event.imageUrl || null,
                            })
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          accessibilityRole="button"
                          accessibilityLabel={`Message ${hostName} about ${event.title}`}
                        >
                          <Text style={styles.eventHostMessage}>💬</Text>
                        </TouchableOpacity>
                      ) : null}
                      <CategoryIcon event={event} color={colors.textTertiary} size={18} />
                    </View>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                      {event.location}
                    </Text>
                    <View style={styles.eventTagRow}>
                      <Text style={[styles.eventTag, { color: colors.textTertiary }]}>{event.date}</Text>
                      <TouchableOpacity
                        onPress={() => openAttendeesModal(event.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={[styles.eventTag, { color: colors.primary }]}>
                          {visibleAttendees.length} going
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {isUserEvent ? (
                  <View style={styles.userEventActions}>
                    <Button
                      label="Edit"
                      variant="secondary"
                      size="sm"
                      style={styles.eventActionButton}
                      onPress={() => openEditModal(event)}
                    />
                    <Button
                      label="Remove"
                      variant="danger"
                      size="sm"
                      style={styles.eventActionButton}
                      onPress={() => handleDeleteEvent(event.id)}
                    />
                  </View>
                ) : (
                  <Button
                    label={isInterested ? "I'm in ✓" : "I'm interested"}
                    variant={isInterested ? 'primary' : 'secondary'}
                    fullWidth
                    style={styles.eventAction}
                    onPress={() => toggleInterest(event.id)}
                  />
                )}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="🤝"
            title="Nothing from your connections"
            message={`No one in your network has posted an event in ${user?.residence || 'your city'} yet. Start one.`}
            actionLabel="Create an event"
            onAction={() => navigation.navigate('CreateEvent')}
          />
        )}
      </ScrollView>
      <BottomSheet
        visible={modalVisible !== null}
        onClose={closeAttendeesModal}
        title={getCurrentEvent()?.title || 'Event'}
        subtitle="People going"
      >
        <ScrollView
          style={styles.attendeesList}
          contentContainerStyle={styles.attendeesListContent}
          showsVerticalScrollIndicator
        >
          {(() => {
            const currentEvent = getCurrentEvent();
            const visibleAttendees = currentEvent ? getVisibleAttendees(currentEvent) : [];

            if (visibleAttendees.length === 0) {
              return (
                <EmptyState
                  icon="👥"
                  title="Nobody yet"
                  message="No one from your network has said they're going."
                />
              );
            }

            return visibleAttendees.map((attendee) => (
              <PersonRow
                key={attendee.id}
                name={attendee.name}
                avatarUri={attendee.photoUrl}
                subtitle={attendee.city}
                connectors={attendee.connectors}
                onPress={() => {
                  closeAttendeesModal();
                  navigation.navigate('FriendProfile', { userId: attendee.id });
                }}
                onMessage={() => {
                  // Close first — otherwise the sheet stays up over the Chat tab.
                  const event = getCurrentEvent();
                  const hosted = event && attendee.id === event.hostId;
                  closeAttendeesModal();
                  openDirectMessage(attendee.id, {
                    kind: 'event',
                    label: hosted ? 'posting' : 'going to',
                    eventTitle: event?.title,
                    imageUrl: event?.imageUrl || null,
                  });
                }}
              />
            ));
          })()}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={editingEvent !== null}
        onClose={closeEditModal}
        title="Edit event"
        footer={<Button label="Update event" fullWidth onPress={handleUpdateEvent} />}
      >
        <ScrollView
          style={styles.editModalBody}
          contentContainerStyle={styles.editModalBodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {[
            { label: 'Title', placeholder: 'Event title', value: editTitle, onChange: setEditTitle },
            {
              label: 'Time',
              placeholder: 'e.g. Today, 4:00 PM',
              value: editTime,
              onChange: setEditTime,
            },
            {
              label: 'Destination',
              placeholder: 'Location',
              value: editDestination,
              onChange: setEditDestination,
            },
          ].map((field) => (
            <View key={field.label} style={styles.editInputSection}>
              <Text style={[styles.editInputLabel, { color: colors.textPrimary }]}>{field.label}</Text>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textTertiary}
                value={field.value}
                onChangeText={field.onChange}
              />
            </View>
          ))}

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
              placeholder="Add details about your event…"
              placeholderTextColor={colors.textTertiary}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventCardContent: {
    flexDirection: 'row',
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eventHost: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  eventHostMessage: {
    fontSize: 13,
    marginLeft: 8,
  },
  eventTypeIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  eventMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventTagRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  eventTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventAction: {
    marginTop: 14,
  },
  userEventActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  eventActionButton: {
    flex: 1,
  },
  attendeesList: {
    flexGrow: 0,
  },
  attendeesListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  editModalBody: {
    flexGrow: 0,
  },
  editModalBodyContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
  },
  editInputSection: {
    marginBottom: 16,
  },
  editInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  editTextArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 96,
  },
});