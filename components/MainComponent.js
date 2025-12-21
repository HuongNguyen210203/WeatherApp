import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import WeatherListScreen from '../screens/WeatherListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

import { getDeviceId } from '../shared/deviceId';
import { supabase } from '../shared/supabaseClient';

const Stack = createNativeStackNavigator();
  function Main() {
useEffect(() => {
  (async () => {
    try {
      const id = await getDeviceId();
      console.log('App DEVICE_ID:', id);

      const { data, error } = await supabase
        .from('anonymous_users')
        .upsert({ device_id: id }, { onConflict: 'device_id' })
        .select();

      if (error) {
        console.log('Upsert anonymous_users error:', error);
      } else {
        console.log('Upsert OK:', data);
      }
    } catch (e) {
      console.log('init anonymous user failed:', e);
    }
  })();
}, []);

return (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CitySearch" component={WeatherListScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
}

export default Main;

