import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { HOURLY_DATA } from '../constants/data';

export default function HourlyForecast() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hourlyRow}
    >
      {HOURLY_DATA.map((item, index) => (
        <View
          key={index}
          style={[styles.hourChip, item.isNow && styles.hourChipActive]}
        >
          <Text
            style={[
              styles.hourLabel,
              item.isNow && styles.hourLabelActive,
            ]}
          >
            {item.label}
          </Text>
          <Text style={styles.hourIcon}>🌧</Text>
          <Text style={styles.hourChance}>{item.chance}</Text>
          <Text
            style={[
              styles.hourTemp,
              item.isNow && styles.hourTempActive,
            ]}
          >
            {item.temp}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hourlyRow: {
    paddingRight: 16,
  },
  hourChip: {
    width: 70,
    borderRadius: 30,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#342561',
    alignItems: 'center',
  },
  hourChipActive: {
    backgroundColor: '#4B2FA0',
  },
  hourLabel: {
    color: '#FFFFFFAA',
    fontSize: 12,
    marginBottom: 4,
  },
  hourLabelActive: {
    color: '#FFFFFF',
  },
  hourIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  hourChance: {
    color: '#50D7FF',
    fontSize: 11,
    marginBottom: 4,
  },
  hourTemp: {
    color: '#FFFFFFAA',
    fontSize: 14,
  },
  hourTempActive: {
    color: '#FFFFFF',
  },
});

