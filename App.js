// import React, { useState } from 'react';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import HomeScreen from './screens/HomeScreen';
// import WeatherListScreen from './screens/WeatherListScreen';

// export default function App() {
//   const [currentScreen, setCurrentScreen] = useState('home'); // 'home' or 'weatherList'

//   if (currentScreen === 'weatherList') {
//     return (
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <WeatherListScreen onBack={() => setCurrentScreen('home')} />
//       </GestureHandlerRootView>
//     );
//   }

//   return (
//     <HomeScreen onNavigateToWeatherList={() => setCurrentScreen('weatherList')} />
//   );
// }
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Main from './components/MainComponent';
import { ConfigureStore } from './redux/ConfigureStore';

const store = ConfigureStore();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <Main />
      </Provider>
    </GestureHandlerRootView>
  );
}
