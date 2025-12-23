// shared/backgroundWeatherTask.js
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  fetchMiniForecast,
  detectBadWeather,
  fetchMiniAirQuality,
  detectBadAirQuality,
} from './weatherAlerts';

import { canSendAlert, markAlertSent, pushWeatherAlert } from './notify';

export const TASK_NAME = 'WEATHER_ALERTS_TASK';
export const FAVORITES_CACHE_KEY = 'FAVORITES_CACHE_V1';

// (tuỳ chọn) giới hạn số thành phố mỗi lần chạy để tránh rate limit
const MAX_CITIES_PER_RUN = 6;

// (tuỳ chọn) retry nhẹ khi gặp 429/timeout
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safeFetchMiniForecast(lat, lon) {
  try {
    return await fetchMiniForecast(lat, lon);
  } catch (e) {
    // retry 1 lần nếu lỗi tạm thời
    await sleep(800);
    return await fetchMiniForecast(lat, lon);
  }
}

async function safeFetchMiniAQ(lat, lon) {
  try {
    return await fetchMiniAirQuality(lat, lon);
  } catch (e) {
    // AQ là phụ, fail thì bỏ qua
    return null;
  }
}

/**
 * Ưu tiên loại alert:
 * - Weather (storm/wind/snow/rain/uv/fog)
 * - Nếu không có weather alert thì mới xét AQI
 */
function pickAlert(weatherJson, aqJson) {
  const w = detectBadWeather(weatherJson);
  if (w) return w;

  const aq = detectBadAirQuality(aqJson);
  if (aq) return aq;

  return null;
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const raw = (await AsyncStorage.getItem(FAVORITES_CACHE_KEY)) || '[]';
    const favs = JSON.parse(raw);

    if (!Array.isArray(favs) || favs.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // giảm tải: chỉ check một phần favorites mỗi lần
    const slice = favs.slice(0, MAX_CITIES_PER_RUN);

    let sentAny = false;

    for (const city of slice) {
      const lat = city?.lat;
      const lon = city?.lon;

      if (lat == null || lon == null) continue;

      // 1) Weather mini
      let weatherJson = null;
      try {
        weatherJson = await safeFetchMiniForecast(lat, lon);
      } catch (e) {
        // nếu weather fail thì skip city (vì weather là chính)
        continue;
      }

      // 2) AQ mini (phụ)
      const aqJson = await safeFetchMiniAQ(lat, lon);

      // 3) Quyết định alert
      const alert = pickAlert(weatherJson, aqJson);
      if (!alert) continue;

      // 4) chống spam theo (cityId, alertType)
      //    - city.id (UUID) lý tưởng; nếu thiếu thì fallback theo lat/lon (ổn cho background)
      const cityKey = city?.id
        ? `city:${String(city.id)}`
        : `geo:${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;


      const ok = await canSendAlert(cityKey, alert.type);
      if (!ok) continue;

      // 5) push notification
      const cityName = city?.name ?? 'Favorite place';
      await pushWeatherAlert(alert, cityName);
      await markAlertSent(cityKey, alert.type);

      sentAny = true;
    }

    return sentAny
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerWeatherAlertsTask() {
  const status = await BackgroundFetch.getStatusAsync();
  if (status !== BackgroundFetch.BackgroundFetchStatus.Available) return;

  const tasks = await TaskManager.getRegisteredTasksAsync();
  const already = tasks.some((t) => t.taskName === TASK_NAME);
  if (already) return;

  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 30 * 60, 
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
