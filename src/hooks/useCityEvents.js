import { useEffect, useMemo, useState } from 'react';
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

  const attendeePool = useMemo(
    () => (city ? getVisibleUserIdsByCity(toMockCityName(city), friends) : []),
    [city, friends]
  );

  const populated = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        attendeeIds:
          event.attendeeIds?.length > 0
            ? event.attendeeIds
            : seedEventAttendees(event.id, attendeePool),
      })),
    [events, attendeePool]
  );

  return { events: populated, isLoading, error };
}
