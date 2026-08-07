// Connection-web math: who is one hop away, who is two, and how big the
// network actually is.

import { USERS_BY_ID, ALL_USERS } from '../mock/users';
import { FRIENDS_BY_USER_ID } from '../mock/graph';
import { CURRENT_USER_ID } from './visibility';

const friendsOf = (userId) => FRIENDS_BY_USER_ID.get(userId) || [];

/** Direct friends as user records, skipping ids with no matching user. */
export function getDirectFriends(friendIds = []) {
  return friendIds.map((id) => USERS_BY_ID.get(id)).filter(Boolean);
}

/**
 * Everyone exactly two hops out: a friend of at least one direct friend, who is
 * not the current user and not already a direct friend.
 *
 * Returns [{ user, viaIds }] sorted by how many of your friends know them.
 */
export function getSecondDegreeConnections(friendIds = []) {
  const directSet = new Set(friendIds);
  const byId = new Map();

  friendIds.forEach((friendId) => {
    friendsOf(friendId).forEach((candidateId) => {
      if (candidateId === CURRENT_USER_ID) return;
      if (directSet.has(candidateId)) return;

      const user = USERS_BY_ID.get(candidateId);
      if (!user) return;

      const existing = byId.get(candidateId);
      if (existing) {
        existing.viaIds.push(friendId);
      } else {
        byId.set(candidateId, { user, viaIds: [friendId] });
      }
    });
  });

  return Array.from(byId.values()).sort((a, b) => {
    if (b.viaIds.length !== a.viaIds.length) return b.viaIds.length - a.viaIds.length;
    return a.user.name.localeCompare(b.user.name);
  });
}

/** How many of your direct friends also know `userId`. */
export function getMutualFriendCount(userId, friendIds = []) {
  const directSet = new Set(friendIds);
  return friendsOf(userId).filter((id) => directSet.has(id)).length;
}

/**
 * The direct friends through whom you're connected to `userId` — the people
 * whose faces appear as bubbles on a friend-of-a-friend's avatar.
 *
 * Returns [] for your own direct friends, since there's no one to route through.
 */
export function getConnectorFriends(userId, friendIds = []) {
  const directSet = new Set(friendIds);
  if (directSet.has(userId) || userId === CURRENT_USER_ID) return [];

  return friendsOf(userId)
    .filter((id) => directSet.has(id))
    .map((id) => USERS_BY_ID.get(id))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Everyone reachable from you — direct friends and friends-of-friends. */
export function getReachablePeople(friendIds = []) {
  const direct = getDirectFriends(friendIds).map((user) => ({
    user,
    degree: 1,
    connectors: [],
  }));

  const second = getSecondDegreeConnections(friendIds).map(({ user, viaIds }) => ({
    user,
    degree: 2,
    connectors: viaIds.map((id) => USERS_BY_ID.get(id)).filter(Boolean),
  }));

  return [...direct, ...second];
}

/**
 * Headline numbers for the Friends tab.
 *
 * `totalReach` counts each person once — someone who is both a friend and a
 * friend-of-a-friend is already excluded from the second-degree set.
 */
export function getConnectionStats(friendIds = []) {
  const secondDegree = getSecondDegreeConnections(friendIds);

  const cities = new Set();
  getDirectFriends(friendIds).forEach((user) => user.city && cities.add(user.city));
  secondDegree.forEach(({ user }) => user.city && cities.add(user.city));

  return {
    directCount: friendIds.length,
    secondDegreeCount: secondDegree.length,
    totalReach: friendIds.length + secondDegree.length,
    cityCount: cities.size,
    cities: Array.from(cities).sort(),
    secondDegree,
  };
}

/**
 * Direct friends decorated with the number of *new* people each one brings to
 * the network — i.e. their friends who aren't already yours. This is what the
 * radial web draws on its outer ring.
 */
export function getFriendsWithReach(friendIds = []) {
  const directSet = new Set(friendIds);

  return getDirectFriends(friendIds)
    .map((user) => {
      const secondDegreeCount = friendsOf(user.id).filter(
        (id) => id !== CURRENT_USER_ID && !directSet.has(id)
      ).length;
      return { id: user.id, name: user.name, city: user.city, secondDegreeCount };
    })
    .sort((a, b) => b.secondDegreeCount - a.secondDegreeCount);
}

/**
 * Direct friends, each carrying the actual people they bring to the network
 * (their friends who aren't already yours). The web draws these on its outer
 * ring, so they need to be real users rather than anonymous dots — that's what
 * lets the location filter highlight them.
 */
export function getFriendsWithPeers(friendIds = []) {
  const directSet = new Set(friendIds);

  return getDirectFriends(friendIds)
    .map((user) => {
      const peers = friendsOf(user.id)
        .filter((id) => id !== CURRENT_USER_ID && !directSet.has(id))
        .map((id) => USERS_BY_ID.get(id))
        .filter(Boolean);

      return {
        id: user.id,
        name: user.name,
        city: user.city,
        secondDegreeCount: peers.length,
        peers,
      };
    })
    .sort((a, b) => b.secondDegreeCount - a.secondDegreeCount);
}

/**
 * People the current user could plausibly add: everyone who isn't already a
 * friend and has no request in flight. Second-degree connections come first
 * since they share mutuals.
 */
export function getSuggestedPeople(friendIds = [], excludedIds = [], { discoverable = true } = {}) {
  // With discoverability off you can still reach direct suggestions, but the
  // wider friends-of-friends pool stops surfacing you and vice versa.
  if (!discoverable) return [];

  const excluded = new Set([...friendIds, ...excludedIds, CURRENT_USER_ID]);

  const secondDegreeIds = new Set(
    getSecondDegreeConnections(friendIds).map(({ user }) => user.id)
  );

  return ALL_USERS.filter((user) => !excluded.has(user.id)).sort((a, b) => {
    const aSecond = secondDegreeIds.has(a.id) ? 0 : 1;
    const bSecond = secondDegreeIds.has(b.id) ? 0 : 1;
    if (aSecond !== bSecond) return aSecond - bSecond;
    return a.name.localeCompare(b.name);
  });
}
