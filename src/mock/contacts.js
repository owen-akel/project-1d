// Demo contact book.
//
// Reading the real address book needs a device with contacts in it, which makes
// the onboarding flow impossible to demo on a simulator. So the phone book here
// is the twelve people already in the mock graph, plus a handful of names who
// aren't in the app at all — those are the ones worth inviting.

import { ALL_USERS } from './users';

/** Deterministic 10-digit US number so the list looks real and stays stable. */
const phoneFor = (seed) => {
  const digits = String(5550000 + (seed * 7919) % 10000).padStart(7, '0');
  return `(212) ${digits.slice(0, 3)}-${digits.slice(3, 7)}`;
};

const OFF_APP_NAMES = [
  'Maya Rodriguez',
  'Theo Brennan',
  'Priya Raghavan',
  'Daniel Whitfield',
  'Nina Kowalski',
  'Omar Haddad',
  'Grace Lindqvist',
  'Caleb Moreau',
];

/**
 * The contact book as the demo sees it:
 *   - the twelve main users, already on 1D
 *   - eight people who aren't, and can be invited by text
 */
export function getDemoContacts() {
  const onApp = ALL_USERS.filter((user) => user.id.startsWith('main-user-')).map(
    (user, index) => ({
      id: `contact-${user.id}`,
      name: user.name,
      number: phoneFor(index + 1),
      onApp: true,
      userId: user.id,
      city: user.city,
    })
  );

  const offApp = OFF_APP_NAMES.map((name, index) => ({
    id: `contact-off-${index + 1}`,
    name,
    number: phoneFor(index + 100),
    onApp: false,
    userId: null,
    city: null,
  }));

  return [...onApp, ...offApp].sort((a, b) => a.name.localeCompare(b.name));
}
