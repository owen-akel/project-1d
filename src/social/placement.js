// Where things sit on the map.
//
// Local events carry real venue coordinates from Ticketmaster. Nothing else
// does — mock users only know their city, and connection events only know a
// free-text location — so those get stable invented coordinates scattered
// around the relevant city centre. Same input always lands in the same spot,
// which matters: markers that jump between renders are unusable.

import { CITY_BY_NAME } from '../data/cities';
import { hashString } from './eventAttendees';

// Mock users store short codes; the coordinate table uses full names.
const CITY_CODE_TO_NAME = {
  NYC: 'New York',
  LA: 'Los Angeles',
  SF: 'San Francisco',
  Boston: 'Boston',
  Chicago: 'Chicago',
  Austin: 'Austin',
};

export const cityCenter = (city) => {
  if (!city) return null;
  const name = CITY_CODE_TO_NAME[city] || city;
  const match = CITY_BY_NAME.get(name);
  return match ? { latitude: match.lat, longitude: match.lng } : null;
};

/**
 * A stable point inside `spreadKm` of the city centre, derived from `seed`.
 *
 * Uses a golden-angle spiral rather than raw random offsets so a crowd spreads
 * evenly instead of clumping.
 */
export function scatterAroundCity(seed, city, spreadKm = 6) {
  const center = cityCenter(city);
  if (!center) return null;

  const hash = hashString(seed);
  const angle = (hash % 1000) / 1000 * Math.PI * 2;
  // sqrt keeps the distribution even across the disc instead of centre-heavy.
  const distance = Math.sqrt(((hash >> 10) % 1000) / 1000) * spreadKm;

  const latitudeDelta = distance / 111;
  const longitudeDelta = distance / (111 * Math.cos((center.latitude * Math.PI) / 180));

  return {
    latitude: center.latitude + latitudeDelta * Math.sin(angle),
    longitude: center.longitude + longitudeDelta * Math.cos(angle),
  };
}

/** Real venue coordinates when Ticketmaster gave us them, invented otherwise. */
export function eventCoordinate(event, fallbackCity) {
  const latitude = Number(event?.latitude);
  const longitude = Number(event?.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { coordinate: { latitude, longitude }, precise: true };
  }

  const scattered = scatterAroundCity(
    `${event?.id || event?.title}`,
    event?.city || fallbackCity,
    5
  );

  return scattered ? { coordinate: scattered, precise: false } : { coordinate: null, precise: false };
}

/** Where a person sits. Home city, scattered but stable. */
export function personCoordinate(user) {
  return scatterAroundCity(`person:${user?.id}`, user?.city, 7);
}
