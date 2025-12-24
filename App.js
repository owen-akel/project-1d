import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FriendsProvider } from './context/FriendsContext';
import { UserProvider } from './context/UserContext';
import LaunchScreen from './screens/LaunchScreen';
import AuthScreen from './screens/AuthScreen';
import LocalEventsScreen from './screens/LocalEventsScreen';
import ConnectionsEventsScreen from './screens/ConnectionsEventsScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import MapScreen from './screens/MapScreen';
import ChatScreen from './screens/ChatScreen';
import NewChatScreen from './screens/NewChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import FriendProfileScreen from './screens/FriendProfileScreen';
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
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { colors } = useTheme();

  // Custom icon component for logo
  const LogoIcon = ({ focused }) => (
    <View style={[styles.iconContainer, styles.logoIconContainer, { backgroundColor: colors.card }]}>
      <Image
        source={require('./assets/logo_light.png')}
        style={styles.logoIcon}
        resizeMode="contain"
      />
    </View>
  );

  // Icon component for tab icons with background matching
  const TabIcon = ({ source, focused, color }) => (
    <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
      <Image
        source={source}
        style={[
          styles.tabIcon,
          { tintColor: focused ? color : colors.textTertiary }
        ]}
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
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 100,
          paddingBottom: 30,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="LocalEvents"
        component={LocalEventsScreen}
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
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <FriendsProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </FriendsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 44,
    height: 44,
  },
  logoIcon: {
    width: 44,
    height: 44,
  },
  tabIcon: {
    width: 36,
    height: 36,
  },
});
