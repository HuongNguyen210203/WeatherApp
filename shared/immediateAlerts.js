import AsyncStorage from '@react-native-async-storage/async-storage';
import { canSendAlert, markAlertSent, pushWeatherAlert } from './notify';
import {
  detectBadWeather,
  detectBadAirQuality,
  fetchMiniForecast,
  fetchMiniAirQuality,
} from './weatherAlerts';
import { FAVORITES_CACHE_KEY } from './backgroundWeatherTask';

// Giới hạn để tránh 429 (tuỳ bạn chỉnh)
const MAX_FAVORITES_CHECK = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Chuẩn hoá key để đồng bộ với HomeScreen/foreground
 * - Nếu có id:  city:<id>
 * - Nếu không:   geo:<lat4>,<lon4>
 */
function cityKey(city) {
  if (city?.id) return `city:${String(city.id)}`;
  if (city?.lat != null && city?.lon != null) {
    return `geo:${Number(city.lat).toFixed(4)},${Number(city.lon).toFixed(4)}`;
  }
  return null;
}

export async function runImmediateAlerts({
  currentCity,        // { id?, name, lat, lon }
  currentWeather,     // weather.data (forecast full) nếu đã có
  favoritesOverride,  // mảng favorites từ Redux (nếu có) - ƯU TIÊN
}) {
  // 1) Load favorites (ưu tiên Redux override, fallback AsyncStorage)
  let favorites = [];
  if (Array.isArray(favoritesOverride)) {
    favorites = favoritesOverride;
  } else {
    const raw = (await AsyncStorage.getItem(FAVORITES_CACHE_KEY)) || '[]';
    const favs = JSON.parse(raw);
    favorites = Array.isArray(favs) ? favs : [];
  }

  // 2) Tạo danh sách city cần check: current + favorites
  const list = [];

  if (currentCity?.lat != null && currentCity?.lon != null) {
    list.push({ ...currentCity, __source: 'current' });
  }

  for (const c of favorites.slice(0, MAX_FAVORITES_CHECK)) {
    if (c?.lat == null || c?.lon == null) continue;
    list.push({ ...c, __source: 'favorite' });
  }

  // 3) Deduplicate theo cityKey chuẩn hoá
  const seen = new Set();
  const uniq = [];
  for (const c of list) {
    const key = cityKey(c);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniq.push(c);
  }

  // 4) Check lần lượt
  for (const c of uniq) {
    const key = cityKey(c);
    if (!key) continue;

    let weatherJson = null;
    let aqJson = null;

    // Nếu current và đã có currentWeather thì reuse
    if (c.__source === 'current' && currentWeather) {
      weatherJson = currentWeather;
      aqJson = currentWeather?.air_quality ?? null;
    } else {
      weatherJson = await fetchMiniForecast(c.lat, c.lon);
      await sleep(350);
      aqJson = await fetchMiniAirQuality(c.lat, c.lon);
      await sleep(350);
    }

    const alert =
      detectBadWeather(weatherJson) || detectBadAirQuality(aqJson);
    if (!alert) continue;

      console.log('[IMMEDIATE] checking', {
    name: c.name,
    source: c.__source, // current | favorite
    key,
    alert,
  });

    const ok = await canSendAlert(key, alert.type);
    if (!ok) continue;

    await pushWeatherAlert(alert, c.name ?? 'Weather');
    await markAlertSent(key, alert.type);
  }
}
