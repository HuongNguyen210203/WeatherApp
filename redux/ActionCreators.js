import * as ActionTypes from './ActionTypes';
import { supabase, supabaseWithDevice } from '../shared/supabaseClient';
import { getDeviceId } from '../shared/deviceId';
import * as Location from 'expo-location';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAVORITES_CACHE_KEY } from '../shared/backgroundWeatherTask';


//helpers
const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const roundCoord = (n, p = 4) => Number(Number(n).toFixed(p));

const mergeWeatherWithAQ = (forecastJson, aqJson) => {
  return {
    ...(forecastJson ?? {}),
    air_quality: aqJson ?? null,
  };
};
//cities
export const fetchCities = () => async (dispatch) => {
  dispatch({ type: ActionTypes.CITIES_LOADING });

  const { data, error } = await supabase
    .from('cities')
    .select('id,name,country,lat,lon')
    .order('name', { ascending: true });

  if (error) {
    return dispatch({ type: ActionTypes.CITIES_FAILED, payload: error.message });
  }

  dispatch({ type: ActionTypes.CITIES_SUCCESS, payload: data ?? [] });
};

export const selectCity = (city) => ({ type: ActionTypes.SELECT_CITY, payload: city });

//air quality open meteo
export const fetchAirQuality = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    current: 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide',
  });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Air Quality API error: ${res.status}`);
  return res.json();
};

//weather forecast
export const fetchForecast = (lat, lon) => async (dispatch) => {
  try {
    dispatch({ type: ActionTypes.WEATHER_LOADING });

    if (lat == null || lon == null) throw new Error('Missing latitude/longitude');

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      timezone: 'auto',
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m',
      hourly:
        'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m,uv_index',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    const [forecastRes, aqJson] = await Promise.all([
      fetch(url),
      fetchAirQuality(lat, lon).catch(() => null),
    ]);

    if (!forecastRes.ok) throw new Error(`Open-Meteo error: ${forecastRes.status}`);

    const forecastJson = await forecastRes.json();
    const merged = mergeWeatherWithAQ(forecastJson, aqJson);

    dispatch({ type: ActionTypes.WEATHER_SUCCESS, payload: merged });
  } catch (e) {
    dispatch({ type: ActionTypes.WEATHER_FAILED, payload: e?.message ?? String(e) });
  }
};

//weather forecast by device location
export const fetchForecastByDeviceLocation = () => async (dispatch) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Location permission not granted');

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const lat = loc?.coords?.latitude;
    const lon = loc?.coords?.longitude;
    if (lat == null || lon == null) throw new Error('Cannot read device location');

    // reverse geocode
    let name = 'Current location';
    let country = '';
    try {
      const arr = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      const p = arr?.[0];
      name = p?.city || p?.subregion || p?.region || p?.district || 'Current location';
      country = p?.countryCode || p?.country || '';
    } catch {}

    
    const cityWithUuid = await ensureCityUuid({
      id: null,
      name,
      country,
      lat,
      lon,
    });

    dispatch(
      selectCity({
        ...cityWithUuid,
        source: 'device',
      })
    );

    await dispatch(fetchForecast(lat, lon));

  } catch (e) {
    dispatch({ type: ActionTypes.WEATHER_FAILED, payload: e?.message ?? String(e) });
  }
};

//fav device
export const fetchFavorites = () => async (dispatch) => {
  dispatch({ type: ActionTypes.FAVORITES_LOADING });

  try {
    const device_id = await getDeviceId();
    const client = supabaseWithDevice(device_id);

    const { data, error } = await client
      .from('favorites_device')
      .select('city_id, cities:city_id ( id,name,country,lat,lon )')
      .eq('device_id', device_id);

    if (error) {
      return dispatch({ type: ActionTypes.FAVORITES_FAILED, payload: error.message });
    }

    const cities = (data ?? []).map((row) => row.cities).filter(Boolean);
    dispatch({ type: ActionTypes.FAVORITES_SUCCESS, payload: cities });
    await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(cities ?? []));
  } catch (e) {
    dispatch({ type: ActionTypes.FAVORITES_FAILED, payload: e?.message ?? String(e) });
  }
};

// đảm bảo city.id là uuid hợp lệ
const ensureCityUuid = async (city) => {
  // CHỈ chấp nhận UUID. "geo:xxxx" sẽ không qua được.
  if (isUuid(city?.id)) return city;

  const lat = city?.lat;
  const lon = city?.lon;
  if (lat == null || lon == null) throw new Error('Missing lat/lon for city');

  const payload = {
    name: city?.name ?? 'Current location',
    country: city?.country ?? '',
    lat: roundCoord(lat, 4),
    lon: roundCoord(lon, 4),
  };

  // 1) SELECT trước theo vùng sai số (tránh float mismatch)
  const EPS = 0.0002; // ~20m
  const { data: foundFirst, error: selErr1 } = await supabase
    .from('cities')
    .select('id,name,country,lat,lon')
    .gte('lat', payload.lat - EPS)
    .lte('lat', payload.lat + EPS)
    .gte('lon', payload.lon - EPS)
    .lte('lon', payload.lon + EPS)
    .limit(1)
    .maybeSingle();

  if (selErr1) throw selErr1;
  if (foundFirst?.id) return foundFirst;

  // 2) INSERT nếu chưa có
  const { data: inserted, error: insErr } = await supabase
    .from('cities')
    .insert(payload)
    .select('id,name,country,lat,lon')
    .maybeSingle();

  if (!insErr && inserted?.id) return inserted;

  // 3) INSERT fail (trùng/rls/...) -> SELECT lại
  const { data: foundAgain, error: selErr2 } = await supabase
    .from('cities')
    .select('id,name,country,lat,lon')
    .gte('lat', payload.lat - EPS)
    .lte('lat', payload.lat + EPS)
    .gte('lon', payload.lon - EPS)
    .lte('lon', payload.lon + EPS)
    .limit(1)
    .maybeSingle();

  if (selErr2) throw selErr2;
  if (foundAgain?.id) return foundAgain;

  if (insErr) throw new Error(`Insert cities failed: ${insErr.message}`);
  throw new Error('Cannot create/find city id for current location');
};

export const toggleFavorite = (city) => async (dispatch, getState) => {
  try {
    console.log('toggleFavorite city.id=', city?.id, 'lat=', city?.lat, 'lon=', city?.lon);

    const device_id = await getDeviceId();
    const client = supabaseWithDevice(device_id);

    // luôn đảm bảo uuid hợp lệ
    const ensuredCity = await ensureCityUuid(city);

    const list = getState()?.favorites?.list ?? [];
    const exists = list.some((c) => c?.id === ensuredCity?.id);

    if (exists) {
      const { error } = await client
        .from('favorites_device')
        .delete()
        .eq('device_id', device_id)
        .eq('city_id', ensuredCity.id);

      if (error) throw error;

      dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: ensuredCity.id });
      const next = (getState()?.favorites?.list ?? []).filter((c) => c?.id !== ensuredCity.id);
      await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(next));

    } else {
      const { data, error } = await client
        .from('favorites_device')
        .upsert(
          { device_id, city_id: ensuredCity.id },
          { onConflict: 'device_id,city_id' }
        )
        .select();

      console.log('favorites_device upsert data:', data);
      if (error) throw error;

      dispatch({ type: ActionTypes.ADD_FAVORITE, payload: ensuredCity });
      const next = [ensuredCity, ...(getState()?.favorites?.list ?? [])]
        .filter((c, idx, arr) => arr.findIndex((x) => x?.id === c?.id) === idx);

      await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(next));
    }
  } catch (e) {
    console.log('toggleFavorite error:', e?.message ?? e);
  }
};
export const removeFavorite = (cityId) => async (dispatch, getState) => {
  try {
    const device_id = await getDeviceId();
    const client = supabaseWithDevice(device_id);

    const { data, error } = await client
      .from('favorites_device')
      .delete()
      .eq('device_id', device_id)
      .eq('city_id', cityId)
      .select();

    console.log('favorites_device delete data:', data);

    if (error) throw error;

    dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: cityId });

    const next = (getState()?.favorites?.list ?? []).filter(
      (c) => c?.id !== cityId
    );

    await AsyncStorage.setItem(
      FAVORITES_CACHE_KEY,
      JSON.stringify(next)
    );
  } catch (e) {
    console.log('removeFavorite error:', e?.message ?? e);
  }
};
