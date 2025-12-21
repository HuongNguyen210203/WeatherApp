import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { connect } from 'react-redux';

import HomeScreen from '../screens/HomeScreen';
import WeatherListScreen from '../screens/WeatherListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

import { getDeviceId } from '../shared/deviceId';
import { supabaseWithDevice } from '../shared/supabaseClient';
import { fetchFavorites } from '../redux/ActionCreators';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

function Main({ fetchFavorites }) {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const id = await getDeviceId();
        if (!mounted) return;

        console.log('App DEVICE_ID:', id);

        const client = supabaseWithDevice(id);

        const payload = {
          device_id: id,
          last_seen_at: new Date().toISOString(),
        };

        const { error } = await client
          .from('anonymous_users')
          .upsert(payload, { onConflict: 'device_id' });

        if (error) console.log('Upsert anonymous_users error:', error?.message ?? error);
        else console.log('Upsert anonymous_users OK');

        await fetchFavorites();
      } catch (e) {
        console.log('init anonymous user failed:', e?.message ?? e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchFavorites]);

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          // animation mặc định cho các màn dạng push
          animation: 'slide_from_right',
          animationDuration: 240,
          contentStyle: { backgroundColor: '#0B0B1A' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="CitySearch"
          component={WeatherListScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 260,
          }}
        />

        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 240,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default connect(null, { fetchFavorites })(Main);
