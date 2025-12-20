import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { bootstrapAuth } from '../redux/ActionCreators';

import HomeScreen from '../screens/HomeScreen';
import WeatherListScreen from '../screens/WeatherListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createNativeStackNavigator();

function Main({ auth, bootstrapAuth }) {
  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const isAuthed = !!auth?.session;

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthed ? 'app' : 'auth'}
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthed ? 'Home' : 'Login'}
      >
        {!isAuthed ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CitySearch" component={WeatherListScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const mapStateToProps = (state) => ({ auth: state.auth });
export default connect(mapStateToProps, { bootstrapAuth })(Main);
