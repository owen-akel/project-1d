// Mock events database - split into major events and connection events

import { getUsersByCity } from './users';
import { getVisibleUserIdsByCity } from '../social/visibility';

// Re-exported for backwards compatibility; the rule itself now lives in
// src/social/visibility.js so every screen shares one implementation.
export function getVisibleUsersByCity(city, friends = []) {
  return getVisibleUserIdsByCity(city, friends);
}

// Connection Events Templates (individual user events)
const CONNECTION_EVENT_TEMPLATES = {
  golf: [
    { title: 'Weekend Golf Round', location: 'Local Golf Course' },
    { title: 'Morning Golf Session', location: 'City Golf Club' },
    { title: 'Golf Tournament', location: 'Championship Course' },
  ],
  lifting: [
    { title: 'Gym Session', location: 'Local Gym' },
    { title: 'Weightlifting Meetup', location: 'Fitness Center' },
    { title: 'Strength Training', location: 'CrossFit Box' },
  ],
  running: [
    { title: 'Morning Run', location: 'Central Park' },
    { title: '5K Training Run', location: 'Riverside Trail' },
    { title: 'Weekend Jog', location: 'City Park' },
  ],
  beer: [
    { title: 'Brewery Visit', location: 'Local Brewery' },
    { title: 'Happy Hour', location: 'Downtown Bar' },
    { title: 'Beer Tasting', location: 'Craft Beer Hall' },
  ],
  movies: [
    { title: 'Movie Night', location: 'Cinema Downtown' },
    { title: 'Film Screening', location: 'Theater Complex' },
    { title: 'Movie Marathon', location: 'Local Theater' },
  ],
};

// Major Events Templates (city-wide events)
const MAJOR_EVENT_TEMPLATES = {
  concerts: [
    { title: 'Taylor Swift Concert', location: 'Madison Square Garden' },
    { title: 'Jazz Night', location: 'Blue Note Jazz Club' },
    { title: 'Indie Rock Festival', location: 'Central Park' },
    { title: 'Summer Concert Series', location: 'Outdoor Amphitheater' },
  ],
  comedy: [
    { title: 'Stand-Up Comedy Night', location: 'The Comedy Cellar' },
    { title: 'Improv Show', location: 'Upright Citizens Brigade' },
    { title: 'Comedy Festival', location: 'Convention Center' },
    { title: 'Open Mic Night', location: 'Local Comedy Club' },
  ],
  festivals: [
    { title: 'Summer Music Festival', location: 'Waterfront Park' },
    { title: 'Food & Wine Festival', location: 'Downtown Plaza' },
    { title: 'Art Festival', location: 'City Park' },
    { title: 'Cultural Festival', location: 'Main Street' },
  ],
  sports: [
    { title: 'NBA Game: Lakers vs Warriors', location: 'Staples Center' },
    { title: 'Baseball Game', location: 'Yankee Stadium' },
    { title: 'Soccer Match', location: 'Soccer Stadium' },
    { title: 'College Football Game', location: 'University Stadium' },
  ],
  theater: [
    { title: 'Broadway Show: Hamilton', location: 'Richard Rodgers Theatre' },
    { title: 'Shakespeare in the Park', location: 'Central Park' },
    { title: 'Musical Performance', location: 'Lincoln Center' },
    { title: 'Dance Performance', location: 'City Theater' },
  ],
  'music-festival': [
    { title: 'Coachella Music Festival', location: 'Empire Polo Club' },
    { title: 'Jazz Festival', location: 'Jazz District' },
    { title: 'Rock Festival', location: 'Concert Grounds' },
  ],
};

// Relative dates
const RELATIVE_DATES = [
  'Today, 4:00 PM',
  'Today, 7:00 PM',
  'Tomorrow, 10:00 AM',
  'Tomorrow, 2:00 PM',
  'Tomorrow, 6:00 PM',
  'Saturday, 8:00 AM',
  'Saturday, 12:00 PM',
  'Saturday, 5:00 PM',
  'Sunday, 9:00 AM',
  'Sunday, 3:00 PM',
  'Friday, 6:00 PM',
  'Thursday, 7:00 PM',
];

// Helper to get deterministic "random" item from array (based on seed)
function getDeterministicItem(array, seed) {
  return array[seed % array.length];
}

// Helper to get deterministic subset of array (based on seed)
function getDeterministicSubset(array, count, seed) {
  const shuffled = [...array].sort((a, b) => {
    // Deterministic shuffle based on seed
    const hashA = (a.charCodeAt(0) + seed) % 1000;
    const hashB = (b.charCodeAt(0) + seed) % 1000;
    return hashA - hashB;
  });
  return shuffled.slice(0, Math.min(count, array.length));
}

// Generate connection events for a specific city (individual user events)
function generateConnectionEventsForCity(city, eventIdStart, friends = []) {
  const cityUsers = getUsersByCity(city);
  if (cityUsers.length === 0) return [];

  const events = [];
  const eventTypes = ['golf', 'lifting', 'running', 'beer', 'movies'];
  let eventId = eventIdStart;

  // Generate 4 events per city
  const numEvents = 4;

  // Get visible users in this city
  const visibleUserIds = getVisibleUsersByCity(city, friends);

  for (let i = 0; i < numEvents; i++) {
    const eventType = eventTypes[i % eventTypes.length];
    const templates = CONNECTION_EVENT_TEMPLATES[eventType];
    const template = getDeterministicItem(templates, eventId + i);
    
    // Select a user from this city as the host (deterministic)
    const host = getDeterministicItem(cityUsers, eventId + i);
    
    // Get a date (deterministic)
    const date = getDeterministicItem(RELATIVE_DATES, eventId + i);

    // Populate attendees: 10-30% of visible users (deterministic based on event ID)
    const attendeePercentage = 0.1 + ((eventId + i) % 3) * 0.1; // 10%, 20%, or 30%
    const numAttendees = Math.max(1, Math.floor(visibleUserIds.length * attendeePercentage));
    const attendeeIds = getDeterministicSubset(visibleUserIds, numAttendees, eventId + i);

    events.push({
      id: `connection-event-${eventId}`,
      title: template.title,
      location: template.location,
      date: date,
      hostId: host.id,
      city: city,
      type: eventType,
      attendeeIds: attendeeIds, // Pre-populated with visible users
    });

    eventId++;
  }

  return events;
}

// Generate major events for a specific city (city-wide events)
function generateMajorEventsForCity(city, eventIdStart, friends = []) {
  const events = [];
  const eventTypes = ['concerts', 'comedy', 'festivals', 'sports', 'theater', 'music-festival'];
  let eventId = eventIdStart;

  // Generate 4-5 major events per city
  const numEvents = 5;

  // Get visible users in this city
  const visibleUserIds = getVisibleUsersByCity(city, friends);
  
  for (let i = 0; i < numEvents; i++) {
    const eventType = eventTypes[i % eventTypes.length];
    const templates = MAJOR_EVENT_TEMPLATES[eventType];
    const template = getDeterministicItem(templates, eventId + i);
    
    // Get a date (deterministic)
    const date = getDeterministicItem(RELATIVE_DATES, eventId + i);

    // Populate attendees: 20-50% of visible users (deterministic based on event ID)
    const attendeePercentage = 0.2 + (eventId % 3) * 0.1; // 20%, 30%, or 40%
    const numAttendees = Math.max(1, Math.floor(visibleUserIds.length * attendeePercentage));
    const attendeeIds = getDeterministicSubset(visibleUserIds, numAttendees, eventId);

    events.push({
      id: `major-event-${eventId}`,
      title: template.title,
      location: template.location,
      date: date,
      hostId: null, // Major events don't have individual hosts
      city: city,
      type: eventType,
      attendeeIds: attendeeIds, // Pre-populated with visible users
    });

    eventId++;
  }

  return events;
}

// Generate all connection events for all cities
// Note: Connection events need friends array to populate attendees, but we'll generate them
// with empty friends initially, and they'll be filtered/updated in the screens
const CITIES = ['Boston', 'NYC', 'Chicago', 'LA', 'SF', 'Austin'];
let allConnectionEvents = [];
let connectionEventIdCounter = 1;

CITIES.forEach((city) => {
  // Generate with empty friends array initially
  // Screens will need to filter/regenerate based on actual friends
  const cityEvents = generateConnectionEventsForCity(city, connectionEventIdCounter, []);
  allConnectionEvents = [...allConnectionEvents, ...cityEvents];
  connectionEventIdCounter += cityEvents.length;
});

// Generate all major events for all cities
// Note: Major events need friends array to populate attendees, but we'll generate them
// with empty friends initially, and they'll be filtered/updated in the screens
let allMajorEvents = [];
let majorEventIdCounter = 1000; // Start from 1000 to avoid ID conflicts

CITIES.forEach((city) => {
  // Generate with empty friends array initially
  // Screens will need to filter/regenerate based on actual friends
  const cityEvents = generateMajorEventsForCity(city, majorEventIdCounter, []);
  allMajorEvents = [...allMajorEvents, ...cityEvents];
  majorEventIdCounter += cityEvents.length;
});

// Helper function to get connection events by city (with friends for attendee filtering)
export function getConnectionEventsByCity(city, friends = []) {
  // Regenerate connection events with current friends list to get correct attendees
  const connectionEvents = [];
  const eventTypes = ['golf', 'lifting', 'running', 'beer', 'movies'];
  let eventId = 1;
  const cityIndex = CITIES.indexOf(city);
  if (cityIndex === -1) return [];
  
  // Calculate starting event ID for this city
  eventId = 1 + (cityIndex * 4);
  
  const cityUsers = getUsersByCity(city);
  if (cityUsers.length === 0) return [];
  
  const visibleUserIds = getVisibleUsersByCity(city, friends);
  
  for (let i = 0; i < 4; i++) {
    const eventType = eventTypes[i % eventTypes.length];
    const templates = CONNECTION_EVENT_TEMPLATES[eventType];
    const template = getDeterministicItem(templates, eventId + i);
    const host = getDeterministicItem(cityUsers, eventId + i);
    const date = getDeterministicItem(RELATIVE_DATES, eventId + i);
    
    // Populate attendees: 10-30% of visible users
    const attendeePercentage = 0.1 + ((eventId + i) % 3) * 0.1;
    const numAttendees = Math.max(1, Math.floor(visibleUserIds.length * attendeePercentage));
    const attendeeIds = getDeterministicSubset(visibleUserIds, numAttendees, eventId + i);

    connectionEvents.push({
      id: `connection-event-${eventId + i}`,
      title: template.title,
      location: template.location,
      date: date,
      hostId: host.id,
      city: city,
      type: eventType,
      attendeeIds: attendeeIds,
    });
  }
  
  return connectionEvents;
}

// Helper function to get major events by city (with friends for attendee filtering)
export function getMajorEventsByCity(city, friends = []) {
  // Regenerate major events with current friends list to get correct attendees
  const majorEvents = [];
  const eventTypes = ['concerts', 'comedy', 'festivals', 'sports', 'theater', 'music-festival'];
  let eventId = 1000;
  const cityIndex = CITIES.indexOf(city);
  if (cityIndex === -1) return [];
  
  // Calculate starting event ID for this city
  eventId = 1000 + (cityIndex * 5);
  
  const visibleUserIds = getVisibleUsersByCity(city, friends);
  
  for (let i = 0; i < 5; i++) {
    const eventType = eventTypes[i % eventTypes.length];
    const templates = MAJOR_EVENT_TEMPLATES[eventType];
    const template = getDeterministicItem(templates, eventId + i);
    const date = getDeterministicItem(RELATIVE_DATES, eventId + i);
    
    // Populate attendees: 20-50% of visible users
    const attendeePercentage = 0.2 + ((eventId + i) % 3) * 0.1;
    const numAttendees = Math.max(1, Math.floor(visibleUserIds.length * attendeePercentage));
    const attendeeIds = getDeterministicSubset(visibleUserIds, numAttendees, eventId + i);

    majorEvents.push({
      id: `major-event-${eventId + i}`,
      title: template.title,
      location: template.location,
      date: date,
      hostId: null,
      city: city,
      type: eventType,
      attendeeIds: attendeeIds,
    });
  }
  
  return majorEvents;
}

// Legacy exports for backward compatibility
export function getEventsByCity(city) {
  return getConnectionEventsByCity(city);
}

export function getEventsByHost(hostId) {
  return allConnectionEvents.filter(event => event.hostId === hostId);
}

export function getEventById(eventId) {
  const allEvents = [...allConnectionEvents, ...allMajorEvents];
  return allEvents.find(event => event.id === eventId);
}

export { allConnectionEvents as ALL_CONNECTION_EVENTS, allMajorEvents as ALL_MAJOR_EVENTS };
