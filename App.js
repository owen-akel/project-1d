import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LaunchScreen from './screens/LaunchScreen';
import AuthScreen from './screens/AuthScreen';
import LocalEventsScreen from './screens/LocalEventsScreen';
import ConnectionsEventsScreen from './screens/ConnectionsEventsScreen';
import MapScreen from './screens/MapScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
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
        component={ConnectionsEventsScreen}
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
        component={MapScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <LogoIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
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
        component={ProfileScreen}
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
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 32,
    height: 32,
  },
  logoIcon: {
    width: 32,
    height: 32,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});
