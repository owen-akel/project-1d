import { useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { getVisibleUserIdsByCity, toMockCityName } from '../social/visibility';
import { seedEventAttendees } from '../social/eventAttendees';

const EVENTS_API_BASE_URL = 'http://localhost:4000';

/**
 * Fetches events for a city and date range from the local events API.
 *
 * Kept separate from LocalEventsScreen so the map can show the same events on
 * the same terms — including the seeded attendee lists, which is what makes an
 * event feel populated rather than empty.
 */
export default function useCityEvents({ city, startDate, endDate, friends = [], size = 50 }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!city || !startDate || !endDate) {
        if (isMounted) {
          setEvents([]);
          setError(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({
          city,
          startDate,
          endDate,
          size: String(size),
        });

        const response = await fetch(`${EVENTS_API_BASE_URL}/events?${query.toString()}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || 'Failed to fetch events.');

        if (isMounted) setEvents(payload?.events || []);
      } catch (fetchError) {
        if (isMounted) {
          setEvents([]);
          setError(fetchError.message || 'Unable to fetch events.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [city, startDate, endDate, size]);

  // Ticketmaster nearly always supplies venue coordinates, but an older build
  // of the API didn't pass them through, and the odd venue has none. Geocoding
  // covers both without needing anything restarted — the street address when we
  // have it, otherwise the venue name plus city, which resolves well enough for
  // named venues ("Lena Horne Theatre, New York").
  const [geocoded, setGeocoded] = useState({});
  const geocodeCache = useRef(new Map());

  useEffect(() => {
    let cancelled = false;

    const queryFor = (event) =>
      event.address || (event.location ? `${event.location}, ${event.city || city || ''}` : null);

    const missing = events.filter((event) => {
      const query = queryFor(event);
      return (
        query &&
        !(Number.isFinite(event.latitude) && Number.isFinite(event.longitude)) &&
        !geocodeCache.current.has(query)
      );
    });

    if (missing.length === 0) return undefined;

    (async () => {
      // Sequential and capped — forward geocoding is rate limited by the OS.
      for (const event of missing.slice(0, 20)) {
        if (cancelled) return;
        const query = queryFor(event);
        try {
          const [match] = await Location.geocodeAsync(query);
          geocodeCache.current.set(
            query,
            match ? { latitude: match.latitude, longitude: match.longitude } : null
          );
        } catch {
          geocodeCache.current.set(query, null);
        }
      }

      if (!cancelled) setGeocoded(Object.fromEntries(geocodeCache.current));
    })();

    return () => {
      cancelled = true;
    };
  }, [events, city]);

  const attendeePool = useMemo(
    () => (city ? getVisibleUserIdsByCity(toMockCityName(city), friends) : []),
    [city, friends]
  );

  const populated = useMemo(
    () =>
      events.map((event) => {
        const hasCoords = Number.isFinite(event.latitude) && Number.isFinite(event.longitude);
        const query =
          event.address || (event.location ? `${event.location}, ${event.city || city || ''}` : null);
        const resolved = !hasCoords && query ? geocoded[query] : null;

        return {
          ...event,
          latitude: hasCoords ? event.latitude : resolved?.latitude ?? null,
          longitude: hasCoords ? event.longitude : resolved?.longitude ?? null,
          attendeeIds:
            event.attendeeIds?.length > 0
              ? event.attendeeIds
              : seedEventAttendees(event.id, attendeePool),
        };
      }),
    [events, attendeePool, geocoded, city]
  );

  return { events: populated, isLoading, error };
}
