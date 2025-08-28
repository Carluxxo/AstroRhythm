// App.tsx

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { PlayerProvider } from './src/contexts/PlayerContext';
import MiniPlayer from './src/components/MiniPlayer';

export default function App() {
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(undefined);

  return (
    <PlayerProvider>
      <NavigationContainer
        onStateChange={(state) => {
          const currentRoute = state?.routes[state.index];
          setCurrentRouteName(currentRoute?.name);
        }}
      >
        <View style={styles.container}>
          <AppNavigator />
          <MiniPlayer currentRouteName={currentRouteName} />
        </View>
      </NavigationContainer>
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050810',
  },
});