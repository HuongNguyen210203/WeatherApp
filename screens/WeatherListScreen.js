import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { fetchCities, selectCity } from '../redux/ActionCreators';

/* ================== Open-Meteo helpers ================== */

const geoSearch = async (name) => {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?' +
    `name=${encodeURIComponent(name)}&count=12&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed');
  const json = await res.json();
  return json?.results ?? [];
};

const fetchCurrentWeather = async (lat, lon) => {
  const url =
    'https://api.open-meteo.com/v1/forecast?' +
    `latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code,is_day' +
    '&daily=temperature_2m_max,temperature_2m_min' +
    '&timezone=auto';

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather request failed');
  const json = await res.json();

  const temp = json?.current?.temperature_2m;
  const code = json?.current?.weather_code;
  const isDay = json?.current?.is_day;

  const hi = Array.isArray(json?.daily?.temperature_2m_max)
    ? json.daily.temperature_2m_max[0]
    : null;
  const lo = Array.isArray(json?.daily?.temperature_2m_min)
    ? json.daily.temperature_2m_min[0]
    : null;

  return { temp, hi, lo, code, isDay };
};

const codeToText = (code) => {
  if (code === 0) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
  if ([71, 73, 75, 77].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Weather';
};

/* ================== Screen ================== */

function WeatherListScreen({ navigation, cities, fetchCities, selectCity }) {
  const [q, setQ] = useState('');

  // Online search state
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineErr, setOnlineErr] = useState('');
  const [onlineResults, setOnlineResults] = useState([]);

  // Cache weather preview by lat/lon
  const weatherCacheRef = useRef(new Map()); // key: "lat,lon" -> {temp,hi,lo,code}
  const [, forceRerender] = useState(0);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Local cities (Supabase) filter
  const localFiltered = useMemo(() => {
    const list = cities?.list ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c) => {
      const name = (c.name ?? '').toLowerCase();
      const country = (c.country ?? '').toLowerCase();
      return name.includes(s) || country.includes(s);
    });
  }, [cities?.list, q]);

  // Debounced worldwide search
  useEffect(() => {
    const s = q.trim();
    setOnlineErr('');

    if (s.length < 2) {
      setOnlineResults([]);
      setOnlineLoading(false);
      return;
    }

    let cancelled = false;
    setOnlineLoading(true);

    const t = setTimeout(async () => {
      try {
        const results = await geoSearch(s);
        if (cancelled) return;

        const mapped = (results ?? []).map((r) => ({
          id: `geo:${r.id ?? `${r.latitude},${r.longitude}`}`,
          name: r.name,
          country: r.country_code || r.country || '',
          lat: r.latitude,
          lon: r.longitude,
          admin1: r.admin1 || '',
        }));

        setOnlineResults(mapped);
      } catch (e) {
        if (!cancelled) setOnlineErr(e?.message || 'Search failed');
      } finally {
        if (!cancelled) setOnlineLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  // Decide which list to show:
  // typing >=2 chars => online results, else local DB list
  const listToRender = useMemo(() => {
    const s = q.trim();
    if (s.length >= 2) return onlineResults;
    return localFiltered;
  }, [q, onlineResults, localFiltered]);

  const ensureWeatherPreview = async (item) => {
    if (item?.lat == null || item?.lon == null) return;
    const key = `${item.lat},${item.lon}`;
    if (weatherCacheRef.current.has(key)) return;

    try {
      const w = await fetchCurrentWeather(item.lat, item.lon);
      weatherCacheRef.current.set(key, w);
      forceRerender((x) => x + 1);
    } catch {
      // ignore per-item preview errors
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.weatherListHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.weatherListTitle}>City Search</Text>

          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={20} color="#A39AD5" style={styles.searchIcon} />
          <TextInput
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            placeholder="Search any city / country"
            placeholderTextColor="#A39AD5"
          />
          {q.length > 0 ? (
            <TouchableOpacity onPress={() => setQ('')} style={{ padding: 6 }}>
              <MaterialIcons name="close" size={18} color="#A39AD5" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Loading / Error */}
        {cities?.isLoading ? (
          <Text style={styles.hintText}>Loading saved cities...</Text>
        ) : cities?.errMess ? (
          <Text style={styles.errText}>{cities.errMess}</Text>
        ) : null}

        {q.trim().length >= 2 && onlineLoading ? (
          <Text style={styles.hintText}>Searching worldwide...</Text>
        ) : null}

        {q.trim().length >= 2 && !!onlineErr ? (
          <Text style={styles.errText}>{onlineErr}</Text>
        ) : null}

        {/* List */}
        <ScrollView
          style={styles.weatherListScroll}
          contentContainerStyle={styles.weatherListContent}
          showsVerticalScrollIndicator={false}
        >
          {listToRender.map((item) => {
            const key = `${item.lat},${item.lon}`;
            const w = weatherCacheRef.current.get(key);

            if (!w) ensureWeatherPreview(item);

            const tempText = w?.temp != null ? `${Math.round(w.temp)}°` : '--°';
            const hiLoText =
              w?.hi != null && w?.lo != null
                ? `H:${Math.round(w.hi)} L:${Math.round(w.lo)}`
                : 'H:-- L:--';
            const condText = w?.code != null ? codeToText(w.code) : '...';

            return (
              <TouchableOpacity
                key={String(item.id)}
                style={styles.weatherCard}
                onPress={() => {
                  selectCity(item);
                  navigation.navigate('Home');
                }}
              >
                <View style={styles.weatherCardLeft}>
                  <Text style={styles.weatherCardTemp}>{tempText}</Text>
                  <Text style={styles.weatherCardHighLow}>{hiLoText}</Text>
                  <Text style={styles.weatherCardLocation}>
                    {item.name}
                    {item.admin1 ? `, ${item.admin1}` : ''}, {item.country}
                  </Text>
                  <Text style={styles.weatherCardCondition}>{condText}</Text>
                </View>

                {/* bạn bảo bỏ icon => để trống */}
                <View style={styles.weatherCardRight} />
              </TouchableOpacity>
            );
          })}

          {!cities?.isLoading && !cities?.errMess && listToRender.length === 0 ? (
            <Text style={styles.emptyText}>No results.</Text>
          ) : null}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const mapStateToProps = (state) => ({
  cities: state.cities,
});

const mapDispatchToProps = {
  fetchCities,
  selectCity,
};

export default connect(mapStateToProps, mapDispatchToProps)(WeatherListScreen);

/* ================== Styles ================== */

const styles = StyleSheet.create({
  // ✅ Đây là phần bạn cần: hạ toàn bộ UI xuống tránh camera/status bar
  safeArea: {
    flex: 1,
    backgroundColor: '#251C51',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 1: 0,
  },

  container: { flex: 1 },

  weatherListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: { padding: 4 },
  weatherListTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  menuButton: { padding: 4 },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { color: '#FFFFFF', fontSize: 14, flex: 1 },

  hintText: { color: '#FFFFFF', marginHorizontal: 20, marginBottom: 10, opacity: 0.9 },
  errText: { color: '#FFB4B4', marginHorizontal: 20, marginBottom: 10 },

  weatherListScroll: { flex: 1 },
  weatherListContent: { paddingHorizontal: 20, paddingBottom: 30 },

  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  weatherCardLeft: { flex: 1 },

  weatherCardTemp: { color: '#FFFFFF', fontSize: 54, fontWeight: '300', marginBottom: 4 },
  weatherCardHighLow: { color: '#FFFFFF', fontSize: 14, marginBottom: 10, opacity: 0.95 },
  weatherCardLocation: { color: '#FFFFFF', fontSize: 16, fontWeight: '500', marginBottom: 6 },
  weatherCardCondition: { color: '#FFFFFF', fontSize: 14, opacity: 0.8 },

  weatherCardRight: { width: 10 },

  emptyText: { color: '#A39AD5', textAlign: 'center', marginTop: 16 },
});
