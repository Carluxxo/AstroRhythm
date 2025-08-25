// src/navigation/AppNavigator.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './types';

import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LibraryScreen from '../screens/LibraryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayerScreen from '../screens/PlayerScreen';
import LuaScreen from '../screens/LuaScreen';
import CustomBottomNavbar from '../components/CustomBottomNavbar';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <CustomBottomNavbar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Início' }} />
    <Tab.Screen name="Library"   component={LibraryScreen}   options={{ tabBarLabel: 'Biblioteca' }} />
    <Tab.Screen name="Calendar"  component={CalendarScreen}  options={{ tabBarLabel: 'Calendário' }} />
    <Tab.Screen name="Lua"       component={LuaScreen}       options={{ tabBarLabel: 'Lua' }} />
    <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ tabBarLabel: 'Perfil' }} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator
    initialRouteName="Onboarding"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#050810' },
    }}
  >
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="MainTabs"    component={MainTabNavigator} />
    <Stack.Screen name="Player"      component={PlayerScreen} />
  </Stack.Navigator>
);

export default AppNavigator;