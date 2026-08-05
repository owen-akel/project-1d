import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FriendsProvider, useFriends } from './context/FriendsContext';
import { UserProvider } from './context/UserContext';
import { ChatProvider, useChat } from './context/ChatContext';
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
import FriendProfileScreen from './screens/FriendProfileScreen';
import FriendRequestsScreen from './screens/FriendRequestsScreen';
import InviteContactsScreen from './screens/InviteContactsScreen';
import CityUsersScreen from './screens/CityUsersScreen';

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

  const LogoIcon = ({ focused }) => (
    <View style={styles.iconContainer}>
      <Image
        source={require('./assets/logo_light.png')}
        style={[styles.logoIcon, { opacity: focused ? 1 : 0.55 }]}
        resizeMode="contain"
      />
    </View>
  );

  const TabIcon = ({ source, focused, color }) => (
    <View style={styles.iconContainer}>
      <Image
        source={source}
        style={[styles.tabIcon, { tintColor: focused ? color : colors.textTertiary }]}
        resizeMode="contain"
      />
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
            <TabIcon
              source={require('./assets/local_page_icon.png')}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ConnectionsEvents"
        component={ConnectionsEventsStackNavigator}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              source={require('./assets/connections_page_icon.png')}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <LogoIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chat',
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              source={require('./assets/chat_icon.png')}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarBadge: pendingRequestCount > 0 ? pendingRequestCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              source={require('./assets/profile_icon.png')}
              focused={focused}
              color={color}
            />
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
      {/* Shown once right after sign-in, before the tabs. */}
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
            <ChatProvider>
              <NavigationContainer>
                <ThemedStatusBar />
                <AppNavigator />
              </NavigationContainer>
            </ChatProvider>
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
  logoIcon: {
    width: 30,
    height: 30,
  },
  tabIcon: {
    width: 26,
    height: 26,
  },
});
