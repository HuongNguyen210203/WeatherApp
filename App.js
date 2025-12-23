import { LogBox } from 'react-native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Main from './components/MainComponent';
import { ConfigureStore } from './redux/ConfigureStore';

const store = ConfigureStore();


LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <Main />
      </Provider>
    </GestureHandlerRootView>
  );
}
