import * as ActionTypes from './ActionTypes';
import { supabase } from '../shared/supabaseClient';
import { getDeviceId } from '../shared/deviceId';
import * as Location from 'expo-location';

/* =====================
 * CITIES (Supabase)
 * ===================== */
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

export const selectCity = (city) => ({
  type: ActionTypes.SELECT_CITY,
  payload: city,
});

/* =====================
 * WEATHER (Open-Meteo)
 * ===================== */
export const fetchForecast = (lat, lon) => async (dispatch) => {
  try {
    dispatch({ type: ActionTypes.WEATHER_LOADING });

    if (lat == null || lon == null) throw new Error('Missing latitude/longitude');

    // 1) Forecast (weather) - thêm UV, wind direction, sunrise/sunset
    const forecastParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),

      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m', // ✅ thêm hướng gió
      ].join(','),

      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
        'is_day', 
      ].join(','),

      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',  // ✅
        'sunset',   // ✅
        'precipitation_probability_max',
        'uv_index_max', // ✅ UV max trong ngày
      ].join(','),

      timezone: 'auto',
    });

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?${forecastParams.toString()}`;

    // 2) Air Quality - AQI thật
    const airParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: [
        'us_aqi',
        'pm2_5',
        'pm10',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
      ].join(','),
      timezone: 'auto',
    });

    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${airParams.toString()}`;

    // Fetch song song
    const [forecastRes, airRes] = await Promise.all([fetch(forecastUrl), fetch(airUrl)]);

    if (!forecastRes.ok) {
      const txt = await forecastRes.text();
      throw new Error(`Forecast API ${forecastRes.status}: ${txt}`);
    }
    if (!airRes.ok) {
      const txt = await airRes.text();
      throw new Error(`Air Quality API ${airRes.status}: ${txt}`);
    }

    const forecastData = await forecastRes.json();
    const airData = await airRes.json();

    // ✅ Gộp lại vào 1 payload (UI vẫn dùng weather.data.current/hourly/daily như cũ)
    dispatch({
      type: ActionTypes.WEATHER_SUCCESS,
      payload: {
        ...forecastData,
        air_quality: airData, // thêm field mới
      },
    });
  } catch (e) {
    dispatch({ type: ActionTypes.WEATHER_FAILED, payload: e?.message ?? String(e) });
  }
};

/* =====================
 * WEATHER by Device Location (App startup)
 * ===================== */
export const fetchForecastByDeviceLocation = () => async (dispatch) => {
  try {
    // xin quyền
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Location permission not granted');

    // lấy vị trí hiện tại
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    // reverse geocode -> lấy city name
    let cityName = 'Current Location';
    let country = '';

    try {
      const geos = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      const g = geos?.[0];
      cityName = g?.city || g?.subregion || g?.region || 'Current Location';
      country = g?.country || '';
    } catch (e) {
      // ignore reverse geocode fail
    }

    // ✅ QUAN TRỌNG: set selectedCity để header hiển thị tên
    dispatch(
      selectCity({
        id: 'device-location', // id tạm
        name: cityName,
        country,
        lat,
        lon,
      })
    );

    // fetch weather theo lat/lon
    await dispatch(fetchForecast(lat, lon));
  } catch (e) {
    dispatch({ type: ActionTypes.WEATHER_FAILED, payload: e.message || String(e) });
  }
};

/* =====================
 * FAVORITES (Supabase + UUID)
 * - favorites.list bạn đang dùng là list city object (HomeScreen check c.id)
 * ===================== */
export const fetchFavorites = () => async (dispatch) => {
  dispatch({ type: ActionTypes.FAVORITES_LOADING });

  try {
    const device_id = await getDeviceId();

    // Lấy favorites + join cities (nếu bạn có foreign key favorites.city_id -> cities.id)
    const { data, error } = await supabase
      .from('favorites')
      .select('city_id, cities ( id,name,country,lat,lon )')
      .eq('device_id', device_id);

    if (error) {
      return dispatch({ type: ActionTypes.FAVORITES_FAILED, payload: error.message });
    }

    // Trả list city objects
    const cities = (data ?? [])
      .map((row) => row.cities)
      .filter(Boolean);

    dispatch({ type: ActionTypes.FAVORITES_SUCCESS, payload: cities });
  } catch (e) {
    dispatch({ type: ActionTypes.FAVORITES_FAILED, payload: e?.message ?? String(e) });
  }
};

/**
 * toggleFavorite(city)
 */
export const toggleFavorite = (city) => async (dispatch, getState) => {
  try {
    const device_id = await getDeviceId();
    const list = getState()?.favorites?.list ?? [];
    const exists = list.some((c) => c?.id === city?.id);

    if (exists) {
      // remove
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('device_id', device_id)
        .eq('city_id', city.id);

      if (error) throw error;

      dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: city.id });
    } else {
      // add
      const { error } = await supabase
        .from('favorites')
        .insert({ device_id, city_id: city.id });

      if (error) throw error;

      dispatch({ type: ActionTypes.ADD_FAVORITE, payload: city });
    }
  } catch (e) {
    // Nếu bạn có toast/alert thì xử lý ở UI; ở đây cứ log để debug
    console.log('toggleFavorite error:', e?.message ?? e);
  }
};
