import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { getMajorEventsByCity } from '../src/mock/events';
import { USERS_BY_ID, getUsersByCity } from '../src/mock/users';
import {
  canViewUser,
  toMockCityName,
  getVisibleUserIdsByCity,
  CURRENT_USER_ID,
} from '../src/social/visibility';
import { getConnectorFriends } from '../src/social/connections';
import { seedEventAttendees } from '../src/social/eventAttendees';
import useOpenChat from '../src/hooks/useOpenChat';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  Chip,
  EmptyState,
  PersonRow,
  BottomSheet,
  EventBackdrop,
  CategoryIcon,
  getInitials,
} from '../src/ui';

const EVENTS_API_BASE_URL = 'http://localhost:4000';

const DAY_NAME_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const toYmd = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayYmd = () => toYmd(new Date());

const getFutureYmd = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return toYmd(date);
};

const formatMonthDay = (ymd) => {
  if (!ymd) return '';
  const parsed = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return ymd;
  return parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatReadableDateRange = (startDate, endDate) => {
  if (!startDate) return 'Select date range';
  if (!endDate || endDate === startDate) return formatMonthDay(startDate);
  return `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}`;
};

const parseLegacyRelativeDate = (rawDate) => {
  if (!rawDate || typeof rawDate !== 'string') return null;
  const [dayLabel, timeLabel] = rawDate.split(',').map((part) => part.trim());
  if (!dayLabel) return null;

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  if (dayLabel === 'Tomorrow') {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (dayLabel !== 'Today') {
    const dayIndex = DAY_NAME_TO_INDEX[dayLabel];
    if (dayIndex === undefined) return null;
    const delta = (dayIndex - baseDate.getDay() + 7) % 7;
    baseDate.setDate(baseDate.getDate() + delta);
  }

  if (timeLabel) {
    const timeParts = timeLabel.split(' ');
    if (timeParts.length === 2) {
      const [clock, meridiem] = timeParts;
      const [hourStr, minuteStr] = clock.split(':');
      let hours = Number(hourStr);
      const minutes = Number(minuteStr || 0);
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      baseDate.setHours(hours, minutes, 0, 0);
    }
  }

  return baseDate;
};

const parseEventDate = (event) => {
  if (event?.startAt) {
    const parsed = new Date(event.startAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return parseLegacyRelativeDate(event?.date);
};

const getOccurrenceKey = (eventId, occurrence) => {
  const identifier = occurrence?.id || occurrence?.startAt || occurrence?.date || 'unknown';
  return `${eventId}::${identifier}`;
};

const normalizeGroupingText = (value) => {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b/g, ' ')
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/g, ' ')
    .replace(/\b\d{1,2}[:.]\d{2}\s?(am|pm)\b/g, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildDisplayGroupKey = (event) => {
  const attractionKey = (event?.attractionIds || []).join(',');
  const titleKey = normalizeGroupingText(event?.title);
  const cityKey = normalizeGroupingText(event?.city);
  if (attractionKey) return `${attractionKey}|${cityKey}`;
  return `${titleKey}|${cityKey}`;
};

const mergeEventsForDisplay = (events) => {
  const grouped = new Map();

  events.forEach((event) => {
    const key = buildDisplayGroupKey(event);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        ...event,
        occurrences: [...(event.occurrences || [])],
      });
      return;
    }

    const mergedOccurrences = [...(existing.occurrences || [])];
    (event.occurrences || []).forEach((incoming) => {
      const incomingKey = `${incoming.id || ''}|${incoming.startAt || incoming.date || ''}`;
      const existingIndex = mergedOccurrences.findIndex((item) => {
        const itemKey = `${item.id || ''}|${item.startAt || item.date || ''}`;
        return itemKey === incomingKey;
      });

      if (existingIndex === -1) {
        mergedOccurrences.push(incoming);
      } else {
        const mergedAttendeeIds = Array.from(
          new Set([...(mergedOccurrences[existingIndex].attendeeIds || []), ...(incoming.attendeeIds || [])])
        );
        mergedOccurrences[existingIndex] = {
          ...mergedOccurrences[existingIndex],
          attendeeIds: mergedAttendeeIds,
        };
      }
    });

    mergedOccurrences.sort((a, b) => {
      const left = a.startAt || a.date || '';
      const right = b.startAt || b.date || '';
      return left.localeCompare(right);
    });

    const earliest = mergedOccurrences[0] || {};
    grouped.set(key, {
      ...existing,
      startAt: earliest.startAt || existing.startAt,
      date: earliest.date || existing.date,
      url: earliest.url || existing.url,
      occurrences: mergedOccurrences,
      attendeeIds: Array.from(new Set(mergedOccurrences.flatMap((item) => item.attendeeIds || []))),
      occurrenceCount: mergedOccurrences.length,
      hasMultipleTimes: mergedOccurrences.length > 1,
      imageUrl: existing.imageUrl || event.imageUrl || null,
      description:
        existing.description && existing.description !== 'No description available.'
          ? existing.description
          : event.description,
    });
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const left = a.startAt || a.date || '';
    const right = b.startAt || b.date || '';
    return left.localeCompare(right);
  });
};

const prettyFilterLabel = (value) => {
  if (!value) return 'Other';
  return value
    .toString()
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
};

const getNeighborhoodLabel = (locationValue) => {
  if (!locationValue) return 'Unknown';
  const raw = locationValue.toString().trim();
  if (!raw) return 'Unknown';
  if (raw.includes(',')) {
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] || raw;
  }
  return raw;
};

const getOccurrenceHour = (occurrence) => {
  if (occurrence?.startAt) {
    const parsed = new Date(occurrence.startAt);
    if (!Number.isNaN(parsed.getTime())) return parsed.getHours();
  }

  const value = occurrence?.date;
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return hour;
};

const getOccurrenceMinute = (occurrence) => {
  if (occurrence?.startAt) {
    const parsed = new Date(occurrence.startAt);
    if (!Number.isNaN(parsed.getTime())) return parsed.getMinutes();
  }

  const value = occurrence?.date;
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;
  return Number(match[2] || 0);
};

const getOccurrenceTimeMeta = (occurrence) => {
  const hour = getOccurrenceHour(occurrence);
  const minute = getOccurrenceMinute(occurrence);
  if (hour === null || hour === undefined || minute === null || minute === undefined) {
    return null;
  }

  const key = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const displayDate = new Date();
  displayDate.setHours(hour, minute, 0, 0);
  const label = displayDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return { key, label, sortValue: hour * 60 + minute };
};

export default function LocalEventsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { openDirectMessage } = useOpenChat();
  const { user } = useUser();
  const { friends } = useFriends();

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [rangeStart, setRangeStart] = useState(getTodayYmd());
  const [rangeEnd, setRangeEnd] = useState(getFutureYmd(7));
  const [isSelectingRangeEnd, setIsSelectingRangeEnd] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [genreFilters, setGenreFilters] = useState([]);
  const [timeFilters, setTimeFilters] = useState([]);
  const [peopleFilters, setPeopleFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [detailsEventId, setDetailsEventId] = useState(null);

  // Fallback to local mock data when backend/API is unavailable
  const fallbackEvents = useMemo(() => {
    if (!user?.residence) {
      return [];
    }
    return getMajorEventsByCity(toMockCityName(user.residence), friends);
  }, [user?.residence, friends]);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      if (!user?.residence || !rangeStart || !rangeEnd) {
        if (isMounted) {
          setLiveEvents([]);
          setEventsError(null);
        }
        return;
      }

      setIsLoadingEvents(true);
      setEventsError(null);

      try {
        const query = new URLSearchParams({
          city: user.residence,
          startDate: rangeStart,
          endDate: rangeEnd,
          size: '50',
        });

        const response = await fetch(`${EVENTS_API_BASE_URL}/events?${query.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to fetch events.');
        }

        const normalizedEvents = (payload?.events || []).map((event) => ({
          ...event,
          attendeeIds: event.attendeeIds || [],
          occurrences: event.occurrences || [],
          isMajor: Boolean(event.isMajor),
          genre: event.genre || event.type || 'Other',
          segment: event.segment || event.type || 'Event',
          attractionIds: event.attractionIds || [],
        }));

        if (isMounted) {
          setLiveEvents(normalizedEvents);
        }
      } catch (error) {
        if (isMounted) {
          setLiveEvents([]);
          setEventsError(error.message || 'Unable to fetch live events.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingEvents(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [user?.residence, rangeStart, rangeEnd]);

  // Track attendee modifications per event occurrence (eventId::occurrenceId -> attendeeIds array)
  const [occurrenceAttendees, setOccurrenceAttendees] = useState(new Map());
  
  // Track which events the user is interested in (using event IDs)
  const [interestedEvents, setInterestedEvents] = useState(new Set());

  // People from your network who live in this city — the pool live events draw
  // their attendees from.
  const attendeePool = useMemo(() => {
    if (!user?.residence) return [];
    return getVisibleUserIdsByCity(toMockCityName(user.residence), friends);
  }, [user?.residence, friends]);

  const sourceEvents = useMemo(() => {
    const normalizeEvent = (event) => {
      const withSeed = (occurrenceId, existing) =>
        existing && existing.length > 0 ? existing : seedEventAttendees(occurrenceId, attendeePool);

      return {
        ...event,
        genre: event.genre || event.type || 'Other',
        segment: event.segment || event.type || 'Event',
        isMajor: event.isMajor !== undefined ? event.isMajor : true,
        attractionIds: event.attractionIds || [],
        occurrences:
          event.occurrences && event.occurrences.length > 0
            ? event.occurrences.map((occurrence) => ({
                ...occurrence,
                attendeeIds: withSeed(
                  `${event.id}:${occurrence.id || occurrence.startAt || occurrence.date}`,
                  occurrence.attendeeIds || event.attendeeIds
                ),
              }))
            : [
                {
                  id: event.id,
                  startAt: event.startAt || null,
                  date: event.date || 'TBD',
                  url: event.url || null,
                  attendeeIds: withSeed(event.id, event.attendeeIds),
                },
              ],
      };
    };

    const normalizedSource = eventsError
      ? fallbackEvents.map(normalizeEvent)
      : liveEvents.map(normalizeEvent);

    return mergeEventsForDisplay(normalizedSource);
  }, [eventsError, liveEvents, fallbackEvents, attendeePool]);

  // Get events with current attendee state
  const events = useMemo(() => {
    return sourceEvents.map(event => {
      const mappedOccurrences = (event.occurrences || []).map((occurrence) => {
        const key = getOccurrenceKey(event.id, occurrence);
        const modified = occurrenceAttendees.get(key);
        const attendeeIds =
          modified !== undefined
            ? modified
            : (occurrence.attendeeIds || event.attendeeIds || []);

        return {
          ...occurrence,
          attendeeIds: attendeeIds || [],
        };
      });

      const attendeeIds = Array.from(
        new Set(mappedOccurrences.flatMap((occurrence) => occurrence.attendeeIds || []))
      );
      return {
        ...event,
        occurrences: mappedOccurrences,
        attendeeIds: attendeeIds || [],
      };
    });
  }, [sourceEvents, occurrenceAttendees]);

  const displayedEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = parseEventDate(event);
      if (!eventDate || !rangeStart) return false;
      const eventYmd = toYmd(eventDate);
      if (eventYmd < rangeStart || eventYmd > rangeEnd) return false;

      if (genreFilters.length > 0) {
        const genreCandidates = [
          (event.genre || '').toString().toLowerCase(),
          (event.segment || '').toString().toLowerCase(),
          (event.type || '').toString().toLowerCase(),
        ].filter(Boolean);
        const hasGenreMatch = genreFilters.some((selectedGenre) =>
          genreCandidates.includes(selectedGenre)
        );
        if (!hasGenreMatch) return false;
      }

      if (locationFilters.length > 0) {
        const neighborhood = getNeighborhoodLabel(event.location).toLowerCase();
        if (!locationFilters.includes(neighborhood)) return false;
      }

      if (timeFilters.length > 0) {
        const occurrences = event.occurrences || [];
        const hasMatchingTime = occurrences.some((occurrence) => {
          const timeMeta = getOccurrenceTimeMeta(occurrence);
          return timeMeta && timeFilters.includes(timeMeta.key);
        });
        if (!hasMatchingTime) return false;
      }

      const visibleAttendeeCount = (event.attendeeIds || []).length;
      if (peopleFilters.length > 0) {
        const hasPeopleMatch = peopleFilters.some((minimum) => visibleAttendeeCount >= minimum);
        if (!hasPeopleMatch) return false;
      }

      return true;
    });
  }, [events, rangeStart, rangeEnd, genreFilters, timeFilters, peopleFilters, locationFilters]);

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
    return displayedEvents.find((event) => event.id === modalVisible);
  };

  const getDetailsEvent = () => {
    return displayedEvents.find((event) => event.id === detailsEventId);
  };

  const openDetailsModal = (eventId) => {
    setDetailsEventId(eventId);
  };

  const closeDetailsModal = () => {
    setDetailsEventId(null);
  };

  const genreOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        events.flatMap((event) => [
          (event.segment || '').toString().toLowerCase(),
          (event.genre || '').toString().toLowerCase(),
          (event.type || '').toString().toLowerCase(),
        ])
      )
    )
      .filter((value) => value && value !== 'event')
      .sort();
    return values;
  }, [events]);

  const locationOptions = useMemo(() => {
    const values = Array.from(
      new Set(events.map((event) => getNeighborhoodLabel(event.location).toLowerCase()).filter(Boolean))
    ).sort();
    return values;
  }, [events]);

  const timesOptions = useMemo(() => {
    const entries = new Map();
    events.forEach((event) => {
      (event.occurrences || []).forEach((occurrence) => {
        const timeMeta = getOccurrenceTimeMeta(occurrence);
        if (!timeMeta) return;
        if (!entries.has(timeMeta.key)) {
          entries.set(timeMeta.key, { id: timeMeta.key, label: timeMeta.label, sortValue: timeMeta.sortValue });
        }
      });
    });

    return Array.from(entries.values())
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(({ id, label }) => ({ id, label }));
  }, [events]);

  const peopleOptions = useMemo(
    () => [
      { value: 1, label: '1+' },
      { value: 3, label: '3+' },
      { value: 5, label: '5+' },
      { value: 10, label: '10+' },
    ],
    []
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genreFilters.length > 0) count += 1;
    if (timeFilters.length > 0) count += 1;
    if (peopleFilters.length > 0) count += 1;
    if (locationFilters.length > 0) count += 1;
    return count;
  }, [genreFilters, timeFilters, peopleFilters, locationFilters]);

  const toggleMultiSelectValue = (setter, value) => {
    setter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const clearAllFilters = () => {
    setGenreFilters([]);
    setTimeFilters([]);
    setPeopleFilters([]);
    setLocationFilters([]);
  };

  const formatOccurrenceDate = (occurrence) => {
    if (occurrence?.startAt) {
      const parsed = new Date(occurrence.startAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    }
    return occurrence?.date || 'TBD';
  };

  const formatEventDate = (event) => {
    if (event?.startAt) {
      const parsed = new Date(event.startAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    }
    return event?.date || 'TBD';
  };

  const onCalendarDayPress = (day) => {
    const picked = day.dateString;

    if (!isSelectingRangeEnd) {
      setRangeStart(picked);
      setRangeEnd(picked);
      setIsSelectingRangeEnd(true);
      return;
    }

    if (picked < rangeStart) {
      setRangeStart(picked);
      setRangeEnd(rangeStart || picked);
    } else {
      setRangeEnd(picked);
    }
    setIsSelectingRangeEnd(false);
  };

  const clearDateRange = () => {
    const today = getTodayYmd();
    setRangeStart(today);
    setRangeEnd(getFutureYmd(7));
    setIsSelectingRangeEnd(false);
  };

  const markedDates = useMemo(() => {
    if (!rangeStart) return {};
    const end = rangeEnd || rangeStart;

    if (rangeStart === end) {
      return {
        [rangeStart]: {
          selected: true,
          selectedColor: colors.primary,
        },
      };
    }

    const marks = {};
    const cursor = new Date(`${rangeStart}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    while (cursor <= endDate) {
      const ymd = toYmd(cursor);
      marks[ymd] = {
        color: colors.primary,
        textColor: colors.onPrimary,
        startingDay: ymd === rangeStart,
        endingDay: ymd === end,
      };
      cursor.setDate(cursor.getDate() + 1);
    }

    return marks;
  }, [rangeStart, rangeEnd, colors.primary]);

  const toggleOccurrenceInterest = (event, occurrence) => {
    if (!event || !occurrence) return;

    const occurrenceKey = getOccurrenceKey(event.id, occurrence);

    setOccurrenceAttendees((prevMap) => {
      const newMap = new Map(prevMap);
      const existing = newMap.get(occurrenceKey);
      const baseAttendees =
        existing !== undefined
          ? existing
          : (occurrence.attendeeIds || event.attendeeIds || []);
      const nextAttendees = baseAttendees.includes(CURRENT_USER_ID)
        ? baseAttendees.filter((id) => id !== CURRENT_USER_ID)
        : [...baseAttendees, CURRENT_USER_ID];

      newMap.set(occurrenceKey, nextAttendees);
      return newMap;
    });
  };

  // Get visible attendees for an event (only those who live in the city and are visible, plus current user)
  const getVisibleAttendees = (event, attendeeIdsOverride = null) => {
    if (!event || !user?.residence) return [];
    const cityUserIds = new Set(
      getUsersByCity(toMockCityName(user.residence)).map((cityUser) => cityUser.id)
    );

    const attendeeIds = attendeeIdsOverride || event.attendeeIds || [];

    return attendeeIds
      .filter((attendeeId) => {
        // Current user is always shown, others must live in the city
        if (attendeeId === CURRENT_USER_ID) return true;
        return cityUserIds.has(attendeeId);
      })
      .filter((attendeeId) => canViewUser(attendeeId, friends))
      .map((attendeeId) => {
        const isCurrentUser = attendeeId === CURRENT_USER_ID;
        const attendee = isCurrentUser ? { name: user?.name || 'You' } : USERS_BY_ID.get(attendeeId);
        const name = attendee?.name || 'Unknown';
        return {
          id: attendeeId,
          name,
          avatar: getInitials(name),
          photoUrl: attendee?.photoUrl || null,
          city: attendee?.city,
          isCurrentUser,
          connectors: isCurrentUser ? [] : getConnectorFriends(attendeeId, friends),
        };
      });
  };

  return (
    <Screen>
      <ScreenHeader title="Local" subtitle={`Events in ${user?.residence || 'your city'}`}>
        <View style={styles.headerControls}>
          <Chip
            label={`📅  ${formatReadableDateRange(rangeStart, rangeEnd)}`}
            onPress={() => setCalendarVisible(true)}
          />
          <Chip
            label={activeFiltersCount > 0 ? `Filters · ${activeFiltersCount}` : 'Filters'}
            selected={activeFiltersCount > 0}
            onPress={() => setFiltersVisible(true)}
          />
        </View>
      </ScreenHeader>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingEvents ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading events…</Text>
          </View>
        ) : null}
        {eventsError ? (
          <Text style={[styles.fetchErrorText, { color: colors.textSecondary }]}>
            Live events unavailable — showing saved data.
          </Text>
        ) : null}
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => {
            const going = interestedEvents.has(event.id);
            const attendeeCount = getVisibleAttendees(event).length;

            return (
              <Card key={event.id} style={styles.eventCard} onPress={() => openDetailsModal(event.id)}>
                <EventBackdrop event={event} height={190} width={340} />
                <View style={styles.eventCardTop}>
                  <View style={[styles.eventIconContainer, { backgroundColor: colors.primaryMuted }]}>
                    <CategoryIcon event={event} color={colors.primary} size={24} />
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                      {event.location}
                    </Text>
                    <Text style={[styles.eventMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                      {formatEventDate(event)}
                    </Text>
                    <View style={styles.eventTagRow}>
                      <TouchableOpacity
                        onPress={() => openAttendeesModal(event.id)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={[styles.eventTag, { color: colors.primary }]}>
                          {attendeeCount} going
                        </Text>
                      </TouchableOpacity>
                      {event.occurrences?.length > 1 ? (
                        <Text style={[styles.eventTag, { color: colors.textTertiary }]}>
                          {event.occurrences.length} times
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <Button
                  label={going ? 'Going ✓  ·  Manage times' : "I'm going  ·  Pick a time"}
                  variant={going ? 'primary' : 'secondary'}
                  onPress={() => openDetailsModal(event.id)}
                  fullWidth
                  style={styles.eventAction}
                />
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="🗓️"
            title="No events found"
            message={`Nothing between ${formatReadableDateRange(rangeStart, rangeEnd)}. Try a wider date range or clearing filters.`}
            actionLabel={activeFiltersCount > 0 ? 'Clear filters' : undefined}
            onAction={activeFiltersCount > 0 ? clearAllFilters : undefined}
          />
        )}
      </ScrollView>

      <BottomSheet
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        title="Pick a date range"
        subtitle="Tap once for the start date, again for the end"
        footer={
          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="secondary"
              onPress={clearDateRange}
              style={styles.sheetAction}
            />
            <Button
              label="Apply"
              onPress={() => setCalendarVisible(false)}
              style={styles.sheetAction}
            />
          </View>
        }
      >
        <View style={styles.calendarContainer}>
          <Calendar
            markingType="period"
            markedDates={markedDates}
            onDayPress={onCalendarDayPress}
            theme={{
              calendarBackground: colors.card,
              dayTextColor: colors.textPrimary,
              monthTextColor: colors.textPrimary,
              arrowColor: colors.primary,
              todayTextColor: colors.primary,
              textDisabledColor: colors.textTertiary,
            }}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={detailsEventId !== null}
        onClose={closeDetailsModal}
        title={getDetailsEvent()?.title || 'Event'}
        subtitle={getDetailsEvent()?.location}
      >
        <ScrollView style={styles.detailsScroll} contentContainerStyle={styles.detailsContent}>
          {getDetailsEvent()?.imageUrl ? (
            <Image
              source={{ uri: getDetailsEvent().imageUrl }}
              style={[styles.detailsImage, { backgroundColor: colors.backgroundSecondary }]}
              resizeMode="cover"
            />
          ) : null}

          <Text style={[styles.detailsSectionTitle, { color: colors.textPrimary }]}>About</Text>
          <Text style={[styles.detailsDescription, { color: colors.textSecondary }]}>
            {getDetailsEvent()?.description || 'No description available.'}
          </Text>

          <Text style={[styles.detailsSectionTitle, { color: colors.textPrimary }]}>
            Dates &amp; times · {getDetailsEvent()?.occurrences?.length || 1}
          </Text>
          {(
            getDetailsEvent()?.occurrences || [
              {
                date: getDetailsEvent()?.date || 'TBD',
                attendeeIds: getDetailsEvent()?.attendeeIds || [],
              },
            ]
          ).map((occurrence, index) => {
            const detailsEvent = getDetailsEvent();
            const visibleCount = detailsEvent
              ? getVisibleAttendees(detailsEvent, occurrence.attendeeIds || []).length
              : 0;
            const userGoing = (occurrence.attendeeIds || []).includes(CURRENT_USER_ID);

            return (
              <View
                key={`${occurrence.id || index}-${occurrence.startAt || occurrence.date}`}
                style={[styles.occurrenceRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.occurrenceRowTop}>
                  <Text style={[styles.occurrenceText, { color: colors.textPrimary }]}>
                    {formatOccurrenceDate(occurrence)}
                  </Text>
                  <Text style={[styles.occurrenceCountText, { color: colors.textSecondary }]}>
                    {visibleCount} going
                  </Text>
                </View>
                <Button
                  label={userGoing ? "I'm going ✓" : "I'm going"}
                  variant={userGoing ? 'primary' : 'secondary'}
                  size="sm"
                  fullWidth
                  style={{ marginTop: 8 }}
                  onPress={() => {
                    if (detailsEvent) {
                      toggleOccurrenceInterest(detailsEvent, occurrence);
                    }
                  }}
                />
              </View>
            );
          })}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        title="Filters"
        subtitle="Genre, times, people attending, location"
        footer={
          <View style={styles.sheetActions}>
            <Button
              label="Clear all"
              variant="secondary"
              onPress={clearAllFilters}
              style={styles.sheetAction}
            />
            <Button
              label="Apply"
              onPress={() => setFiltersVisible(false)}
              style={styles.sheetAction}
            />
          </View>
        }
      >
        <ScrollView style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {[
            {
              title: 'Genre',
              options: genreOptions.map((genre) => ({ id: genre, label: prettyFilterLabel(genre) })),
              selected: genreFilters,
              setter: setGenreFilters,
            },
            {
              title: 'Times',
              options: timesOptions,
              selected: timeFilters,
              setter: setTimeFilters,
            },
            {
              title: 'People attending',
              options: peopleOptions.map((option) => ({ id: option.value, label: option.label })),
              selected: peopleFilters,
              setter: setPeopleFilters,
            },
            {
              title: 'Location',
              options: locationOptions.map((location) => ({
                id: location,
                label: prettyFilterLabel(location),
              })),
              selected: locationFilters,
              setter: setLocationFilters,
            },
          ].map((section) => (
            <View key={section.title} style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>
                {section.title}
              </Text>
              {section.options.length > 0 ? (
                <View style={styles.filterOptionsWrap}>
                  {section.options.map((option) => (
                    <Chip
                      key={`${section.title}-${option.id}`}
                      label={option.label}
                      selected={section.selected.includes(option.id)}
                      onPress={() => toggleMultiSelectValue(section.setter, option.id)}
                    />
                  ))}
                </View>
              ) : (
                <Text style={[styles.filterEmptyText, { color: colors.textTertiary }]}>
                  Nothing to filter on yet.
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </BottomSheet>

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
                  message="Be the first from your network to say you're going."
                />
              );
            }

            return visibleAttendees.map((attendee) => (
              <PersonRow
                key={attendee.id}
                name={attendee.name}
                avatarUri={attendee.photoUrl}
                subtitle={attendee.isCurrentUser ? 'You' : attendee.city}
                connectors={attendee.connectors}
                onPress={
                  attendee.isCurrentUser
                    ? undefined
                    : () => {
                        closeAttendeesModal();
                        navigation.navigate('FriendProfile', { userId: attendee.id });
                      }
                }
                onMessage={
                  attendee.isCurrentUser
                    ? undefined
                    : () => {
                        // Close first — otherwise the sheet stays up over the Chat tab.
                        const event = getCurrentEvent();
                        closeAttendeesModal();
                        openDirectMessage(attendee.id, {
                          kind: 'event',
                          label: 'going to',
                          eventTitle: event?.title,
                          imageUrl: event?.imageUrl || null,
                        });
                      }
                }
              />
            ));
          })()}
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  loadingState: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  fetchErrorText: {
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  eventCard: {
    marginBottom: 12,
  },
  eventCardTop: {
    flexDirection: 'row',
  },
  eventIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventIcon: {
    fontSize: 22,
  },
  eventContent: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
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
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetAction: {
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 18,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  filterOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterEmptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailsScroll: {
    flexGrow: 0,
  },
  detailsContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  detailsImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
  },
  detailsDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  occurrenceRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  occurrenceRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  occurrenceText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  occurrenceCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendeesList: {
    flexGrow: 0,
  },
  attendeesListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
});
