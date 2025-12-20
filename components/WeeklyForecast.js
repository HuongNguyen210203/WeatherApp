import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { WEEKLY_DATA } from '../constants/data';

export default function WeeklyForecast() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weeklyRow}
    >
      {WEEKLY_DATA.map((item, index) => (
        <View key={index} style={styles.weeklyChip}>
          <Text style={styles.weeklyLabel}>{item.label}</Text>
          <Text style={styles.weeklyIcon}>{item.icon}</Text>
          <Text style={styles.weeklyChance}>{item.chance}</Text>
          <Text style={styles.weeklyTemp}>
            {item.high}  {item.low}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  weeklyRow: {
    paddingRight: 16,
  },
  weeklyChip: {
    width: 70,
    borderRadius: 30,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#342561',
    alignItems: 'center',
  },
  weeklyLabel: {
    color: '#FFFFFFAA',
    fontSize: 12,
    marginBottom: 4,
  },
  weeklyIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  weeklyChance: {
    color: '#50D7FF',
    fontSize: 11,
    marginBottom: 4,
  },
  weeklyTemp: {
    color: '#FFFFFFAA',
    fontSize: 14,
  },
});

