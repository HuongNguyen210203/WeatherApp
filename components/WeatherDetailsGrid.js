import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function WeatherDetailsGrid({ current, currentUnits, daily, airQuality }) {
  const windUnit = currentUnits?.wind_speed_10m ?? 'km/h';

  const fmtHour = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const aqi = airQuality?.current?.us_aqi;
  const aqiLabel = (v) => {
    if (v == null) return '';
    if (v <= 50) return 'Good';
    if (v <= 100) return 'Moderate';
    if (v <= 150) return 'Unhealthy (Sensitive)';
    if (v <= 200) return 'Unhealthy';
    if (v <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };
  const aqiPercent = (v) => {
    if (v == null) return '0%';
    const p = Math.max(0, Math.min(100, Math.round((v / 300) * 100)));
    return `${p}%`;
  };

  const uvMaxToday = daily?.uv_index_max?.[0];
  const uvLabel = (v) => {
    if (v == null) return '';
    if (v < 3) return 'Low';
    if (v < 6) return 'Moderate';
    if (v < 8) return 'High';
    if (v < 11) return 'Very High';
    return 'Extreme';
  };
  const uvPercent = (v) => {
    if (v == null) return '0%';
    const p = Math.max(0, Math.min(100, Math.round((v / 11) * 100)));
    return `${p}%`;
  };

  const sunrise = daily?.sunrise?.[0];
  const sunset = daily?.sunset?.[0];

  const windDirToText = (deg) => {
    if (deg == null) return '';
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const i = Math.round(deg / 45) % 8;
    return `${dirs[i]} (${Math.round(deg)}°)`;
  };

  return (
    <View style={styles.weatherDetailsContainer}>
      {/* AIR QUALITY */}
      <View style={styles.cardFull}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>AIR QUALITY</Text>
          <MaterialIcons name="more-vert" size={20} color="#A39AD5" />
        </View>

        <Text style={styles.bigValue}>
          {aqi != null ? `${aqi} • ${aqiLabel(aqi)}` : '—'}
        </Text>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: aqiPercent(aqi) }]}>
            <View style={styles.progressBarDot} />
          </View>
        </View>

        <TouchableOpacity style={styles.seeMoreLink}>
          <Text style={styles.seeMoreText}>See more</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#50D7FF" />
        </TouchableOpacity>
      </View>

      {/* UV + SUNRISE */}
      <View style={styles.detailsRow}>
        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-sunny" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>UV INDEX</Text>
          </View>

          <Text style={styles.detailValueLarge}>
            {uvMaxToday != null ? Math.round(uvMaxToday) : '—'}
          </Text>
          <Text style={styles.detailAccent}>
            {uvMaxToday != null ? uvLabel(uvMaxToday) : ''}
          </Text>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: uvPercent(uvMaxToday) }]}>
              <View style={styles.progressBarDot} />
            </View>
          </View>
        </View>

        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>SUNRISE</Text>
          </View>

          <Text style={styles.detailValueLarge}>
            {sunrise ? fmtHour(sunrise) : '—'}
          </Text>

          <View style={styles.sunriseGraph}>
            <View style={styles.wavyLine} />
            <View style={styles.graphDot} />
          </View>

          <Text style={styles.detailAccent}>
            Sunset: {sunset ? fmtHour(sunset) : '—'}
          </Text>
        </View>
      </View>

      {/* WIND + RAINFALL */}
      <View style={styles.detailsRow}>
        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-windy" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>WIND</Text>
          </View>

          <Text style={styles.detailValueLarge}>
            {current?.wind_speed_10m != null ? Math.round(current.wind_speed_10m) : '—'}
          </Text>
          <Text style={styles.detailAccent}>{windUnit}</Text>
          <Text style={styles.detailAccent}>{windDirToText(current?.wind_direction_10m)}</Text>
        </View>

        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-rainy" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>RAINFALL</Text>
          </View>

          <Text style={styles.detailValueLarge}>
            {current?.precipitation != null ? `${current.precipitation} mm` : '—'}
          </Text>
          <Text style={styles.detailAccent}>current</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weatherDetailsContainer: { paddingHorizontal: 18, paddingTop: 20 },

  cardFull: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#342561',
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardHeaderText: { color: '#A39AD5', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  cardHeaderTextSmall: { color: '#A39AD5', fontSize: 11, fontWeight: '600', marginLeft: 6 },

  bigValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 12 },

  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#251C51',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  progressBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#50D7FF', position: 'relative' },
  progressBarDot: {
    position: 'absolute',
    right: -6,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#50D7FF',
  },

  seeMoreLink: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  seeMoreText: { color: '#50D7FF', fontSize: 12, marginRight: 4 },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  detailCardHalf: { width: '48%', borderRadius: 24, padding: 16, backgroundColor: '#342561' },
  detailValueLarge: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  detailAccent: { color: '#A39AD5', fontSize: 12, marginTop: 4 },

  sunriseGraph: { height: 40, marginVertical: 8, position: 'relative', justifyContent: 'center' },
  wavyLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#50D7FF', borderRadius: 1, top: '50%' },
  graphDot: { position: 'absolute', right: 20, top: '50%', marginTop: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
});
