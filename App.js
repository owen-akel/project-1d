import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FriendsProvider, useFriends } from './context/FriendsContext';
import { UserProvider } from './context/UserContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import LaunchScreen from './screens/LaunchScreen';
import AuthScreen from './screens/AuthScreen';
import LocalEventsScreen from './screens/LocalEventsScreen';
import ConnectionsEventsScreen from './screens/ConnectionsEventsScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import MapScreen from './screens/MapScreen';
import ChatScreen from './screens/ChatScreen';
import NewChatScreen from './screens/NewChatScreen';
import ConversationScreen from './screens/ConversationScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import SettingsScreen from './screens/SettingsScreen';
import FriendProfileScreen from './screens/FriendProfileScreen';
import FriendRequestsScreen from './screens/FriendRequestsScreen';
import InviteContactsScreen from './screens/InviteContactsScreen';
import CityUsersScreen from './screens/CityUsersScreen';
import { LocalIcon, ConnectionsIcon, ChatIcon, ProfileIcon } from './src/ui/icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Nested stack for Chat section
function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ChatList" component={ChatScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      {/* Reachable from a DM header, so it needs to live in this stack too. */}
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
    </Stack.Navigator>
  );
}

// Nested stack for Connections Events section
function ConnectionsEventsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ConnectionsEventsList" component={ConnectionsEventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
    </Stack.Navigator>
  );
}

// Nested stack for Local Events, so attendee lists can open profiles
function LocalEventsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LocalEventsList" component={LocalEventsScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
    </Stack.Navigator>
  );
}

// Nested stack for Profile section
function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="InviteContacts" component={InviteContactsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// Nested stack for Home section
function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={MapScreen} />
      <Stack.Screen name="CityUsers" component={CityUsersScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { pendingRequestCount } = useFriends();
  const { totalUnread } = useChat();
  const { settings } = useSettings();

  // Notification preferences decide whether the badges show at all.
  const showMessageBadge = settings.pushEnabled && settings.messageBadges;
  const showRequestBadge = settings.pushEnabled && settings.requestBadges;

  const TabIcon = ({ Icon, focused, color }) => (
    <View style={styles.iconContainer}>
      <Icon color={focused ? color : colors.textTertiary} size={25} active={focused} />
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 56 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarBadgeStyle: {
          backgroundColor: colors.primary,
          color: colors.onPrimary,
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="LocalEvents"
        component={LocalEventsStackNavigator}
        options={{
          tabBarLabel: 'Local',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={LocalIcon} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ConnectionsEvents"
        component={ConnectionsEventsStackNavigator}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={ConnectionsIcon} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                source={require('./assets/logo_light.png')}
                style={[styles.homeLogo, { opacity: focused ? 1 : 0.5 }]}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chat',
          tabBarBadge: showMessageBadge && totalUnread > 0 ? totalUnread : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={ChatIcon} focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarBadge: showRequestBadge && pendingRequestCount > 0 ? pendingRequestCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={ProfileIcon} focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

/**
 * React Navigation paints its own background behind screens and during
 * transitions. Left on its light default it flashes pale behind the dark UI, so
 * feed it the app palette.
 */
function ThemedNavigationContainer({ children }) {
  const { colors, isDarkMode } = useTheme();
  const base = isDarkMode ? NavigationDarkTheme : NavigationLightTheme;

  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.backgroundSecondary,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return <NavigationContainer theme={theme}>{children}</NavigationContainer>;
}

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Launch"
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      {/* Sign-up onboarding: profile, then contacts, then the tabs.
          Logging in skips both and goes straight to Main. */}
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen
        name="InviteContacts"
        component={InviteContactsScreen}
        initialParams={{ onboarding: true }}
      />
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <FriendsProvider>
            <SettingsProvider>
              <ChatProvider>
              <ThemedNavigationContainer>
                <ThemedStatusBar />
                <AppNavigator />
              </ThemedNavigationContainer>
              </ChatProvider>
            </SettingsProvider>
          </FriendsProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeLogo: {
    width: 30,
    height: 30,
  },
});
