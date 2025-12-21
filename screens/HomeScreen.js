import React, { useRef, useEffect, useState, useMemo } from 'react';
import { connect } from 'react-redux';

import {
  fetchForecast,
  fetchForecastByDeviceLocation,
  selectCity,
  toggleFavorite,
  fetchFavorites,
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

const isGeoId = (id) => typeof id === 'string' && id.startsWith('geo:');

function HomeScreen({
  navigation,
  selectedCity,
  weather,
  fetchForecast,
  fetchForecastByDeviceLocation,
  favorites,
  toggleFavorite,
  fetchFavorites,
}) {
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    if (selectedCity?.lat != null && selectedCity?.lon != null) {
      fetchForecast(selectedCity.lat, selectedCity.lon);
    } else {
      fetchForecastByDeviceLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const [locking, setLocking] = useState(false);

  // ✅ Chuẩn hóa city dùng cho favorite (geo:xxx => id null)
  const fixedCityForFav = useMemo(() => {
    if (!selectedCity) return null;
    if (isGeoId(selectedCity.id)) return { ...selectedCity, id: null };
    return selectedCity;
  }, [selectedCity]);

  // ✅ isFavorite: nếu city có UUID thì match theo id, nếu current location thì match theo lat/lon
  const isFavorite = useMemo(() => {
    if (!fixedCityForFav) return false;

    // case city UUID
    if (fixedCityForFav.id) {
      return (favorites ?? []).some((c) => c?.id === fixedCityForFav.id);
    }

    // case current location: match theo lat/lon (4 decimals)
    const keyLat = Number(Number(fixedCityForFav.lat).toFixed(4));
    const keyLon = Number(Number(fixedCityForFav.lon).toFixed(4));

    return (favorites ?? []).some((c) => {
      const clat = Number(Number(c?.lat).toFixed(4));
      const clon = Number(Number(c?.lon).toFixed(4));
      return clat === keyLat && clon === keyLon;
    });
  }, [fixedCityForFav, favorites]);

  const sheetRef = useRef(null);
  const snapPoints = ['50%', '89%'];

  const goToCitySearch = () => navigation.navigate('CitySearch');
  const goToHome = () => navigation.navigate('Home');
  const goToFavorites = () => navigation.navigate('Favorites');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../assets/night-sky.png')}
        style={[styles.appBackground, { backgroundColor: '#0B0B1A' }]}
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

              {/* ✅ Heart always show */}
              {!!fixedCityForFav && (
                <TouchableOpacity
                  disabled={locking}
                  onPress={async () => {
                    if (locking) return;
                    setLocking(true);

                    // ✅ quan trọng: dùng fixedCityForFav (geo => null)
                    await toggleFavorite(fixedCityForFav);

                    // ✅ reload favorites để UI đổi tim + Favorites list
                    await fetchFavorites();

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
                    opacity: locking ? 0.5 : 1,
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
  root: { flex: 1 },
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
  selectedCity: state.cities.selected,
  weather: state.weather,
  favorites: state.favorites.list,
});

const mapDispatchToProps = {
  fetchForecast,
  fetchForecastByDeviceLocation,
  toggleFavorite,
  selectCity,
  fetchFavorites,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
