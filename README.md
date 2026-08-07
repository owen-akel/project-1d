# 1D (One Degree) - Social Media App

A React Native social media application built with Expo that connects people one degree away through maps, chat, and profiles.

## Features

- **Local**: Live events for your city, pulled from Ticketmaster via `events-api`
  - Date-range picker plus genre / time / attendance / location filters
  - Repeat showings grouped into a single event with multiple occurrences

- **Connections**: Events posted by friends and friends-of-friends in your city

- **Home (Map)**: Interactive map showing how many of your connections are in each city

- **Chat**: Direct messages and group chats
  - Group creation searches across friends *and* friends-of-friends
  - A message shortcut sits next to every name in the app (profiles, the city
    list, event attendee lists, friend lists, requests)

- **Profile**: Two tabs
  - *Profile* — photo, residence, hometown/college/grad year, interests
  - *Friends* — the connection web: total friends, friends-of-friends, and total
    reach, drawn as a radial graph, plus the friend list and pending requests.
    Pick a city to highlight everyone who lives there — direct and indirect —
    with a pill showing the total that opens the full list, filterable by
    degree and interest. Tap a friend to zoom in: they become the centre, you
    slide to the edge along the angle they already occupied, and their own
    connections fan out around them.

- **Connector bubbles**: a friend-of-a-friend's avatar carries small bubbles for
  the direct friends you're linked through, with a matching "via …" line.

- **Friend requests**: Send, cancel, accept, and decline requests. A Discover tab
  surfaces people you're not connected to yet, ranked by shared mutuals.

- **Invite contacts**: After sign-in (and any time from Profile), pick contacts
  and send them an invite. Contacts are read on-device only, and the invite opens
  your own Messages app — nothing sends automatically.

## Running locally

Start to finish on a fresh clone. There are **two** npm projects here — the Expo
app at the root and the events API in `events-api/` — so both need installing.

```bash
# 1. App dependencies
npm install

# 2. Backend dependencies
cd events-api && npm install && cd ..

# 3. Backend config — copy the template and add your own Ticketmaster key
cp events-api/.env.example events-api/.env
# then edit events-api/.env and set TICKETMASTER_API_KEY

# 4. Run the API and the app together
npm run dev
```

Then press `i` in the Expo output to open the iOS simulator (or scan the QR code
with Expo Go).

### Getting a Ticketmaster key

Register at
[developer.ticketmaster.com](https://developer-acct.ticketmaster.com/user/register)
and use the **Consumer Key** from your app. It's free, and the default quota is
plenty for development.

The key is per-developer and must never be committed — `events-api/.env` is
gitignored and should stay that way.

### Running without a key

The app still runs: `events-api` refuses to start without the key, the Local tab's
fetch fails, and it falls back to the mock events in `src/mock/events.js` with a
"Live events unavailable" note. Everything else — the connection web, friend
requests, chat, invites — works normally, since it's all local mock data.

### Notes

- The app reaches the API at `http://localhost:4000`, which works on the
  simulator and web but **not** on a physical phone over Expo Go. Point
  `EVENTS_API_BASE_URL` in `screens/LocalEventsScreen.js` at your machine's LAN
  IP to test on a real device.
- No state persists. Profile edits, friends, requests, and messages all live in
  React context, so a reload resets everything to the seeded state — which means
  a fresh clone looks the same as any other.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your phone

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on your device:
   - **iOS**: Press `i` in the terminal or scan the QR code with your iPhone camera
   - **Android**: Press `a` in the terminal or scan the QR code with the Expo Go app
   - **Web**: Press `w` in the terminal

### Running with Expo Go

1. Install the Expo Go app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code that appears in your terminal after running `npm start`

### Project Structure

```
project-1d/
├── App.js                     # Navigation: 5 tabs + nested stacks
├── app.json                   # Expo configuration
├── context/
│   ├── ThemeContext.js        # Colors + spacing/radius/typography/shadow tokens
│   ├── UserContext.js         # Current user profile
│   └── FriendsContext.js      # Friends list + incoming/outgoing friend requests
├── screens/
│   ├── LocalEventsScreen.js   # Live events + filters
│   ├── ConnectionsEventsScreen.js
│   ├── MapScreen.js
│   ├── ChatScreen.js / NewChatScreen.js
│   ├── ProfileScreen.js       # Profile | Friends tabs
│   ├── FriendProfileScreen.js
│   ├── FriendRequestsScreen.js
│   ├── InviteContactsScreen.js
│   ├── CityUsersScreen.js / CreateEventScreen.js
│   └── AuthScreen.js / LaunchScreen.js
├── src/
│   ├── ui/                    # Shared primitives (Screen, Card, Button, Chip,
│   │                          # Avatar, BottomSheet, ConnectionWeb, …)
│   ├── social/
│   │   ├── visibility.js      # Single source of truth for "can I see this user?"
│   │   └── connections.js     # Friends / friends-of-friends / reach math
│   ├── data/                  # Shared city + interest reference data
│   └── mock/                  # Mock users, friend graph, events
├── events-api/                # Express service proxying Ticketmaster
└── prec/                      # Unused screens from an earlier project
```

### Conventions

- Style with tokens from `useTheme()` (`colors`, `spacing`, `radius`,
  `typography`, `shadows`) rather than hardcoded values, and build screens out
  of `src/ui` primitives so they stay visually consistent. The app defaults to
  the dark palette; both themes must stay legible (there's a toggle on Profile).
- Text on a primary-coloured surface uses `colors.onPrimary`, not `#ffffff` —
  the accent is light in dark mode, so white-on-teal is unreadable there.
- Anything that decides whether one user can see another goes through
  `src/social/visibility.js`. Don't reimplement it per screen.

## Map API Setup

The app uses `react-native-maps` which supports both Google Maps and Apple Maps:

- **iOS**: Uses Apple Maps by default (no API key needed)
- **Android**: Uses Google Maps (requires Google Maps API key)

### Setting up Google Maps for Android (Optional)

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add the API key to `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_API_KEY_HERE"
        }
      }
    }
  }
}
```

Note: The free tier for Google Maps provides $200 credit per month, which is usually sufficient for development and small-scale apps.

## Customization

### Theme Colors

Edit `context/ThemeContext.js` to customize the app's color scheme. The app supports both light and dark modes.

### Adding Features

- **Backend Integration**: Connect to a backend API by modifying the screens to fetch real data
- **Authentication**: Add authentication screens and context
- **Real-time Chat**: Integrate WebSocket or a service like Firebase for real-time messaging
- **User Posts**: Connect to a backend to fetch and display real user posts on the map

## Troubleshooting

### EMFILE: too many open files error

If you encounter this error on macOS, try these solutions:

**Solution 1: Increase file descriptor limit (Recommended)**
```bash
# Check current limit
ulimit -n

# Temporarily increase limit (current terminal session only)
ulimit -n 10240

# Then start Expo
npm start
```

**Solution 2: Make it permanent**
Add this to your `~/.zshrc` or `~/.bash_profile`:
```bash
ulimit -n 10240
```

Then restart your terminal or run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

**Solution 3: Install Watchman (Best for long-term)**
Watchman is Facebook's file watching service that's more efficient:
```bash
brew install watchman
```

After installation, restart your terminal and try `npm start` again.

**Solution 4: Clear Metro bundler cache**
```bash
npx expo start -c
# or
rm -rf node_modules/.cache
npm start
```

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Start on iOS simulator
- `npm run android` - Start on Android emulator
- `npm run web` - Start on web browser

## Dependencies

- `expo` - Expo SDK
- `react-native` - React Native framework
- `react-native-maps` - Map component for React Native
- `@react-navigation/native` - Navigation library
- `@react-navigation/bottom-tabs` - Bottom tab navigator
- `expo-location` - Location services
- `expo-status-bar` - Status bar component

## Notes

- The app uses sample/mock data for posts, conversations, and user profiles
- To make it production-ready, you'll need to integrate with a backend API
- Location permissions are requested when the Map screen is accessed
- The app follows the UI patterns from the `prec` folder for consistency

## License

This project is private and proprietary.

