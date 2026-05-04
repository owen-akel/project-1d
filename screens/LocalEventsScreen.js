import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useFriends } from '../context/FriendsContext';
import { getMajorEventsByCity } from '../src/mock/events';
import { USERS_BY_ID, getUsersByCity } from '../src/mock/users';

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
    const mockCityName = mapCityNameToMockCity(user.residence);
    return getMajorEventsByCity(mockCityName, friends);
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

  const sourceEvents = useMemo(() => {
    const normalizeEvent = (event) => ({
      ...event,
      genre: event.genre || event.type || 'Other',
      segment: event.segment || event.type || 'Event',
      isMajor: event.isMajor !== undefined ? event.isMajor : true,
      attractionIds: event.attractionIds || [],
      occurrences:
        event.occurrences && event.occurrences.length > 0
          ? event.occurrences.map((occurrence) => ({
              ...occurrence,
              attendeeIds: occurrence.attendeeIds || event.attendeeIds || [],
            }))
          : [
              {
                id: event.id,
                startAt: event.startAt || null,
                date: event.date || 'TBD',
                url: event.url || null,
                attendeeIds: event.attendeeIds || [],
              },
            ],
    });

    const normalizedSource = eventsError
      ? fallbackEvents.map(normalizeEvent)
      : liveEvents.map(normalizeEvent);

    return mergeEventsForDisplay(normalizedSource);
  }, [eventsError, liveEvents, fallbackEvents]);

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
        textColor: '#ffffff',
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
    
    const attendeeIds = attendeeIdsOverride || event.attendeeIds || [];

    return attendeeIds
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
        <TouchableOpacity
          style={[styles.dateRangeButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          activeOpacity={0.75}
          onPress={() => setCalendarVisible(true)}
        >
          <Text style={[styles.dateRangeButtonText, { color: colors.textPrimary }]}>
            Date Range: {formatReadableDateRange(rangeStart, rangeEnd)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          activeOpacity={0.75}
          onPress={() => setFiltersVisible(true)}
        >
          <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>
            Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoadingEvents ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading events...</Text>
          </View>
        ) : null}
        {eventsError ? (
          <Text style={[styles.fetchErrorText, { color: colors.textSecondary }]}>
            Live events unavailable. Showing local data.
          </Text>
        ) : null}
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => {
            return (
              <View
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={styles.eventCardTop}>
                  <TouchableOpacity
                    style={styles.eventDetailsTapArea}
                    onPress={() => openDetailsModal(event.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.eventIconContainer}>
                      <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                      <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>📍 {event.location}</Text>
                      <View style={styles.eventDetails}>
                        <Text style={[styles.eventDate, { color: colors.textSecondary }]}>🕐 {formatEventDate(event)}</Text>
                        <TouchableOpacity
                          onPress={() => openAttendeesModal(event.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.eventAttendees, { color: colors.textSecondary }]}>
                            👥 {getVisibleAttendees(event).length} going
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {event.occurrences?.length > 1 ? (
                        <Text style={[styles.multiTimeText, { color: colors.textSecondary }]}>
                          {event.occurrences.length} available times - tap for details
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.interestedButton,
                    {
                      backgroundColor: interestedEvents.has(event.id) ? colors.primary : colors.backgroundSecondary,
                      borderColor: interestedEvents.has(event.id) ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => openDetailsModal(event.id)}
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
                    {interestedEvents.has(event.id) ? 'Going ✓ (Manage Times)' : "I'm Going (Pick Time)"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No events found between {rangeStart} and {rangeEnd}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={calendarVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCalendarVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Pick Date Range</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Tap once for start date, tap again for end date
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
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
                  textDisabledColor: colors.textSecondary,
                }}
              />
            </View>
            <View style={styles.calendarActions}>
              <TouchableOpacity
                style={[styles.calendarActionButton, { borderColor: colors.border }]}
                onPress={clearDateRange}
              >
                <Text style={[styles.calendarActionButtonText, { color: colors.textPrimary }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calendarActionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setCalendarVisible(false)}
              >
                <Text style={[styles.calendarActionButtonText, { color: '#ffffff' }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsEventId !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeDetailsModal}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {getDetailsEvent()?.title}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {getDetailsEvent()?.location}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeDetailsModal}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.detailsScroll} contentContainerStyle={styles.detailsContent}>
              {getDetailsEvent()?.imageUrl ? (
                <Image
                  source={{ uri: getDetailsEvent().imageUrl }}
                  style={styles.detailsImage}
                  resizeMode="cover"
                />
              ) : null}
              <Text style={[styles.detailsSectionTitle, { color: colors.textPrimary }]}>Description</Text>
              <Text style={[styles.detailsDescription, { color: colors.textSecondary }]}>
                {getDetailsEvent()?.description || 'No description available.'}
              </Text>

              <Text style={[styles.detailsSectionTitle, { color: colors.textPrimary }]}>
                Dates & Times ({getDetailsEvent()?.occurrences?.length || 1})
              </Text>
              {(getDetailsEvent()?.occurrences || [{ date: getDetailsEvent()?.date || 'TBD', attendeeIds: getDetailsEvent()?.attendeeIds || [] }]).map((occurrence, index) => {
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
                        👥 {visibleCount} going
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.occurrenceGoingButton,
                        {
                          backgroundColor: userGoing ? colors.primary : colors.backgroundSecondary,
                          borderColor: userGoing ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        if (detailsEvent) {
                          toggleOccurrenceInterest(detailsEvent, occurrence);
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.occurrenceGoingButtonText,
                          { color: userGoing ? '#ffffff' : colors.textPrimary },
                        ]}
                      >
                        {userGoing ? "I'm Going ✓" : "I'm Going"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={filtersVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setFiltersVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filters</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Genre, Times, People Attending, Location
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setFiltersVisible(false)}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalScroll} contentContainerStyle={styles.filterModalContent}>
              <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>Genre</Text>
              <View style={styles.filterOptionsWrap}>
                {genreOptions.map((genre) => {
                  const selected = genreFilters.includes(genre);
                  return (
                    <TouchableOpacity
                      key={`genre-${genre}`}
                      style={[
                        styles.filterChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : colors.card,
                        },
                      ]}
                      onPress={() => toggleMultiSelectValue(setGenreFilters, genre)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: selected ? '#ffffff' : colors.textPrimary },
                        ]}
                      >
                        {prettyFilterLabel(genre)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>Times</Text>
              <View style={styles.filterOptionsWrap}>
                {timesOptions.map((option) => {
                  const selected = timeFilters.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={`times-${option.id}`}
                      style={[
                        styles.filterChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : colors.card,
                        },
                      ]}
                      onPress={() => toggleMultiSelectValue(setTimeFilters, option.id)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: selected ? '#ffffff' : colors.textPrimary },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>People Attending</Text>
              <View style={styles.filterOptionsWrap}>
                {peopleOptions.map((option) => {
                  const selected = peopleFilters.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={`people-${option.value}`}
                      style={[
                        styles.filterChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : colors.card,
                        },
                      ]}
                      onPress={() => toggleMultiSelectValue(setPeopleFilters, option.value)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: selected ? '#ffffff' : colors.textPrimary },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.filterSectionTitle, { color: colors.textPrimary }]}>Location</Text>
              <View style={styles.filterOptionsWrap}>
                {locationOptions.map((locationOption) => {
                  const selected = locationFilters.includes(locationOption);
                  return (
                    <TouchableOpacity
                      key={`location-${locationOption}`}
                      style={[
                        styles.filterChip,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : colors.card,
                        },
                      ]}
                      onPress={() => toggleMultiSelectValue(setLocationFilters, locationOption)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: selected ? '#ffffff' : colors.textPrimary },
                        ]}
                      >
                        {prettyFilterLabel(locationOption)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.filterActionsRow}>
              <TouchableOpacity
                style={[styles.calendarActionButton, { borderColor: colors.border }]}
                onPress={clearAllFilters}
              >
                <Text style={[styles.calendarActionButtonText, { color: colors.textPrimary }]}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calendarActionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setFiltersVisible(false)}
              >
                <Text style={[styles.calendarActionButtonText, { color: '#ffffff' }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  dateRangeButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  dateRangeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingState: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fetchErrorText: {
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '500',
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
  eventDetailsTapArea: {
    flexDirection: 'row',
    flex: 1,
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
  multiTimeText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
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
  calendarContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  calendarActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  calendarActionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterModalScroll: {
    flex: 1,
  },
  filterModalContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  filterOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
  detailsScroll: {
    flex: 1,
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 26,
  },
  detailsImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#e2e8f0',
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  detailsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  occurrenceRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  occurrenceRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  occurrenceText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  occurrenceCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  occurrenceGoingButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occurrenceGoingButtonText: {
    fontSize: 13,
    fontWeight: '600',
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


