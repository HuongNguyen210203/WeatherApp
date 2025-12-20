import * as ActionTypes from './ActionTypes';
import { supabase } from '../shared/supabaseClient';

//cities
export const fetchCities = () => async (dispatch) => {
  dispatch({ type: ActionTypes.CITIES_LOADING });

  const { data, error } = await supabase
    .from('cities')
    .select('id,name,country,lat,lon')
    .order('name', { ascending: true });

  if (error) return dispatch({ type: ActionTypes.CITIES_FAILED, payload: error.message });
  dispatch({ type: ActionTypes.CITIES_SUCCESS, payload: data ?? [] });
  console.log('fetchCities start');
  console.log('result', { data, error });

};


export const selectCity = (city) => ({ type: ActionTypes.SELECT_CITY, payload: city });

//weather
export const fetchForecast = (lat, lon) => async (dispatch) => {
  dispatch({ type: ActionTypes.WEATHER_LOADING });

  const { data, error } = await supabase.functions.invoke('forecast', {
    body: { lat, lon },
  });

  if (error) return dispatch({ type: ActionTypes.WEATHER_FAILED, payload: error.message });
  dispatch({ type: ActionTypes.WEATHER_SUCCESS, payload: data });
};

export const addFavorite = (cityId) => async (dispatch) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;

  if (!userId) return; // chưa login thì lát mình xử lý UX

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, city_id: cityId });

  if (!error) dispatch(fetchFavorites());
};

export const removeFavorite = (cityId) => async (dispatch) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;

  if (!userId) return;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('city_id', cityId);

  if (!error) dispatch(fetchFavorites());
};


// helper: chuẩn hoá payload theo reducer auth của bạn
const authPayload = (session) => ({
  session: session ?? null,
  user: session?.user ?? null,
});

let authSub = null;

export const bootstrapAuth = () => async (dispatch) => {
  dispatch({ type: ActionTypes.AUTH_LOADING });

  try {
    // 1) lấy session hiện tại
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data?.session ?? null;

    dispatch({
      type: ActionTypes.AUTH_SUCCESS,
      payload: authPayload(session),
    });

    // 2) subscribe (chỉ gắn 1 lần)
    if (!authSub) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession) {
          dispatch({
            type: ActionTypes.AUTH_SUCCESS,
            payload: authPayload(newSession),
          });
        } else {
          dispatch({ type: ActionTypes.AUTH_SIGNOUT });
        }
      });

      authSub = sub?.subscription ?? null;
    }
    if (session) {
      await dispatch(fetchFavorites());
    } else {
      dispatch({ type: ActionTypes.FAVORITES_CLEAR });
    }
  } catch (e) {
    dispatch({
      type: ActionTypes.AUTH_FAILED,
      payload: e?.message ?? 'bootstrapAuth failed',
    });
  }
};

export const signInWithEmail = (email, password) => async (dispatch) => {
  dispatch({ type: ActionTypes.AUTH_LOADING });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const accessToken = data?.session?.access_token;
    console.log('ACCESS TOKEN:', accessToken);

    const session = data?.session ?? null;

    dispatch({
      type: ActionTypes.AUTH_SUCCESS,
      payload: authPayload(session),
    });
    //auto sync
    await dispatch(fetchFavorites());
  } catch (e) {
    dispatch({
      type: ActionTypes.AUTH_FAILED,
      payload: e?.message ?? 'Login failed',
    });
  }
};

export const signUpWithEmail = (email, password) => async (dispatch) => {
  dispatch({ type: ActionTypes.AUTH_LOADING });

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    
    const session = data?.session ?? null;

    dispatch({
      type: ActionTypes.AUTH_SUCCESS,
      payload: authPayload(session),
    });
  } catch (e) {
    dispatch({
      type: ActionTypes.AUTH_FAILED,
      payload: e?.message ?? 'Signup failed',
    });
  }
};

export const signOut = () => async (dispatch) => {
  dispatch({ type: ActionTypes.AUTH_LOADING });

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    dispatch({ type: ActionTypes.AUTH_SIGNOUT });
    dispatch({ type: ActionTypes.FAVORITES_CLEAR });
  } catch (e) {
    dispatch({
      type: ActionTypes.AUTH_FAILED,
      payload: e?.message ?? 'Logout failed',
    });
  }
};

export const fetchFavorites = () => async (dispatch) => {
  dispatch({ type: ActionTypes.FAVORITES_LOADING });

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('city_id, cities:city_id ( id, name, country, lat, lon )')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const cities = (data ?? []).map((row) => row.cities);
    dispatch({
      type: ActionTypes.FAVORITES_SUCCESS,
      payload: cities,
    });
  } catch (e) {
    dispatch({
      type: ActionTypes.FAVORITES_FAILED,
      payload: e.message,
    });
  }
};


export const toggleFavorite = (city) => async (dispatch) => {
  try {
    const { error } = await supabase.functions.invoke('favorites', {
      body: { op: 'toggle', city_id: city.id },
    });
    if (error) throw error;

    await dispatch(fetchFavorites());
  } catch (e) {
    console.error('toggleFavorite failed:', e);
  }
};
