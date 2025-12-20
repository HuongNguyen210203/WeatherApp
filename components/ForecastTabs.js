import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HourlyForecast from './HourlyForecast';
import WeeklyForecast from './WeeklyForecast';

export default function ForecastTabs() {
  const [activeTab, setActiveTab] = useState('hourly');

  return (
    <View style={styles.forecastContainer}>
      <View style={styles.tabHeaderRow}>
        <TouchableOpacity onPress={() => setActiveTab('hourly')}>
          <Text style={activeTab === 'hourly' ? styles.sectionTitle : styles.sectionTitleInactive}>
            Hourly Forecast
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('weekly')}>
          <Text style={activeTab === 'weekly' ? styles.sectionTitle : styles.sectionTitleInactive}>
            Weekly Forecast
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentTrack}>
        <View style={[
          styles.segmentThumb,
          { marginLeft: activeTab === 'hourly' ? 0 : '50%' }
        ]} />
      </View>

      {activeTab === 'hourly' ? <HourlyForecast /> : <WeeklyForecast />}
    </View>
  );
}

const styles = StyleSheet.create({
  forecastContainer: {
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitleInactive: {
    color: '#A39AD5',
    fontSize: 16,
  },
  segmentTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#342561',
    marginBottom: 18,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  segmentThumb: {
    width: '50%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#C427FB',
    position: 'absolute',
    top: 0,
    transition: 'margin-left 0.3s ease',
  },
});

