# 1D (One Degree) - Social Media App

A React Native social media application built with Expo that connects people one degree away through maps, chat, and profiles.

## Features

- **Map Screen**: Interactive map with scrollable view showing nearby users and posts
  - Uses `react-native-maps` for map functionality
  - Location-based user posts
  - User location tracking
  - Scrollable post cards overlay

- **Chat Screen**: Messaging interface to connect with other users
  - Conversation list
  - Message threads
  - Unread message indicators

- **Profile Screen**: User profile management
  - Profile information
  - Stats (posts, followers, following)
  - Settings and preferences
  - Dark mode toggle

## Running locally

1. Backend: `cd events-api && npm start` (requires `events-api/.env` with `TICKETMASTER_API_KEY`)
2. App: `npm start`

Or run both at once from the root: `npm run dev`

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
├── App.js                 # Main app entry point with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── context/
│   └── ThemeContext.js   # Theme provider (light/dark mode)
├── screens/
│   ├── MapScreen.js      # Map view with user posts
│   ├── ChatScreen.js     # Messaging interface
│   └── ProfileScreen.js  # User profile page
└── README.md
```

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

