import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { RootStackParamList } from './types';

import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LibraryScreen from '../screens/LibraryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayerScreen from '../screens/PlayerScreen';
import LuaScreen from '../screens/LuaScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import WaitConfirm from '../screens/WaitConfirm';
import CustomBottomNavbar from '../components/CustomBottomNavbar';
import LoginAccountScreen from '../screens/LoginAccountScreen'

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomBottomNavbar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Início" component={DashboardScreen} />
      <Tab.Screen name="Coleção" component={LibraryScreen} />
      <Tab.Screen name="Agenda" component={CalendarScreen} />
      <Tab.Screen name="Lua" component={LuaScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A4FFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#050810' } }}
    >
      {session && session.user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Player" component={PlayerScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <Stack.Screen name="WaitConfirm" component={WaitConfirm} />
          <Stack.Screen name="LoginAccount" component={LoginAccountScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050810',
  },
});

export default AppNavigator;
