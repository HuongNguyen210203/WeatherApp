import React, { useRef, useEffect, useState, useMemo } from 'react';
import { connect } from 'react-redux';

// noti
import { detectBadWeather, detectBadAirQuality } from '../shared/weatherAlerts';
import { canSendAlert, markAlertSent, pushWeatherAlert } from '../shared/notify';
import { runImmediateAlerts } from '../shared/immediateAlerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAVORITES_CACHE_KEY } from '../shared/backgroundWeatherTask';
import { getDeviceId } from '../shared/deviceId';

//redux
import {
  fetchForecast,
  fetchForecastByDeviceLocation,
  selectCity,
  toggleFavorite,
  fetchFavorites,
} from '../redux/ActionCreators';

// homescreen
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
//refs
  const lastFetchRef = useRef(null);
  const didRunImmediateRef = useRef(false);
  const skipFirstForegroundAlertRef = useRef(false);
  const lastImmediateSigRef = useRef('');     // chống chạy lặp cùng 1 chữ ký
  const lastFavoritesSigRef = useRef('');     // theo dõi favorites đã thay đổi chưa


//load favorites

useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      await getDeviceId();          // đảm bảo DEVICE_ID đã có
      if (!mounted) return;
      fetchFavorites();             // rồi mới fetch favorites
    } catch {
      // ignore
    }
  })();

  return () => { mounted = false; };
}, [fetchFavorites]);
//cache favorites for immediateAlerts/background task
  useEffect(() => {
  (async () => {
    try {
      await AsyncStorage.setItem(
        FAVORITES_CACHE_KEY,
        JSON.stringify(favorites ?? [])
      );
    } catch {
      // ignore
    }
  })();
}, [favorites]);


  //fetch weather when selectedCity changes
  useEffect(() => {
    if (selectedCity?.lat != null && selectedCity?.lon != null) {
      const key = `${selectedCity.lat},${selectedCity.lon}`;
      if (lastFetchRef.current === key) return;
      lastFetchRef.current = key;
      fetchForecast(selectedCity.lat, selectedCity.lon);
    } else {
      if (lastFetchRef.current === 'device') return;
      lastFetchRef.current = 'device';
      fetchForecastByDeviceLocation();
    }
  }, [
    selectedCity?.lat,
    selectedCity?.lon,
    fetchForecast,
    fetchForecastByDeviceLocation,
  ]);

//memo
  const [locking, setLocking] = useState(false);

  const fixedCityForFav = useMemo(() => {
    if (!selectedCity) return null;
    if (isGeoId(selectedCity.id)) return { ...selectedCity, id: null };
    return selectedCity;
  }, [selectedCity]);

  const isFavorite = useMemo(() => {
    if (!fixedCityForFav) return false;

    if (fixedCityForFav.id) {
      return (favorites ?? []).some((c) => c?.id === fixedCityForFav.id);
    }

    const lat = Number(Number(fixedCityForFav.lat).toFixed(4));
    const lon = Number(Number(fixedCityForFav.lon).toFixed(4));

    return (favorites ?? []).some((c) => {
      const clat = Number(Number(c?.lat).toFixed(4));
      const clon = Number(Number(c?.lon).toFixed(4));
      return clat === lat && clon === lon;
    });
  }, [fixedCityForFav, favorites]);

 //alert when app first load
  // alert on app load / reload (current + favorites)
useEffect(() => {
  const run = async () => {
    if (!fixedCityForFav?.lat || !fixedCityForFav?.lon) return;
    if (!weather?.data || weather?.isLoading || weather?.errMess) return;

    // tạo chữ ký để biết "đã chạy immediate với bộ dữ liệu này chưa"
    const cityKey = fixedCityForFav.id
      ? `city:${String(fixedCityForFav.id)}`
      : `geo:${Number(fixedCityForFav.lat).toFixed(4)},${Number(fixedCityForFav.lon).toFixed(4)}`;

    const favSig = JSON.stringify(
      (favorites ?? []).map((c) => c?.id ?? `${Number(c?.lat).toFixed(4)},${Number(c?.lon).toFixed(4)}`)
    );

    const sig = `${cityKey}|${favSig}`;

    // Nếu chưa đổi gì thì không chạy lại
    if (lastImmediateSigRef.current === sig) return;
    lastImmediateSigRef.current = sig;

    // tránh foreground bắn ngay sau immediate
    skipFirstForegroundAlertRef.current = true;

    await runImmediateAlerts({
      currentCity: fixedCityForFav,
      currentWeather: weather.data,
      favoritesOverride: favorites ?? [],   // <-- cần sửa immediateAlerts để nhận param này
    });
  };

  run().catch(() => {});
}, [
  fixedCityForFav?.id,
  fixedCityForFav?.lat,
  fixedCityForFav?.lon,
  fixedCityForFav?.name,
  weather?.data,
  weather?.isLoading,
  weather?.errMess,
  favorites, 
]);



  //alert when app in foreground, reload
  useEffect(() => {
    const run = async () => {
      if (weather?.isLoading) return;
      if (weather?.errMess) return;
      if (!weather?.data) return;

      const city = fixedCityForFav;
      if (!city?.lat || !city?.lon) return;

      // tránh trùng với immediate
      if (skipFirstForegroundAlertRef.current) {
        skipFirstForegroundAlertRef.current = false;
        return;
      }

      const wAlert = detectBadWeather(weather.data);
      const aqAlert = detectBadAirQuality(weather.data?.air_quality);
      const alert = wAlert || aqAlert;
      if (!alert) return;

      const key = city.id
        ? `city:${city.id}`
        : `geo:${Number(city.lat).toFixed(4)},${Number(city.lon).toFixed(4)}`;

      const ok = await canSendAlert(key, alert.type);
      if (!ok) return;

      await pushWeatherAlert(alert, city.name ?? 'Weather');
      await markAlertSent(key, alert.type);
    };

    run().catch(() => {});
  }, [
    weather?.data,
    weather?.isLoading,
    weather?.errMess,
    fixedCityForFav?.id,
    fixedCityForFav?.lat,
    fixedCityForFav?.lon,
    fixedCityForFav?.name,
  ]);

//bottom sheet
  const sheetRef = useRef(null);
  const snapPoints = ['50%', '89%'];

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
                onChooseCityPress={() =>
                  navigation.navigate('Favorites', { pickMode: true })
                }
              />

              {!!fixedCityForFav && (
                <TouchableOpacity
                  disabled={locking}
                  onPress={async () => {
                    if (locking) return;
                    setLocking(true);
                    await toggleFavorite(fixedCityForFav);
                    await fetchFavorites();
                    setLocking(false);
                  }}
                  style={styles.heart}
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
              <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
                <ForecastTabs
                  hourly={weather?.data?.hourly}
                  daily={weather?.data?.daily}
                />
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
              onPlusPress={() => navigation.navigate('CitySearch')}
              onPinPress={() => navigation.navigate('Home')}
              onListPress={() => navigation.navigate('Favorites')}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

//styles
const styles = StyleSheet.create({
  appBackground: { flex: 1 },
  safeArea: { flex: 1 },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  heart: {
    position: 'absolute',
    top: 110,
    right: 20,
    zIndex: 999,
    backgroundColor: '#342561',
    padding: 12,
    borderRadius: 20,
  },
  bottomSheetBackground: {
    backgroundColor: '#251C51',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  bottomSheetIndicator: {
    backgroundColor: '#A39AD5',
    width: 40,
    height: 4,
  },
  bottomSheetContent: { paddingBottom: 40 },
});

//redux
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
