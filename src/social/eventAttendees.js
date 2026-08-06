/** Stable 32-bit hash so a given event always seeds the same crowd. */
export const hashString = (value) => {
  let hash = 0;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
};

/**
 * Ticketmaster has no idea who from your network is going, so live events arrive
 * with empty attendee lists and every card reads "0 going". Seed each showing
 * deterministically from the people you can see in that city — same event, same
 * faces, every time, on both the local list and the map.
 */
export function seedEventAttendees(seedKey, pool) {
  if (!pool || pool.length === 0) return [];

  const hash = hashString(seedKey);
  const count = hash % Math.min(pool.length + 1, 10);
  const picked = new Set();

  for (let index = 0; index < count; index += 1) {
    picked.add(pool[(hash + index * 7919) % pool.length]);
  }

  return Array.from(picked);
}
