const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: __dirname + '/.env' });

if (!process.env.TICKETMASTER_API_KEY) {
  console.error('❌ TICKETMASTER_API_KEY not found. Run from the events-api folder and confirm events-api/.env exists.');
  process.exit(1);
}
console.log('✅ Ticketmaster key loaded');

const app = express();

const PORT = Number(process.env.PORT || 4000);
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const MAX_RESULTS = 50;
const MAJOR_SEGMENTS = new Set(['sports', 'music', 'arts & theatre', 'arts and theatre']);

app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
  })
);
app.use(express.json());

const eventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

const isValidIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const normalizeType = (segmentName) => {
  if (!segmentName) return 'event';
  const lowered = segmentName.toLowerCase();
  if (lowered.includes('music')) return 'music';
  if (lowered.includes('comedy')) return 'comedy';
  if (lowered.includes('sport')) return 'sports';
  if (lowered.includes('theatre') || lowered.includes('theater')) return 'theater';
  return lowered.replace(/\s+/g, '-');
};

const normalizeDedupValue = (value) => {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const normalizeTitleForGrouping = (title) => {
  const normalized = normalizeDedupValue(title)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b/g, ' ')
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/g, ' ')
    .replace(/\b\d{1,2}[:.]\d{2}\s?(am|pm)\b/g, ' ')
    .replace(/\b\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?\b/g, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
    .replace(/[-,:|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || normalizeDedupValue(title);
};

const pickBestImage = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted[0]?.url || null;
};

const mapTicketmasterEvent = (event, fallbackCity) => {
  const venue = event?._embedded?.venues?.[0];
  const attractions = event?._embedded?.attractions || [];
  const attractionIds = attractions.map((item) => item.id).filter(Boolean).sort();
  const segmentName = event?.classifications?.[0]?.segment?.name;
  const genreName =
    event?.classifications?.[0]?.genre?.name ||
    event?.classifications?.[0]?.subGenre?.name ||
    null;
  const startAt = event?.dates?.start?.dateTime || null;
  const localDate = event?.dates?.start?.localDate;
  const localTime = event?.dates?.start?.localTime;
  const normalizedSegment = normalizeDedupValue(segmentName);

  const latitude = Number(venue?.location?.latitude);
  const longitude = Number(venue?.location?.longitude);

  return {
    id: event.id,
    title: event.name || 'Untitled Event',
    location: venue?.name || 'Unknown Venue',
    city: venue?.city?.name || fallbackCity,
    // Passed through so the map can pin events at their actual venue.
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    startAt,
    date: startAt || (localDate ? `${localDate}${localTime ? ` ${localTime}` : ''}` : 'TBD'),
    type: normalizeType(segmentName),
    segment: segmentName || 'Event',
    genre: genreName || 'Other',
    description: event?.info || event?.pleaseNote || 'No description available.',
    imageUrl: pickBestImage(event?.images),
    source: 'ticketmaster',
    url: event.url || null,
    isMajor: MAJOR_SEGMENTS.has(normalizedSegment),
    attendeeIds: [],
    attractionIds,
    occurrences: [
      {
        id: event.id,
        startAt,
        date: startAt || (localDate ? `${localDate}${localTime ? ` ${localTime}` : ''}` : 'TBD'),
        url: event.url || null,
        attendeeIds: [],
      },
    ],
  };
};

const buildDedupKey = (event) => {
  const title = normalizeTitleForGrouping(event.title);
  const location = normalizeDedupValue(event.location);
  const attraction = (event.attractionIds || []).join(',');
  return `${attraction}|${title}|${location}`;
};

const groupEvents = (events) => {
  const grouped = new Map();

  events.forEach((event) => {
    const key = buildDedupKey(event);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, event);
      return;
    }

    const existingOccurrences = existing.occurrences || [];
    const incomingOccurrences = event.occurrences || [];
    const mergedOccurrences = [...existingOccurrences];

    incomingOccurrences.forEach((incoming) => {
      const incomingKey = `${incoming.startAt || incoming.date}|${incoming.url || ''}`;
      const alreadyExists = mergedOccurrences.some(
        (item) => `${item.startAt || item.date}|${item.url || ''}` === incomingKey
      );
      if (!alreadyExists) {
        mergedOccurrences.push(incoming);
      }
    });

    mergedOccurrences.sort((a, b) => {
      const aDate = a.startAt || a.date || '';
      const bDate = b.startAt || b.date || '';
      return aDate.localeCompare(bDate);
    });

    const firstOccurrence = mergedOccurrences[0];
    grouped.set(key, {
      ...existing,
      latitude: existing.latitude ?? event.latitude,
      longitude: existing.longitude ?? event.longitude,
      startAt: firstOccurrence?.startAt || existing.startAt,
      date: firstOccurrence?.date || existing.date,
      url: firstOccurrence?.url || existing.url,
      occurrences: mergedOccurrences,
      occurrenceCount: mergedOccurrences.length,
      hasMultipleTimes: mergedOccurrences.length > 1,
      isMajor: existing.isMajor || event.isMajor,
      description:
        existing.description && existing.description !== 'No description available.'
          ? existing.description
          : event.description,
      imageUrl: existing.imageUrl || event.imageUrl || null,
      genre:
        existing.genre && existing.genre !== 'Other'
          ? existing.genre
          : event.genre || 'Other',
    });
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const aDate = a.startAt || a.date || '';
    const bDate = b.startAt || b.date || '';
    return aDate.localeCompare(bDate);
  });
};

const sanitizeEventsForClient = (events) => {
  return events.map((event) => {
    if (!event.occurrenceCount) {
      return {
        ...event,
        occurrenceCount: event.occurrences?.length || 1,
        hasMultipleTimes: (event.occurrences?.length || 1) > 1,
      };
    }

    return event;
  });
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/events', eventLimiter, async (req, res) => {
  try {
    const { city, startDate, endDate } = req.query;
    const size = Math.min(Number(req.query.size || 25), MAX_RESULTS);

    if (!city || !startDate || !endDate) {
      return res.status(400).json({
        error: 'city, startDate, and endDate are required query parameters.',
      });
    }

    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
      return res.status(400).json({
        error: 'startDate and endDate must be YYYY-MM-DD.',
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        error: 'startDate must be before or equal to endDate.',
      });
    }

    if (!TICKETMASTER_API_KEY) {
      return res.status(500).json({
        error: 'Server configuration missing TICKETMASTER_API_KEY.',
      });
    }

    const tmResponse = await axios.get(
      'https://app.ticketmaster.com/discovery/v2/events.json',
      {
        timeout: 10000,
        params: {
          apikey: TICKETMASTER_API_KEY,
          city,
          startDateTime: `${startDate}T00:00:00Z`,
          endDateTime: `${endDate}T23:59:59Z`,
          size,
          sort: 'date,asc',
        },
      }
    );

    const rawEvents = tmResponse?.data?._embedded?.events || [];
    const mappedEvents = rawEvents.map((event) => mapTicketmasterEvent(event, city));
    const groupedEvents = groupEvents(mappedEvents);
    const events = sanitizeEventsForClient(groupedEvents);

    return res.json({
      source: 'ticketmaster',
      total: events.length,
      events,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const providerDetail =
      error?.response?.data?.errors ||
      error?.response?.data ||
      error.message ||
      'Unknown error';

    return res.status(status).json({
      error: 'Failed to fetch events from Ticketmaster.',
      providerDetail,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Events API listening on http://localhost:${PORT}`);
});
