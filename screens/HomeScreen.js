import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  fetchForecast,
  fetchForecastByDeviceLocation,
  selectCity,
  toggleFavorite,
} from '../redux/ActionCreators';

import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ImageBackground,
  View,
  TouchableOpacity,
} from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import CurrentWeatherHeader from '../components/CurrentWeatherHeader';
import ForecastTabs from '../components/ForecastTabs';
import WeatherDetailsGrid from '../components/WeatherDetailsGrid';
import BottomNav from '../components/BottomNav';

import { MaterialIcons } from '@expo/vector-icons';

function HomeScreen({
  navigation,
  selectedCity,
  weather,
  fetchForecast,
  fetchForecastByDeviceLocation,
  favorites,
  toggleFavorite,
  selectCity,
}) {
  useEffect(() => {
    if (selectedCity?.lat != null && selectedCity?.lon != null) {
      fetchForecast(selectedCity.lat, selectedCity.lon);
    } else {
      fetchForecastByDeviceLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const isFavorite = !!favorites?.some((c) => c?.id === selectedCity?.id);
  const [locking, setLocking] = useState(false);

  const sheetRef = useRef(null);
  const snapPoints = ['50%', '100%'];

  const goToCitySearch = () => navigation.navigate('CitySearch');
  const goToHome = () => navigation.navigate('Home');
  const goToFavorites = () => navigation.navigate('Favorites');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../assets/night-sky.png')}
        style={styles.appBackground}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />

          <View style={styles.root}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <CurrentWeatherHeader
              cityName={selectedCity?.name}
              country={selectedCity?.country}
              isLoading={weather.isLoading}
              error={weather.errMess}
              current={weather.data?.current}
              currentUnits={weather.data?.current_units}
              onChooseCityPress={() => navigation.navigate('Favorites', { pickMode: true })}
            />
              {selectedCity && (
                <TouchableOpacity
                  disabled={isFavorite || locking}
                  onPress={async () => {
                    if (locking || isFavorite) return;
                    setLocking(true);
                    await toggleFavorite(selectedCity);
                    setLocking(false);
                  }}
                  style={{
                    position: 'absolute',
                    top: 110,
                    right: 20,
                    zIndex: 999,
                    backgroundColor: '#342561',
                    padding: 12,
                    borderRadius: 20,
                    opacity: isFavorite || locking ? 0.5 : 1,
                  }}
                >
                  <MaterialIcons
                    name={isFavorite ? 'favorite' : 'favorite-border'}
                    size={24}
                    color={isFavorite ? '#FF6B6B' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              )}
            </ScrollView>

            <BottomSheet
              ref={sheetRef}
              snapPoints={snapPoints}
              index={0}
              backgroundStyle={styles.bottomSheetBackground}
              handleIndicatorStyle={styles.bottomSheetIndicator}
            >
              <BottomSheetScrollView
                contentContainerStyle={styles.bottomSheetContent}
                showsVerticalScrollIndicator={false}
              >
                <ForecastTabs hourly={weather?.data?.hourly} daily={weather?.data?.daily} />
                <WeatherDetailsGrid
                  current={weather?.data?.current}
                  currentUnits={weather?.data?.current_units}
                  hourly={weather?.data?.hourly}
                  daily={weather?.data?.daily}
                  airQuality={weather?.data?.air_quality}
                />
              </BottomSheetScrollView>
            </BottomSheet>

            <BottomNav
              active="home"
              onPlusPress={goToCitySearch}
              onPinPress={goToHome}
              onListPress={goToFavorites}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appBackground: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  root: { flex: 1, paddingTop: 0 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  bottomSheetBackground: {
    backgroundColor: '#251C51',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  bottomSheetIndicator: { backgroundColor: '#A39AD5', width: 40, height: 4 },
  bottomSheetContent: { paddingBottom: 40 },
});

const mapStateToProps = (state) => ({
  cities: state.cities, 
  selectedCity: state.cities.selected,
  weather: state.weather,
  favorites: state.favorites.list,
});

const mapDispatchToProps = {
  fetchForecast,
  fetchForecastByDeviceLocation,
  toggleFavorite,
  selectCity,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
