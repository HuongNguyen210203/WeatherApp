import * as ActionTypes from './ActionTypes';
import { supabase, supabaseWithDevice } from '../shared/supabaseClient';
import { getDeviceId } from '../shared/deviceId'; // nếu file bạn là deviceid.js thì đổi thành '../shared/deviceid'

// =====================
// CITIES (không cần device header)
// =====================
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

// =====================
// WEATHER (không cần device header)
// =====================
export const fetchForecast = (lat, lon) => async (dispatch) => {
  dispatch({ type: ActionTypes.WEATHER_LOADING });

  const { data, error } = await supabase.functions.invoke('forecast', {
    body: { lat, lon },
  });

  if (error) {
    return dispatch({ type: ActionTypes.WEATHER_FAILED, payload: error.message });
  }

  dispatch({ type: ActionTypes.WEATHER_SUCCESS, payload: data });
};

// =====================
// ANONYMOUS USER INIT (cần device header nếu bật RLS)
// =====================
export const initAnonymousUser = () => async (dispatch) => {
  try {
    const deviceId = await getDeviceId();
    const sb = supabaseWithDevice(deviceId);

    // Upsert device_id lên bảng anonymous_users
    const { error } = await sb
      .from('anonymous_users')
      .upsert({ device_id: deviceId }, { onConflict: 'device_id' });

    if (error) {
      console.log('upsert anonymous_users error:', error.message);
      // vẫn tiếp tục, vì app vẫn có deviceId local
    }

    await dispatch(fetchFavorites(deviceId));
  } catch (e) {
    console.log('initAnonymousUser failed:', e?.message ?? e);
  }
};

// =====================
// FAVORITES (cần device header nếu bật RLS)
// =====================
export const fetchFavorites = (deviceIdParam) => async (dispatch) => {
  dispatch({ type: ActionTypes.FAVORITES_LOADING });

  try {
    const deviceId = deviceIdParam ?? (await getDeviceId());
    const sb = supabaseWithDevice(deviceId);

    const { data, error } = await sb
      .from('favorites_device')
      .select('city_id, cities:city_id ( id, name, country, lat, lon )')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const cities = (data ?? []).map((row) => row.cities).filter(Boolean);

    dispatch({ type: ActionTypes.FAVORITES_SUCCESS, payload: cities });
  } catch (e) {
    dispatch({
      type: ActionTypes.FAVORITES_FAILED,
      payload: e?.message ?? 'fetchFavorites failed',
    });
  }
};

export const addFavorite = (cityId) => async (dispatch) => {
  try {
    const deviceId = await getDeviceId();
    const sb = supabaseWithDevice(deviceId);

    const { error } = await sb
      .from('favorites_device')
      .upsert(
        { device_id: deviceId, city_id: cityId },
        { onConflict: 'device_id,city_id' }
      );

    if (error) throw error;

    await dispatch(fetchFavorites(deviceId));
  } catch (e) {
    console.log('addFavorite failed:', e?.message ?? e);
  }
};

export const removeFavorite = (cityId) => async (dispatch) => {
  try {
    const deviceId = await getDeviceId();
    const sb = supabaseWithDevice(deviceId);

    const { error } = await sb
      .from('favorites_device')
      .delete()
      .eq('device_id', deviceId)
      .eq('city_id', cityId);

    if (error) throw error;

    await dispatch(fetchFavorites(deviceId));
  } catch (e) {
    console.log('removeFavorite failed:', e?.message ?? e);
  }
};

export const toggleFavorite = (city) => async (dispatch, getState) => {
  try {
    const currentFavs = getState()?.favorites?.list ?? [];
    const exists = currentFavs.some((c) => c?.id === city?.id);

    if (exists) {
      await dispatch(removeFavorite(city.id));
    } else {
      await dispatch(addFavorite(city.id));
    }
  } catch (e) {
    console.log('toggleFavorite failed:', e?.message ?? e);
  }
};
