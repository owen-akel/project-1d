// Single source of truth for "can the current user see this person?".
//
// The mock graph encodes the rule in the IDs themselves:
//   - `main-user-N`          -> visible only if they are a direct friend
//   - `{firstname}-friend-N` -> visible only if their parent main user is a direct friend
//
// This used to be copy-pasted into six screens, each carrying its own hardcoded
// list of first names. The lookup below is derived from the user data instead,
// so adding a main user no longer means editing six arrays.

import { ALL_USERS, getUsersByCity } from '../mock/users';

export const CURRENT_USER_ID = 'current-user-1';

const MAIN_USER_ID_BY_FIRST_NAME = new Map();
ALL_USERS.forEach((user) => {
  if (user.id.startsWith('main-user-')) {
    MAIN_USER_ID_BY_FIRST_NAME.set(user.name.split(' ')[0].toLowerCase(), user.id);
  }
});

export const isMainUser = (userId) =>
  typeof userId === 'string' && userId.startsWith('main-user-');

/** `rod-friend-5` -> `main-user-1`, or null when the id isn't a friend-of id. */
export function getParentMainUserId(userId) {
  if (typeof userId !== 'string') return null;
  const match = userId.match(/^(.+)-friend-\d+$/);
  if (!match) return null;
  return MAIN_USER_ID_BY_FIRST_NAME.get(match[1].toLowerCase()) || null;
}

export function canViewUser(targetUserId, friends = []) {
  if (!targetUserId) return false;
  if (targetUserId === CURRENT_USER_ID) return true;
  if (isMainUser(targetUserId)) return friends.includes(targetUserId);

  const parentMainUserId = getParentMainUserId(targetUserId);
  return parentMainUserId ? friends.includes(parentMainUserId) : false;
}

/** Ids of everyone in `city` the current user is allowed to see. */
export function getVisibleUserIdsByCity(city, friends = []) {
  return getUsersByCity(city)
    .filter((user) => canViewUser(user.id, friends))
    .map((user) => user.id);
}

/** Full user records for everyone in `city` the current user is allowed to see. */
export function getVisibleUsersByCity(city, friends = []) {
  return getUsersByCity(city).filter((user) => canViewUser(user.id, friends));
}

// The app stores residence as a display city name but the mock data uses short
// codes for three of them. Keep the mapping in one place.
const CITY_ALIASES = {
  'New York': 'NYC',
  'Los Angeles': 'LA',
  'San Francisco': 'SF',
};

export const toMockCityName = (cityName) => CITY_ALIASES[cityName] || cityName;
