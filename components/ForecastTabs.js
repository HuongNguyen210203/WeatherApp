import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

/**
 * ForecastTabs
 * - Hiển thị 12 giờ tiếp theo (REAL Open-Meteo)
 * - Icon theo weather_code + is_day
 */
function ForecastTabs({ hourly }) {

  /* ================== Helpers ================== */

  const fmtHourLabel = (iso, isNow = false) => {
    if (isNow) return 'Now';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: 'numeric' });
    } catch {
      return iso;
    }
  };

  /**
   * Open-Meteo weather_code → MaterialCommunityIcons
   * https://open-meteo.com/en/docs
   */
  const codeToIcon = (code, isDay = 1) => {
    const day = isDay === 1;

    if (code == null) return day ? 'weather-cloudy' : 'weather-night';

    // ☀️ Clear
    if (code === 0) return day ? 'weather-sunny' : 'weather-night';

    // 🌤 Trời râm / nhiều mây
    if (code === 1)
      return day ? 'weather-partly-cloudy' : 'weather-night-partly-cloudy';
    if (code === 2) return 'weather-cloudy';
    if (code === 3) return 'weather-cloudy';

    // 🌫 Sương mù
    if (code === 45 || code === 48) return 'weather-fog';

    // 🌦 Mưa phùn
    if (code >= 51 && code <= 57) return 'weather-rainy';

    // 🌧 Mưa vừa – mưa to
    if (code >= 61 && code <= 65) return 'weather-pouring';

    // 🧊 Mưa đóng băng / mưa đá nhẹ
    if (code === 66 || code === 67) return 'weather-hail';

    // ❄️ Tuyết
    if (code >= 71 && code <= 77) return 'weather-snowy';

    // 🌧 Mưa rào
    if (code >= 80 && code <= 82) return 'weather-rainy';

    // ❄️❄️ Tuyết rào
    if (code === 85 || code === 86) return 'weather-snowy-heavy';

    // ⛈ Sấm sét
    if (code === 95) return 'weather-lightning';

    // ⛈⛈ Sấm sét + mưa đá
    if (code === 96 || code === 99)
      return 'weather-lightning-rainy';

    return day ? 'weather-cloudy' : 'weather-night-partly-cloudy';
  };

  /* ================== 12 HOURS REAL DATA ================== */

  const hourly12 = useMemo(() => {
    if (!hourly?.time?.length) return [];

    const now = new Date();
    const times = hourly.time;

    let startIdx = times.findIndex((t) => new Date(t) >= now);
    if (startIdx < 0) startIdx = 0;

    const end = Math.min(startIdx + 12, times.length);
    const out = [];

    for (let i = startIdx; i < end; i++) {
      out.push({
        key: String(i),
        time: times[i],
        isNow: i === startIdx,
        temp: hourly.temperature_2m?.[i],
        pop: hourly.precipitation_probability?.[i],
        code: hourly.weather_code?.[i],
        isDay: hourly.is_day?.[i],
      });
    }
    return out;
  }, [hourly]);

  /* ================== Render ================== */

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.tabRow}>
        <Text style={[styles.tabText, styles.tabActive]}>
          Hourly Forecast
        </Text>
      </View>

      {/* Underline */}
      <View style={styles.underline}>
        <View style={styles.underlineActive} />
      </View>

      {/* Content */}
      {hourly12.length === 0 ? (
        <Text style={{ color: '#A39AD5' }}>No hourly data.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled
          nestedScrollEnabled
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.hourlyRow}
        >
          {hourly12.map((item) => {
            const isNow = item.isNow;

            return (
              <View
                key={item.key}
                style={[
                  styles.hourPill,
                  isNow && styles.hourPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.hourLabel,
                    isNow && styles.hourLabelActive,
                  ]}
                >
                  {fmtHourLabel(item.time, isNow)}
                </Text>

                <MaterialCommunityIcons
                  name={codeToIcon(item.code, item.isDay)}
                  size={26}
                  color={isNow ? '#FFFFFF' : '#A39AD5'}
                  style={{ marginVertical: 6 }}
                />

                <Text
                  style={[
                    styles.popText,
                    isNow && styles.popTextActive,
                  ]}
                >
                  {item.pop != null
                    ? `${Math.round(item.pop)}%`
                    : '--'}
                </Text>

                <Text
                  style={[
                    styles.tempText,
                    isNow && styles.tempTextActive,
                  ]}
                >
                  {item.temp != null
                    ? `${Math.round(item.temp)}°`
                    : '--'}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export default React.memo(ForecastTabs);

/* ================== Styles ================== */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    color: '#A39AD5',
    fontSize: 16,
    fontWeight: '600',
  },
  tabActive: {
    color: '#FFFFFF',
  },

  underline: {
    height: 3,
    backgroundColor: 'rgba(163,154,213,0.25)',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 14,
  },
  underlineActive: {
    height: 3,
    width: '55%',
    backgroundColor: '#B14CFF',
    borderRadius: 2,
  },

  hourlyRow: {
    paddingBottom: 6,
    paddingRight: 10,
  },

  hourPill: {
    width: 86,
    borderRadius: 24,
    paddingVertical: 14,
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  hourPillActive: {
    backgroundColor: 'rgba(177,76,255,0.35)',
  },

  hourLabel: {
    color: '#A39AD5',
    fontSize: 12,
    fontWeight: '600',
  },
  hourLabelActive: {
    color: '#FFFFFF',
  },

  popText: {
    color: '#50D7FF',
    fontSize: 12,
    fontWeight: '600',
  },
  popTextActive: {
    color: '#50D7FF',
  },

  tempText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  tempTextActive: {
    color: '#FFFFFF',
  },
});
