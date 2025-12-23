// logic cảnh báo thời tiết xấu & chất lượng không khí

/**
 * Phân tích thời tiết xấu từ Open-Meteo (mini forecast)
 * @param {Object} param0
 * @returns {null | { type, title, body }}
 */
export function detectBadWeather({ current, daily }) {
  const code = current?.weather_code;
  const wind = current?.wind_speed_10m ?? 0;
  const uvMax = daily?.uv_index_max?.[0] ?? null;

  // Thunderstorm / severe weather
  const isThunderstorm = typeof code === 'number' && code >= 95; // 95–99

  // Rain
  const isRain = [61, 63, 65, 66, 67, 80, 81, 82].includes(code);

  // Snow / freezing
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);

  // Fog
  const isFog = [45, 48].includes(code);

  // Strong wind (m/s)
  const isStormWind = wind >= 17; // ~ cấp gió mạnh

  // Harsh sun (UV)
  const isHarshSun = uvMax != null && uvMax >= 7;

  

  if (isThunderstorm) {
    return {
      type: 'STORM',
      title: '⚠️ Storm alert',
      body: 'Thunderstorm or severe weather expected. Avoid outdoor activities.',
    };
  }

  if (isStormWind) {
    return {
      type: 'WIND',
      title: '💨 Strong wind',
      body: 'Strong wind conditions. Be careful when traveling.',
    };
  }

  if (isSnow) {
    return {
      type: 'SNOW',
      title: '❄️ Snow alert',
      body: 'Snow or icy conditions expected. Travel with caution.',
    };
  }

  if (isRain) {
    return {
      type: 'RAIN',
      title: '🌧️ Rain alert',
      body: 'Rain expected. Bring an umbrella or raincoat.',
    };
  }

  if (isHarshSun) {
    return {
      type: 'UV',
      title: '☀️ High UV index',
      body: 'UV level is high. Use sun protection and stay hydrated.',
    };
  }

  if (isFog) {
    return {
      type: 'FOG',
      title: '🌫️ Fog alert',
      body: 'Low visibility due to fog. Drive carefully.',
    };
  }

  return null;
}

/**
 * Fetch mini weather forecast cho alert (nhẹ, tránh rate limit)
 */
export async function fetchMiniForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    current: 'weather_code,wind_speed_10m',
    daily: 'uv_index_max',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mini forecast fetch failed: ${res.status}`);
  }
  return res.json();
}

/* ======================================================
 * AIR QUALITY (Open-Meteo) — logic cho cảnh báo AQI
 * ====================================================== */

/**
 * Fetch mini air quality (chỉ AQI)
 */
export async function fetchMiniAirQuality(lat, lon) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    current: 'us_aqi',
  });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mini AQ fetch failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Phân tích AQI xấu
 * @param {Object} aqJson
 * @returns {null | { type, level, title, body }}
 */
export function detectBadAirQuality(aqJson) {
  const aqi = aqJson?.current?.us_aqi;
  if (aqi == null) return null;

  // AQI > 150: rất xấu
  if (aqi > 150) {
    return {
      type: 'AQI',
      level: 'VERY_BAD',
      title: '🌫️ Very poor air quality',
      body: 'Air quality is hazardous. Stay indoors if possible.',
    };
  }

  // AQI 101–150: kém
  if (aqi >= 101) {
    return {
      type: 'AQI',
      level: 'BAD',
      title: '🌫️ Poor air quality',
      body: 'Air quality is unhealthy for sensitive groups.',
    };
  }

  // AQI <= 100: không cảnh báo
  return null;
}
